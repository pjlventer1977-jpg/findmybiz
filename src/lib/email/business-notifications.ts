import { getFromAddress, getMailTransporter, isSmtpConfigured, resetMailTransporter } from "./smtp";
import { getPlanByTier } from "@/constants/membership";
import type { MembershipTier } from "@/types";

const DEFAULT_ADMIN_EMAIL = "info@findmybiz.co.za";

interface BusinessEmailPayload {
  businessId: string;
  businessName: string;
  businessEmail: string;
  contactPerson?: string | null;
  selectedTier?: MembershipTier;
}

interface BusinessProfileUpdatedPayload extends BusinessEmailPayload {
  changedFields: string[];
}

interface BusinessApprovalPayload extends BusinessEmailPayload {
  selectedTier: MembershipTier;
  billingUrl: string;
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
  const selectedPlan = getPlanByTier(payload.selectedTier ?? "free");
  const paymentStatus =
    selectedPlan.tier === "free"
      ? "Not applicable"
      : "Pending — payment required after approval";

  return sendBusinessEmail({
    to: getAdminEmail(),
    subject: `New business pending approval: ${payload.businessName}`,
    text: [
      "A new business has registered on Find My Biz and is pending approval.",
      "",
      `Business: ${payload.businessName}`,
      `Contact person: ${contact}`,
      `Email: ${payload.businessEmail}`,
      `Selected plan: ${selectedPlan.name}`,
      `Plan price: ${selectedPlan.price === 0 ? "Free" : `R${selectedPlan.price}/month`}`,
      `Payment status: ${paymentStatus}`,
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
      <tr><td style="padding: 8px 0; font-weight: bold;">Selected plan</td><td>${escapeHtml(selectedPlan.name)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Plan price</td><td>${selectedPlan.price === 0 ? "Free" : `R${selectedPlan.price}/month`}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Payment status</td><td>${escapeHtml(paymentStatus)}</td></tr>
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
      "Please make sure all minimum requirements have been completed under your Business Profile tab for approval.",
      "",
      "We will email you again as soon as it has been approved.",
      "",
      `Complete your business profile: ${appUrl}/dashboard/profile`,
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
    <p>Your business profile has been received and is pending admin approval.</p>
    <p>Please make sure all minimum requirements have been completed under your <strong>Business Profile</strong> tab for approval.</p>
    <p>We will email you again as soon as it has been approved.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${appUrl}/dashboard/profile" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Business Profile</a>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendBusinessProfileUpdatedAdminEmail(
  payload: BusinessProfileUpdatedPayload
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const adminUrl = `${appUrl}/admin/businesses`;
  const contact = payload.contactPerson || "Not provided";
  const changedFields = payload.changedFields.length
    ? payload.changedFields.join(", ")
    : "Profile details";

  return sendBusinessEmail({
    to: getAdminEmail(),
    subject: `Business profile updated: ${payload.businessName}`,
    text: [
      "A business owner has updated their Find My Biz profile.",
      "",
      `Business: ${payload.businessName}`,
      `Contact person: ${contact}`,
      `Email: ${payload.businessEmail}`,
      `Updated: ${changedFields}`,
      "",
      `Review the business profile: ${adminUrl}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #007A4D; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 22px;">Business Profile Updated</h1>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>A business owner has updated their Find My Biz profile for review.</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Business</td><td>${escapeHtml(payload.businessName)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Contact person</td><td>${escapeHtml(contact)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td><a href="mailto:${escapeHtml(payload.businessEmail)}">${escapeHtml(payload.businessEmail)}</a></td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Updated</td><td>${escapeHtml(changedFields)}</td></tr>
    </table>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${adminUrl}" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review in Admin</a>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendBusinessApprovedEmail(
  payload: BusinessApprovalPayload
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const selectedPlan = getPlanByTier(payload.selectedTier);
  const isPaidPlan = selectedPlan.tier !== "free";

  return sendBusinessEmail({
    to: payload.businessEmail,
    subject: "Your Find My Biz business profile has been approved",
    text: [
      `Hi ${payload.contactPerson || payload.businessName},`,
      "",
      `${payload.businessName} has been approved on Find My Biz.`,
      "Your listing is now live and can receive enquiries through the platform.",
      ...(isPaidPlan
        ? [
            "",
            `To activate your ${selectedPlan.name} membership (R${selectedPlan.price}/month), complete payment:`,
            payload.billingUrl,
          ]
        : []),
      "",
      `Manage your profile: ${appUrl}/dashboard/profile`,
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
    ${isPaidPlan ? `
    <p>To activate your <strong>${escapeHtml(selectedPlan.name)}</strong> membership (R${selectedPlan.price}/month), complete payment when you are ready.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${payload.billingUrl}" style="display: inline-block; background: #F9B233; color: #1E293B; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Activate your plan — Pay now</a>
    </div>` : ""}
    <div style="text-align: center; margin-top: 24px;">
      <a href="${appUrl}/dashboard/profile" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage Profile</a>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendSubscriptionPaymentAdminEmail(payload: {
  businessId: string;
  businessName: string;
  businessEmail: string;
  contactPerson?: string | null;
  tier: MembershipTier;
  amount: number;
  payfastPaymentId: string;
  paymentReference: string;
}): Promise<{ success: boolean; error?: string }> {
  const plan = getPlanByTier(payload.tier);
  const adminUrl = `${getAppUrl()}/admin/businesses`;
  const contact = payload.contactPerson || "Not provided";

  return sendBusinessEmail({
    to: getAdminEmail(),
    subject: `Subscription payment successful: ${payload.businessName}`,
    text: [
      "PayFast status: Successful (COMPLETE)",
      "",
      `Business: ${payload.businessName}`,
      `Contact person: ${contact}`,
      `Email: ${payload.businessEmail}`,
      `Plan: ${plan.name}`,
      `Amount: R${payload.amount.toFixed(2)}`,
      `PayFast payment ID: ${payload.payfastPaymentId}`,
      `Internal reference: ${payload.paymentReference}`,
      "",
      `Review business: ${adminUrl}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #007A4D; color: white; padding: 20px; border-radius: 8px 8px 0 0;"><h1 style="margin: 0; font-size: 22px;">Subscription Payment Successful</h1></div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>PayFast status: <strong>Successful (COMPLETE)</strong></p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 150px;">Business</td><td>${escapeHtml(payload.businessName)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Contact person</td><td>${escapeHtml(contact)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td>${escapeHtml(payload.businessEmail)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Plan</td><td>${escapeHtml(plan.name)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Amount</td><td>R${payload.amount.toFixed(2)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">PayFast ID</td><td>${escapeHtml(payload.payfastPaymentId)}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold;">Reference</td><td>${escapeHtml(payload.paymentReference)}</td></tr>
    </table>
    <div style="text-align: center; margin-top: 24px;"><a href="${adminUrl}" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review in Admin</a></div>
  </div>
</body></html>`,
  });
}

export async function sendSubscriptionPaymentOwnerEmail(payload: {
  businessName: string;
  businessEmail: string;
  contactPerson?: string | null;
  tier: MembershipTier;
}): Promise<{ success: boolean; error?: string }> {
  const plan = getPlanByTier(payload.tier);
  const dashboardUrl = `${getAppUrl()}/dashboard`;

  return sendBusinessEmail({
    to: payload.businessEmail,
    subject: `Payment received — your ${plan.name} plan is active`,
    text: [
      `Hi ${payload.contactPerson || payload.businessName},`,
      "",
      `Payment received. Your ${plan.name} membership is now active on Find My Biz.`,
      "",
      `Dashboard: ${dashboardUrl}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #007A4D; color: white; padding: 20px; border-radius: 8px 8px 0 0;"><h1 style="margin: 0; font-size: 22px;">Payment Received</h1></div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Hi ${escapeHtml(payload.contactPerson || payload.businessName)},</p>
    <p>Payment received. Your <strong>${escapeHtml(plan.name)}</strong> membership is now active on Find My Biz.</p>
    <div style="text-align: center; margin-top: 24px;"><a href="${dashboardUrl}" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Dashboard</a></div>
  </div>
</body></html>`,
  });
}

export async function sendSubscriptionPaymentFailedOwnerEmail(payload: {
  businessName: string;
  businessEmail: string;
  contactPerson?: string | null;
  tier: MembershipTier;
  status: string;
}): Promise<{ success: boolean; error?: string }> {
  const plan = getPlanByTier(payload.tier);
  const billingUrl = `${getAppUrl()}/dashboard/billing`;
  const statusLabel = payload.status.toUpperCase() === "CANCELLED" ? "cancelled" : "failed";

  return sendBusinessEmail({
    to: payload.businessEmail,
    subject: `Subscription payment ${statusLabel} — Find My Biz`,
    text: [
      `Hi ${payload.contactPerson || payload.businessName},`,
      "",
      `Your Find My Biz ${plan.name} subscription payment was ${statusLabel}.`,
      "Your listing has been moved to the Free plan. You can reactivate a paid plan anytime from Billing.",
      "",
      `Billing: ${billingUrl}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #B45309; color: white; padding: 20px; border-radius: 8px 8px 0 0;"><h1 style="margin: 0; font-size: 22px;">Subscription Payment ${escapeHtml(statusLabel)}</h1></div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Hi ${escapeHtml(payload.contactPerson || payload.businessName)},</p>
    <p>Your Find My Biz <strong>${escapeHtml(plan.name)}</strong> subscription payment was <strong>${escapeHtml(statusLabel)}</strong>.</p>
    <p>Your listing has been moved to the Free plan. You can reactivate a paid plan anytime from Billing.</p>
    <div style="text-align: center; margin-top: 24px;"><a href="${billingUrl}" style="display: inline-block; background: #007A4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Billing</a></div>
  </div>
</body></html>`,
  });
}
