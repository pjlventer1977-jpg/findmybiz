import { Suspense } from "react";
import { HeroSection } from "@/components/home/sections/hero-section";
import { SectionShell } from "@/components/home/section-shell";

function HeroFallback() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <SectionShell className="py-10 lg:py-14">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-slate-200" />
          <div className="mx-auto h-5 w-1/2 animate-pulse rounded-lg bg-slate-200" />
          <div className="mx-auto h-24 w-full max-w-2xl animate-pulse rounded-xl bg-slate-200" />
        </div>
      </SectionShell>
    </section>
  );
}

export function HeroSectionAsync() {
  return (
    <Suspense fallback={<HeroFallback />}>
      <HeroSection />
    </Suspense>
  );
}
