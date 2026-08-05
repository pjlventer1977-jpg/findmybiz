"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAnalyticsSummary } from "@/lib/queries/admin-analytics";

const CHART_GREEN = "#007A4D";
const CHART_BLUE = "#002395";

export function AdminAnalyticsCharts({ data }: { data: AdminAnalyticsSummary }) {
  const hasViews = data.profileViewsByDay.some((row) => row.count > 0);
  const hasLeads = data.leadsByDay.some((row) => row.count > 0);
  const hasCategories = data.topCategories.length > 0;
  const hasLeadBusinesses = data.topBusinessesByLeads.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile page visits</CardTitle>
        </CardHeader>
        <CardContent>
          {hasViews ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.profileViewsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_BLUE}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              No profile visits in this period.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business leads delivered</CardTitle>
        </CardHeader>
        <CardContent>
          {hasLeads ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.leadsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_GREEN}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              No leads in this period.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most searched categories</CardTitle>
        </CardHeader>
        <CardContent>
          {hasCategories ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.topCategories}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="searches" fill={CHART_BLUE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No category search data yet. Searches and quote requests will appear here.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top businesses by leads</CardTitle>
        </CardHeader>
        <CardContent>
          {hasLeadBusinesses ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.topBusinessesByLeads}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="leads" fill={CHART_GREEN} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No business leads in this period.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
