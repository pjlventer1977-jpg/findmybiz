import type { AnalyticsSummary } from "@/lib/queries/analytics";

export interface AnalyticsInsight {
  title: string;
  body: string;
  tone: "positive" | "neutral" | "action";
}

export function buildAnalyticsInsights(data: AnalyticsSummary): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  if (data.leadsPeriod > data.leadsPrevPeriod && data.leadsPeriod > 0) {
    insights.push({
      title: "Lead momentum is up",
      body: `You received ${data.leadsPeriod} lead${data.leadsPeriod === 1 ? "" : "s"} in the last ${data.periodDays} days — up from ${data.leadsPrevPeriod} in the previous period.`,
      tone: "positive",
    });
  }

  if (data.leadsUnread > 0) {
    insights.push({
      title: "Unread leads need attention",
      body: `${data.leadsUnread} lead${data.leadsUnread === 1 ? " is" : "s are"} still unread. Responding within 24 hours helps improve trust and conversion.`,
      tone: "action",
    });
  }

  if (data.profileViewsPeriod > data.profileViewsPrevPeriod && data.profileViewsPeriod > 0) {
    insights.push({
      title: "More people are viewing your profile",
      body: `Profile views rose to ${data.profileViewsPeriod} this period, compared with ${data.profileViewsPrevPeriod} previously.`,
      tone: "positive",
    });
  }

  if (data.bestLeadWeek && data.bestLeadWeek.count > 0) {
    insights.push({
      title: "Your strongest week for leads",
      body: `Week starting ${data.bestLeadWeek.week} brought in ${data.bestLeadWeek.count} lead${data.bestLeadWeek.count === 1 ? "" : "s"} — your best week in this period.`,
      tone: "neutral",
    });
  }

  if (data.conversionRate > 0 && data.categoryBenchmark) {
    if (data.conversionRate >= data.categoryBenchmark.avgConversionRate) {
      insights.push({
        title: "Strong lead conversion",
        body: `Your ${data.conversionRate}% view-to-lead rate is at or above the ${data.categoryBenchmark.avgConversionRate}% average for similar businesses.`,
        tone: "positive",
      });
    } else {
      insights.push({
        title: "Room to improve conversion",
        body: `Your ${data.conversionRate}% view-to-lead rate is below the ${data.categoryBenchmark.avgConversionRate}% category average. Add photos, specials, and a clear call-to-action.`,
        tone: "action",
      });
    }
  }

  if (data.profileViewsPeriod === 0 && data.searchAppearancesPeriod === 0) {
    insights.push({
      title: "Boost your visibility",
      body: "No profile views or search appearances yet this period. Complete your profile, add categories, and publish a special to get discovered.",
      tone: "action",
    });
  }

  if (data.topReferrer) {
    insights.push({
      title: "Top traffic source",
      body: `Most profile visits came from ${data.topReferrer.label} (${data.topReferrer.count} view${data.topReferrer.count === 1 ? "" : "s"}).`,
      tone: "neutral",
    });
  }

  return insights.slice(0, 5);
}
