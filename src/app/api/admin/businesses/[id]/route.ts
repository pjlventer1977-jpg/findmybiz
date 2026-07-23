import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { recalculateBizTrustScore } from "@/lib/admin/biz-trust";
import { createServiceClient } from "@/lib/supabase/server";
import { sendBusinessApprovedEmail } from "@/lib/email/business-notifications";
import {
  canApprove,
  getMissingVerificationDocuments,
  getProfileCompleteness,
  hasVerificationDocuments,
} from "@/lib/business/profile-readiness";

const actionSchema = z.object({
  action: z.enum(["approved", "verified_approved", "rejected", "suspended"]),
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
      "id, status, name, email, contact_person, description, phone, province_id, city_id, logo_url, business_categories(category_id), business_documents(*)"
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

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      status: isApprovalAction ? "approved" : action,
      is_verified: action === "verified_approved",
      approved_at: isApprovalAction ? new Date().toISOString() : null,
      approved_by: isApprovalAction ? auth.user.id : null,
    })
    .eq("id", businessId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update business", details: updateError.message },
      { status: 500 }
    );
  }

  let bizTrustScore: number | undefined;
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
    });

    if (!emailResult.success) {
      console.warn("Business approval email failed:", {
        business_id: businessId,
        error: emailResult.error,
      });
    }
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
    status: isApprovalAction ? "approved" : action,
    biz_trust_score: bizTrustScore,
  });
}
