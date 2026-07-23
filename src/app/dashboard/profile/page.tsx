import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Circle } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { getCategories, getProvinces } from "@/lib/queries/public";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileCompleteness } from "@/lib/business/profile-readiness";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  const [documentsResult, provinces, categories, businessCategoryResult] = await Promise.all([
    supabase
      .from("business_documents")
      .select("*")
      .eq("business_id", business.id)
      .order("uploaded_at", { ascending: false }),
    getProvinces(),
    getCategories(),
    supabase
      .from("business_categories")
      .select("category_id")
      .eq("business_id", business.id)
      .limit(1)
      .maybeSingle(),
  ]);
  const documents = documentsResult.data ?? [];
  const primaryCategoryId = businessCategoryResult.data?.category_id ?? null;
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
                    className={complete ? "flex items-center gap-2 text-sa-green" : "flex items-center gap-2 text-muted-foreground"}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item}
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
                    className={complete ? "flex items-center gap-2 text-sa-green" : "flex items-center gap-2 text-muted-foreground"}
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
        primaryCategoryId={primaryCategoryId}
      />
    </div>
  );
}
