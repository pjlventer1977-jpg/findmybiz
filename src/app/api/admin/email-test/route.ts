import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { verifySmtpConnection, isSmtpConfigured } from "@/lib/email/smtp";
import { getAdminEmail, sendBusinessPendingAdminEmail } from "@/lib/email/business-notifications";
import { sendLeadNotificationEmail } from "@/lib/email/lead-notification";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        admin_approval_email: getAdminEmail(),
        error: "SMTP_PASSWORD not set. Restart dev server after updating .env.local",
      },
      { status: 503 }
    );
  }

  const result = await verifySmtpConnection();

  return NextResponse.json({
    configured: true,
    connected: result.ok,
    host: result.host,
    port: result.port,
    admin_approval_email: getAdminEmail(),
    error: result.error,
    dns_note:
      "mail.findmybiz.co.za must resolve to your cPanel mail server IP, not your Vercel website IP (75.2.60.5). Use SMTP_HOST=102.208.231.6 and SMTP_TLS_SERVERNAME=mail.findmybiz.co.za on Vercel until DNS is fixed.",
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const verify = await verifySmtpConnection();
  if (!verify.ok) {
    return NextResponse.json(
      { error: verify.error, host: verify.host, port: verify.port },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "business_registration") {
    const result = await sendBusinessPendingAdminEmail({
      businessId: "test-business-id",
      businessName: "Test Business Registration",
      businessEmail: auth.user.email!,
      contactPerson: "Test Contact",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      type: "business_registration",
      sent_to: getAdminEmail(),
    });
  }

  const result = await sendLeadNotificationEmail({
    businessName: "Test Business",
    businessEmail: auth.user.email!,
    customerName: "Test Customer",
    customerPhone: "0821234567",
    customerEmail: "customer@example.com",
    serviceDescription: "This is a test lead notification from Find My Biz.",
    budget: "R5,000 - R10,000",
    cityName: "Johannesburg",
    provinceName: "Gauteng",
    categoryName: "Plumbers",
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, sent_to: auth.user.email });
}
