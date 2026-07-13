import { EmptyState } from "@/components/home/empty-state";
import { EventCard } from "@/components/home/cards/event-card";
import { SectionHeader } from "@/components/home/section-header";
import { SectionShell } from "@/components/home/section-shell";
import type { Event } from "@/types";

interface UpcomingEventsSectionProps {
  events: Event[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <SectionShell>
        <SectionHeader
          title="Upcoming Events"
          viewAllHref="/events"
          viewAllLabel="View all events"
        />
        {events.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming events"
            description="New networking events and business showcases will appear here soon."
          />
        )}
      </SectionShell>
    </section>
  );
}
