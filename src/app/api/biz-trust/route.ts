import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateBizTrustScore,
  calculateProfileCompleteness,
} from "@/lib/biz-trust-score";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { business_id } = await request.json();

  const { data: business } = await supabase
    .from("businesses")
    .select(`
      *,
      business_documents(*),
      business_categories(category:categories(*)),
      reviews(rating, status)
    `)
    .eq("id", business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const docs = business.business_documents ?? [];
  const approvedReviews = (business.reviews ?? []).filter(
    (r: { status: string }) => r.status === "approved"
  );
  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) /
        approvedReviews.length
      : 0;

  const daysSinceApproval = business.approved_at
    ? Math.floor(
        (Date.now() - new Date(business.approved_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const score = calculateBizTrustScore({
    emailVerified: business.email_verified,
    hasLogo: !!business.logo_url,
    hasProofOfAddress: docs.some((d: { document_type: string }) => d.document_type === "proof_of_address"),
    hasIdDocument: docs.some((d: { document_type: string }) => d.document_type === "id_document"),
    hasCipcDocument: docs.some((d: { document_type: string }) => d.document_type === "cipc"),
    profileCompleteness: calculateProfileCompleteness({
      ...business,
      categories: business.business_categories,
    }),
    averageRating: avgRating,
    reviewCount: approvedReviews.length,
    leadResponseRate: business.lead_response_rate,
    daysSinceApproval,
  });

  await supabase
    .from("businesses")
    .update({ biz_trust_score: score })
    .eq("id", business_id);

  return NextResponse.json({ score });
}
