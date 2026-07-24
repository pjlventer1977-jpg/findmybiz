import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { sendBusinessProfileUpdatedAdminEmail } from "@/lib/email/business-notifications";

const notificationSchema = z.object({
  changedFields: z.array(z.string().trim().min(1).max(80)).min(1).max(3),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getOwnerPrimaryBusiness(user.id);
  if (!business || business.id !== id) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const parsed = notificationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notification details" }, { status: 400 });
  }

  const emailResult = await sendBusinessProfileUpdatedAdminEmail({
    businessId: business.id,
    businessName: business.name,
    businessEmail: business.email,
    contactPerson: business.contact_person,
    changedFields: parsed.data.changedFields,
  });

  if (!emailResult.success) {
    console.error("Business profile update notification failed:", {
      business_id: business.id,
      error: emailResult.error,
    });
    return NextResponse.json(
      { error: "Profile updated, but the review notification could not be sent." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
