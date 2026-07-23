import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import type { Special } from "@/types";

interface SpecialCardProps {
  special: Special;
}

export function SpecialCard({ special }: SpecialCardProps) {
  const expiryDate = new Date(special.expiry_date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-sa-gold/35 via-sa-gold/15 to-sa-red/25">
        {special.image_url ? (
          <Image
            src={special.image_url}
            alt={special.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gift className="h-14 w-14 text-sa-gold" aria-hidden />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-sa-red shadow-sm">
          Ends {expiryDate}
        </span>
      </div>

      <div className="p-4">
        <h2 className="line-clamp-2 text-base font-bold text-sa-blue">{special.title}</h2>
        {special.business && (
          <Link
            href={`/business/${special.business.slug}#specials`}
            className="mt-2 inline-block text-sm font-semibold text-sa-green transition-colors hover:text-sa-blue"
          >
            {special.business.name}
          </Link>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Valid until {expiryDate}</p>
          {special.business && (
            <Link
              href={`/business/${special.business.slug}#specials`}
              className="shrink-0 text-sm font-semibold text-sa-green transition-colors hover:text-sa-blue"
            >
              View deal
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
