import { getFromAddress, getMailTransporter, isSmtpConfigured, resetMailTransporter } from "./smtp";
import { buildWhatsAppLeadMessage } from "@/lib/lead-router";
import { buildWhatsAppLink } from "@/lib/utils";

export interface LeadEmailPayload {
  businessName: string;
  businessEmail: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceDescription: string;
  budget?: string;
  cityName?: string;
  provinceName?: string;
  categoryName?: string;
  whatsappNumber?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLeadEmailHtml(payload: LeadEmailPayload): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://findmybiz.co.za";
  const location = [payload.cityName, payload.provinceName].filter(Boolean).join(", ");

  const whatsappMessage = buildWhatsAppLeadMessage({
    customer_name: payload.customerName,
    customer_phone: payload.customerPhone,
    customer_email: payload.customerEmail,
    service_description: payload.serviceDescription,
    budget: payload.budget,
    city_name: payload.cityName,
    province_name: payload.provinceName,
  });

  const whatsappLink = payload.whatsappNumber
    ? buildWhatsAppLink(payload.whatsappNumber, whatsappMessage)
    : buildWhatsAppLink(payload.customerPhone, `Hi ${payload.customerName}, I'm following up on your quote request from Find My Biz.`);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #007A4D; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">New Lead from Find My Biz</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Hi ${escapeHtml(payload.businessName)}, you have a new customer enquiry.</p>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Customer</td><td>${escapeHtml(payload.customerName)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Phone</td><td><a href="tel:${escapeHtml(payload.customerPhone)}">${escapeHtml(payload.customerPhone)}</a></td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td><a href="mailto:${escapeHtml(payload.customerEmail)}">${escapeHtml(payload.customerEmail)}</a></td></tr>
      ${location ? `<tr><td style="padding: 8px 0; font-weight: bold;">Location</td><td>${escapeHtml(location)}</td></tr>` : ""}
      ${payload.categoryName ? `<tr><td style="padding: 8px 0; font-weight: bold;">Category</td><td>${escapeHtml(payload.categoryName)}</td></tr>` : ""}
      ${payload.budget ? `<tr><td style="padding: 8px 0; font-weight: bold;">Budget</td><td>${escapeHtml(payload.budget)}</td></tr>` : ""}
    </table>
    <div style="margin: 20px 0; padding: 16px; background: #f9f9f9; border-radius: 6px;">
      <p style="margin: 0 0 8px; font-weight: bold;">Service required</p>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(payload.serviceDescription)}</p>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 4px;">Reply on WhatsApp</a>
      <a href="${appUrl}/dashboard/leads" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 4px;">View in Dashboard</a>
    </div>
    <p style="margin-top: 24px; font-size: 12px; color: #666; text-align: center;">
      Reply promptly to improve your BizTrust Score. This lead was routed via Find My Biz QuoteMatch.
    </p>
  </div>
</body>
</html>`;
}

function buildLeadEmailText(payload: LeadEmailPayload): string {
  const lines = [
    `New Lead from Find My Biz`,
    ``,
    `Hi ${payload.businessName},`,
    ``,
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.customerPhone}`,
    `Email: ${payload.customerEmail}`,
  ];

  if (payload.cityName || payload.provinceName) {
    lines.push(`Location: ${[payload.cityName, payload.provinceName].filter(Boolean).join(", ")}`);
  }
  if (payload.categoryName) lines.push(`Category: ${payload.categoryName}`);
  if (payload.budget) lines.push(`Budget: ${payload.budget}`);

  lines.push(
    ``,
    `Service required:`,
    payload.serviceDescription,
    ``,
    `View in dashboard: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://findmybiz.co.za"}/dashboard/leads`,
    ``,
    `Reply promptly to improve your BizTrust Score.`
  );

  return lines.join("\n");
}

export async function sendLeadNotificationEmail(
  payload: LeadEmailPayload
): Promise<{ success: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    console.warn("SMTP not configured — skipping lead email notification");
    return { success: false, error: "SMTP not configured" };
  }

  const transport = getMailTransporter();
  if (!transport) {
    return { success: false, error: "Mail transporter unavailable" };
  }

  try {
    await transport.sendMail({
      from: getFromAddress(),
      to: payload.businessEmail,
      replyTo: payload.customerEmail,
      subject: `New lead: ${payload.customerName} — Find My Biz`,
      text: buildLeadEmailText(payload),
      html: buildLeadEmailHtml(payload),
    });

    return { success: true };
  } catch (error) {
    resetMailTransporter();
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error(`Lead email to ${payload.businessEmail} failed:`, message);
    return { success: false, error: message };
  }
}
