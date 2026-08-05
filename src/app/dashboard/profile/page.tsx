import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Circle } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { getCategoryTree, getProvinces } from "@/lib/queries/public";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileCompleteness } from "@/lib/business/profile-readiness";
import type { ServiceAreaSelection } from "@/components/business/service-areas-select";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  const [
    documentsResult,
    provinces,
    categories,
    businessCategoriesResult,
    serviceAreasResult,
  ] = await Promise.all([
    supabase
      .from("business_documents")
      .select("*")
      .eq("business_id", business.id)
      .order("uploaded_at", { ascending: false }),
    getProvinces(),
    getCategoryTree(),
    supabase
      .from("business_categories")
      .select("category_id")
      .eq("business_id", business.id),
    supabase
      .from("business_service_areas")
      .select("city_id, city:cities(id, name, province_id, province:provinces(id, name))")
      .eq("business_id", business.id),
  ]);

  const documents = documentsResult.data ?? [];
  const categoryIds = (businessCategoriesResult.data ?? []).map((row) => row.category_id);
  const primaryCategoryId = categoryIds[0] ?? null;

  const serviceAreas: ServiceAreaSelection[] = (serviceAreasResult.data ?? [])
    .map((row) => {
      const city = Array.isArray(row.city) ? row.city[0] : row.city;
      if (!city) return null;
      const province = Array.isArray(city.province) ? city.province[0] : city.province;
      return {
        cityId: city.id,
        provinceId: city.province_id,
        cityName: city.name,
        provinceName: province?.name ?? "",
      } satisfies ServiceAreaSelection;
    })
    .filter((area): area is ServiceAreaSelection => area !== null);

  // Fallback for businesses that still only have HQ city set
  if (serviceAreas.length === 0 && business.city_id && business.province_id) {
    const province = provinces.find((p) => p.id === business.province_id);
    const { data: city } = await supabase
      .from("cities")
      .select("id, name")
      .eq("id", business.city_id)
      .maybeSingle();
    if (city) {
      serviceAreas.push({
        cityId: city.id,
        provinceId: business.province_id,
        cityName: city.name,
        provinceName: province?.name ?? "",
      });
    }
  }

  const readiness = getProfileCompleteness(business, primaryCategoryId);
  const hasDocument = (type: "proof_of_address" | "id_document") =>
    documents.some((document) => document.document_type === type);
  const readinessItems = [
    "Business description",
    "Phone number",
    "Email address",
    "Province",
    "City / town",
    "Primary category",
    "Company logo",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Listing readiness</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete the listing details below for approval. Documents are only needed for a
            Verified badge.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Needed for approval</h2>
            <ul className="space-y-1.5 text-sm">
              {readinessItems.map((item) => {
                const complete = !readiness.missingFields.includes(item);
                const Icon = complete ? CheckCircle2 : Circle;
                return (
                  <li
                    key={item}
                    className={
                      complete
                        ? "flex items-center gap-2 text-sa-green"
                        : "flex items-center gap-2 text-muted-foreground"
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item === "Primary category"
                      ? "Service categories"
                      : item === "City / town"
                        ? "Service areas"
                        : item}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Needed for a Verified badge</h2>
            <ul className="space-y-1.5 text-sm">
              {[
                { label: "Proof of Address", complete: hasDocument("proof_of_address") },
                { label: "ID / Passport", complete: hasDocument("id_document") },
              ].map(({ label, complete }) => {
                const Icon = complete ? CheckCircle2 : Circle;
                return (
                  <li
                    key={label}
                    className={
                      complete
                        ? "flex items-center gap-2 text-sa-green"
                        : "flex items-center gap-2 text-muted-foreground"
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
      </Card>
      <ProfileForm
        business={business}
        documents={documents}
        provinces={provinces}
        categories={categories}
        categoryIds={categoryIds}
        serviceAreas={serviceAreas}
      />
    </div>
  );
}
