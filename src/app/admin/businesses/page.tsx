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

  const businessSelect = `
    *,
    province:provinces(name),
    city:cities(name),
    business_categories(category_id),
    business_documents(*),
    email_notifications(id, notification_type, recipient, status, error_message, created_at)
  `;

  const { data: pendingBusinesses } = await supabase
    .from("businesses")
    .select(businessSelect)
    .eq("status", "pending")
    .order("created_at");

  const { data: approvedBusinesses } = await supabase
    .from("businesses")
    .select(businessSelect)
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(12);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Business Approvals</h1>
      {!pendingBusinesses?.length ? (
        <p className="text-muted-foreground">No pending businesses.</p>
      ) : (
        <div className="space-y-4">
          {pendingBusinesses.map((business) => (
            <AdminBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      <section className="space-y-4 border-t pt-6">
        <div>
          <h2 className="text-xl font-semibold">Recently Approved</h2>
          <p className="text-sm text-muted-foreground">
            Approval email delivery attempts are recorded here. “Sent” means the SMTP server
            accepted the message.
          </p>
        </div>
        {!approvedBusinesses?.length ? (
          <p className="text-muted-foreground">No approved businesses yet.</p>
        ) : (
          <div className="space-y-4">
            {approvedBusinesses.map((business) => (
              <AdminBusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
