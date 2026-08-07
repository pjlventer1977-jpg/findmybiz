import { searchBusinesses, getProvinces, getCategoryTree, getCategoryBySlug } from "@/lib/queries/public";
import { BusinessCard } from "@/components/business/business-card";
import { SearchAppearanceTracker } from "@/components/analytics/search-appearance-tracker";
import { logSearchAnalytics } from "@/lib/analytics/log-search";
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
  const [businesses, provinces, categories, activeCategory] = await Promise.all([
    searchBusinesses({
      q: params.q,
      province: params.province,
      city: params.city,
      category: params.category,
    }),
    getProvinces(),
    getCategoryTree(),
    params.category ? getCategoryBySlug(params.category) : Promise.resolve(null),
  ]);

  const categoryLabel = activeCategory?.name;

  void logSearchAnalytics({
    categoryId: activeCategory?.id,
    searchTerm: params.q,
    resultsCount: businesses.length,
  });

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
        {categoryLabel && ` in ${categoryLabel}`}
        {params.q && !categoryLabel && (
          <span className="block text-xs mt-1">
            Matching business names, descriptions, and service categories
          </span>
        )}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  compact
                  variant="featured"
                  className="h-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
