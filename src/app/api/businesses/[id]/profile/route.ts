import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";

const profileSchema = z.object({
  description: z.string().max(5000).optional().nullable(),
  phone: z.string().min(5).max(30),
  email: z.string().email().max(255),
  website: z.string().max(500).optional().nullable(),
  provinceId: z.string().uuid().optional().nullable(),
  cityId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
});

function normalizeWebsite(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { description, phone, email, website, provinceId, cityId, categoryId } =
      parsed.data;

    if (cityId) {
      if (!provinceId) {
        return NextResponse.json(
          { error: "Select a province before selecting a city." },
          { status: 400 }
        );
      }

      const { data: city, error: cityError } = await supabase
        .from("cities")
        .select("province_id")
        .eq("id", cityId)
        .single();

      if (cityError || !city || city.province_id !== provinceId) {
        return NextResponse.json(
          { error: "Please select a city that belongs to the selected province." },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        description: description?.trim() || null,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        website: normalizeWebsite(website),
        province_id: provinceId ?? null,
        city_id: cityId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (categoryId) {
      const { error: removeCategoriesError } = await supabase
        .from("business_categories")
        .delete()
        .eq("business_id", id);

      if (removeCategoriesError) {
        return NextResponse.json(
          { error: removeCategoriesError.message },
          { status: 500 }
        );
      }

      const { error: addCategoryError } = await supabase
        .from("business_categories")
        .insert({ business_id: id, category_id: categoryId });

      if (addCategoryError) {
        return NextResponse.json(
          { error: addCategoryError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
