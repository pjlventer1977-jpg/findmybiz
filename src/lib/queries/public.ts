import { createClient } from "@/lib/supabase/server";
import type { Business, Category, Province, City, Special, Event } from "@/types";

export async function getProvinces(): Promise<Province[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("provinces")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function getProvinceBySlug(slug: string): Promise<Province | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("provinces")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getCitiesByProvince(provinceId: string): Promise<City[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cities")
    .select("*")
    .eq("province_id", provinceId)
    .order("name");
  return data ?? [];
}

export async function getCityBySlug(provinceSlug: string, citySlug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cities")
    .select("*, province:provinces(*)")
    .eq("slug", citySlug)
    .single();

  if (!data || (data.province as Province)?.slug !== provinceSlug) return null;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("sort_order");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function searchBusinesses(params: {
  q?: string;
  province?: string;
  city?: string;
  category?: string;
  tier?: string;
  limit?: number;
  offset?: number;
}): Promise<Business[]> {
  const supabase = await createClient();
  let query = supabase
    .from("businesses")
    .select(`
      *,
      province:provinces(*),
      city:cities(*),
      categories:business_categories(category:categories(*))
    `)
    .eq("status", "approved");

  if (params.province) {
    const prov = await getProvinceBySlug(params.province);
    if (prov) query = query.eq("province_id", prov.id);
  }

  if (params.city) {
    query = query.eq("city.slug", params.city);
  }

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  if (params.tier) {
    query = query.eq("membership_tier", params.tier);
  }

  query = query
    .order("membership_tier", { ascending: false })
    .order("biz_trust_score", { ascending: false })
    .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

  const { data } = await query;

  return (data ?? []).map((b) => ({
    ...b,
    categories: b.categories?.map((bc: { category: Category }) => bc.category) ?? [],
  }));
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select(`
      *,
      province:provinces(*),
      city:cities(*),
      suburb:suburbs(*),
      categories:business_categories(category:categories(*))
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!data) return null;

  return {
    ...data,
    categories: data.categories?.map((bc: { category: Category }) => bc.category) ?? [],
  };
}

export async function getFeaturedBusinesses(limit = 6): Promise<Business[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select(`
      *,
      province:provinces(*),
      city:cities(*)
    `)
    .eq("status", "approved")
    .or("is_featured.eq.true,membership_tier.eq.enterprise")
    .order("biz_trust_score", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getLatestSpecials(limit = 6): Promise<Special[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("specials")
    .select(`
      *,
      business:businesses(id, name, slug, logo_url, city:cities(name))
    `)
    .eq("status", "approved")
    .gte("expiry_date", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(`
      *,
      province:provinces(name),
      city:cities(name)
    `)
    .eq("status", "approved")
    .gte("event_date", new Date().toISOString())
    .order("event_date")
    .limit(limit);

  return data ?? [];
}

export async function getPopularCategories(limit = 12): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("sort_order")
    .limit(limit);

  return data ?? [];
}
