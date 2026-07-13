import Link from "next/link";
import { Building2, Check, CircleEllipsis, MapPin, MessageCircle } from "lucide-react";
import { SectionShell } from "@/components/home/section-shell";
import { SA_PROVINCES } from "@/data/homepage";

interface StatsMapSectionProps {
  stats: {
    businesses: number;
    categories: number;
    quotes: number;
    provinces: number;
  };
}

function formatStat(value: number) {
  if (value >= 10000) {
    return `${Math.floor(value / 100) / 100}`.replace(/\.?0+$/, "") + "k+";
  }
  if (value >= 1000) {
    return `${Math.floor(value / 100) / 10}k+`;
  }
  return `${value.toLocaleString("en-ZA")}+`;
}

const STAT_ITEMS = [
  { key: "businesses" as const, label: "Businesses Listed", icon: Building2 },
  { key: "categories" as const, label: "Categories", icon: CircleEllipsis },
  { key: "quotes" as const, label: "Quotes Requested", icon: MessageCircle },
  { key: "provinces" as const, label: "Provinces Covered", icon: MapPin },
];

export function StatsMapSection({ stats }: StatsMapSectionProps) {
  return (
    <section className="bg-slate-50 py-10 sm:py-12">
      <SectionShell className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="rounded-xl bg-slate-50 p-4 text-center transition-colors hover:bg-emerald-50/60"
            >
              <Icon className="mx-auto mb-2 h-6 w-6 text-primary" aria-hidden />
              <p className="text-2xl font-bold text-slate-900">
                {key === "provinces" ? stats.provinces : formatStat(stats[key])}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Businesses Across South Africa
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto]">
            <div className="relative min-h-44 overflow-hidden rounded-2xl bg-emerald-50">
              <div className="absolute inset-6 rounded-[42%] bg-emerald-200/60 blur-sm" />
              {Array.from({ length: 9 }).map((_, index) => (
                <span
                  key={index}
                  className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-md"
                  style={{
                    left: `${14 + ((index * 23) % 70)}%`,
                    top: `${16 + ((index * 17) % 60)}%`,
                  }}
                >
                  <MapPin className="h-3 w-3" aria-hidden />
                </span>
              ))}
            </div>
            <ul className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:min-w-[180px]">
              {SA_PROVINCES.map((province) => (
                <li key={province.slug}>
                  <Link
                    href={`/${province.slug}`}
                    className="flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:text-primary"
                  >
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {province.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}
