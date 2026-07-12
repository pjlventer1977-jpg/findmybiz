import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminBusinessActions } from "./admin-actions";

export default async function AdminBusinessesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      city:cities(name)
    `)
    .eq("status", "pending")
    .order("created_at");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Business Approvals</h1>
      {!businesses?.length ? (
        <p className="text-muted-foreground">No pending businesses.</p>
      ) : (
        <div className="space-y-4">
          {businesses.map((b) => (
            <div key={b.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(b.city as { name: string })?.name}, {(b.province as { name: string })?.name}
                  </p>
                  <p className="text-sm mt-2">{b.description?.slice(0, 200)}...</p>
                </div>
                <AdminBusinessActions businessId={b.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
