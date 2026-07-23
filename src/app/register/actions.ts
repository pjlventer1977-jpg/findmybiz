"use server";

import { z } from "zod";
import { slugify } from "@/lib/utils";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyPendingBusinessRegistration } from "@/lib/email/registration-notifications";

const registrationSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export async function registerBusinessAccount(input: {
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  password: string;
}) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Please check your details.",
    };
  }

  const { businessName, contactPerson, phone, email, password } = parsed.data;
  const supabase = await createClient();
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
  const serviceClient = await createServiceClient();
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

  const notification = await notifyPendingBusinessRegistration(business.id, user.id);
  if (!notification.ok) {
    console.error("Business registration notifications failed:", {
      business_id: business.id,
      notification,
    });
  }

  return { ok: true };
}
