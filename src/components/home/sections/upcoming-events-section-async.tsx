import { Suspense } from "react";
import { getUpcomingEvents } from "@/lib/queries/public";
import { UpcomingEventsSection } from "@/components/home/sections/upcoming-events-section";
import { EventsSkeleton } from "@/components/home/skeletons";

async function UpcomingEventsContent() {
  const events = await getUpcomingEvents(4);
  return <UpcomingEventsSection events={events} />;
}

export function UpcomingEventsSectionAsync() {
  return (
    <Suspense
      fallback={
        <section className="bg-white py-10 sm:py-12">
          <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6">
            <div className="mb-5 h-8 w-40 animate-pulse rounded-md bg-slate-200" />
            <EventsSkeleton />
          </div>
        </section>
      }
    >
      <UpcomingEventsContent />
    </Suspense>
  );
}
