"use server";

import { z } from "zod";
import { slugify } from "@/lib/utils";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyPendingBusinessRegistration } from "@/lib/email/registration-notifications";
import type { MembershipTier } from "@/types";

const registrationSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  selectedTier: z.enum(["free", "starter", "professional", "enterprise"]),
  categoryIds: z.array(z.string().uuid()).min(1).max(8),
  serviceCityIds: z.array(z.string().uuid()).min(1).max(20),
  primaryCityId: z.string().uuid(),
});

export async function registerBusinessAccount(input: {
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  password: string;
  selectedTier: MembershipTier;
  categoryIds: string[];
  serviceCityIds: string[];
  primaryCityId: string;
}) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Please check your details.",
    };
  }

  const {
    businessName,
    contactPerson,
    phone,
    email,
    password,
    selectedTier,
    categoryIds,
    serviceCityIds,
    primaryCityId,
  } = parsed.data;

  if (!serviceCityIds.includes(primaryCityId)) {
    return { ok: false, error: "Primary city must be one of your service areas." };
  }

  const supabase = await createClient();
  const serviceClient = await createServiceClient();

  const { data: cities, error: citiesError } = await serviceClient
    .from("cities")
    .select("id, province_id")
    .in("id", serviceCityIds);

  if (citiesError || !cities || cities.length !== serviceCityIds.length) {
    return { ok: false, error: "One or more selected cities are invalid." };
  }

  const primaryCity = cities.find((c) => c.id === primaryCityId);
  if (!primaryCity) {
    return { ok: false, error: "Primary city is invalid." };
  }

  const { data: categories, error: categoriesError } = await serviceClient
    .from("categories")
    .select("id, parent_id")
    .in("id", categoryIds);

  if (categoriesError || !categories || categories.length !== categoryIds.length) {
    return { ok: false, error: "One or more selected categories are invalid." };
  }

  // Prefer subcategory IDs (children); reject unknown empties already handled
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.findmybiz.co.za";
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: contactPerson },
      emailRedirectTo: `${appUrl}/dashboard/profile`,
    },
  });

  if (signUpError || !signUpData.user) {
    return {
      ok: false,
      error: signUpError?.message ?? "Could not create your account.",
    };
  }

  const user = signUpData.user;
  const slug = `${slugify(businessName)}-${Date.now().toString(36)}`;
  const { data: business, error: businessError } = await serviceClient
    .from("businesses")
    .insert({
      owner_id: user.id,
      name: businessName,
      slug,
      contact_person: contactPerson,
      email: email.toLowerCase(),
      phone,
      whatsapp: phone,
      status: "pending",
      membership_tier: "free",
      intended_membership_tier: selectedTier,
      province_id: primaryCity.province_id,
      city_id: primaryCity.id,
    })
    .select("id")
    .single();

  if (businessError || !business) {
    await serviceClient.auth.admin.deleteUser(user.id);
    return {
      ok: false,
      error: businessError?.message ?? "Could not create your business profile.",
    };
  }

  const { error: profileError } = await serviceClient
    .from("profiles")
    .update({ role: "business_owner", full_name: contactPerson })
    .eq("id", user.id);

  if (profileError) {
    console.error("Business owner role update failed:", {
      business_id: business.id,
      error: profileError.message,
    });
    await serviceClient.from("businesses").delete().eq("id", business.id);
    await serviceClient.auth.admin.deleteUser(user.id);
    return { ok: false, error: "Could not finish setting up your business account." };
  }

  const { error: categoryInsertError } = await serviceClient
    .from("business_categories")
    .insert(categoryIds.map((category_id) => ({ business_id: business.id, category_id })));

  if (categoryInsertError) {
    await serviceClient.from("businesses").delete().eq("id", business.id);
    await serviceClient.auth.admin.deleteUser(user.id);
    return { ok: false, error: "Could not save your service categories." };
  }

  const { error: areasInsertError } = await serviceClient
    .from("business_service_areas")
    .insert(
      serviceCityIds.map((city_id) => ({
        business_id: business.id,
        city_id,
      }))
    );

  if (areasInsertError) {
    await serviceClient.from("businesses").delete().eq("id", business.id);
    await serviceClient.auth.admin.deleteUser(user.id);
    return { ok: false, error: "Could not save your service areas." };
  }

  const notification = await notifyPendingBusinessRegistration(business.id, user.id);
  if (!notification.ok) {
    console.error("Business registration notifications failed:", {
      business_id: business.id,
      notification,
    });
  }

  return { ok: true };
}
