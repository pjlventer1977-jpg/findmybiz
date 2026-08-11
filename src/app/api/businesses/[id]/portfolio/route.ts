import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canUsePortfolio } from "@/lib/membership/plan-access";
import {
  deletePortfolioImage,
  uploadPortfolioImage,
  validatePortfolioImageFile,
} from "@/lib/storage/portfolio-image";
import type { MembershipTier } from "@/types";

const MAX_PORTFOLIO_ITEMS = 20;

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getOwnedBusiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  userId: string
) {
  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, membership_tier")
    .eq("id", businessId)
    .eq("owner_id", userId)
    .single();

  if (error || !business) return null;
  return business;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: businessId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await getOwnedBusiness(supabase, businessId, user.id);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const tier = business.membership_tier as MembershipTier;
    if (!canUsePortfolio(tier)) {
      return NextResponse.json(
        { error: "Upgrade to Professional or Enterprise to use the portfolio gallery." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const caption = formData.get("caption");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Portfolio image is required" }, { status: 400 });
    }

    const validationError = validatePortfolioImageFile(image);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { count, error: countError } = await supabase
      .from("business_portfolio")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId);

    if (countError) {
      return NextResponse.json({ error: "Failed to check portfolio limits" }, { status: 500 });
    }

    if ((count ?? 0) >= MAX_PORTFOLIO_ITEMS) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_PORTFOLIO_ITEMS} portfolio images.` },
        { status: 403 }
      );
    }

    const { data: item, error: insertError } = await supabase
      .from("business_portfolio")
      .insert({
        business_id: businessId,
        image_url: "",
        caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (insertError || !item) {
      return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
    }

    try {
      const imageUrl = await uploadPortfolioImage(
        supabase,
        user.id,
        item.id,
        image
      );

      const { error: updateError } = await supabase
        .from("business_portfolio")
        .update({ image_url: imageUrl })
        .eq("id", item.id)
        .eq("business_id", businessId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return NextResponse.json({
        id: item.id,
        image_url: imageUrl,
        caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
      });
    } catch (uploadErr) {
      await supabase.from("business_portfolio").delete().eq("id", item.id);
      const message =
        uploadErr instanceof Error ? uploadErr.message : "Image upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: businessId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await getOwnedBusiness(supabase, businessId, user.id);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Portfolio item ID is required" }, { status: 400 });
    }

    const { data: item, error: itemError } = await supabase
      .from("business_portfolio")
      .select("id, image_url")
      .eq("id", itemId)
      .eq("business_id", businessId)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    if (item.image_url) {
      try {
        await deletePortfolioImage(supabase, item.image_url);
      } catch {
        // Continue deleting the DB row even if storage cleanup fails.
      }
    }

    const { error: deleteError } = await supabase
      .from("business_portfolio")
      .delete()
      .eq("id", itemId)
      .eq("business_id", businessId);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
