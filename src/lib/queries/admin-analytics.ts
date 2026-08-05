import { createServiceClient } from "@/lib/supabase/server";
import {
  buildDailySeries,
  getAnalyticsDateRange,
  percentChange,
  type AnalyticsPeriod,
} from "@/lib/analytics/dates";

export interface AdminTopCategory {
  categoryId: string;
  name: string;
  searches: number;
}

export interface AdminLeadByBusiness {
  businessId: string;
  name: string;
  leads: number;
}

export interface AdminAnalyticsSummary {
  periodDays: AnalyticsPeriod;
  profileViewsPeriod: number;
  profileViewsPrevPeriod: number;
  profileViewsChange: number;
  profileViewsAllTime: number;
  searchEventsPeriod: number;
  searchEventsPrevPeriod: number;
  searchEventsChange: number;
  leadsPeriod: number;
  leadsPrevPeriod: number;
  leadsChange: number;
  leadsAllTime: number;
  quoteRequestsPeriod: number;
  businessesApproved: number;
  businessesPending: number;
  businessesTotal: number;
  profileViewsByDay: { date: string; fullDate: string; count: number }[];
  leadsByDay: { date: string; fullDate: string; count: number }[];
  topCategories: AdminTopCategory[];
  topBusinessesByLeads: AdminLeadByBusiness[];
}

export async function getAdminAnalytics(
  days: AnalyticsPeriod = 30
): Promise<AdminAnalyticsSummary> {
  const supabase = await createServiceClient();
  const { start, end, prevStart, prevEnd } = getAnalyticsDateRange(days);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const prevStartIso = prevStart.toISOString();
  const prevEndIso = prevEnd.toISOString();

  const [
    { data: profileViewsPeriodRows },
    { data: profileViewsPrevRows },
    { count: profileViewsAllTime },
    { data: searchPeriodRows },
    { data: searchPrevRows },
    { data: leadsPeriodRows },
    { data: leadsPrevRows },
    { count: leadsAllTime },
    { count: quoteRequestsPeriod },
    { count: businessesApproved },
    { count: businessesPending },
    { count: businessesTotal },
    { data: categorySearchRows },
    { data: leadBusinessRows },
  ] = await Promise.all([
    supabase
      .from("profile_view_analytics")
      .select("created_at")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    supabase
      .from("profile_view_analytics")
      .select("created_at")
      .gte("created_at", prevStartIso)
      .lte("created_at", prevEndIso),
    supabase
      .from("profile_view_analytics")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("search_analytics")
      .select("created_at")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    supabase
      .from("search_analytics")
      .select("created_at")
      .gte("created_at", prevStartIso)
      .lte("created_at", prevEndIso),
    supabase
      .from("leads")
      .select("created_at")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    supabase
      .from("leads")
      .select("created_at")
      .gte("created_at", prevStartIso)
      .lte("created_at", prevEndIso),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("quote_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("businesses").select("*", { count: "exact", head: true }),
    supabase
      .from("search_analytics")
      .select("category_id")
      .not("category_id", "is", null)
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    supabase
      .from("leads")
      .select("business_id")
      .gte("created_at", startIso)
      .lte("created_at", endIso),
  ]);

  const profileViewsPeriod = profileViewsPeriodRows?.length ?? 0;
  const profileViewsPrevPeriod = profileViewsPrevRows?.length ?? 0;
  const searchEventsPeriod = searchPeriodRows?.length ?? 0;
  const searchEventsPrevPeriod = searchPrevRows?.length ?? 0;
  const leadsPeriod = leadsPeriodRows?.length ?? 0;
  const leadsPrevPeriod = leadsPrevRows?.length ?? 0;

  // Top categories from search_analytics
  const categoryCounts = new Map<string, number>();
  for (const row of categorySearchRows ?? []) {
    if (!row.category_id) continue;
    categoryCounts.set(
      row.category_id,
      (categoryCounts.get(row.category_id) ?? 0) + 1
    );
  }

  // Fallback: if no search_analytics yet, use quote_requests by category
  if (categoryCounts.size === 0) {
    const { data: quoteCats } = await supabase
      .from("quote_requests")
      .select("category_id")
      .gte("created_at", startIso)
      .lte("created_at", endIso);
    for (const row of quoteCats ?? []) {
      if (!row.category_id) continue;
      categoryCounts.set(
        row.category_id,
        (categoryCounts.get(row.category_id) ?? 0) + 1
      );
    }
  }

  const topCategoryIds = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  let topCategories: AdminTopCategory[] = [];
  if (topCategoryIds.length) {
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .in(
        "id",
        topCategoryIds.map(([id]) => id)
      );
    const nameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
    topCategories = topCategoryIds.map(([categoryId, searches]) => ({
      categoryId,
      name: nameById.get(categoryId) ?? "Unknown category",
      searches,
    }));
  }

  // Top businesses by leads
  const leadCounts = new Map<string, number>();
  for (const row of leadBusinessRows ?? []) {
    if (!row.business_id) continue;
    leadCounts.set(row.business_id, (leadCounts.get(row.business_id) ?? 0) + 1);
  }
  const topLeadIds = [...leadCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  let topBusinessesByLeads: AdminLeadByBusiness[] = [];
  if (topLeadIds.length) {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, name")
      .in(
        "id",
        topLeadIds.map(([id]) => id)
      );
    const nameById = new Map((businesses ?? []).map((b) => [b.id, b.name]));
    topBusinessesByLeads = topLeadIds.map(([businessId, leads]) => ({
      businessId,
      name: nameById.get(businessId) ?? "Unknown business",
      leads,
    }));
  }

  return {
    periodDays: days,
    profileViewsPeriod,
    profileViewsPrevPeriod,
    profileViewsChange: percentChange(profileViewsPeriod, profileViewsPrevPeriod),
    profileViewsAllTime: profileViewsAllTime ?? 0,
    searchEventsPeriod,
    searchEventsPrevPeriod,
    searchEventsChange: percentChange(searchEventsPeriod, searchEventsPrevPeriod),
    leadsPeriod,
    leadsPrevPeriod,
    leadsChange: percentChange(leadsPeriod, leadsPrevPeriod),
    leadsAllTime: leadsAllTime ?? 0,
    quoteRequestsPeriod: quoteRequestsPeriod ?? 0,
    businessesApproved: businessesApproved ?? 0,
    businessesPending: businessesPending ?? 0,
    businessesTotal: businessesTotal ?? 0,
    profileViewsByDay: buildDailySeries(days, profileViewsPeriodRows ?? []),
    leadsByDay: buildDailySeries(days, leadsPeriodRows ?? []),
    topCategories,
    topBusinessesByLeads,
  };
}
