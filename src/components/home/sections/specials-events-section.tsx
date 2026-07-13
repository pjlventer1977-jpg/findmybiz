import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import { EventCard } from "@/components/home/cards/event-card";
import { EmptyState } from "@/components/home/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { SectionShell } from "@/components/home/section-shell";
import { Button } from "@/components/ui/button";
import type { Event, Special } from "@/types";

interface SpecialsEventsSectionProps {
  specials: Special[];
  events: Event[];
}

export function SpecialsEventsSection({
  specials,
  events,
}: SpecialsEventsSectionProps) {
  const featuredSpecial = specials[0];

  return (
    <section className="border-t border-slate-100 bg-slate-50 py-10 sm:py-12">
      <SectionShell className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <SectionHeader
            title="Today's Specials"
            viewAllHref="/specials"
            viewAllLabel="View all"
          />
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid sm:grid-cols-[200px_1fr]">
              <div className="relative min-h-[160px] bg-gradient-to-br from-sa-gold/30 to-sa-red/20 sm:min-h-full">
                {featuredSpecial?.image_url ? (
                  <Image
                    src={featuredSpecial.image_url}
                    alt="Today's special"
                    fill
                    sizes="200px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full min-h-[160px] items-center justify-center">
                    <Gift className="h-16 w-16 text-sa-gold" aria-hidden />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center p-5">
                <h3 className="text-lg font-bold text-sa-blue">
                  {featuredSpecial
                    ? featuredSpecial.business?.name ?? "Local Business Special"
                    : "Deals from verified businesses"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {featuredSpecial
                    ? "Limited-time offers from businesses across South Africa."
                    : "Browse the latest promotions and save with local service providers."}
                </p>
                <Button
                  className="mt-4 h-10 w-fit rounded-lg bg-sa-gold text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
                  asChild
                >
                  <Link href="/specials">View Specials</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <SectionHeader
            title="Upcoming Events"
            viewAllHref="/events"
            viewAllLabel="View all events"
          />
          {events.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {events.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming events"
              description="Networking events and business showcases will appear here soon."
            />
          )}
        </div>
      </SectionShell>
    </section>
  );
}
