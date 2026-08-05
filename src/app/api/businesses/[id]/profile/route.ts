import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { sendBusinessProfileUpdatedAdminEmail } from "@/lib/email/business-notifications";

const profileSchema = z.object({
  description: z.string().max(5000).optional().nullable(),
  phone: z.string().min(5).max(30),
  email: z.string().email().max(255),
  website: z.string().max(500).optional().nullable(),
  provinceId: z.string().uuid().optional().nullable(),
  cityId: z.string().uuid().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).max(8).optional(),
  /** @deprecated Prefer categoryIds */
  categoryId: z.string().uuid().optional().nullable(),
  serviceCityIds: z.array(z.string().uuid()).max(20).optional(),
});

function normalizeWebsite(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function sameIdSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
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

    const {
      description,
      phone,
      email,
      website,
      provinceId,
      cityId,
      categoryIds: categoryIdsInput,
      categoryId,
      serviceCityIds,
    } = parsed.data;

    const categoryIds =
      categoryIdsInput && categoryIdsInput.length > 0
        ? [...new Set(categoryIdsInput)]
        : categoryId
          ? [categoryId]
          : undefined;

    const [{ data: currentCategories }, { data: currentAreas }] = await Promise.all([
      supabase.from("business_categories").select("category_id").eq("business_id", id),
      supabase.from("business_service_areas").select("city_id").eq("business_id", id),
    ]);

    const currentCategoryIds = (currentCategories ?? []).map((row) => row.category_id);
    const currentAreaIds = (currentAreas ?? []).map((row) => row.city_id);

    const normalizedDescription = description?.trim() || null;
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedWebsite = normalizeWebsite(website);
    const changedFields = [
      normalizedDescription !== (business.description?.trim() || null) && "Description",
      normalizedPhone !== business.phone && "Phone number",
      normalizedEmail !== business.email.toLowerCase() && "Email address",
      normalizedWebsite !== normalizeWebsite(business.website) && "Website",
      (provinceId ?? null) !== (business.province_id ?? null) && "Province",
      (cityId ?? null) !== (business.city_id ?? null) && "Primary city / town",
      categoryIds &&
        !sameIdSet(categoryIds, currentCategoryIds) &&
        "Service categories",
      serviceCityIds &&
        !sameIdSet([...new Set(serviceCityIds)], currentAreaIds) &&
        "Service areas",
    ].filter(Boolean) as string[];

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

    if (serviceCityIds && serviceCityIds.length > 0) {
      const uniqueCities = [...new Set(serviceCityIds)];
      if (cityId && !uniqueCities.includes(cityId)) {
        return NextResponse.json(
          { error: "Primary city must be included in your service areas." },
          { status: 400 }
        );
      }

      const { data: cities, error: citiesError } = await supabase
        .from("cities")
        .select("id")
        .in("id", uniqueCities);

      if (citiesError || !cities || cities.length !== uniqueCities.length) {
        return NextResponse.json(
          { error: "One or more service area cities are invalid." },
          { status: 400 }
        );
      }
    }

    if (categoryIds && categoryIds.length > 0) {
      const { data: cats, error: catsError } = await supabase
        .from("categories")
        .select("id")
        .in("id", categoryIds);

      if (catsError || !cats || cats.length !== categoryIds.length) {
        return NextResponse.json(
          { error: "One or more categories are invalid." },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        description: normalizedDescription,
        phone: normalizedPhone,
        email: normalizedEmail,
        website: normalizedWebsite,
        province_id: provinceId ?? null,
        city_id: cityId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (categoryIds) {
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

      if (categoryIds.length > 0) {
        const { error: addCategoryError } = await supabase
          .from("business_categories")
          .insert(
            categoryIds.map((category_id) => ({ business_id: id, category_id }))
          );

        if (addCategoryError) {
          return NextResponse.json(
            { error: addCategoryError.message },
            { status: 500 }
          );
        }
      }
    }

    if (serviceCityIds) {
      const uniqueCities = [...new Set(serviceCityIds)];
      const { error: removeAreasError } = await supabase
        .from("business_service_areas")
        .delete()
        .eq("business_id", id);

      if (removeAreasError) {
        return NextResponse.json(
          { error: removeAreasError.message },
          { status: 500 }
        );
      }

      if (uniqueCities.length > 0) {
        const { error: addAreasError } = await supabase
          .from("business_service_areas")
          .insert(
            uniqueCities.map((city_id) => ({ business_id: id, city_id }))
          );

        if (addAreasError) {
          return NextResponse.json({ error: addAreasError.message }, { status: 500 });
        }
      }
    }

    if (changedFields.length > 0) {
      const emailResult = await sendBusinessProfileUpdatedAdminEmail({
        businessId: business.id,
        businessName: business.name,
        businessEmail: normalizedEmail,
        contactPerson: business.contact_person,
        changedFields,
      });

      if (!emailResult.success) {
        console.error("Business profile update notification failed:", {
          business_id: business.id,
          error: emailResult.error,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
