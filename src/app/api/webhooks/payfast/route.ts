import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyPayFastITN } from "@/lib/payfast";
import { getPlanByTier } from "@/constants/membership";
import type { MembershipTier } from "@/types";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const postData: Record<string, string> = {};

  formData.forEach((value, key) => {
    postData[key] = value.toString();
  });

  if (!verifyPayFastITN(postData)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (postData.payment_status !== "COMPLETE") {
    return NextResponse.json({ status: "ignored" });
  }

  const supabase = await createServiceClient();
  const mPaymentId = postData.m_payment_id;

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("m_payment_id", mPaymentId)
    .single();

  if (!payment || payment.status === "completed") {
    return NextResponse.json({ status: "already_processed" });
  }

  await supabase
    .from("payments")
    .update({
      status: "completed",
      payfast_payment_id: postData.pf_payment_id,
    })
    .eq("id", payment.id);

  const metadata = payment.metadata as Record<string, unknown>;

  switch (payment.payment_type) {
    case "subscription": {
      const tier = metadata.tier as MembershipTier;
      const businessId = metadata.business_id as string;
      const plan = getPlanByTier(tier);

      await supabase.from("subscriptions").upsert({
        business_id: businessId,
        tier,
        status: "active",
        payfast_token: postData.token,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }, { onConflict: "business_id" });

      await supabase
        .from("businesses")
        .update({ membership_tier: tier })
        .eq("id", businessId);

      await supabase.from("lead_credits").upsert({
        business_id: businessId,
        balance: plan.leadsPerMonth,
        monthly_allocation: plan.leadsPerMonth,
        last_reset_at: new Date().toISOString(),
      }, { onConflict: "business_id" });

      if (tier === "enterprise") {
        await supabase
          .from("businesses")
          .update({ is_featured: true })
          .eq("id", businessId);
      }
      break;
    }

    case "lead_credits": {
      const businessId = metadata.business_id as string;
      const credits = metadata.credits as number;
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const { data: wallet } = await supabase
        .from("lead_credits")
        .select("balance")
        .eq("business_id", businessId)
        .single();

      const newBalance = (wallet?.balance ?? 0) + credits;

      await supabase.from("lead_credits").upsert({
        business_id: businessId,
        balance: newBalance,
      }, { onConflict: "business_id" });

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
      const paidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await supabase
        .from("events")
        .update({ is_paid: true, paid_until: paidUntil.toISOString(), status: "pending" })
        .eq("id", eventId);
      break;
    }
  }

  return NextResponse.json({ status: "ok" });
}
