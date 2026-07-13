import Link from "next/link";
import { CircleEllipsis } from "lucide-react";
import { HeroSearch } from "@/components/home/hero-search";
import { CategoryCard } from "@/components/home/cards/category-card";
import { SectionShell } from "@/components/home/section-shell";
import {
  CATEGORY_ICONS,
  HERO_BACKGROUND_IMAGE,
  POPULAR_SEARCHES,
} from "@/data/homepage";
import type { Category } from "@/types";

interface HeroSectionProps {
  categories: Category[];
}

export function HeroSection({ categories }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07]"
        style={{ backgroundImage: `url('${HERO_BACKGROUND_IMAGE}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,35,149,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,35,149,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden
      />

      <SectionShell className="relative grid items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-12">
        <div className="min-w-0">
          <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-sa-blue sm:text-4xl lg:text-[2.75rem]">
            Find the Best Businesses{" "}
            <span className="text-sa-green">Near You</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
            Discover trusted businesses, compare quotes, browse specials and connect
            with local professionals across South Africa.
          </p>

          <div className="mt-6 max-w-2xl">
            <HeroSearch />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Popular:</span>
            {POPULAR_SEARCHES.map(({ label, query }) => (
              <Link
                key={label}
                href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-sa-green hover:text-sa-green"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.slice(0, 12).map((category, index) => {
                const Icon = CATEGORY_ICONS[index] ?? CircleEllipsis;
                return (
                  <CategoryCard
                    key={category.id}
                    name={category.name}
                    slug={category.slug}
                    icon={Icon}
                  />
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Categories will appear here soon.
            </p>
          )}
        </div>
      </SectionShell>
    </section>
  );
}
