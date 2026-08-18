"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Globe,
  Mail,
  MapPin,
  Phone,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types";

function formatDateRange(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso);
  const startLabel = start.toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!endIso) return startLabel;
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return startLabel;

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${startLabel} – ${end.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return `${startLabel} – ${end.toLocaleString("en-ZA", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`;
}

interface ProvinceGroup {
  provinceName: string;
  events: Event[];
}

function groupByProvince(events: Event[]): ProvinceGroup[] {
  const map = new Map<string, { name: string; events: Event[] }>();
  const noProvince: Event[] = [];

  for (const event of events) {
    const provName = (event.province as { name?: string } | undefined)?.name;
    if (!provName) {
      noProvince.push(event);
      continue;
    }
    const existing = map.get(provName);
    if (existing) {
      existing.events.push(event);
    } else {
      map.set(provName, { name: provName, events: [event] });
    }
  }

  const groups = [...map.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((group) => ({ provinceName: group.name, events: group.events }));

  if (noProvince.length > 0) {
    groups.push({ provinceName: "Other", events: noProvince });
  }

  return groups;
}

function EventExpandCard({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(event.event_date);
  const month = date.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase();
  const day = date.toLocaleDateString("en-ZA", { day: "2-digit" });
  const location = [
    event.venue,
    (event.city as { name?: string } | undefined)?.name,
  ]
    .filter(Boolean)
    .join(", ");
  const ticketHref = event.ticket_link || event.website || null;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50"
      >
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-r from-sa-blue via-sa-green to-sa-blue/80">
          {event.banner_url && (
            <Image
              src={event.banner_url}
              alt=""
              fill
              sizes="80px"
              className="object-cover opacity-80"
              unoptimized
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center text-white">
            <span className="text-[9px] font-bold uppercase">{month}</span>
            <span className="text-base font-bold leading-none">{day}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-sa-blue">{event.name}</h3>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-sa-green" />
              <span className="line-clamp-1">{location}</span>
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDateRange(event.event_date, event.end_date)}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {event.banner_url && (
            <div className="bg-slate-100">
              <Image
                src={event.banner_url}
                alt={event.name}
                width={0}
                height={0}
                sizes="100vw"
                className="mx-auto h-auto max-h-[60vh] w-full object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="space-y-4 p-4 sm:p-5">
            {event.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {event.description}
              </p>
            )}

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-sm">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sa-green" />
                <div>
                  <dt className="font-semibold text-sa-blue">Date & time</dt>
                  <dd className="text-slate-600">{formatDateRange(event.event_date, event.end_date)}</dd>
                </div>
              </div>
              {location && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sa-green" />
                  <div>
                    <dt className="font-semibold text-sa-blue">Location</dt>
                    <dd className="text-slate-600">{location}</dd>
                  </div>
                </div>
              )}
              {event.contact_phone && (
                <div className="flex items-start gap-2 text-sm">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sa-green" />
                  <div>
                    <dt className="font-semibold text-sa-blue">Phone</dt>
                    <dd>
                      <a href={`tel:${event.contact_phone.replace(/\s/g, "")}`} className="text-slate-600 hover:text-sa-green">
                        {event.contact_phone}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {event.contact_email && (
                <div className="flex items-start gap-2 text-sm">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sa-green" />
                  <div>
                    <dt className="font-semibold text-sa-blue">Email</dt>
                    <dd>
                      <a href={`mailto:${event.contact_email}`} className="text-slate-600 hover:text-sa-green">
                        {event.contact_email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {event.website && (
                <div className="flex items-start gap-2 text-sm">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-sa-green" />
                  <div>
                    <dt className="font-semibold text-sa-blue">Website</dt>
                    <dd>
                      <a href={event.website} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-sa-green">
                        {event.website.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            {ticketHref && (
              <Button
                className="h-10 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
                asChild
              >
                <a
                  href={ticketHref}
                  {...(ticketHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  {ticketHref.startsWith("mailto:") ? "Contact for tickets" : "Tickets & info"}
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function EventsGroupedByProvince({ events }: { events: Event[] }) {
  const groups = groupByProvince(events);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.provinceName}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-sa-blue">
            <MapPin className="h-5 w-5 text-sa-green" />
            {group.provinceName}
            <span className="text-sm font-normal text-muted-foreground">
              ({group.events.length})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.events.map((event) => (
              <EventExpandCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
