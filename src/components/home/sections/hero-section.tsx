import Link from "next/link";
import { HeroSearch } from "@/components/home/hero-search";
import { SectionShell } from "@/components/home/section-shell";
import { HERO_BACKGROUND_IMAGE, POPULAR_SEARCHES } from "@/data/homepage";

export function HeroSection() {
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

      <SectionShell className="relative py-10 lg:py-14">
        <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-sa-blue sm:text-4xl lg:text-[2.75rem]">
            Find the Best Businesses{" "}
            <span className="text-sa-green">Near You</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Discover trusted businesses, compare quotes, browse specials and connect
            with local professionals across South Africa.
          </p>

          <div className="mx-auto mt-6 max-w-2xl">
            <HeroSearch />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
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
      </SectionShell>
    </section>
  );
}
