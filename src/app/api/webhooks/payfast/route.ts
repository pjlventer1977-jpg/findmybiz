import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import {
  amountsMatch,
  confirmPayFastServer,
  merchantIdMatches,
  parsePayFastItnBody,
  verifyPayFastITN,
} from "@/lib/payfast";
import { getPlanByTier } from "@/constants/membership";
import type { MembershipTier } from "@/types";
import {
  sendSubscriptionPaymentAdminEmail,
  sendSubscriptionPaymentOwnerEmail,
  sendSubscriptionPaymentFailedOwnerEmail,
  sendSubscriptionRenewalAdminEmail,
  sendSubscriptionRenewalOwnerEmail,
} from "@/lib/email/business-notifications";
import {
  extendPeriodEnd,
  isFailureItnStatus,
  resolveCompleteItnBranch,
  SUBSCRIPTION_PERIOD_DAYS,
} from "@/lib/payments/subscription-lifecycle";
import { getPromoEndsAt } from "@/constants/launch-promo";

async function downgradeBusinessToFree(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  businessId: string,
  subscriptionStatus: "cancelled" | "past_due"
) {
  await supabase
    .from("subscriptions")
    .update({
      status: subscriptionStatus,
      cancelled_at: new Date().toISOString(),
      tier: "free",
      promo_active: false,
      promo_ends_at: null,
      promo_full_amount: null,
    })
    .eq("business_id", businessId);

  await supabase
    .from("businesses")
    .update({
      membership_tier: "free",
      intended_membership_tier: "free",
      is_featured: false,
    })
    .eq("id", businessId);
}

