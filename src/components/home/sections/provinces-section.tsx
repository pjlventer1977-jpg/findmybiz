import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { SectionShell } from "@/components/home/section-shell";
import { SA_PROVINCES } from "@/data/homepage";

export function ProvincesSection() {
  return (
    <section className="bg-slate-50 py-10 sm:py-12">
      <SectionShell>
        <h2 className="mb-6 text-2xl font-bold text-sa-blue">
          Find Businesses in Your Province
        </h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="absolute inset-8 rounded-[38%] bg-sa-green/10" />
            <div className="absolute inset-12 rounded-[42%] border-2 border-dashed border-sa-green/25" />
            {SA_PROVINCES.map((province, index) => (
              <span
                key={province.slug}
                className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-sa-green text-white shadow-sm"
                style={{
                  left: `${12 + ((index * 19) % 72)}%`,
                  top: `${14 + ((index * 13) % 68)}%`,
                }}
                title={province.name}
              >
                <MapPin className="h-3 w-3" aria-hidden />
              </span>
            ))}
            <p className="absolute bottom-4 left-4 text-xs font-medium text-muted-foreground">
              Businesses across all 9 provinces
            </p>
          </div>

          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {SA_PROVINCES.map((province) => (
              <li key={province.slug}>
                <Link
                  href={`/${province.slug}`}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-sa-green/5 hover:text-sa-green"
                >
                  {province.name}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>
    </section>
  );
}
