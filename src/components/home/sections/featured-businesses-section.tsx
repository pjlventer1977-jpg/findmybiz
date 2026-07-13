import { BusinessCard } from "@/components/business/business-card";
import { EmptyState } from "@/components/home/empty-state";
import { SectionHeader } from "@/components/home/section-header";
import { SectionShell } from "@/components/home/section-shell";
import type { Business } from "@/types";

interface FeaturedBusinessesSectionProps {
  businesses: Business[];
}

export function FeaturedBusinessesSection({
  businesses,
}: FeaturedBusinessesSectionProps) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <SectionShell>
        <SectionHeader title="Featured Businesses" viewAllHref="/search" />
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </SectionShell>
    </section>
  );
}
