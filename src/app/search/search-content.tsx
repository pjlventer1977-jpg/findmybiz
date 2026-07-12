import { searchBusinesses, getProvinces, getCategories } from "@/lib/queries/public";
import { BusinessCard } from "@/components/business/business-card";
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
      <h1 className="text-3xl font-bold mb-2">Find Businesses</h1>
      <p className="text-muted-foreground mb-6">
        {businesses.length} verified businesses found
        {params.q && ` for "${params.q}"`}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <SearchFilters
            provinces={provinces}
            categories={categories}
            currentParams={params}
          />
        </aside>

        <div className="lg:col-span-3 space-y-4">
          {businesses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No businesses found. Try adjusting your filters.</p>
            </div>
          ) : (
            businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
