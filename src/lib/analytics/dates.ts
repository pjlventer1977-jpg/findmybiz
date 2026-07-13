import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";

export type AnalyticsPeriod = 30 | 90;

export function getAnalyticsDateRange(days: AnalyticsPeriod) {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, days - 1));
  const prevEnd = startOfDay(subDays(start, 1));
  const prevStart = startOfDay(subDays(prevEnd, days - 1));
  return { start, end, prevStart, prevEnd };
}

export function buildDailySeries(
  days: AnalyticsPeriod,
  rows: { created_at: string }[]
) {
  const { start, end } = getAnalyticsDateRange(days);
  const interval = eachDayOfInterval({ start, end });
  const counts = new Map(
    interval.map((day) => [format(day, "yyyy-MM-dd"), 0])
  );

  for (const row of rows) {
    const key = format(new Date(row.created_at), "yyyy-MM-dd");
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return interval.map((day) => ({
    date: format(day, "dd MMM"),
    fullDate: format(day, "yyyy-MM-dd"),
    count: counts.get(format(day, "yyyy-MM-dd")) ?? 0,
  }));
}

export function buildWeeklyLeadSeries(
  days: AnalyticsPeriod,
  rows: { created_at: string }[]
) {
  const { start, end } = getAnalyticsDateRange(days);
  const counts = new Map<string, number>();

  for (const row of rows) {
    const created = new Date(row.created_at);
    if (created < start || created > end) continue;
    const weekStart = format(
      startOfWeek(created, { weekStartsOn: 1 }),
      "dd MMM"
    );
    counts.set(weekStart, (counts.get(weekStart) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([week, count]) => ({
    week,
    count,
  }));
}

export function countInRange(
  rows: { created_at: string }[],
  rangeStart: Date,
  rangeEnd: Date
) {
  return rows.filter((row) => {
    const created = new Date(row.created_at);
    return created >= rangeStart && created <= rangeEnd;
  }).length;
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
