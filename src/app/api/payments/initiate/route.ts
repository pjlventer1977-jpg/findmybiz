import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  createSubscriptionPayment,
  createCreditPackPayment,
} from "@/lib/payfast";
import { randomUUID } from "crypto";
import type { MembershipTier } from "@/types";
import { getPlanByTier } from "@/constants/membership";

const VALID_TIERS: MembershipTier[] = ["starter", "professional", "enterprise"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, business_id, tier, credits, amount } = body;

  if (!business_id || !type || (type !== "subscription" && amount == null)) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, status, membership_tier, intended_membership_tier")
    .eq("id", business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (type === "subscription" && business.status !== "approved") {
    return NextResponse.json(
      { error: "Your business must be approved before activating a paid plan." },
      { status: 400 }
    );
  }

  if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
    return NextResponse.json(
      { error: "Payment gateway is not configured" },
      { status: 503 }
    );
  }

  const paymentId = randomUUID();
  const serviceClient = await createServiceClient();
  let paymentAmount = Number(amount);

  if (type === "subscription") {
    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Invalid membership tier" }, { status: 400 });
    }

    if (
      business.membership_tier === "free" &&
      business.intended_membership_tier !== "free" &&
      tier !== business.intended_membership_tier
    ) {
      return NextResponse.json(
        { error: "Please activate the plan selected during registration." },
        { status: 400 }
      );
    }

    paymentAmount = getPlanByTier(tier).price;
  }

  const { error: paymentError } = await serviceClient.from("payments").insert({
    business_id,
    amount: paymentAmount,
    payment_type: type,
    status: "pending",
    m_payment_id: paymentId,
    metadata: { business_id, tier, credits, type },
  });

  if (paymentError) {
    console.error("Payment insert failed:", paymentError.message);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }

  let formData;

  if (type === "subscription") {
    formData = createSubscriptionPayment({
      businessId: business_id,
      email: user.email!,
      tierName: tier,
      amount: paymentAmount,
      paymentId,
    });
  } else if (type === "lead_credits") {
    if (!credits) {
      return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
    }
    formData = createCreditPackPayment({
      email: user.email!,
      credits: Number(credits),
      amount: Number(amount),
      paymentId,
    });
  } else {
    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  }

  return NextResponse.json(formData);
}
