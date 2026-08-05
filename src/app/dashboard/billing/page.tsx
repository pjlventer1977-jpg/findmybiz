import { createClient } from "@/lib/supabase/server";
import { BillingClient } from "./billing-client";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { isLaunchPromoActive } from "@/constants/launch-promo";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, promo_active, promo_ends_at, promo_full_amount")
    .eq("business_id", business.id)
    .maybeSingle();

  const hasActiveSubscription = subscription?.status === "active";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing & Membership</h1>
      <BillingClient
        businessId={business.id}
        currentTier={business.membership_tier}
        selectedTier={business.intended_membership_tier ?? business.membership_tier}
        businessStatus={business.status}
        hasActiveSubscription={hasActiveSubscription}
        launchPromoEnabled={isLaunchPromoActive()}
        promoActive={Boolean(subscription?.promo_active)}
        promoEndsAt={subscription?.promo_ends_at ?? null}
        promoFullAmount={
          subscription?.promo_full_amount != null
            ? Number(subscription.promo_full_amount)
            : null
        }
        paymentReturn={
          params.success === "true" || params.success === "credits"
            ? "success"
            : params.cancelled === "true"
              ? "cancelled"
              : null
        }
      />
    </div>
  );
}
