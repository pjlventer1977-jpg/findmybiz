import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cancelPayFastSubscription } from "@/lib/payfast";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const businessId = body.business_id as string | undefined;

  if (!businessId) {
    return NextResponse.json({ error: "Missing business_id" }, { status: 400 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, owner_id, membership_tier")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const serviceClient = await createServiceClient();
  const { data: subscription } = await serviceClient
    .from("subscriptions")
    .select("business_id, status, payfast_token, tier")
    .eq("business_id", businessId)
    .maybeSingle();

  if (!subscription || subscription.status !== "active") {
    return NextResponse.json(
      { error: "No active subscription to cancel" },
      { status: 400 }
    );
  }

  if (!subscription.payfast_token) {
    return NextResponse.json(
      { error: "Subscription has no PayFast token. Contact support." },
      { status: 400 }
    );
  }

  const cancelResult = await cancelPayFastSubscription(subscription.payfast_token);
  if (!cancelResult.success) {
    return NextResponse.json(
      { error: cancelResult.error ?? "Could not cancel with PayFast" },
      { status: 502 }
    );
  }

  const now = new Date().toISOString();

  await serviceClient
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: now,
      tier: "free",
      promo_active: false,
      promo_ends_at: null,
      promo_full_amount: null,
    })
    .eq("business_id", businessId);

  await serviceClient
    .from("businesses")
    .update({
      membership_tier: "free",
      intended_membership_tier: "free",
      is_featured: false,
    })
    .eq("id", businessId);

  return NextResponse.json({ status: "cancelled" });
}
