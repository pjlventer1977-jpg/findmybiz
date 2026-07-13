"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsInsight } from "@/lib/analytics/insights";
import type { AnalyticsSummary } from "@/lib/queries/analytics";
import type { AnalyticsPeriod } from "@/lib/analytics/dates";
import { AnalyticsCharts } from "./analytics-charts";
import { AnalyticsInsightsPanel } from "./analytics-insights";
import { AnalyticsKpiCard } from "./analytics-kpi-card";

export function AnalyticsDashboard({
  data,
  insights,
  periodDays,
  isEnterprise,
}: {
  data: AnalyticsSummary;
  insights: AnalyticsInsight[];
  periodDays: AnalyticsPeriod;
  isEnterprise: boolean;
}) {
  const router = useRouter();

  function setPeriod(days: AnalyticsPeriod) {
    router.push(`/dashboard/analytics?days=${days}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demand Insights</h1>
          <p className="text-muted-foreground">
            Performance over the last {periodDays} days
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border p-1">
            <Button
              size="sm"
              variant={periodDays === 30 ? "default" : "ghost"}
              onClick={() => setPeriod(30)}
            >
              30 days
            </Button>
            {isEnterprise && (
              <Button
                size="sm"
                variant={periodDays === 90 ? "default" : "ghost"}
                onClick={() => setPeriod(90)}
              >
                90 days
              </Button>
            )}
          </div>
          {isEnterprise && (
            <Button size="sm" variant="outline" asChild>
              <a href={`/api/dashboard/analytics/export?days=${periodDays}`}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsKpiCard
          title="Profile Views"
          value={data.profileViewsPeriod}
          change={data.profileViewsChange}
          subtitle={`${data.profileViewsAllTime} all time`}
        />
        <AnalyticsKpiCard
          title="Search Appearances"
          value={data.searchAppearancesPeriod}
          change={data.searchAppearancesChange}
          subtitle={`${data.searchAppearancesAllTime} all time`}
        />
        <AnalyticsKpiCard
          title="Leads Received"
          value={data.leadsPeriod}
          change={data.leadsChange}
          subtitle={`${data.leadsAllTime} all time`}
        />
        <AnalyticsKpiCard
          title="Conversion Rate"
          value={`${data.conversionRate}%`}
          subtitle={`${data.leadsUnread} unread lead${data.leadsUnread === 1 ? "" : "s"}`}
        />
      </div>

      <AnalyticsCharts data={data} />
      <AnalyticsInsightsPanel insights={insights} />

      {isEnterprise && data.categoryBenchmark && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Compared with {data.categoryBenchmark.peersCount} similar businesses in
              your categories.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Avg. profile views</p>
                <p className="text-2xl font-bold">
                  {data.categoryBenchmark.avgProfileViews}
                </p>
                <p className="text-xs mt-1">
                  You rank #{data.categoryBenchmark.viewsRank} for views
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Avg. leads received</p>
                <p className="text-2xl font-bold">{data.categoryBenchmark.avgLeads}</p>
                <p className="text-xs mt-1">
                  You rank #{data.categoryBenchmark.leadsRank} for leads
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Avg. conversion rate</p>
                <p className="text-2xl font-bold">
                  {data.categoryBenchmark.avgConversionRate}%
                </p>
                <p className="text-xs mt-1">
                  Your rate: {data.conversionRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEnterprise && (
        <Card className="border-sa-blue/20 bg-sa-blue/5">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium">Unlock 90-day history and CSV export</p>
              <p className="text-sm text-muted-foreground">
                Upgrade to Enterprise for extended analytics and category benchmarks.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">Upgrade Plan</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
