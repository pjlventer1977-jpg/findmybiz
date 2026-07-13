import Link from "next/link";
import { Check, MessageCircle, Smartphone } from "lucide-react";
import { BusinessCard } from "@/components/business/business-card";
import { EmptyState } from "@/components/home/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { SectionShell } from "@/components/home/section-shell";
import { Button } from "@/components/ui/button";
import type { Business } from "@/types";

const QUOTE_CHECKLIST = [
  "Plumbing & Electrical",
  "Renovations & Building",
  "Cleaning & Gardening",
  "IT & Web Services",
];

interface FeaturedQuotesSectionProps {
  businesses: Business[];
}

export function FeaturedQuotesSection({ businesses }: FeaturedQuotesSectionProps) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <SectionShell>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <SectionHeader title="Featured Businesses" viewAllHref="/search" />
            {businesses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No featured businesses yet"
                description="Check back soon as new verified businesses join FindMyBiz."
              />
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-gradient-to-br from-sa-blue to-sa-green p-5 text-white shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-bold leading-tight">
              Get 5 Quotes — It&apos;s Free!
            </h2>
            <p className="mt-2 text-sm text-white/90">
              Describe your job once and receive up to five competitive quotes from
              verified local businesses.
            </p>
            <ul className="mt-4 space-y-2">
              {QUOTE_CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-sa-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden rounded-xl bg-white/10 p-4 sm:block">
              <Smartphone className="mx-auto h-12 w-12 text-white/80" aria-hidden />
            </div>
            <Button
              className="mt-5 h-10 w-full rounded-lg bg-white text-sm font-semibold text-sa-blue hover:bg-white/90"
              asChild
            >
              <Link href="/get-quotes">
                <MessageCircle className="mr-2 h-4 w-4" />
                Get 5 Quotes Now
              </Link>
            </Button>
          </aside>
        </div>
      </SectionShell>
    </section>
  );
}
