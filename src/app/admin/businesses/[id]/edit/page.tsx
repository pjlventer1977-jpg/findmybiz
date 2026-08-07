import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminBusinessForEdit } from "@/lib/queries/admin-businesses";
import { getCategoryTree, getProvinces } from "@/lib/queries/public";
import { ProfileForm } from "@/app/dashboard/profile/profile-form";
import { Button } from "@/components/ui/button";

export default async function AdminEditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const [editData, provinces, categories] = await Promise.all([
    getAdminBusinessForEdit(id),
    getProvinces(),
    getCategoryTree(),
  ]);

  if (!editData) notFound();

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit business</h1>
          <p className="text-sm text-muted-foreground">{editData.business.name}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/businesses">Back to directory</Link>
        </Button>
      </div>

      <ProfileForm
        business={editData.business}
        documents={editData.documents}
        provinces={provinces}
        categories={categories}
        categoryIds={editData.categoryIds}
        serviceAreas={editData.serviceAreas}
        wholeProvinceIds={editData.wholeProvinceIds}
        saveUrl={`/api/admin/businesses/${editData.business.id}/profile`}
        allowNameEdit
        adminMode
      />
    </div>
  );
}
