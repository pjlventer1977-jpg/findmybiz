import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminAnalytics } from "@/lib/queries/admin-analytics";
import type { AnalyticsPeriod } from "@/lib/analytics/dates";
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function changeLabel(change: number) {
  if (change === 0) return "0% vs prior";
  return `${change > 0 ? "+" : ""}${change}% vs prior`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const days: AnalyticsPeriod = params.days === "90" ? 90 : 30;
  const data = await getAdminAnalytics(days);

  const kpis = [
    {
      label: "Profile page visits",
      value: data.profileViewsPeriod,
      hint: changeLabel(data.profileViewsChange),
      sub: `${data.profileViewsAllTime} all-time`,
    },
    {
      label: "Search / quote events",
      value: data.searchEventsPeriod,
      hint: changeLabel(data.searchEventsChange),
      sub: `${data.quoteRequestsPeriod} quote requests`,
    },
    {
      label: "Business leads",
      value: data.leadsPeriod,
      hint: changeLabel(data.leadsChange),
      sub: `${data.leadsAllTime} all-time`,
    },
    {
      label: "Businesses",
      value: data.businessesApproved,
      hint: `${data.businessesPending} pending`,
      sub: `${data.businessesTotal} registered`,
    },
  ];

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Platform visits, category demand, and lead delivery.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            variant={days === 30 ? "default" : "outline"}
            size="sm"
          >
            <Link href="/admin/analytics?days=30">30 days</Link>
          </Button>
          <Button
            asChild
            variant={days === 90 ? "default" : "outline"}
            size="sm"
          >
            <Link href="/admin/analytics?days=90">90 days</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/businesses">Business directory</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  kpi.hint.startsWith("+")
                    ? "text-sa-green"
                    : kpi.hint.startsWith("-")
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              >
                {kpi.hint}
              </p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminAnalyticsCharts data={data} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top categories</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.topCategories.map((cat, index) => (
                  <li
                    key={cat.categoryId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                      {cat.name}
                    </span>
                    <span className="font-semibold">{cat.searches}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top businesses by leads</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topBusinessesByLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.topBusinessesByLeads.map((biz, index) => (
                  <li
                    key={biz.businessId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                      {biz.name}
                    </span>
                    <span className="font-semibold">{biz.leads}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
