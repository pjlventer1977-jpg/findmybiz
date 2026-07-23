import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminBusinessCard } from "./business-card";

export default async function AdminBusinessesPage() {
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

  const { data: businesses } = await supabase
    .from("businesses")
    .select(`
      *,
      province:provinces(name),
      city:cities(name),
      business_categories(category_id),
      business_documents(*)
    `)
    .eq("status", "pending")
    .order("created_at");

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Business Approvals</h1>
      {!businesses?.length ? (
        <p className="text-muted-foreground">No pending businesses.</p>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <AdminBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
