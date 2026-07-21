import { createServiceClient } from "@/lib/supabase/server";
import {
  getAdminEmail,
  sendBusinessPendingAdminEmail,
  sendBusinessPendingOwnerEmail,
} from "@/lib/email/business-notifications";

export async function notifyPendingBusinessRegistration(
  businessId: string,
  ownerId: string
) {
  const serviceClient = await createServiceClient();
  const { data: business, error } = await serviceClient
    .from("businesses")
    .select("id, owner_id, name, email, contact_person, status")
    .eq("id", businessId)
    .single();

  if (error || !business) {
    return { ok: false, error: "Business not found" as const };
  }

  if (business.owner_id !== ownerId) {
    return { ok: false, error: "Forbidden" as const };
  }

  if (business.status !== "pending") {
    return { ok: false, error: "Business is not pending approval" as const };
  }

  const payload = {
    businessId: business.id,
    businessName: business.name,
    businessEmail: business.email,
    contactPerson: business.contact_person,
  };

  // Send sequentially: the cPanel SMTP account is used by both messages and
  // can reject concurrent authenticated connections from a serverless function.
  const adminEmail = await sendBusinessPendingAdminEmail(payload);
  const ownerEmail = await sendBusinessPendingOwnerEmail(payload);

  const adminRecipient = getAdminEmail();

  if (!adminEmail.success) {
    console.error("Registration admin notification failed:", {
      business_id: businessId,
      admin_recipient: adminRecipient,
      error: adminEmail.error,
    });
  }

  if (!ownerEmail.success) {
    console.error("Registration owner notification failed:", {
      business_id: businessId,
      owner_recipient: business.email,
      error: ownerEmail.error,
    });
  }

  return {
    ok: adminEmail.success && ownerEmail.success,
    admin_recipient: adminRecipient,
    admin_email: adminEmail,
    owner_email: ownerEmail,
  };
}
