import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Oldest registered business for this owner — shared by layout + all dashboard pages. */
export const getOwnerPrimaryBusiness = cache(async (ownerId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*, lead_credits(balance, monthly_allocation)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
});
