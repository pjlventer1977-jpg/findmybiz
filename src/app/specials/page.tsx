import { getLatestSpecials } from "@/lib/queries/public";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Specials",
  description: "Browse the latest deals and promotions from South African businesses.",
};

export default async function SpecialsPage() {
  const specials = await getLatestSpecials(24);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Specials Board</h1>
          <p className="text-muted-foreground">Latest deals from verified businesses</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/specials">Post a Special</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specials.map((special) => (
          <Card key={special.id}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg">{special.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {special.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Valid until {new Date(special.expiry_date).toLocaleDateString("en-ZA")}
              </p>
              {special.business && (
                <Link
                  href={`/business/${special.business.slug}`}
                  className="text-sm text-primary mt-3 inline-block hover:underline"
                >
                  {special.business.name}
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {specials.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No active specials at the moment. Check back soon!
        </p>
      )}
    </div>
  );
}
