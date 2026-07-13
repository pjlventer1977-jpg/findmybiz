import { Suspense } from "react";
import { getFeaturedBusinesses } from "@/lib/queries/public";
import { FeaturedQuotesSection } from "@/components/home/sections/featured-quotes-section";
import { FeaturedBusinessesSkeleton } from "@/components/home/skeletons";

async function FeaturedQuotesContent() {
  const businesses = await getFeaturedBusinesses(4);
  return <FeaturedQuotesSection businesses={businesses} />;
}

export function FeaturedQuotesSectionAsync() {
  return (
    <Suspense
      fallback={
        <section className="bg-white py-10 sm:py-12">
          <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6">
            <div className="mb-5 h-8 w-48 animate-pulse rounded-md bg-slate-200" />
            <FeaturedBusinessesSkeleton />
          </div>
        </section>
      }
    >
      <FeaturedQuotesContent />
    </Suspense>
  );
}
