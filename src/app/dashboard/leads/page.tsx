import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildWhatsAppLink } from "@/lib/utils";
import { buildWhatsAppLeadMessage } from "@/lib/lead-router";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, whatsapp, phone")
    .eq("owner_id", user!.id)
    .single();

  if (!business) {
    return <p>Register a business first.</p>;
  }

  const { data: leads } = await supabase
    .from("leads")
    .select(`
      *,
      quote_request:quote_requests(
        customer_name,
        customer_email,
        customer_phone,
        service_description,
        budget,
        created_at,
        city:cities(name),
        province:provinces(name)
      )
    `)
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lead Inbox</h1>

      {!leads?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No leads yet. Upgrade your plan or improve your profile to receive more leads.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const qr = lead.quote_request;
            if (!qr) return null;

            const whatsappMessage = buildWhatsAppLeadMessage({
              customer_name: qr.customer_name,
              customer_phone: qr.customer_phone,
              customer_email: qr.customer_email,
              service_description: qr.service_description,
              budget: qr.budget,
              city_name: (qr.city as { name: string } | null)?.name,
              province_name: (qr.province as { name: string } | null)?.name,
            });

            const waLink = business.whatsapp
              ? buildWhatsAppLink(qr.customer_phone, whatsappMessage)
              : null;

            return (
              <Card key={lead.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{qr.customer_name}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded capitalize ${
                      lead.status === "new" ? "bg-primary/10 text-primary" : "bg-muted"
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{qr.service_description}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Phone: {qr.customer_phone}</p>
                    <p>Email: {qr.customer_email}</p>
                    {qr.budget && <p>Budget: {qr.budget}</p>}
                    <p>
                      Received: {new Date(qr.created_at).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <a href={`tel:${qr.customer_phone}`}>Call</a>
                    </Button>
                    {waLink && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                          WhatsApp Lead Card
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" asChild>
                      <a href={`mailto:${qr.customer_email}`}>Email</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
