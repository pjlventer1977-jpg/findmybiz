import { Suspense } from "react";
import { getPopularCategories } from "@/lib/queries/public";
import { HeroSection } from "@/components/home/sections/hero-section";
import { CategoryGridSkeleton } from "@/components/home/skeletons";
import { SectionShell } from "@/components/home/section-shell";

async function HeroContent() {
  const categories = await getPopularCategories();
  return <HeroSection categories={categories} />;
}

function HeroFallback() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <SectionShell className="grid min-h-[420px] items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="h-12 w-3/4 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-5 w-1/2 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <CategoryGridSkeleton />
        </div>
      </SectionShell>
    </section>
  );
}

export function HeroSectionAsync() {
  return (
    <Suspense fallback={<HeroFallback />}>
      <HeroContent />
    </Suspense>
  );
}
