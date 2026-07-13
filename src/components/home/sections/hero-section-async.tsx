import { Suspense } from "react";
import { HeroSection } from "@/components/home/sections/hero-section";
import { SectionShell } from "@/components/home/section-shell";

function HeroFallback() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <SectionShell className="py-6 sm:py-8 lg:py-12">
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
          <div className="order-2 space-y-4 text-center lg:order-1 lg:text-left">
            <div className="mx-auto h-10 w-3/4 animate-pulse rounded-lg bg-slate-200 lg:mx-0" />
            <div className="mx-auto h-5 w-1/2 animate-pulse rounded-lg bg-slate-200 lg:mx-0" />
            <div className="mx-auto h-24 w-full max-w-2xl animate-pulse rounded-xl bg-slate-200 lg:mx-0" />
          </div>
          <div className="order-1 h-48 animate-pulse rounded-2xl bg-slate-200 lg:order-2 lg:h-64" />
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
