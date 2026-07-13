import { Suspense } from "react";
import { getHomepageStats } from "@/lib/queries/public";
import { StatsMapSection } from "@/components/home/sections/stats-map-section";
import { SectionShell } from "@/components/home/section-shell";

async function StatsMapContent() {
  const stats = await getHomepageStats();
  return <StatsMapSection stats={stats} />;
}

function StatsMapFallback() {
  return (
    <section className="bg-slate-50 py-10 sm:py-12">
      <SectionShell className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </SectionShell>
    </section>
  );
}

export function StatsMapSectionAsync() {
  return (
    <Suspense fallback={<StatsMapFallback />}>
      <StatsMapContent />
    </Suspense>
  );
}
