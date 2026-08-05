import { createClient } from "@/lib/supabase/server";
import { BillingClient } from "./billing-client";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
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
      />
    </div>
  );
}
