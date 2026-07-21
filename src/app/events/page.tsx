import { getUpcomingEvents } from "@/lib/queries/public";
import Link from "next/link";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { EventCard } from "@/components/home/cards/event-card";
import { SectionHeader } from "@/components/home/section-header";
import { SectionShell } from "@/components/home/section-shell";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Events",
  description: "Discover markets, festivals, expos, and events across South Africa.",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents(24);

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <SectionShell>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sa-blue via-sa-green/90 to-sa-blue px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border-[18px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-12 right-1/3 h-36 w-36 rounded-full bg-sa-gold/20 blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-sa-gold">
              <CalendarDays className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-wider">FindMyBiz Events</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Discover What&apos;s On
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
              Markets · Festivals · Expos · Networking — across all 9 provinces.
            </p>
            <Button
              className="mt-6 h-11 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-sa-gold/90"
              asChild
            >
              <Link href="/dashboard/events">List an Event</Link>
            </Button>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: "Free to browse", icon: Sparkles },
                { label: "SA-wide", icon: MapPin },
                { label: "Verified hosts", icon: CalendarDays },
              ].map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-sa-gold" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-8 sm:pt-10">
          <SectionHeader title="Upcoming Events" />
          {events.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-sa-green/35 bg-white px-6 py-12 text-center shadow-sm">
              <CalendarDays className="mx-auto h-11 w-11 text-sa-green" aria-hidden />
              <h2 className="mt-4 text-xl font-bold text-sa-blue">No upcoming events yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                Markets, festivals, and business expos will appear here. Be the first to list yours.
              </p>
              <Button
                className="mt-6 h-11 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
                asChild
              >
                <Link href="/dashboard/events">List an Event</Link>
              </Button>
            </div>
          )}
        </section>
      </SectionShell>
    </main>
  );
}
