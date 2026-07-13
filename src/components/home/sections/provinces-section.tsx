"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { SectionShell } from "@/components/home/section-shell";
import { SaProvinceMap } from "@/components/home/sa-province-map";
import { SA_PROVINCES } from "@/data/homepage";
import { cn } from "@/lib/utils";

export function ProvincesSection() {
  const [activeProvince, setActiveProvince] = useState<string | null>(null);

  return (
    <section className="bg-slate-50 py-10 sm:py-12">
      <SectionShell>
        <h2 className="mb-6 text-2xl font-bold text-sa-blue">
          Find Businesses in Your Province
        </h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex min-h-[280px] flex-col justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <SaProvinceMap
              className="mx-auto w-full flex-1"
              activeSlug={activeProvince}
              onProvinceHover={setActiveProvince}
            />
          </div>

          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {SA_PROVINCES.map((province) => (
              <li key={province.slug}>
                <Link
                  href={`/${province.slug}`}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-sa-green/5 hover:text-sa-green",
                    activeProvince === province.slug &&
                      "bg-sa-green/10 text-sa-green"
                  )}
                  onMouseEnter={() => setActiveProvince(province.slug)}
                  onMouseLeave={() => setActiveProvince(null)}
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
