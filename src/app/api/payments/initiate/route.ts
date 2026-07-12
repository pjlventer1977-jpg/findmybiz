import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSubscriptionPayment, createCreditPackPayment } from "@/lib/payfast";
import { randomUUID } from "crypto";
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, business_id, tier, credits, amount } = body;

  const paymentId = randomUUID();

  const { error: paymentError } = await supabase.from("payments").insert({
    business_id,
    amount,
    payment_type: type,
    status: "pending",
    m_payment_id: paymentId,
    metadata: { business_id, tier, credits, type },
  });

  if (paymentError) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }

  let formData;

  if (type === "subscription") {
    formData = createSubscriptionPayment({
      businessId: business_id,
      email: user.email!,
      tierName: tier,
      amount,
      paymentId,
    });
  } else if (type === "lead_credits") {
    formData = createCreditPackPayment({
      email: user.email!,
      credits,
      amount,
      paymentId,
    });
  } else {
    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  }

  return NextResponse.json(formData);
}
