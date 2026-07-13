import { Building2, CircleEllipsis, MapPin, MessageCircle } from "lucide-react";
import { SectionShell } from "@/components/home/section-shell";

interface StatsBarSectionProps {
  stats: {
    businesses: number;
    categories: number;
    quotes: number;
    provinces: number;
  };
}

function formatStat(value: number) {
  if (value >= 10000) {
    return `${Math.floor(value / 100).toLocaleString("en-ZA")}+`;
  }
  if (value >= 1000) {
    const formatted = Math.floor(value / 100) / 10;
    return `${formatted.toLocaleString("en-ZA")}k+`;
  }
  return `${value.toLocaleString("en-ZA")}+`;
}

const STAT_ITEMS = [
  { key: "businesses" as const, label: "Businesses Listed", icon: Building2 },
  { key: "categories" as const, label: "Categories", icon: CircleEllipsis },
  { key: "quotes" as const, label: "Quotes Requested", icon: MessageCircle },
  { key: "provinces" as const, label: "Provinces Covered", icon: MapPin },
];

export function StatsBarSection({ stats }: StatsBarSectionProps) {
  return (
    <section className="border-y border-slate-200 bg-white py-6">
      <SectionShell>
        <div className="grid grid-cols-2 gap-4 divide-x-0 divide-slate-100 lg:grid-cols-4 lg:divide-x">
          {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="flex items-center gap-3 px-0 text-center sm:text-left lg:px-6 first:lg:pl-0"
            >
              <span className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sa-green/10 text-sa-green sm:mx-0">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xl font-bold text-sa-blue sm:text-2xl">
                  {key === "provinces" ? stats.provinces : formatStat(stats[key])}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
