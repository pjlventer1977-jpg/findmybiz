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
  variant?: "default" | "featured";
}

export function BusinessCard({
  business,
  className,
  compact = false,
  variant = "default",
}: BusinessCardProps) {
  const trust = getTrustBadgeLabel(business.biz_trust_score);
  const reviewCount = business.approved_review_count ?? 0;
  const hasReviews = reviewCount > 0;
  const rating = business.average_review_rating ?? 0;
  const location = [business.city?.name, business.province?.name].filter(Boolean).join(", ");
  const category = business.categories?.[0]?.name ?? "Local Business";
  const showPremium = business.is_featured || business.membership_tier !== "free";
  const isFeatured = variant === "featured";
  const isCompactFeatured = compact && isFeatured;
  const logoBoxSize = isCompactFeatured ? 80 : 96;
  const actionButtonSize = isCompactFeatured ? "h-7 w-7" : "h-8 w-8";
  const actionIconSize = isCompactFeatured ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <article
      className={cn(
        "group overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        isCompactFeatured ? "rounded-xl" : "rounded-2xl",
        "relative",
        isFeatured &&
          "border-sa-gold/30 ring-1 ring-sa-gold/40 shadow-md hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      <Link href={`/business/${business.slug}`} className="block">
        {isFeatured ? (
          <div
            className={cn(
              "relative flex items-center justify-center border-b border-slate-100 bg-slate-50",
              isCompactFeatured ? "h-28" : "h-32"
            )}
          >
            <div
              className={cn(
                "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100",
                isCompactFeatured ? "h-20 w-20" : "h-24 w-24"
              )}
            >
              {business.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt=""
                  width={logoBoxSize}
                  height={logoBoxSize}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span
                  className={cn(
                    "font-bold text-sa-green",
                    isCompactFeatured ? "text-2xl" : "text-3xl"
                  )}
                >
                  {business.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        ) : (
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
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase text-sa-green shadow-sm">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        )}
      </Link>

      <div
        className={cn(
          "relative",
          isFeatured
            ? isCompactFeatured
              ? "p-2.5"
              : "p-4"
            : compact
              ? "p-3 pt-7"
              : "p-4 pt-8"
        )}
      >
        {!isFeatured && (
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
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/business/${business.slug}`}>
              <h3 className="truncate text-sm font-bold text-sa-blue group-hover:text-sa-green">
                {business.name}
              </h3>
            </Link>
            <p className="text-[11px] text-muted-foreground">{category}</p>
          </div>
          {business.is_verified && !isFeatured && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-sa-green" aria-label="Verified" />
          )}
        </div>

        {hasReviews ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StarRating rating={rating} compact count={reviewCount} />
            <span className="text-[11px] font-semibold text-slate-700">
              {rating.toFixed(1)}
            </span>
          </div>
        ) : (
          <div className="mt-1.5">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white",
                trust.color
              )}
            >
              {trust.label}
            </span>
          </div>
        )}

        {location && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sa-green" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {business.is_local_champion && !compact && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-sa-gold/20 px-2 py-1 text-xs font-semibold text-sa-blue">
            <Crown className="h-3 w-3" /> Local Champion
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-2 border-t border-slate-100 pt-2.5",
            isCompactFeatured ? "mt-2" : "mt-3"
          )}
        >
          {business.phone ? (
            <a
              href={`tel:${business.phone}`}
              className={cn(
                "flex items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5",
                actionButtonSize
              )}
              aria-label="Call"
            >
              <Phone className={actionIconSize} />
            </a>
          ) : (
            <span
              className={cn(
                "flex items-center justify-center rounded-lg border border-slate-100 text-slate-300",
                actionButtonSize
              )}
            >
              <Phone className={actionIconSize} />
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
              className={cn(
                "flex items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5",
                actionButtonSize
              )}
              aria-label="WhatsApp"
            >
              <MessageCircle className={actionIconSize} />
            </a>
          ) : (
            <span
              className={cn(
                "flex items-center justify-center rounded-lg border border-slate-100 text-slate-300",
                actionButtonSize
              )}
            >
              <MessageCircle className={actionIconSize} />
            </span>
          )}
          {business.website ? (
            <a
              href={business.website}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "flex items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5",
                actionButtonSize
              )}
              aria-label="Website"
            >
              <Globe className={actionIconSize} />
            </a>
          ) : (
            <Link
              href={`/business/${business.slug}`}
              className={cn(
                "flex items-center justify-center rounded-lg border border-slate-200 text-sa-green transition-colors hover:border-sa-green hover:bg-sa-green/5",
                actionButtonSize
              )}
              aria-label="Profile"
            >
              <Globe className={actionIconSize} />
            </Link>
          )}
        </div>
      </div>
      {isFeatured && business.is_verified && (
        <span
          className={cn(
            "absolute inline-flex items-center gap-1 rounded-full bg-sa-green px-2 py-1 text-[9px] font-bold uppercase text-white shadow-sm",
            isCompactFeatured ? "bottom-2 right-2" : "bottom-3 right-3"
          )}
        >
          <BadgeCheck className="h-3 w-3" />
          Verified
        </span>
      )}
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
