import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  Phone,
  Ticket,
} from "lucide-react";
import { SectionShell } from "@/components/home/section-shell";
import { Button } from "@/components/ui/button";
import { getEventBySlug } from "@/lib/queries/public";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatEventDateRange(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso);
  const startLabel = start.toLocaleString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!endIso) return startLabel;

  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return startLabel;

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    const endTime = end.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startLabel} – ${endTime}`;
  }

  const endLabel = end.toLocaleString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startLabel} – ${endLabel}`;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };

  return {
    title: event.name,
    description: event.description ?? `${event.name} on Find My Biz Events`,
    openGraph: {
      title: event.name,
      description: event.description ?? undefined,
      images: event.banner_url ? [event.banner_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const location = [event.city?.name, event.province?.name].filter(Boolean).join(", ");
  const ticketHref = event.ticket_link ?? event.website ?? null;
  const ticketIsExternal =
    ticketHref?.startsWith("http://") || ticketHref?.startsWith("https://");

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <SectionShell>
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="gap-2 text-sa-blue" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
          </Button>
        </div>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {event.banner_url ? (
            <div className="border-b border-slate-100 bg-slate-100">
              <Image
                src={event.banner_url}
                alt={event.name}
                width={0}
                height={0}
                sizes="100vw"
                priority
                unoptimized
                className="mx-auto h-auto max-h-[85vh] w-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-[3/2] w-full bg-gradient-to-r from-sa-blue via-sa-green to-sa-blue/80" />
          )}

          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              {event.category && (
                <p className="text-xs font-semibold uppercase tracking-wider text-sa-green">
                  {event.category}
                </p>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-sa-blue sm:text-4xl">
                {event.name}
              </h1>
              {event.description && (
                <p className="max-w-3xl text-base leading-relaxed text-slate-600">
                  {event.description}
                </p>
              )}
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <dt className="flex items-center gap-2 text-sm font-semibold text-sa-blue">
                  <CalendarDays className="h-4 w-4 text-sa-green" />
                  Date & time
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-700">
                  {formatEventDateRange(event.event_date, event.end_date)}
                </dd>
              </div>

              {(event.venue || location) && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-sa-blue">
                    <MapPin className="h-4 w-4 text-sa-green" />
                    Location
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-slate-700">
                    {event.venue}
                    {event.venue && location ? " · " : ""}
                    {location}
                  </dd>
                </div>
              )}

              {event.contact_phone && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-sa-blue">
                    <Phone className="h-4 w-4 text-sa-green" />
                    Phone
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`tel:${event.contact_phone.replace(/\s/g, "")}`}
                      className="text-sm text-slate-700 hover:text-sa-green"
                    >
                      {event.contact_phone}
                    </a>
                  </dd>
                </div>
              )}

              {event.contact_email && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-sa-blue">
                    <Mail className="h-4 w-4 text-sa-green" />
                    Email
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${event.contact_email}`}
                      className="text-sm text-slate-700 hover:text-sa-green"
                    >
                      {event.contact_email}
                    </a>
                  </dd>
                </div>
              )}

              {event.website && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-sa-blue">
                    <Globe className="h-4 w-4 text-sa-green" />
                    Website
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-700 hover:text-sa-green"
                    >
                      {event.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {ticketHref && (
              <Button
                className="h-11 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
                asChild
              >
                <a
                  href={ticketHref}
                  {...(ticketIsExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  {ticketHref.startsWith("mailto:") ? "Contact for tickets" : "Tickets & info"}
                </a>
              </Button>
            )}
          </div>
        </article>
      </SectionShell>
    </main>
  );
}
