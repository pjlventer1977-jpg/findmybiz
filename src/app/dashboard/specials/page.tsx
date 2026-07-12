import { createClient } from "@/lib/supabase/server";
import { SpecialsDashboard } from "./specials-form";

export default async function DashboardSpecialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, membership_tier")
    .eq("owner_id", user!.id)
    .single();

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
