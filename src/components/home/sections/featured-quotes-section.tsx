import Link from "next/link";
import { Check, MessageCircle, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/home/empty-state";
import { FeaturedBusinessesCarousel } from "@/components/home/featured-businesses-carousel";
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
          <div className="relative min-w-0 overflow-hidden rounded-3xl border border-sa-gold/20 bg-gradient-to-br from-slate-50 via-white to-sa-gold/5 p-6 shadow-sm sm:p-8">
            <div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sa-gold via-amber-300 to-sa-gold"
              aria-hidden
            />
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sa-gold">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Premium Listings
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-sa-blue sm:text-3xl">
                  Featured Businesses
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                  Hand-picked Professional &amp; Enterprise businesses across South Africa
                </p>
              </div>
              <Link
                href="/search"
                className="shrink-0 pt-1 text-sm font-semibold text-sa-green hover:text-sa-blue hover:underline"
              >
                View all
              </Link>
            </div>
            {businesses.length > 0 ? (
              <>
                <FeaturedBusinessesCarousel businesses={businesses} />
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-sa-green" aria-hidden />
                  Featured listings include verified, premium members.
                </p>
              </>
            ) : (
              <EmptyState
                title="No Professional or Enterprise businesses yet"
                description="Check back soon as premium South African businesses join FindMyBiz."
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
