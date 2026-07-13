import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard";
import { buildAnalyticsInsights } from "@/lib/analytics/insights";
import type { AnalyticsPeriod } from "@/lib/analytics/dates";
import { getBusinessAnalytics } from "@/lib/queries/analytics";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);
  if (!business) return <p>Register a business first.</p>;

  const isPro = ["professional", "enterprise"].includes(business.membership_tier);
  const isEnterprise = business.membership_tier === "enterprise";

  const params = await searchParams;
  const requestedDays = params.days === "90" ? 90 : 30;
  const periodDays: AnalyticsPeriod =
    requestedDays === 90 && isEnterprise ? 90 : 30;

  if (!isPro) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Demand Insights</h1>
        <Card>
          <CardContent className="py-8">
            <p className="font-medium mb-2">Upgrade to Professional</p>
            <p className="text-sm text-muted-foreground mb-4">
              Demand insights with charts, trends, and actionable tips are
              available on Professional and Enterprise plans.
            </p>
            <Button asChild>
              <Link href="/dashboard/billing">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analytics = await getBusinessAnalytics(business.id, periodDays);
  const insights = buildAnalyticsInsights(analytics);

  return (
    <AnalyticsDashboard
      data={analytics}
      insights={insights}
      periodDays={periodDays}
      isEnterprise={isEnterprise}
    />
  );
}
