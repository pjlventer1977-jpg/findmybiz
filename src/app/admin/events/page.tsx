import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminEventActions } from "./event-actions";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "pending")
    .order("event_date");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Event Moderation</h1>
      {!events?.length ? (
        <p className="text-muted-foreground">No pending events.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg flex justify-between">
              <div>
                <h3 className="font-semibold">{event.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.event_date).toLocaleDateString("en-ZA")} — {event.venue}
                </p>
                <p className="text-sm mt-1">{event.description?.slice(0, 150)}</p>
              </div>
              <AdminEventActions eventId={event.id} adminId={user!.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
