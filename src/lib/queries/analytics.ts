import { createClient } from "@/lib/supabase/server";
import {
  buildDailySeries,
  buildWeeklyLeadSeries,
  countInRange,
  getAnalyticsDateRange,
  percentChange,
  type AnalyticsPeriod,
} from "@/lib/analytics/dates";

export interface CategoryBenchmark {
  avgProfileViews: number;
  avgLeads: number;
  avgConversionRate: number;
  peersCount: number;
  leadsRank: number;
  viewsRank: number;
}

export interface AnalyticsSummary {
  periodDays: AnalyticsPeriod;
  profileViewsAllTime: number;
  profileViewsPeriod: number;
  profileViewsPrevPeriod: number;
  profileViewsChange: number;
  searchAppearancesAllTime: number;
  searchAppearancesPeriod: number;
  searchAppearancesPrevPeriod: number;
  searchAppearancesChange: number;
  leadsAllTime: number;
  leadsPeriod: number;
  leadsPrevPeriod: number;
  leadsChange: number;
  leadsUnread: number;
  conversionRate: number;
  profileViewsByDay: { date: string; fullDate: string; count: number }[];
  searchAppearancesByDay: { date: string; fullDate: string; count: number }[];
  leadsByWeek: { week: string; count: number }[];
  leadStatusBreakdown: { status: string; count: number }[];
  funnel: { label: string; value: number }[];
  bestLeadWeek: { week: string; count: number } | null;
  topReferrer: { label: string; count: number } | null;
  categoryBenchmark: CategoryBenchmark | null;
}

function formatReferrer(referrer: string | null) {
  if (!referrer) return "Direct / unknown";
  try {
    const url = new URL(referrer);
    if (url.hostname.includes("findmybiz")) return "FindMyBiz search";
    return url.hostname.replace("www.", "");
  } catch {
    return referrer;
  }
}

async function getCategoryBenchmark(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  businessProfileViews: number,
  businessLeads: number
): Promise<CategoryBenchmark | null> {
  const { data: categories } = await supabase
    .from("business_categories")
    .select("category_id")
    .eq("business_id", businessId);

  const categoryIds = categories?.map((row) => row.category_id) ?? [];
  if (!categoryIds.length) return null;

  const { data: peers } = await supabase
    .from("business_categories")
    .select("business_id")
    .in("category_id", categoryIds);

  const peerIds = [
    ...new Set(
      (peers ?? [])
        .map((row) => row.business_id)
        .filter((id) => id !== businessId)
    ),
  ];

  if (!peerIds.length) return null;

  const { data: peerBusinesses } = await supabase
    .from("businesses")
    .select("id, profile_views")
    .in("id", peerIds)
    .eq("status", "approved");

  const { data: peerLeads } = await supabase
    .from("leads")
    .select("business_id")
    .in("business_id", peerIds);

  const leadCounts = new Map<string, number>();
  for (const lead of peerLeads ?? []) {
    leadCounts.set(lead.business_id, (leadCounts.get(lead.business_id) ?? 0) + 1);
  }

  const peerStats = (peerBusinesses ?? []).map((peer) => {
    const views = peer.profile_views ?? 0;
    const leads = leadCounts.get(peer.id) ?? 0;
    return {
      id: peer.id,
      views,
      leads,
      conversion: views > 0 ? (leads / views) * 100 : 0,
    };
  });

  if (!peerStats.length) return null;

  const avgProfileViews = Math.round(
    peerStats.reduce((sum, peer) => sum + peer.views, 0) / peerStats.length
  );
  const avgLeads = Math.round(
    peerStats.reduce((sum, peer) => sum + peer.leads, 0) / peerStats.length
  );
  const avgConversionRate = Math.round(
    peerStats.reduce((sum, peer) => sum + peer.conversion, 0) / peerStats.length
  );

  const viewsRank =
    peerStats.filter((peer) => peer.views < businessProfileViews).length + 1;
  const leadsRank =
    peerStats.filter((peer) => peer.leads < businessLeads).length + 1;

  return {
    avgProfileViews,
    avgLeads,
    avgConversionRate,
    peersCount: peerStats.length,
    viewsRank,
    leadsRank,
  };
}

