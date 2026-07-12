import { getUpcomingEvents } from "@/lib/queries/public";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Events",
  description: "Discover markets, festivals, expos, and events across South Africa.",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents(24);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events Hub</h1>
          <p className="text-muted-foreground">Markets, festivals, expos, and more</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events">List an Event</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="pt-6">
              <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                {event.category ?? "Event"}
              </span>
              <h3 className="font-semibold text-lg mt-2">{event.name}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(event.event_date).toLocaleDateString("en-ZA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {event.venue && <p className="text-sm mt-1">{event.venue}</p>}
              <Link
                href={`/events/${event.slug}`}
                className="text-sm text-primary mt-3 inline-block hover:underline"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No upcoming events. List yours today!
        </p>
      )}
    </div>
  );
}
