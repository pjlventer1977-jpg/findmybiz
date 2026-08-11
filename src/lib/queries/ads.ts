import { createCatalogClient } from "@/lib/supabase/server";
import { expireStaleFeaturedAds } from "@/lib/ads/lifecycle";

export interface BannerAd {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  placement: string;
  category_id: string | null;
}

export async function getActiveHomeBanners(limit = 3): Promise<BannerAd[]> {
  const supabase = await createCatalogClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("banner_ads")
    .select("id, title, image_url, link_url, placement, category_id")
    .eq("placement", "home")
    .eq("is_active", true)
    .gte("end_date", now)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getActiveHomeBanners failed:", error.message);
    return [];
  }

  return (data ?? []).filter((banner) => banner.image_url);
}

export async function getActiveCategoryBanner(
  categoryId: string
): Promise<BannerAd | null> {
  const supabase = await createCatalogClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("banner_ads")
    .select("id, title, image_url, link_url, placement, category_id")
    .eq("placement", "category")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .gte("end_date", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getActiveCategoryBanner failed:", error.message);
    return null;
  }

  return data?.image_url ? data : null;
}

export async function prepareFeaturedCatalog() {
  const supabase = await createCatalogClient();
  await expireStaleFeaturedAds(supabase);
}
