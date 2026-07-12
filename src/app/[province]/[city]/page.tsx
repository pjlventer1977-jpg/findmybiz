import { notFound } from "next/navigation";
import Link from "next/link";
import { getCityBySlug, searchBusinesses, getCategories } from "@/lib/queries/public";
import { BusinessCard } from "@/components/business/business-card";

interface PageProps {
  params: Promise<{ province: string; city: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { province, city } = await params;
  const cityData = await getCityBySlug(province, city);
  if (!cityData) return { title: "City Not Found" };
  return {
    title: `Businesses in ${cityData.name}`,
    description: `Find verified businesses in ${cityData.name}, South Africa.`,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { province, city: citySlug } = await params;
  const cityData = await getCityBySlug(province, citySlug);
  if (!cityData) notFound();

  const [businesses, categories] = await Promise.all([
    searchBusinesses({ province, city: citySlug, limit: 12 }),
    getCategories(),
  ]);

  const provinceName = (cityData.province as { name: string })?.name ?? province;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href={`/${province}`} className="hover:text-primary capitalize">
          {provinceName}
        </Link>
        {" / "}
        <span>{cityData.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        Businesses in {cityData.name}
      </h1>
      <p className="text-muted-foreground mb-8">
        {businesses.length} verified businesses in {cityData.name}, {provinceName}
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.slice(0, 16).map((cat) => (
            <Link
              key={cat.id}
              href={`/${province}/${citySlug}/${cat.slug}`}
              className="p-3 rounded-lg border hover:border-primary text-sm text-center"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {businesses.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
