import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { LeadListItem } from "@/components/dashboard/lead-list-item";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { LEAD_WITH_QUOTE_SELECT } from "@/lib/queries/leads";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) {
    return <p>Register a business first.</p>;
  }

  const { data: leads } = await supabase
    .from("leads")
    .select(LEAD_WITH_QUOTE_SELECT)
    .eq("business_id", business.id)
    .eq("status", "new")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lead Inbox</h1>
        <p className="text-muted-foreground">
          New leads awaiting your response. Mark as read to move them to Total Leads Received.
        </p>
        {business.membership_tier !== "professional" &&
          business.membership_tier !== "enterprise" && (
            <p className="mt-1 text-xs text-muted-foreground">
              Upgrade to Professional for WhatsApp Lead Cards with pre-filled customer details.
            </p>
          )}
      </div>

      {!leads?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No new leads. Check Total Leads Received for your full lead history.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadListItem
              key={lead.id}
              lead={lead}
              businessWhatsapp={business.whatsapp}
              membershipTier={business.membership_tier}
              showMarkAsRead
            />
          ))}
        </div>
      )}
    </div>
  );
}