export async function POST(request: NextRequest) {
  // Use the raw body so PayFast's posted field order (and empty values) are preserved.
  const rawBody = await request.text();
  const { data: postData, fieldOrder } = parsePayFastItnBody(rawBody);

  console.info("PayFast ITN received", {
    m_payment_id: postData.m_payment_id,
    payment_status: postData.payment_status,
    merchant_id: postData.merchant_id,
    pf_payment_id: postData.pf_payment_id,
    amount_gross: postData.amount_gross,
    has_token: Boolean(postData.token),
  });

  const signatureCheck = verifyPayFastITN(postData, fieldOrder);
  if (!signatureCheck.valid) {
    console.warn("PayFast ITN signature verification failed", {
      m_payment_id: postData.m_payment_id,
      payment_status: postData.payment_status,
      field_order: fieldOrder,
      passphrase_configured: signatureCheck.passphraseConfigured,
      received_signature: signatureCheck.received,
      calculated_signature: signatureCheck.calculated,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!merchantIdMatches(postData.merchant_id)) {
    console.warn("PayFast ITN merchant_id mismatch", {
      m_payment_id: postData.m_payment_id,
      posted: postData.merchant_id,
    });
    return NextResponse.json({ error: "Invalid merchant" }, { status: 400 });
  }

  const serverValid = await confirmPayFastServer(postData, fieldOrder);
  if (!serverValid) {
    console.warn("PayFast ITN server confirmation failed", {
      m_payment_id: postData.m_payment_id,
    });
    return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const mPaymentId = postData.m_payment_id;
  const paymentStatus = postData.payment_status?.toUpperCase();

  if (isFailureItnStatus(paymentStatus)) {
    return handleFailureItn(supabase, postData, mPaymentId, paymentStatus!);
  }

  if (paymentStatus !== "COMPLETE") {
    return NextResponse.json({ status: "ignored" });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("m_payment_id", mPaymentId)
    .maybeSingle();

  let hasMatchingActiveSubscription = false;
  if (postData.token) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("business_id, tier, status, payfast_token, current_period_end")
      .eq("payfast_token", postData.token)
      .eq("status", "active")
      .maybeSingle();
    hasMatchingActiveSubscription = Boolean(sub);
  }

  const branch = resolveCompleteItnBranch({
    paymentStatus: payment?.status ?? null,
    hasMatchingActiveSubscription,
  });

  if (branch.kind === "ignore") {
    return NextResponse.json({ status: branch.reason });
  }

  if (branch.kind === "renewal") {
    return handleRenewal(supabase, postData);
  }

  // First payment — pending row required
  if (!payment || payment.status !== "pending") {
    return NextResponse.json({ status: "already_processed" });
  }

  if (!amountsMatch(Number(payment.amount), postData.amount_gross)) {
    console.warn("PayFast ITN amount mismatch", {
      m_payment_id: mPaymentId,
      expected: payment.amount,
      received: postData.amount_gross,
    });
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const { data: claimed, error: claimError } = await supabase
    .from("payments")
    .update({
      status: "completed",
      payfast_payment_id: postData.pf_payment_id,
    })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (claimError || !claimed) {
    return NextResponse.json({ status: "already_processed" });
  }

  const metadata = payment.metadata as Record<string, unknown>;

  switch (payment.payment_type) {
    case "subscription": {
      const tier = metadata.tier as MembershipTier;
      const businessId = metadata.business_id as string;
      const plan = getPlanByTier(tier);
      const now = new Date();
      const periodEnd = new Date(
        now.getTime() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000
      );
      const promoApplied = Boolean(metadata.launch_promo);
      const fullAmount = Number(metadata.full_amount) || plan.price;

      await supabase.from("subscriptions").upsert(
        {
          business_id: businessId,
          tier,
          status: "active",
          payfast_token: postData.token,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancelled_at: null,
          promo_active: promoApplied,
          promo_ends_at: promoApplied ? getPromoEndsAt(now).toISOString() : null,
          promo_full_amount: promoApplied ? fullAmount : null,
          promo_converted_at: null,
        },
        { onConflict: "business_id" }
      );

      await supabase
        .from("businesses")
        .update({
          membership_tier: tier,
          intended_membership_tier: tier,
        })
        .eq("id", businessId);

      await supabase.from("lead_credits").upsert(
        {
          business_id: businessId,
          balance: plan.leadsPerMonth,
          monthly_allocation: plan.leadsPerMonth,
          last_reset_at: now.toISOString(),
        },
        { onConflict: "business_id" }
      );

      if (tier === "enterprise") {
        await supabase
          .from("businesses")
          .update({ is_featured: true })
          .eq("id", businessId);
      }

      const { data: business } = await supabase
        .from("businesses")
        .select("id, name, email, contact_person")
        .eq("id", businessId)
        .single();

      if (business) {
        const amount = Number(postData.amount_gross) || Number(payment.amount);
        const adminEmail = await sendSubscriptionPaymentAdminEmail({
          businessId,
          businessName: business.name,
          businessEmail: business.email,
          contactPerson: business.contact_person,
          tier,
          amount,
          payfastPaymentId: postData.pf_payment_id ?? "Not provided",
          paymentReference: mPaymentId,
        });
        const ownerEmail = await sendSubscriptionPaymentOwnerEmail({
          businessName: business.name,
          businessEmail: business.email,
          contactPerson: business.contact_person,
          tier,
        });

        if (!adminEmail.success || !ownerEmail.success) {
          console.error("Subscription payment notification failed:", {
            business_id: businessId,
            admin_error: adminEmail.error,
            owner_error: ownerEmail.error,
          });
        }
      }
      break;
    }

    case "lead_credits": {
      const businessId = metadata.business_id as string;
      const credits = Number(metadata.credits);
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const { data: wallet } = await supabase
        .from("lead_credits")
        .select("balance")
        .eq("business_id", businessId)
        .single();

      const newBalance = (wallet?.balance ?? 0) + credits;

      await supabase.from("lead_credits").upsert(
        {
          business_id: businessId,
          balance: newBalance,
        },
        { onConflict: "business_id" }
      );

      await supabase.from("lead_credit_transactions").insert({
        business_id: businessId,
        amount: credits,
        balance_after: newBalance,
        transaction_type: "purchase",
        reference_id: payment.id,
        description: `Purchased ${credits} lead credits`,
        expires_at: expiresAt.toISOString(),
      });
      break;
    }

    case "event": {
      const eventId = metadata.event_id as string;
      const requestedWeeks = Number(metadata.duration_weeks);
      const durationWeeks = [1, 2, 4].includes(requestedWeeks) ? requestedWeeks : 1;
      const paidUntil = new Date(
        Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000
      );
      await supabase
        .from("events")
        .update({
          is_paid: true,
          paid_until: paidUntil.toISOString(),
          status: "pending",
        })
        .eq("id", eventId);
      break;
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function handleRenewal(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  postData: Record<string, string>
) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("business_id, tier, status, payfast_token, current_period_end")
    .eq("payfast_token", postData.token)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ status: "no_subscription" });
  }

  const tier = subscription.tier as MembershipTier;
  const plan = getPlanByTier(tier);
  const { periodStart, periodEnd } = extendPeriodEnd(subscription.current_period_end);
  const renewalPaymentId = randomUUID();
  const amount = Number(postData.amount_gross) || plan.price;

  const { data: renewalPayment, error: insertError } = await supabase
    .from("payments")
    .insert({
      business_id: subscription.business_id,
      amount,
      payment_type: "subscription",
      status: "completed",
      m_payment_id: renewalPaymentId,
      payfast_payment_id: postData.pf_payment_id,
      metadata: {
        business_id: subscription.business_id,
        tier,
        type: "subscription",
        renewal: true,
        source_m_payment_id: postData.m_payment_id,
      },
    })
    .select("id")
    .single();

  if (insertError) {
    // Idempotency: PayFast may retry; if pf_payment_id already stored, treat as ok
    console.error("Renewal payment insert failed:", insertError.message);
    if (postData.pf_payment_id) {
      const { data: existing } = await supabase
        .from("payments")
        .select("id")
        .eq("payfast_payment_id", postData.pf_payment_id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ status: "already_processed" });
      }
    }
    return NextResponse.json({ error: "Renewal failed" }, { status: 500 });
  }

  await supabase
    .from("subscriptions")
    .update({
      current_period_start: periodStart,
      current_period_end: periodEnd,
      status: "active",
    })
    .eq("business_id", subscription.business_id);

  await supabase.from("lead_credits").upsert(
    {
      business_id: subscription.business_id,
      balance: plan.leadsPerMonth,
      monthly_allocation: plan.leadsPerMonth,
      last_reset_at: periodStart,
    },
    { onConflict: "business_id" }
  );

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, email, contact_person")
    .eq("id", subscription.business_id)
    .single();

  if (business) {
    const ownerEmail = await sendSubscriptionRenewalOwnerEmail({
      businessName: business.name,
      businessEmail: business.email,
      contactPerson: business.contact_person,
      tier,
      amount,
      periodEnd,
    });
    const adminEmail = await sendSubscriptionRenewalAdminEmail({
      businessId: business.id,
      businessName: business.name,
      businessEmail: business.email,
      contactPerson: business.contact_person,
      tier,
      amount,
      payfastPaymentId: postData.pf_payment_id ?? "Not provided",
    });

    if (!ownerEmail.success || !adminEmail.success) {
      console.error("Subscription renewal notification failed:", {
        business_id: subscription.business_id,
        payment_id: renewalPayment?.id,
        owner_error: ownerEmail.error,
        admin_error: adminEmail.error,
      });
    }
  }

  return NextResponse.json({ status: "renewed" });
}

async function handleFailureItn(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  postData: Record<string, string>,
  mPaymentId: string,
  paymentStatus: string
) {
  if (mPaymentId) {
    await supabase
      .from("payments")
      .update({ status: "failed", payfast_payment_id: postData.pf_payment_id })
      .eq("m_payment_id", mPaymentId)
      .eq("status", "pending");
  }

  let businessId: string | null = null;
  let tier: MembershipTier | null = null;

  if (postData.token) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("business_id, tier, status")
      .eq("payfast_token", postData.token)
      .eq("status", "active")
      .maybeSingle();

    if (sub) {
      businessId = sub.business_id;
      tier = sub.tier as MembershipTier;
      const nextStatus = paymentStatus === "CANCELLED" ? "cancelled" : "past_due";
      await downgradeBusinessToFree(supabase, sub.business_id, nextStatus);
    }
  }

  if (!businessId && mPaymentId) {
    const { data: payment } = await supabase
      .from("payments")
      .select("metadata, business_id")
      .eq("m_payment_id", mPaymentId)
      .maybeSingle();
    const metadata = (payment?.metadata ?? {}) as Record<string, unknown>;
    businessId = (metadata.business_id as string) || payment?.business_id || null;
    if (metadata.tier) tier = metadata.tier as MembershipTier;
  }

  if (businessId) {
    const { data: business } = await supabase
      .from("businesses")
      .select("name, email, contact_person")
      .eq("id", businessId)
      .single();

    if (business) {
      const result = await sendSubscriptionPaymentFailedOwnerEmail({
        businessName: business.name,
        businessEmail: business.email,
        contactPerson: business.contact_person,
        tier: tier ?? "free",
        status: paymentStatus,
      });
      if (!result.success) {
        console.error("Failed-payment email error:", result.error);
      }
    }
  }

  return NextResponse.json({ status: "failed_handled" });
}
