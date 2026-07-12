import { notFound } from "next/navigation";
import Link from "next/link";
import { getProvinceBySlug, getCitiesByProvince, searchBusinesses } from "@/lib/queries/public";
import { BusinessCard } from "@/components/business/business-card";

interface PageProps {
  params: Promise<{ province: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { province: slug } = await params;
  const province = await getProvinceBySlug(slug);
  if (!province) return { title: "Province Not Found" };
  return {
    title: `Businesses in ${province.name}`,
    description: `Find verified businesses in ${province.name}, South Africa.`,
  };
}

export default async function ProvincePage({ params }: PageProps) {
  const { province: slug } = await params;
  const province = await getProvinceBySlug(slug);
  if (!province) notFound();

  const [cities, businesses] = await Promise.all([
    getCitiesByProvince(province.id),
    searchBusinesses({ province: slug, limit: 12 }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Businesses in {province.name}</h1>
      <p className="text-muted-foreground mb-8">
        Browse verified businesses across {province.name}
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Cities & Towns</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/${slug}/${city.slug}`}
              className="p-3 rounded-lg border hover:border-primary hover:shadow-sm text-sm text-center"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </section>

      {businesses.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Featured in {province.name}</h2>
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
