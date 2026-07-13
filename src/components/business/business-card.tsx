import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  Crown,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import { getTrustBadgeLabel } from "@/lib/biz-trust-score";
import { buildWhatsAppLink, cn } from "@/lib/utils";
import type { Business } from "@/types";

interface BusinessCardProps {
  business: Business;
  className?: string;
  compact?: boolean;
}

export function BusinessCard({ business, className, compact = false }: BusinessCardProps) {
  const trust = getTrustBadgeLabel(business.biz_trust_score);
  const rating = Math.max(3.8, Math.min(5, business.biz_trust_score / 20));
  const location = [business.city?.name, business.province?.name].filter(Boolean).join(", ");
  const category = business.categories?.[0]?.name ?? "Local Business";
  const showPremium = business.is_featured || business.membership_tier !== "free";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <Link href={`/business/${business.slug}`} className="block">
        <div
          className={cn(
            "relative bg-gradient-to-br from-sa-blue via-sa-green to-sa-blue/80",
            compact ? "h-24" : "h-32"
          )}
        >
          {business.logo_url && (
            <Image
              src={business.logo_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-35"
            />
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {showPremium && (
              <span className="rounded-full bg-sa-gold px-2 py-0.5 text-[9px] font-bold uppercase text-slate-900 shadow-sm">
                Premium
              </span>
            )}
            {business.is_verified && (
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase text-sa-green shadow-sm">
                Verified
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className={cn("relative", compact ? "p-3 pt-7" : "p-4 pt-8")}>
        <Link
          href={`/business/${business.slug}`}
          className={cn(
            "absolute flex items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white shadow-md",
            compact ? "-top-6 left-3 h-12 w-12" : "-top-8 left-4 h-14 w-14"
          )}
        >
          {business.logo_url ? (
            <Image
              src={business.logo_url}
              alt={business.name}
              width={compact ? 48 : 56}
              height={compact ? 48 : 56}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-sa-green">
              {business.name.charAt(0)}
            </span>
          )}
        </Link>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/business/${business.slug}`}>
              <h3 className="truncate text-sm font-bold text-sa-blue group-hover:text-sa-green">
                {business.name}
              </h3>
            </Link>
            <p className="text-[11px] text-muted-foreground">{category}</p>
          </div>
          {business.is_verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-sa-green" aria-label="Verified" />
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StarRating rating={rating} compact />
          <span className="text-[11px] font-semibold text-slate-700">
            {rating.toFixed(1)}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold text-white",
              trust.color,
              compact && "hidden sm:inline-flex"
            )}
          >
            {trust.label}
          </span>
        </div>

        {location && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sa-green" />
            {location}
          </p>
        )}

        {business.is_local_champion && !compact && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-sa-gold/20 px-2 py-1 text-xs font-semibold text-sa-blue">
            <Crown className="h-3 w-3" /> Local Champion
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          {business.phone ? (
            <a
              href={`tel:${business.phone}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5"
              aria-label="Call"
            >
              <Phone className="h-4 w-4" />
            </a>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 text-slate-300">
              <Phone className="h-4 w-4" />
            </span>
          )}
          {business.whatsapp || business.phone ? (
            <a
              href={buildWhatsAppLink(
                business.whatsapp || business.phone,
                `Hi ${business.name}, I found you on Find My Biz.`
              )}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 text-slate-300">
              <MessageCircle className="h-4 w-4" />
            </span>
          )}
          {business.website ? (
            <a
              href={business.website}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5"
              aria-label="Website"
            >
              <Globe className="h-4 w-4" />
            </a>
          ) : (
            <Link
              href={`/business/${business.slug}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5"
              aria-label="Profile"
            >
              <Globe className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function TrustBadge({ score }: { score: number }) {
  const trust = getTrustBadgeLabel(score);
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "rounded-full px-3 py-1 text-sm font-medium text-white",
          trust.color
        )}
      >
        BizTrust {score}
      </span>
      <span className="text-sm text-muted-foreground">{trust.label}</span>
    </div>
  );
}

export function StarRating({
  rating,
  count,
  compact = false,
}: {
  rating: number;
  count?: number;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            i < Math.round(rating) ? "fill-sa-gold text-sa-gold" : "text-gray-300"
          )}
        />
      ))}
      {count !== undefined && (
        <span className="ml-1 text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
