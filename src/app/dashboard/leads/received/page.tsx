import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { LeadListItem } from "@/components/dashboard/lead-list-item";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { LEAD_WITH_QUOTE_SELECT } from "@/lib/queries/leads";

export const dynamic = "force-dynamic";

export default async function ReceivedLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) {
    return <p>Register a business first.</p>;
  }

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id);

  const { data: leads } = await supabase
    .from("leads")
    .select(LEAD_WITH_QUOTE_SELECT)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Total Leads Received</h1>
        <p className="text-muted-foreground">
          {totalLeads ?? 0} lead{(totalLeads ?? 0) === 1 ? "" : "s"} received to date
        </p>
      </div>

      {!leads?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No leads received yet. Improve your profile to start receiving leads.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadListItem
              key={lead.id}
              lead={lead}
              businessWhatsapp={business.whatsapp}
            />
          ))}
        </div>
      )}
    </div>
  );
}
