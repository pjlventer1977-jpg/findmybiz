import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { getCategories, getProvinces } from "@/lib/queries/public";

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Management</h1>
      <ProfileForm
        business={business}
        documents={documentsResult.data ?? []}
        provinces={provinces}
        categories={categories}
        primaryCategoryId={businessCategoryResult.data?.category_id ?? null}
      />
    </div>
  );
}
