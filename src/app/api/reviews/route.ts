import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canCollectReviews } from "@/lib/membership/plan-access";
import type { MembershipTier } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sign in to leave a review." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const businessSlug =
      typeof body.businessSlug === "string" ? body.businessSlug.trim() : "";
    const reviewerName =
      typeof body.reviewerName === "string" ? body.reviewerName.trim() : "";
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const rating = Number(body.rating);

    if (!businessSlug) {
      return NextResponse.json({ error: "Business is required." }, { status: 400 });
    }

    if (!reviewerName || reviewerName.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please select a rating between 1 and 5." },
        { status: 400 }
      );
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, membership_tier, status")
      .eq("slug", businessSlug)
      .single();

    if (businessError || !business || business.status !== "approved") {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!canCollectReviews(business.membership_tier as MembershipTier)) {
      return NextResponse.json(
        { error: "This business does not accept customer reviews yet." },
        { status: 403 }
      );
    }

    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("business_id", business.id)
      .eq("reviewer_id", user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this business." },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      business_id: business.id,
      reviewer_id: user.id,
      reviewer_name: reviewerName,
      rating,
      comment: comment || null,
      status: "pending",
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to submit review. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been submitted and will appear after moderation.",
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
