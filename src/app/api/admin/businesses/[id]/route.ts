import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { recalculateBizTrustScore } from "@/lib/admin/biz-trust";
import { createServiceClient } from "@/lib/supabase/server";

const actionSchema = z.object({
  action: z.enum(["approved", "rejected", "suspended"]),
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
    .select("id, status")
    .eq("id", businessId)
    .single();

  if (fetchError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      status: action,
      is_verified: action === "approved",
      approved_at: action === "approved" ? new Date().toISOString() : null,
      approved_by: action === "approved" ? auth.user.id : null,
    })
    .eq("id", businessId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update business", details: updateError.message },
      { status: 500 }
    );
  }

  let bizTrustScore: number | undefined;
  if (action === "approved") {
    bizTrustScore = await recalculateBizTrustScore(supabase, businessId);
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
    status: action,
    biz_trust_score: bizTrustScore,
  });
}
