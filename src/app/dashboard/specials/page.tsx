import { createClient } from "@/lib/supabase/server";
import { SpecialsDashboard } from "./specials-form";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";

export default async function DashboardSpecialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  const startOfMonth = new Date(new Date().setDate(1)).toISOString();
  const { count } = await supabase
    .from("specials")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id)
    .gte("created_at", startOfMonth);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Specials</h1>
      <SpecialsDashboard
        businessId={business.id}
        tier={business.membership_tier}
        existingCount={count ?? 0}
      />
    </div>
  );
}
