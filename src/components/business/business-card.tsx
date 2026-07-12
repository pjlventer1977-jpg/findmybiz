import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTrustBadgeLabel } from "@/lib/biz-trust-score";
import type { Business } from "@/types";

interface BusinessCardProps {
  business: Business;
  className?: string;
}

export function BusinessCard({ business, className }: BusinessCardProps) {
  const trust = getTrustBadgeLabel(business.biz_trust_score);

  return (
    <Link
      href={`/business/${business.slug}`}
      className={cn(
        "group block rounded-lg border bg-card p-4 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex gap-4">
        <div className="h-16 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {business.logo_url ? (
            <Image
              src={business.logo_url}
              alt={business.name}
              width={64}
              height={64}
              className="object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-primary">
              {business.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate group-hover:text-primary">
              {business.name}
            </h3>
            {business.is_verified && (
              <Shield className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>

          {business.city && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {business.city.name}
              {business.province && `, ${business.province.name}`}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-xs px-2 py-0.5 rounded-full text-white", trust.color)}>
              {trust.label}
            </span>
            {business.is_local_champion && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sa-gold text-foreground flex items-center gap-1">
                <Crown className="h-3 w-3" /> Champion
              </span>
            )}
            {business.membership_tier !== "free" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                {business.membership_tier}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TrustBadge({ score }: { score: number }) {
  const trust = getTrustBadgeLabel(score);
  return (
    <div className="flex items-center gap-2">
      <span className={cn("text-sm px-3 py-1 rounded-full text-white font-medium", trust.color)}>
        BizTrust {score}
      </span>
      <span className="text-sm text-muted-foreground">{trust.label}</span>
    </div>
  );
}

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.round(rating) ? "fill-sa-gold text-sa-gold" : "text-gray-300"
          )}
        />
      ))}
      {count !== undefined && (
        <span className="text-sm text-muted-foreground ml-1">({count})</span>
      )}
    </div>
  );
}
