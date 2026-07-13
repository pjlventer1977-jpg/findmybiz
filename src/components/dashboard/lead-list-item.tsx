import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildWhatsAppLeadMessage } from "@/lib/lead-router";
import { buildWhatsAppLink } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";
import { MarkLeadReadButton } from "./mark-lead-read-button";

type QuoteRequestSummary = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_description: string;
  budget?: string | null;
  created_at: string;
  city?: { name: string } | null;
  province?: { name: string } | null;
};

export type LeadWithQuote = Lead & {
  quote_request?: QuoteRequestSummary | null;
};

function statusLabel(status: LeadStatus) {
  if (status === "new") return "New";
  if (status === "viewed") return "Read";
  return status;
}

export function LeadListItem({
  lead,
  businessWhatsapp,
  showMarkAsRead = false,
}: {
  lead: LeadWithQuote;
  businessWhatsapp?: string | null;
  showMarkAsRead?: boolean;
}) {
  const qr = lead.quote_request;
  if (!qr) return null;

  const whatsappMessage = buildWhatsAppLeadMessage({
    customer_name: qr.customer_name,
    customer_phone: qr.customer_phone,
    customer_email: qr.customer_email,
    service_description: qr.service_description,
    budget: qr.budget,
    city_name: qr.city?.name,
    province_name: qr.province?.name,
  });

  const waLink = businessWhatsapp
    ? buildWhatsAppLink(qr.customer_phone, whatsappMessage)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{qr.customer_name}</CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded capitalize ${
              lead.status === "new"
                ? "bg-primary/10 text-primary"
                : "bg-muted"
            }`}
          >
            {statusLabel(lead.status)}
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
        <div className="flex flex-wrap gap-2">
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
          {showMarkAsRead && lead.status === "new" && (
            <MarkLeadReadButton leadId={lead.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
