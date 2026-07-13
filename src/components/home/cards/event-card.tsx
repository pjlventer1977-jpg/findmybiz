import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Event } from "@/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const date = new Date(event.event_date);
  const month = date.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase();
  const day = date.toLocaleDateString("en-ZA", { day: "2-digit" });
  const location = [event.city?.name, event.province?.name].filter(Boolean).join(", ");

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="relative h-24 overflow-hidden bg-gradient-to-r from-sa-blue via-sa-green to-sa-blue/80">
        {event.banner_url && (
          <Image
            src={event.banner_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-80 transition-transform group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex h-14 w-12 flex-col items-center justify-center rounded-lg bg-white text-center shadow-md">
          <span className="text-[10px] font-bold uppercase text-sa-green">{month}</span>
          <span className="text-lg font-bold leading-none text-slate-900">{day}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-sa-blue group-hover:text-sa-green">
          <Link href="/events">{event.name}</Link>
        </h3>
        {(location || event.venue) && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sa-green" />
            <span className="line-clamp-2">{event.venue ?? location}</span>
          </p>
        )}
      </div>
    </article>
  );
}
