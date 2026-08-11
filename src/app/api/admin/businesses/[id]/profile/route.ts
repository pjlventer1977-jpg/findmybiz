import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { getCategoriesLimit } from "@/lib/membership/plan-access";
import type { MembershipTier } from "@/types";

const adminProfileSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  phone: z.string().min(5).max(30),
  email: z.string().email().max(255),
  website: z.string().max(500).optional().nullable(),
  provinceId: z.string().uuid().optional().nullable(),
  cityId: z.string().uuid().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).max(8).optional(),
  serviceCityIds: z.array(z.string().uuid()).max(20).optional(),
  wholeProvinceIds: z.array(z.string().uuid()).max(9).optional(),
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
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = adminProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  const { data: business, error: fetchError } = await supabase
    .from("businesses")
    .select("id, name, membership_tier")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const {
    name,
    description,
    phone,
    email,
    website,
    provinceId: provinceIdInput,
    cityId,
    categoryIds,
    serviceCityIds,
    wholeProvinceIds,
  } = parsed.data;

  let resolvedProvinceId = provinceIdInput ?? null;

  if (cityId) {
    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("province_id")
      .eq("id", cityId)
      .single();

    if (cityError || !city) {
      return NextResponse.json({ error: "Primary city is invalid." }, { status: 400 });
    }

    if (resolvedProvinceId && city.province_id !== resolvedProvinceId) {
      return NextResponse.json(
        { error: "Please select a city that belongs to the selected province." },
        { status: 400 }
      );
    }

    resolvedProvinceId = city.province_id;
  }

  if (serviceCityIds !== undefined || wholeProvinceIds !== undefined) {
    const uniqueCities = [...new Set(serviceCityIds ?? [])];
    const uniqueProvinces = [...new Set(wholeProvinceIds ?? [])];

    if (uniqueCities.length === 0 && uniqueProvinces.length === 0) {
      return NextResponse.json(
        { error: "Add at least one city/town or whole province." },
        { status: 400 }
      );
    }

    if (cityId) {
      const coveredByCity = uniqueCities.includes(cityId);
      const coveredByProvince =
        resolvedProvinceId !== null && uniqueProvinces.includes(resolvedProvinceId);
      if (!coveredByCity && !coveredByProvince) {
        return NextResponse.json(
          { error: "Primary city must be within the selected service areas." },
          { status: 400 }
        );
      }
    }
  }

  if (categoryIds && categoryIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one service category." },
      { status: 400 }
    );
  }

  if (categoryIds && categoryIds.length > 0) {
    const categoryLimit = getCategoriesLimit(business.membership_tier as MembershipTier);
    if (categoryIds.length > categoryLimit) {
      return NextResponse.json(
        {
          error: `This business is on the ${business.membership_tier} plan (max ${categoryLimit} categor${
            categoryLimit === 1 ? "y" : "ies"
          }).`,
        },
        { status: 403 }
      );
    }
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      ...(name ? { name: name.trim() } : {}),
      description: description?.trim() || null,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      website: normalizeWebsite(website),
      province_id: resolvedProvinceId,
      city_id: cityId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (categoryIds) {
    await supabase.from("business_categories").delete().eq("business_id", id);
    if (categoryIds.length > 0) {
      const { error } = await supabase.from("business_categories").insert(
        categoryIds.map((category_id) => ({ business_id: id, category_id }))
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  if (serviceCityIds) {
    const uniqueCities = [...new Set(serviceCityIds)];
    await supabase.from("business_service_areas").delete().eq("business_id", id);
    if (uniqueCities.length > 0) {
      const { error } = await supabase.from("business_service_areas").insert(
        uniqueCities.map((city_id) => ({ business_id: id, city_id }))
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  if (wholeProvinceIds) {
    const uniqueProvinces = [...new Set(wholeProvinceIds)];
    await supabase.from("business_service_provinces").delete().eq("business_id", id);
    if (uniqueProvinces.length > 0) {
      const { error } = await supabase.from("business_service_provinces").insert(
        uniqueProvinces.map((province_id) => ({ business_id: id, province_id }))
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  await supabase.from("admin_actions").insert({
    admin_id: auth.user.id,
    action_type: "edited",
    target_type: "business",
    target_id: id,
  });

  return NextResponse.json({ success: true });
}
