import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCityBySlug,
  getCategoryBySlug,
  searchBusinesses,
} from "@/lib/queries/public";
import { BusinessCard } from "@/components/business/business-card";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ province: string; city: string; category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { province, city, category } = await params;
  const [cityData, categoryData] = await Promise.all([
    getCityBySlug(province, city),
    getCategoryBySlug(category),
  ]);
  if (!cityData || !categoryData) return { title: "Not Found" };
  return {
    title: `${categoryData.name} in ${cityData.name}`,
    description: `Find ${categoryData.name.toLowerCase()} services in ${cityData.name}, South Africa. Request quotes from verified businesses.`,
  };
}

export default async function CategoryLocationPage({ params }: PageProps) {
  const { province, city: citySlug, category: categorySlug } = await params;
  const [cityData, categoryData] = await Promise.all([
    getCityBySlug(province, citySlug),
    getCategoryBySlug(categorySlug),
  ]);

  if (!cityData || !categoryData) notFound();

  const businesses = await searchBusinesses({
    province,
    city: citySlug,
    category: categorySlug,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href={`/${province}`} className="hover:text-primary capitalize">
          {(cityData.province as { name: string })?.name}
        </Link>
        {" / "}
        <Link href={`/${province}/${citySlug}`} className="hover:text-primary">
          {cityData.name}
        </Link>
        {" / "}
        <span>{categoryData.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {categoryData.name} in {cityData.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        {businesses.length} verified {categoryData.name.toLowerCase()} businesses
      </p>

      <Button asChild className="mb-8">
        <Link href={`/get-quotes?category=${categorySlug}&province=${province}&city=${citySlug}`}>
          Get 5 Quotes for {categoryData.name}
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No businesses listed yet in this category and area.
          </p>
          <Button asChild>
            <Link href="/register">List Your Business Here</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
