import { Suspense } from "react";
import { getFeaturedBusinesses } from "@/lib/queries/public";
import { FeaturedBusinessesSection } from "@/components/home/sections/featured-businesses-section";
import { FeaturedBusinessesSkeleton } from "@/components/home/skeletons";

async function FeaturedBusinessesContent() {
  const businesses = await getFeaturedBusinesses(4);
  return <FeaturedBusinessesSection businesses={businesses} />;
}

export function FeaturedBusinessesSectionAsync() {
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
      <FeaturedBusinessesContent />
    </Suspense>
  );
}
