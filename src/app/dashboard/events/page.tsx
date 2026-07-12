import { createClient } from "@/lib/supabase/server";
import { EventForm } from "./event-form";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";

export default async function DashboardEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Events</h1>
      <EventForm businessId={business.id} />
    </div>
  );
}
