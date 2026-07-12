import { createClient } from "@/lib/supabase/server";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, membership_tier")
    .eq("owner_id", user!.id)
    .single();

  if (!business) return <p>Register a business first.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing & Membership</h1>
      <BillingClient businessId={business.id} currentTier={business.membership_tier} />
    </div>
  );
}
