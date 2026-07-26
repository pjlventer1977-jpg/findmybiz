import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { sendBusinessApprovedEmail } from "@/lib/email/business-notifications";
import { createServiceClient } from "@/lib/supabase/server";
import type { MembershipTier } from "@/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: businessId } = await params;
  const supabase = await createServiceClient();
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, email, contact_person, status, intended_membership_tier")
    .eq("id", businessId)
    .single();

  if (businessError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (business.status !== "approved") {
    return NextResponse.json(
      { error: "Only approved businesses can receive an approval-email resend." },
      { status: 400 }
    );
  }

  const selectedTier = (business.intended_membership_tier ?? "free") as MembershipTier;
  const emailResult = await sendBusinessApprovedEmail({
    businessId: business.id,
    businessName: business.name,
    businessEmail: business.email,
    contactPerson: business.contact_person,
    selectedTier,
    billingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.findmybiz.co.za"}/dashboard/billing?plan=${selectedTier}`,
  });

  const { error: notificationAuditError } = await supabase
    .from("email_notifications")
    .insert({
      business_id: business.id,
      notification_type: "business_approved_resend",
      recipient: business.email,
      subject: "Your Find My Biz business profile has been approved",
      status: emailResult.success ? "sent" : "failed",
      error_message: emailResult.error ?? null,
      attempted_by: auth.user.id,
    });

  if (notificationAuditError) {
    console.error("Failed to record approval email resend:", notificationAuditError);
  }

  if (!emailResult.success) {
    return NextResponse.json(
      { error: emailResult.error ?? "The email could not be sent." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    recipient: business.email,
    status: "sent",
  });
}
