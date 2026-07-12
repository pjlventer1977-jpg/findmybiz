import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, profile_views, search_appearances, membership_tier")
    .eq("owner_id", user!.id)
    .single();

  if (!business) return <p>Register a business first.</p>;

  const isPro = ["professional", "enterprise"].includes(business.membership_tier);

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id);

  const { count: viewsThisMonth } = await supabase
    .from("profile_view_analytics")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id)
    .gte("created_at", new Date(new Date().setDate(1)).toISOString());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Demand Insights</h1>

      {!isPro ? (
        <div className="p-4 rounded-lg bg-muted">
          <p className="font-medium">Upgrade to Professional</p>
          <p className="text-sm text-muted-foreground">
            Demand insights are available on Professional and Enterprise plans.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Profile Views (All Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{business.profile_views}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Views This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{viewsThisMonth ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Search Appearances</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{business.search_appearances}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Leads Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalLeads ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
