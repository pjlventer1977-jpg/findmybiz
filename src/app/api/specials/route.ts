import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanByTier } from "@/constants/membership";
import { uploadSpecialImage, validateSpecialImageFile } from "@/lib/storage/special-image";
import type { MembershipTier } from "@/types";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function endOfMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
}

function defaultSpecialTitle() {
  return `Special – ${new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const businessId = formData.get("businessId");
    const image = formData.get("image");

    if (typeof businessId !== "string" || !businessId) {
      return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
    }

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Special image is required" }, { status: 400 });
    }

    const validationError = validateSpecialImageFile(image);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, membership_tier")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const tier = business.membership_tier as MembershipTier;
    const plan = getPlanByTier(tier);

    if (plan.specialsPerMonth === 0) {
      return NextResponse.json(
        { error: "Upgrade to Starter or above to upload specials." },
        { status: 403 }
      );
    }

    const startOfMonth = new Date(new Date().setDate(1)).toISOString();
    const { count, error: countError } = await supabase
      .from("specials")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", startOfMonth);

    if (countError) {
      return NextResponse.json({ error: "Failed to check plan limits" }, { status: 500 });
    }

    if ((count ?? 0) >= plan.specialsPerMonth) {
      return NextResponse.json(
        {
          error: `You have reached your monthly limit of ${plan.specialsPerMonth} special${
            plan.specialsPerMonth === 1 ? "" : "s"
          }.`,
        },
        { status: 403 }
      );
    }

    const { data: special, error: insertError } = await supabase
      .from("specials")
      .insert({
        business_id: businessId,
        title: defaultSpecialTitle(),
        start_date: todayISO(),
        expiry_date: endOfMonthISO(),
        status: "approved",
      })
      .select("id")
      .single();

    if (insertError || !special) {
      return NextResponse.json({ error: "Failed to create special" }, { status: 500 });
    }

    try {
      const imageUrl = await uploadSpecialImage(
        supabase,
        user.id,
        special.id,
        image
      );

      const { error: updateError } = await supabase
        .from("specials")
        .update({ image_url: imageUrl })
        .eq("id", special.id)
        .eq("business_id", businessId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return NextResponse.json({
        id: special.id,
        image_url: imageUrl,
      });
    } catch (uploadErr) {
      await supabase.from("specials").delete().eq("id", special.id);
      const message =
        uploadErr instanceof Error ? uploadErr.message : "Image upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
