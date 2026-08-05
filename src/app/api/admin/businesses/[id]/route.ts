import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { recalculateBizTrustScore } from "@/lib/admin/biz-trust";
import { cancelBusinessSubscriptionIfActive } from "@/lib/admin/business-lifecycle";
import { createServiceClient } from "@/lib/supabase/server";
import {
  sendBusinessApprovedEmail,
  sendBusinessDeletedEmail,
  sendBusinessSuspendedEmail,
} from "@/lib/email/business-notifications";
import {
  canApprove,
  getMissingVerificationDocuments,
  getProfileCompleteness,
  hasVerificationDocuments,
} from "@/lib/business/profile-readiness";

const actionSchema = z.object({
  action: z.enum([
    "approved",
    "verified_approved",
    "rejected",
    "suspended",
    "unsuspended",
  ]),
});

const deleteSchema = z.object({
  confirm_name: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: businessId } = await params;
  const body = await request.json();
  const parsed = actionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid action", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { action } = parsed.data;
  const supabase = await createServiceClient();

  const { data: business, error: fetchError } = await supabase
    .from("businesses")
    .select(
      "id, status, name, email, contact_person, description, phone, province_id, city_id, logo_url, intended_membership_tier, is_verified, business_categories(category_id), business_documents(*)"
    )
    .eq("id", businessId)
    .single();

  if (fetchError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const primaryCategoryId = business.business_categories[0]?.category_id;
  const documents = business.business_documents;
  const isApprovalAction = action === "approved" || action === "verified_approved";
  const completeness = getProfileCompleteness(
    business,
    primaryCategoryId,
    Boolean(business.logo_url)
  );

  if (isApprovalAction && !canApprove(business, primaryCategoryId, Boolean(business.logo_url))) {
    return NextResponse.json(
      {
        error: "Listing profile is incomplete.",
        missingFields: completeness.missingFields,
      },
      { status: 400 }
    );
  }

  if (action === "verified_approved" && !hasVerificationDocuments(documents)) {
    return NextResponse.json(
      {
        error: "Verification documents are incomplete.",
        missingDocuments: getMissingVerificationDocuments(documents),
      },
      { status: 400 }
    );
  }

  if (action === "unsuspended" && business.status !== "suspended") {
    return NextResponse.json(
      { error: "Only suspended businesses can be restored." },
      { status: 400 }
    );
  }

  if (action === "suspended" && business.status === "suspended") {
    return NextResponse.json({ error: "Business is already suspended." }, { status: 400 });
  }

  if (action === "suspended") {
    const cancelResult = await cancelBusinessSubscriptionIfActive(supabase, businessId);
    if (cancelResult.error) {
      return NextResponse.json(
        { error: `Could not suspend: ${cancelResult.error}` },
        { status: 502 }
      );
    }
  }

  let nextStatus: string;
  if (isApprovalAction || action === "unsuspended") {
    nextStatus = "approved";
  } else {
    nextStatus = action;
  }

  const updatePayload: Record<string, unknown> = {
    status: nextStatus,
  };

  if (action === "verified_approved") {
    updatePayload.is_verified = true;
  } else if (action === "suspended" || action === "rejected") {
    updatePayload.is_verified = false;
    updatePayload.is_featured = false;
  }

  if (isApprovalAction || action === "unsuspended") {
    updatePayload.approved_at = new Date().toISOString();
    updatePayload.approved_by = auth.user.id;
  } else if (action === "suspended" || action === "rejected") {
    updatePayload.approved_at = null;
    updatePayload.approved_by = null;
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update(updatePayload)
    .eq("id", businessId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update business", details: updateError.message },
      { status: 500 }
    );
  }

  let bizTrustScore: number | undefined;
  let emailNotification:
    | { status: "sent" | "failed"; recipient: string; error?: string }
    | undefined;

  if (action === "verified_approved") {
    await supabase
      .from("business_documents")
      .update({ verified: true })
      .eq("business_id", businessId)
      .in("document_type", ["proof_of_address", "id_document"]);
  }

  if (isApprovalAction) {
    bizTrustScore = await recalculateBizTrustScore(supabase, businessId);

    const emailResult = await sendBusinessApprovedEmail({
      businessId: business.id,
      businessName: business.name,
      businessEmail: business.email,
      contactPerson: business.contact_person,
      selectedTier: business.intended_membership_tier,
      billingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.findmybiz.co.za"}/dashboard/billing?plan=${business.intended_membership_tier}`,
    });

    emailNotification = {
      status: emailResult.success ? "sent" : "failed",
      recipient: business.email,
      ...(emailResult.error ? { error: emailResult.error } : {}),
    };

    const { error: notificationAuditError } = await supabase
      .from("email_notifications")
      .insert({
        business_id: business.id,
        notification_type: "business_approved",
        recipient: business.email,
        subject: "Your Find My Biz business profile has been approved",
        status: emailNotification.status,
        error_message: emailResult.error ?? null,
        attempted_by: auth.user.id,
      });

    if (notificationAuditError) {
      console.error("Failed to record approval email notification:", notificationAuditError);
    }

    if (!emailResult.success) {
      console.warn("Business approval email failed:", {
        business_id: businessId,
        error: emailResult.error,
      });
    }
  }

  if (action === "suspended" && business.email) {
    const emailResult = await sendBusinessSuspendedEmail({
      businessName: business.name,
      businessEmail: business.email,
      contactPerson: business.contact_person,
    });
    emailNotification = {
      status: emailResult.success ? "sent" : "failed",
      recipient: business.email,
      ...(emailResult.error ? { error: emailResult.error } : {}),
    };
  }

  const { error: logError } = await supabase.from("admin_actions").insert({
    admin_id: auth.user.id,
    action_type: action,
    target_type: "business",
    target_id: businessId,
  });

  if (logError) {
    console.error("Failed to log admin action:", logError);
  }

  return NextResponse.json({
    success: true,
    business_id: businessId,
    status: nextStatus,
    biz_trust_score: bizTrustScore,
    email_notification: emailNotification,
  });
}

/**
 * Permanently delete a business listing and its owner auth account.
 * Requires confirm_name matching the business name.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: businessId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Type the exact business name to confirm deletion." },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  const { data: business, error: fetchError } = await supabase
    .from("businesses")
    .select("id, name, email, contact_person, owner_id")
    .eq("id", businessId)
    .single();

  if (fetchError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (business.name.trim().toLowerCase() !== parsed.data.confirm_name.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Confirmation name does not match the business." },
      { status: 400 }
    );
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", business.owner_id)
    .maybeSingle();

  if (ownerProfile?.role === "admin") {
    return NextResponse.json(
      { error: "Cannot delete an admin account via business delete." },
      { status: 403 }
    );
  }

  if (business.owner_id === auth.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin-linked account this way." },
      { status: 403 }
    );
  }

  const cancelResult = await cancelBusinessSubscriptionIfActive(supabase, businessId);
  if (cancelResult.error) {
    return NextResponse.json(
      { error: `Could not cancel subscription before delete: ${cancelResult.error}` },
      { status: 502 }
    );
  }

  // Clear FKs that block profile deletion
  await supabase
    .from("businesses")
    .update({ approved_by: null })
    .eq("approved_by", business.owner_id);

  if (business.email) {
    await sendBusinessDeletedEmail({
      businessName: business.name,
      businessEmail: business.email,
      contactPerson: business.contact_person,
    });
  }

  await supabase.from("admin_actions").insert({
    admin_id: auth.user.id,
    action_type: "deleted",
    target_type: "business",
    target_id: businessId,
  });

  const { error: deleteBusinessError } = await supabase
    .from("businesses")
    .delete()
    .eq("id", businessId);

  if (deleteBusinessError) {
    return NextResponse.json(
      { error: "Failed to delete business", details: deleteBusinessError.message },
      { status: 500 }
    );
  }

  // If the owner has no other businesses, remove the auth user + profile
  const { count: remaining } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", business.owner_id);

  let userDeleted = false;
  if ((remaining ?? 0) === 0) {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
      business.owner_id
    );
    if (deleteUserError) {
      console.error("Failed to delete owner auth user:", deleteUserError.message);
      return NextResponse.json(
        {
          success: true,
          business_deleted: true,
          user_deleted: false,
          warning: `Business removed, but owner account could not be deleted: ${deleteUserError.message}`,
        },
        { status: 200 }
      );
    }
    userDeleted = true;
  }

  return NextResponse.json({
    success: true,
    business_deleted: true,
    user_deleted: userDeleted,
  });
}
