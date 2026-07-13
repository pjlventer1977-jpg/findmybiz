import { Suspense } from "react";
import { getHomepageStats } from "@/lib/queries/public";
import { StatsBarSection } from "@/components/home/sections/stats-bar-section";
import { SectionShell } from "@/components/home/section-shell";

async function StatsBarContent() {
  const stats = await getHomepageStats();
  return <StatsBarSection stats={stats} />;
}

function StatsBarFallback() {
  return (
    <section className="border-y border-slate-200 bg-white py-6">
      <SectionShell>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </SectionShell>
    </section>
  );
}

export function StatsBarSectionAsync() {
  return (
    <Suspense fallback={<StatsBarFallback />}>
      <StatsBarContent />
    </Suspense>
  );
}
