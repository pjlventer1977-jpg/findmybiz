import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, description, phone, email, status, slug, logo_url")
    .eq("owner_id", user!.id)
    .single();

  if (!business) return <p>Register a business first.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Management</h1>
      <ProfileForm business={business} />
    </div>
  );
}