export async function getBusinessAnalytics(
  businessId: string,
  periodDays: AnalyticsPeriod
): Promise<AnalyticsSummary> {
  const supabase = await createClient();
  const { start, end, prevStart, prevEnd } = getAnalyticsDateRange(periodDays);
  const rangeStartIso = start.toISOString();
  const rangeEndIso = end.toISOString();

  const [
    businessResult,
    profileViewsResult,
    searchAppearancesResult,
    leadsResult,
    referrersResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("profile_views, search_appearances")
      .eq("id", businessId)
      .single(),
    supabase
      .from("profile_view_analytics")
      .select("created_at, referrer")
      .eq("business_id", businessId)
      .gte("created_at", prevStart.toISOString())
      .lte("created_at", rangeEndIso),
    supabase
      .from("search_appearance_analytics")
      .select("created_at")
      .eq("business_id", businessId)
      .gte("created_at", prevStart.toISOString())
      .lte("created_at", rangeEndIso),
    supabase
      .from("leads")
      .select("created_at, status")
      .eq("business_id", businessId),
    supabase
      .from("profile_view_analytics")
      .select("referrer")
      .eq("business_id", businessId)
      .gte("created_at", rangeStartIso)
      .lte("created_at", rangeEndIso),
  ]);

  const business = businessResult.data;
  const profileViews = profileViewsResult.data ?? [];
  const searchAppearances = searchAppearancesResult.error
    ? []
    : (searchAppearancesResult.data ?? []);
  const leads = leadsResult.data ?? [];
  const referrers = referrersResult.data ?? [];

  const profileViewsPeriod = countInRange(profileViews, start, end);
  const profileViewsPrevPeriod = countInRange(profileViews, prevStart, prevEnd);
  const searchAppearancesPeriod = countInRange(searchAppearances, start, end);
  const searchAppearancesPrevPeriod = countInRange(
    searchAppearances,
    prevStart,
    prevEnd
  );
  const leadsPeriod = countInRange(leads, start, end);
  const leadsPrevPeriod = countInRange(leads, prevStart, prevEnd);
  const leadsAllTime = leads.length;
  const leadsUnread = leads.filter((lead) => lead.status === "new").length;

  const conversionRate =
    profileViewsPeriod > 0
      ? Math.round((leadsPeriod / profileViewsPeriod) * 100)
      : 0;

  const profileViewsByDay = buildDailySeries(periodDays, profileViews);
  const searchAppearancesByDay = buildDailySeries(periodDays, searchAppearances);
  const leadsByWeek = buildWeeklyLeadSeries(periodDays, leads);

  const bestLeadWeek = leadsByWeek.reduce<{ week: string; count: number } | null>(
    (best, week) => {
      if (!best || week.count > best.count) return week;
      return best;
    },
    null
  );

  const referrerCounts = new Map<string, number>();
  for (const row of referrers) {
    const label = formatReferrer(row.referrer);
    referrerCounts.set(label, (referrerCounts.get(label) ?? 0) + 1);
  }
  const topReferrerEntry = [...referrerCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  const statusOrder = ["new", "viewed", "contacted", "closed", "expired"];
  const leadStatusBreakdown = statusOrder
    .map((status) => ({
      status: status === "new" ? "Unread" : status.charAt(0).toUpperCase() + status.slice(1),
      count: leads.filter((lead) => lead.status === status).length,
    }))
    .filter((row) => row.count > 0);

  const categoryBenchmark = await getCategoryBenchmark(
    supabase,
    businessId,
    business?.profile_views ?? 0,
    leadsAllTime
  );

  return {
    periodDays,
    profileViewsAllTime: business?.profile_views ?? 0,
    profileViewsPeriod,
    profileViewsPrevPeriod,
    profileViewsChange: percentChange(profileViewsPeriod, profileViewsPrevPeriod),
    searchAppearancesAllTime: business?.search_appearances ?? 0,
    searchAppearancesPeriod,
    searchAppearancesPrevPeriod,
    searchAppearancesChange: percentChange(
      searchAppearancesPeriod,
      searchAppearancesPrevPeriod
    ),
    leadsAllTime,
    leadsPeriod,
    leadsPrevPeriod,
    leadsChange: percentChange(leadsPeriod, leadsPrevPeriod),
    leadsUnread,
    conversionRate,
    profileViewsByDay,
    searchAppearancesByDay,
    leadsByWeek,
    leadStatusBreakdown,
    funnel: [
      { label: "Search appearances", value: searchAppearancesPeriod },
      { label: "Profile views", value: profileViewsPeriod },
      { label: "Leads received", value: leadsPeriod },
    ],
    bestLeadWeek,
    topReferrer: topReferrerEntry
      ? { label: topReferrerEntry[0], count: topReferrerEntry[1] }
      : null,
    categoryBenchmark,
  };
}
