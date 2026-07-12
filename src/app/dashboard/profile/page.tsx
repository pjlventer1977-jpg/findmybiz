import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Management</h1>
      <ProfileForm business={business} />
    </div>
  );
}
