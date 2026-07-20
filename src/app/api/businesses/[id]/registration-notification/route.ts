import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  sendBusinessPendingAdminEmail,
  sendBusinessPendingOwnerEmail,
} from "@/lib/email/business-notifications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: businessId } = await params;
  const serviceClient = await createServiceClient();

  const { data: business, error } = await serviceClient
    .from("businesses")
    .select("id, owner_id, name, email, contact_person, status")
    .eq("id", businessId)
    .single();

  if (error || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (business.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (business.status !== "pending") {
    return NextResponse.json({ error: "Business is not pending approval" }, { status: 409 });
  }

  const payload = {
    businessId: business.id,
    businessName: business.name,
    businessEmail: business.email,
    contactPerson: business.contact_person,
  };

  const [adminEmail, ownerEmail] = await Promise.all([
    sendBusinessPendingAdminEmail(payload),
    sendBusinessPendingOwnerEmail(payload),
  ]);

  return NextResponse.json({
    success: adminEmail.success || ownerEmail.success,
    admin_email: adminEmail,
    owner_email: ownerEmail,
  });
}
