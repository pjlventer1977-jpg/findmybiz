import { createClient, createCatalogClient } from "@/lib/supabase/server";
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

/** Parents with nested children for SA taxonomy pickers. */
export async function getCategoryTree(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const rows = data ?? [];
  const parents = rows.filter((c) => !c.parent_id);
  const children = rows.filter((c) => c.parent_id);

  return parents.map((parent) => ({
    ...parent,
    children: children
      .filter((c) => c.parent_id === parent.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));
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

/** Category IDs that should match a filter slug (parent expands to all children). */
export async function getMatchingCategoryIds(slug: string): Promise<string[]> {
  const category = await getCategoryBySlug(slug);
  if (!category) return [];

  if (category.parent_id) {
    return [category.id];
  }

  const supabase = await createClient();
  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", category.id);

  return [category.id, ...(children ?? []).map((c) => c.id)];
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
  const supabase = await createCatalogClient();
  let categoryBusinessIds: string[] | null = null;

  if (params.category) {
    const matchingIds = await getMatchingCategoryIds(params.category);
    if (matchingIds.length === 0) return [];

    const { data: categoryLinks, error: categoryError } = await supabase
      .from("business_categories")
      .select("business_id")
      .in("category_id", matchingIds);

    if (categoryError) {
      console.error("searchBusinesses category filter failed:", categoryError.message);
      return [];
    }

    categoryBusinessIds = categoryLinks?.map((row) => row.business_id) ?? [];
    if (categoryBusinessIds.length === 0) return [];
  }

  let locationBusinessIds: string[] | null = null;

  if (params.city) {
    const { data: cityRow } = await supabase
      .from("cities")
      .select("id, province_id")
      .eq("slug", params.city)
      .maybeSingle();

    if (!cityRow) return [];

    locationBusinessIds = await getBusinessIdsForProvinceScope(supabase, {
      provinceId: cityRow.province_id,
      cityIds: [cityRow.id],
    });
    if (locationBusinessIds.length === 0) return [];
  } else if (params.province) {
    const prov = await getProvinceBySlug(params.province);
    if (!prov) return [];

    const { data: provinceCities } = await supabase
      .from("cities")
      .select("id")
      .eq("province_id", prov.id);
    const cityIds = (provinceCities ?? []).map((c) => c.id);

    locationBusinessIds = await getBusinessIdsForProvinceScope(supabase, {
      provinceId: prov.id,
      cityIds,
    });
    if (locationBusinessIds.length === 0) return [];
  }

  let textMatchBusinessIds: string[] | null = null;
  if (params.q?.trim()) {
    const term = params.q.trim();
    const [{ data: nameMatches, error: nameError }, { data: categoryMatches }] =
      await Promise.all([
        supabase
          .from("businesses")
          .select("id")
          .eq("status", "approved")
          .or(`name.ilike.%${term}%,description.ilike.%${term}%`),
        supabase
          .from("categories")
          .select("id")
          .or(`name.ilike.%${term}%,slug.ilike.%${term.replace(/\s+/g, "-")}%`),
      ]);

    if (nameError) {
      console.error("searchBusinesses text filter failed:", nameError.message);
      return [];
    }

    let categoryLinkedIds: string[] = [];
    const matchedCategoryIds = (categoryMatches ?? []).map((c) => c.id);
    if (matchedCategoryIds.length > 0) {
      const { data: links } = await supabase
        .from("business_categories")
        .select("business_id")
        .in("category_id", matchedCategoryIds);
      categoryLinkedIds = (links ?? []).map((row) => row.business_id);
    }

    textMatchBusinessIds = [
      ...new Set([
        ...(nameMatches ?? []).map((row) => row.id),
        ...categoryLinkedIds,
      ]),
    ];
    if (textMatchBusinessIds.length === 0) return [];
  }

  let query = supabase
    .from("businesses")
    .select(`
      *,
      province:provinces(*),
      city:cities(*),
      categories:business_categories(category:categories(*))
    `)
    .eq("status", "approved");

  if (categoryBusinessIds) {
    query = query.in("id", categoryBusinessIds);
  }

  if (locationBusinessIds) {
    query = query.in("id", locationBusinessIds);
  }

  if (textMatchBusinessIds) {
    query = query.in("id", textMatchBusinessIds);
  }

  if (params.tier) {
    query = query.eq("membership_tier", params.tier);
  }

  query = query
    .order("membership_tier", { ascending: false })
    .order("biz_trust_score", { ascending: false })
    .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

  const { data, error } = await query;

  if (error) {
    console.error("searchBusinesses query failed:", error.message);
    return [];
  }

  return (data ?? []).map((b) => ({
    ...b,
    categories: b.categories?.map((bc: { category: Category }) => bc.category) ?? [],
  }));
}

async function getBusinessIdsForProvinceScope(
  supabase: Awaited<ReturnType<typeof createCatalogClient>>,
  scope: { provinceId: string; cityIds: string[] }
): Promise<string[]> {
  const { provinceId, cityIds } = scope;

  const [
    { data: hqByProvince },
    { data: hqByCity },
    { data: areaLinks },
    { data: wholeProvinceLinks },
  ] = await Promise.all([
    supabase.from("businesses").select("id").eq("status", "approved").eq("province_id", provinceId),
    cityIds.length
      ? supabase.from("businesses").select("id").eq("status", "approved").in("city_id", cityIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    cityIds.length
      ? supabase.from("business_service_areas").select("business_id").in("city_id", cityIds)
      : Promise.resolve({ data: [] as { business_id: string }[] }),
    supabase.from("business_service_provinces").select("business_id").eq("province_id", provinceId),
  ]);

  return [
    ...new Set([
      ...(hqByProvince ?? []).map((row) => row.id),
      ...(hqByCity ?? []).map((row) => row.id),
      ...(areaLinks ?? []).map((row) => row.business_id),
      ...(wholeProvinceLinks ?? []).map((row) => row.business_id),
    ]),
  ];
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = await createCatalogClient();
  const { data, error } = await supabase
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

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("getBusinessBySlug failed:", error.message);
    }
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    categories: data.categories?.map((bc: { category: Category }) => bc.category) ?? [],
  };
}

export async function getFeaturedBusinesses(): Promise<Business[]> {
  const supabase = await createCatalogClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      *,
      province:provinces(*),
      city:cities(*),
      categories:business_categories(category:categories(*))
    `)
    .eq("status", "approved")
    .in("membership_tier", ["professional", "enterprise"])
    .order("biz_trust_score", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("getFeaturedBusinesses failed:", error.message);
    return [];
  }

  return (data ?? [])
    .map((business) => ({
      ...business,
      categories:
        business.categories?.map(
          (entry: { category: Category }) => entry.category
        ) ?? [],
    }))
    .sort((a, b) => {
      const tierRank = { enterprise: 2, professional: 1 } as const;
      return tierRank[b.membership_tier as keyof typeof tierRank] -
        tierRank[a.membership_tier as keyof typeof tierRank];
    });
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

export async function getActiveSpecialsByBusinessId(
  businessId: string
): Promise<Special[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("specials")
    .select("id, title, description, image_url, start_date, expiry_date, business_id, status, created_at")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .gte("expiry_date", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false });

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
    .eq("is_paid", true)
    .gte("paid_until", new Date().toISOString())
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

export async function getHomepageStats(): Promise<{
  businesses: number;
  categories: number;
  quotes: number;
  provinces: number;
}> {
  const supabase = await createCatalogClient();

  const [
    { count: businesses },
    { count: categories },
    { count: quotes },
    { count: provinces },
  ] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("quote_requests").select("*", { count: "exact", head: true }),
    supabase.from("provinces").select("*", { count: "exact", head: true }),
  ]);

  return {
    businesses: businesses ?? 0,
    categories: categories ?? 0,
    quotes: quotes ?? 0,
    provinces: provinces ?? 9,
  };
}
