"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/lib/queries/analytics";

const CHART_GREEN = "#007A4D";
const CHART_BLUE = "#002395";
const CHART_GOLD = "#FFB612";

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function AnalyticsCharts({ data }: { data: AnalyticsSummary }) {
  const hasProfileViews = data.profileViewsByDay.some((row) => row.count > 0);
  const hasSearchData = data.searchAppearancesByDay.some((row) => row.count > 0);
  const hasLeadWeeks = data.leadsByWeek.length > 0;
  const hasFunnel = data.funnel.some((row) => row.value > 0);
  const hasStatus = data.leadStatusBreakdown.length > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Views</CardTitle>
        </CardHeader>
        <CardContent>
          {hasProfileViews ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.profileViewsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Views"
                  stroke={CHART_GREEN}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Profile view data will appear as customers visit your listing." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads by Week</CardTitle>
        </CardHeader>
        <CardContent>
          {hasLeadWeeks ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.leadsByWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Leads" fill={CHART_BLUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Lead activity will chart here once you start receiving enquiries." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Appearances</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSearchData ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.searchAppearancesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Appearances"
                  stroke={CHART_GOLD}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Search appearance data will appear when your business shows in results." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demand Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {hasFunnel ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.funnel} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                  {data.funnel.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === 0 ? CHART_GOLD : index === 1 ? CHART_GREEN : CHART_BLUE
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Your funnel will show search → views → leads once activity starts." />
          )}
        </CardContent>
      </Card>

      {hasStatus && (
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Lead Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.leadStatusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Leads" fill={CHART_GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
