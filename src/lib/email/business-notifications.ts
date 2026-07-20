import { getFromAddress, getMailTransporter, isSmtpConfigured, resetMailTransporter } from "./smtp";

const DEFAULT_ADMIN_EMAIL = "info@findmybiz.co.za";

interface BusinessEmailPayload {
  businessId: string;
  businessName: string;
  businessEmail: string;
  contactPerson?: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://www.findmybiz.co.za";
}

export function getAdminEmail(): string {
  return process.env.ADMIN_APPROVAL_EMAIL ?? DEFAULT_ADMIN_EMAIL;
}

async function sendBusinessEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    console.warn("SMTP not configured — skipping business notification email", { to, subject });
    return { success: false, error: "SMTP not configured" };
  }

  const transport = getMailTransporter();
  if (!transport) {
    return { success: false, error: "Mail transporter unavailable" };
  }

  try {
    await transport.sendMail({
      from: getFromAddress(),
      to,
      subject,
      text,
      html,
    });

    console.info("Business notification email sent:", { to, subject });
    return { success: true };
  } catch (error) {
    resetMailTransporter();
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error(`Business notification email to ${to} failed:`, message);
    return { success: false, error: message };
  }
}

export async function sendBusinessPendingAdminEmail(
  payload: BusinessEmailPayload
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const adminUrl = `${appUrl}/admin/businesses`;
  const contact = payload.contactPerson || "Not provided";

  return sendBusinessEmail({
    to: getAdminEmail(),
    subject: `New business pending approval: ${payload.businessName}`,
    text: [
      "A new business has registered on Find My Biz and is pending approval.",
      "",
      `Business: ${payload.businessName}`,
      `Contact person: ${contact}`,
      `Email: ${payload.businessEmail}`,
      "",
      `Review pending businesses: ${adminUrl}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #007A4D; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">New Business Pending Approval</h1>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>A new business has registered on Find My Biz and is waiting for admin approval.</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Business</td><td>${escapeHtml(payload.businessName)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Contact person</td><td>${escapeHtml(contact)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td><a href="mailto:${escapeHtml(payload.businessEmail)}">${escapeHtml(payload.businessEmail)}</a></td></tr>
    </table>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${adminUrl}" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review in Admin</a>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendBusinessPendingOwnerEmail(
  payload: BusinessEmailPayload
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();

  return sendBusinessEmail({
    to: payload.businessEmail,
    subject: "Your Find My Biz registration is pending approval",
    text: [
      `Hi ${payload.contactPerson || payload.businessName},`,
      "",
      `Thank you for registering ${payload.businessName} on Find My Biz.`,
      "Your business profile has been received and is pending admin approval.",
      "",
      "We will email you again as soon as it has been approved.",
      "",
      `Dashboard: ${appUrl}/dashboard`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #007A4D; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">Registration Received</h1>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Hi ${escapeHtml(payload.contactPerson || payload.businessName)},</p>
    <p>Thank you for registering <strong>${escapeHtml(payload.businessName)}</strong> on Find My Biz.</p>
    <p>Your business profile has been received and is pending admin approval. We will email you again as soon as it has been approved.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${appUrl}/dashboard" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendBusinessApprovedEmail(
  payload: BusinessEmailPayload
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();

  return sendBusinessEmail({
    to: payload.businessEmail,
    subject: "Your Find My Biz business profile has been approved",
    text: [
      `Hi ${payload.contactPerson || payload.businessName},`,
      "",
      `${payload.businessName} has been approved on Find My Biz.`,
      "Your listing is now live and can receive enquiries through the platform.",
      "",
      `Manage your profile: ${appUrl}/dashboard`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #007A4D; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">Business Approved</h1>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Hi ${escapeHtml(payload.contactPerson || payload.businessName)},</p>
    <p><strong>${escapeHtml(payload.businessName)}</strong> has been approved on Find My Biz.</p>
    <p>Your listing is now live and can receive enquiries through the platform.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${appUrl}/dashboard" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage Profile</a>
    </div>
  </div>
</body>
</html>`,
  });
}
