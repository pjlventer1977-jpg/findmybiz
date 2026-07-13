import { searchBusinesses, getProvinces, getCategories } from "@/lib/queries/public";
import { BusinessCard } from "@/components/business/business-card";
import { SearchAppearanceTracker } from "@/components/analytics/search-appearance-tracker";
import { SearchFilters } from "./search-filters";

interface SearchPageContentProps {
  params: {
    q?: string;
    province?: string;
    city?: string;
    category?: string;
  };
}

export async function SearchPageContent({ params }: SearchPageContentProps) {
  const [businesses, provinces, categories] = await Promise.all([
    searchBusinesses({
      q: params.q,
      province: params.province,
      city: params.city,
      category: params.category,
    }),
    getProvinces(),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchAppearanceTracker
        businessIds={businesses.map((business) => business.id)}
        searchTerm={params.q}
      />
      <h1 className="mb-2 text-3xl font-bold text-sa-blue">Find Businesses</h1>
      <p className="mb-6 text-muted-foreground">
        {businesses.length} verified businesses found
        {params.q && ` for "${params.q}"`}
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <SearchFilters
            provinces={provinces}
            categories={categories}
            currentParams={params}
          />
        </aside>

        <div className="lg:col-span-3">
          {businesses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No businesses found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
