import type { createServiceClient } from "@/lib/supabase/server";
import { cancelPayFastSubscription } from "@/lib/payfast";

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

/**
 * Cancel PayFast recurring billing (if any) and mark the local subscription cancelled.
 * Used when suspending or permanently deleting a business.
 */
export async function cancelBusinessSubscriptionIfActive(
  supabase: ServiceClient,
  businessId: string
): Promise<{ cancelled: boolean; error?: string }> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, payfast_token")
    .eq("business_id", businessId)
    .maybeSingle();

  if (!subscription || subscription.status !== "active") {
    return { cancelled: false };
  }

  if (subscription.payfast_token) {
    const result = await cancelPayFastSubscription(subscription.payfast_token);
    if (!result.success) {
      return {
        cancelled: false,
        error: result.error ?? "Could not cancel PayFast subscription",
      };
    }
  }

  const now = new Date().toISOString();
  await supabase
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

  await supabase
    .from("businesses")
    .update({
      membership_tier: "free",
      intended_membership_tier: "free",
      is_featured: false,
      is_local_champion: false,
    })
    .eq("id", businessId);

  return { cancelled: true };
}
