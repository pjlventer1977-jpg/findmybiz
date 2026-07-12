import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [
    { data: payments },
    { count: totalBusinesses },
    { count: paidBusinesses },
    { count: totalLeads },
  ] = await Promise.all([
    supabase.from("payments").select("amount, payment_type, status").eq("status", "completed"),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("businesses").select("*", { count: "exact", head: true }).neq("membership_tier", "free"),
    supabase.from("leads").select("*", { count: "exact", head: true }),
  ]);

  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  const tierCounts = await supabase
    .from("businesses")
    .select("membership_tier")
    .eq("status", "approved");

  const tiers = (tierCounts.data ?? []).reduce(
    (acc, b) => {
      acc[b.membership_tier] = (acc[b.membership_tier] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Approved Businesses</p>
          <p className="text-2xl font-bold">{totalBusinesses ?? 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Paid Members</p>
          <p className="text-2xl font-bold">{paidBusinesses ?? 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Leads Delivered</p>
          <p className="text-2xl font-bold">{totalLeads ?? 0}</p>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h2 className="font-semibold mb-4">Membership Breakdown</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(tiers).map(([tier, count]) => (
            <div key={tier}>
              <p className="text-sm capitalize text-muted-foreground">{tier}</p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
