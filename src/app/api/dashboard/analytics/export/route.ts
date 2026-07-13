import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { getBusinessAnalytics } from "@/lib/queries/analytics";
import type { AnalyticsPeriod } from "@/lib/analytics/dates";

function parsePeriod(value: string | null): AnalyticsPeriod {
  return value === "90" ? 90 : 30;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await getOwnerPrimaryBusiness(user.id);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (business.membership_tier !== "enterprise") {
      return NextResponse.json(
        { error: "CSV export is available on Enterprise plans" },
        { status: 403 }
      );
    }

    const days = parsePeriod(request.nextUrl.searchParams.get("days"));
    const analytics = await getBusinessAnalytics(business.id, days);

    const lines = [
      "FindMyBiz Demand Insights Export",
      `Business,${business.name}`,
      `Period,Last ${days} days`,
      `Generated,${format(new Date(), "yyyy-MM-dd HH:mm")}`,
      "",
      "Summary",
      "Metric,Value,Change vs previous period",
      `Profile views (period),${analytics.profileViewsPeriod},${analytics.profileViewsChange}%`,
      `Search appearances (period),${analytics.searchAppearancesPeriod},${analytics.searchAppearancesChange}%`,
      `Leads received (period),${analytics.leadsPeriod},${analytics.leadsChange}%`,
      `Conversion rate,${analytics.conversionRate}%,`,
      `Unread leads,${analytics.leadsUnread},`,
      "",
      "Daily profile views",
      "Date,Views",
      ...analytics.profileViewsByDay.map((row) => `${row.fullDate},${row.count}`),
      "",
      "Daily search appearances",
      "Date,Appearances",
      ...analytics.searchAppearancesByDay.map(
        (row) => `${row.fullDate},${row.count}`
      ),
      "",
      "Weekly leads",
      "Week starting,Leads",
      ...analytics.leadsByWeek.map((row) => `${row.week},${row.count}`),
      "",
      "Lead status breakdown",
      "Status,Count",
      ...analytics.leadStatusBreakdown.map((row) => `${row.status},${row.count}`),
    ];

    const filename = `findmybiz-analytics-${business.slug}-${days}d.csv`;

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
