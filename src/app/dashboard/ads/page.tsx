import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { AdsDashboard } from "./ads-client";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}

export default async function DashboardAdsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold">Advertising</h1>
        <p className="mt-2 text-muted-foreground">Register a business to purchase ads.</p>
        <Button asChild className="mt-4">
          <Link href="/register">Register Your Business</Link>
        </Button>
      </div>
    );
  }

  if (business.status !== "approved") {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold">Advertising</h1>
        <p className="mt-2 text-muted-foreground">
          Your business must be approved before you can purchase featured or banner ads.
        </p>
      </div>
    );
  }

  const { data: categoryLinks } = await supabase
    .from("business_categories")
    .select("category:categories(id, name)")
    .eq("business_id", business.id);

  const categories = (categoryLinks ?? [])
    .map((row) => {
      const category = row.category as { id: string; name: string } | { id: string; name: string }[] | null;
      if (Array.isArray(category)) return category[0] ?? null;
      return category;
    })
    .filter((category): category is { id: string; name: string } => Boolean(category));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Featured &amp; Banner Ads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Boost visibility with homepage featured placement or paid banner slots.
        </p>
      </div>

      {params.success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment received. Your advert will go live once PayFast confirms the transaction
          (usually within a minute).
        </p>
      )}

      {params.cancelled && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Payment was cancelled. No advert was purchased.
        </p>
      )}

      <AdsDashboard
        businessId={business.id}
        businessName={business.name}
        categories={categories}
      />
    </div>
  );
}
