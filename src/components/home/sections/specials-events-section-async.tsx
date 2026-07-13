import { Suspense } from "react";
import { getLatestSpecials, getUpcomingEvents } from "@/lib/queries/public";
import { SpecialsEventsSection } from "@/components/home/sections/specials-events-section";
import { EventsSkeleton } from "@/components/home/skeletons";
import { SectionShell } from "@/components/home/section-shell";

async function SpecialsEventsContent() {
  const [specials, events] = await Promise.all([
    getLatestSpecials(3),
    getUpcomingEvents(4),
  ]);
  return <SpecialsEventsSection specials={specials} events={events} />;
}

function SpecialsEventsFallback() {
  return (
    <section className="border-t border-slate-100 bg-slate-50 py-10 sm:py-12">
      <SectionShell className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
        <EventsSkeleton />
      </SectionShell>
    </section>
  );
}

export function SpecialsEventsSectionAsync() {
  return (
    <Suspense fallback={<SpecialsEventsFallback />}>
      <SpecialsEventsContent />
    </Suspense>
  );
}
