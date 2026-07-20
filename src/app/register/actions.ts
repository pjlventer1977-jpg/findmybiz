"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyPendingBusinessRegistration } from "@/lib/email/registration-notifications";

export async function sendRegistrationNotifications(businessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  return notifyPendingBusinessRegistration(businessId, user.id);
}
