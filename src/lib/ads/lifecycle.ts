import type { SupabaseClient } from "@supabase/supabase-js";
import type { MembershipTier } from "@/types";

export async function expireStaleFeaturedAds(
  supabase: SupabaseClient
): Promise<void> {
  const now = new Date().toISOString();

  const { data: expiredAds } = await supabase
    .from("featured_ads")
    .select("id, business_id")
    .eq("is_active", true)
    .lt("end_date", now);

  if (!expiredAds?.length) return;

  const expiredIds = expiredAds.map((ad) => ad.id);
  await supabase.from("featured_ads").update({ is_active: false }).in("id", expiredIds);

  for (const ad of expiredAds) {
    const { count: activeCount } = await supabase
      .from("featured_ads")
      .select("*", { count: "exact", head: true })
      .eq("business_id", ad.business_id)
      .eq("is_active", true)
      .gte("end_date", now);

    if ((activeCount ?? 0) > 0) continue;

    const { data: business } = await supabase
      .from("businesses")
      .select("membership_tier")
      .eq("id", ad.business_id)
      .single();

    if (business?.membership_tier === "enterprise") continue;

    await supabase
      .from("businesses")
      .update({ is_featured: false })
      .eq("id", ad.business_id);
  }
}

export async function activateFeaturedAd(
  supabase: SupabaseClient,
  params: {
    businessId: string;
    paymentId: string;
    durationDays: number;
  }
) {
  const start = new Date();
  const end = new Date(start.getTime() + params.durationDays * 24 * 60 * 60 * 1000);

  await supabase.from("featured_ads").insert({
    business_id: params.businessId,
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    is_active: true,
    payment_id: params.paymentId,
  });

  await supabase
    .from("businesses")
    .update({ is_featured: true })
    .eq("id", params.businessId);
}

export async function activateBannerAd(
  supabase: SupabaseClient,
  params: {
    bannerAdId: string;
    durationDays: number;
  }
) {
  const start = new Date();
  const end = new Date(start.getTime() + params.durationDays * 24 * 60 * 60 * 1000);

  await supabase
    .from("banner_ads")
    .update({
      is_active: true,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    })
    .eq("id", params.bannerAdId);
}

export function shouldKeepFeatured(tier: MembershipTier): boolean {
  return tier === "enterprise";
}
