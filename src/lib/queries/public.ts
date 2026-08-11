import { createClient, createCatalogClient } from "@/lib/supabase/server";
import { expireStaleFeaturedAds } from "@/lib/ads/lifecycle";
import {
  businessMatchesAllSearchTerms,
  categoryMatchesAllSearchTerms,
  parseSearchTerms,
} from "@/lib/search/text-match";
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

type CatalogClient = Awaited<ReturnType<typeof createCatalogClient>>;

/** Category IDs whose name/slug matches a free-text search (parents include all children). */
async function getCategoryIdsMatchingSearchTerm(
  supabase: CatalogClient,
  term: string
): Promise<string[]> {
  const terms = parseSearchTerms(term);
  if (terms.length === 0) return [];

  const { data: categories } = await supabase
    .from("categories")
    .select("id, parent_id, name, slug");

  const matches = (categories ?? []).filter((category) =>
    categoryMatchesAllSearchTerms(category, terms)
  );

  if (matches.length === 0) return [];

  const ids = new Set<string>();
  const parentIdsToExpand: string[] = [];

  for (const category of matches) {
    ids.add(category.id);
    if (!category.parent_id) {
      parentIdsToExpand.push(category.id);
    }
  }

  if (parentIdsToExpand.length > 0) {
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .in("parent_id", parentIdsToExpand);
    for (const child of children ?? []) {
      ids.add(child.id);
    }
  }

  return [...ids];
}

async function getBusinessIdsMatchingSearchText(
  supabase: CatalogClient,
  term: string
): Promise<string[]> {
  const terms = parseSearchTerms(term);
  if (terms.length === 0) return [];

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, trading_name, description")
    .eq("status", "approved");

  if (error) {
    console.error("getBusinessIdsMatchingSearchText failed:", error.message);
    return [];
  }

  return (businesses ?? [])
    .filter((business) => businessMatchesAllSearchTerms(business, terms))
    .map((business) => business.id);
}

async function attachCategoriesToBusinesses(
  supabase: CatalogClient,
  businesses: Business[]
): Promise<Business[]> {
  if (businesses.length === 0) return [];

  const { data: links, error } = await supabase
    .from("business_categories")
    .select("business_id, category:categories(*)")
    .in(
      "business_id",
      businesses.map((business) => business.id)
    );

  if (error) {
    console.error("attachCategoriesToBusinesses failed:", error.message);
    return businesses.map((business) => ({
      ...business,
      categories: [],
    }));
  }

  const categoriesByBusiness = new Map<string, Category[]>();
  for (const link of links ?? []) {
    const row = link as unknown as { business_id: string; category: Category | null };
    if (!row.category) continue;
    const existing = categoriesByBusiness.get(row.business_id) ?? [];
    existing.push(row.category);
    categoriesByBusiness.set(row.business_id, existing);
  }

  return businesses.map((business) => ({
    ...business,
    categories: categoriesByBusiness.get(business.id) ?? [],
  }));
}

async function attachReviewSummariesToBusinesses(
  supabase: CatalogClient,
  businesses: Business[]
): Promise<Business[]> {
  if (businesses.length === 0) return [];

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("business_id, rating")
    .in(
      "business_id",
      businesses.map((business) => business.id)
    )
    .eq("status", "approved");

  if (error) {
    console.error("attachReviewSummariesToBusinesses failed:", error.message);
    return businesses;
  }

  const totals = new Map<string, { count: number; sum: number }>();
  for (const review of reviews ?? []) {
    const current = totals.get(review.business_id) ?? { count: 0, sum: 0 };
    current.count += 1;
    current.sum += review.rating;
    totals.set(review.business_id, current);
  }

  return businesses.map((business) => {
    const summary = totals.get(business.id);
    if (!summary || summary.count === 0) {
      return {
        ...business,
        approved_review_count: 0,
        average_review_rating: undefined,
      };
    }

    return {
      ...business,
      approved_review_count: summary.count,
      average_review_rating: summary.sum / summary.count,
    };
  });
}

async function attachLocationsToBusinesses(
  supabase: CatalogClient,
  businesses: Business[]
): Promise<Business[]> {
  if (businesses.length === 0) return [];

  const provinceIds = [
    ...new Set(
      businesses.map((business) => business.province_id).filter(Boolean) as string[]
    ),
  ];
  const cityIds = [
    ...new Set(businesses.map((business) => business.city_id).filter(Boolean) as string[]),
  ];

  const [{ data: provinces }, { data: cities }] = await Promise.all([
    provinceIds.length
      ? supabase.from("provinces").select("*").in("id", provinceIds)
      : Promise.resolve({ data: [] as Province[] }),
    cityIds.length
      ? supabase.from("cities").select("*").in("id", cityIds)
      : Promise.resolve({ data: [] as City[] }),
  ]);

  const provinceById = new Map((provinces ?? []).map((province) => [province.id, province]));
  const cityById = new Map((cities ?? []).map((city) => [city.id, city]));

  return businesses.map((business) => ({
    ...business,
    province: business.province_id ? provinceById.get(business.province_id) ?? null : null,
    city: business.city_id ? cityById.get(business.city_id) ?? null : null,
  }));
}

async function hydrateBusinessList(
  supabase: CatalogClient,
  businesses: Business[]
): Promise<Business[]> {
  const withLocations = await attachLocationsToBusinesses(supabase, businesses);
  const withCategories = await attachCategoriesToBusinesses(supabase, withLocations);
  return attachReviewSummariesToBusinesses(supabase, withCategories);
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
    const [nameMatches, matchedCategoryIds] = await Promise.all([
      getBusinessIdsMatchingSearchText(supabase, term),
      getCategoryIdsMatchingSearchTerm(supabase, term),
    ]);

    let categoryLinkedIds: string[] = [];
    if (matchedCategoryIds.length > 0) {
      const { data: links } = await supabase
        .from("business_categories")
        .select("business_id")
        .in("category_id", matchedCategoryIds);
      categoryLinkedIds = (links ?? []).map((row) => row.business_id);
    }

    textMatchBusinessIds = [...new Set([...nameMatches, ...categoryLinkedIds])];
    if (textMatchBusinessIds.length === 0) return [];
  }

  let query = supabase.from("businesses").select("*").eq("status", "approved");

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
    .order("biz_trust_score", { ascending: false })
    .order("created_at", { ascending: false })
    .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

  const { data, error } = await query;

  if (error) {
    console.error(
      "searchBusinesses query failed:",
      error.message,
      error.details,
      error.hint,
      error.code
    );
    return [];
  }

  const rows = (data ?? []) as Business[];
  const tierRank = { enterprise: 4, professional: 3, starter: 2, free: 1 } as const;
  rows.sort((a, b) => {
    const tierDiff =
      (tierRank[b.membership_tier as keyof typeof tierRank] ?? 0) -
      (tierRank[a.membership_tier as keyof typeof tierRank] ?? 0);
    if (tierDiff !== 0) return tierDiff;
    return (b.biz_trust_score ?? 0) - (a.biz_trust_score ?? 0);
  });

  return hydrateBusinessList(supabase, rows);
}

async function getBusinessIdsForProvinceScope(
  supabase: CatalogClient,
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
    .select("*")
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

  let business = data as Business;

  if (business.suburb_id) {
    const { data: suburb } = await supabase
      .from("suburbs")
      .select("*")
      .eq("id", business.suburb_id)
      .maybeSingle();
    business = { ...business, suburb: suburb ?? null };
  }

  const [hydrated] = await hydrateBusinessList(supabase, [business]);
  return hydrated ?? null;
}

export async function getFeaturedBusinesses(): Promise<Business[]> {
  const supabase = await createCatalogClient();
  await expireStaleFeaturedAds(supabase);
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("biz_trust_score", { ascending: false })
    .limit(12);

  if (error) {
    console.error("getFeaturedBusinesses failed:", error.message);
    return [];
  }

  return hydrateBusinessList(supabase, (data ?? []) as Business[]);
}

export async function getPortfolioForBusiness(businessId: string) {
  const supabase = await createCatalogClient();
  const { data, error } = await supabase
    .from("business_portfolio")
    .select("id, image_url, caption, sort_order")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getPortfolioForBusiness failed:", error.message);
    return [];
  }

  return (data ?? []).filter((item) => item.image_url);
}

export async function getLatestSpecials(limit = 6): Promise<Special[]> {
  const supabase = await createCatalogClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: specials, error } = await supabase
    .from("specials")
    .select(
      "id, business_id, title, description, image_url, start_date, expiry_date, status, created_at"
    )
    .eq("status", "approved")
    .gte("expiry_date", today)
    .order("created_at", { ascending: false })
    .limit(Math.max(limit * 3, 12));

  if (error) {
    console.error("getLatestSpecials failed:", error.message);
    return [];
  }

  const activeSpecials = (specials ?? []).filter(
    (special) => typeof special.image_url === "string" && special.image_url.trim().length > 0
  );

  if (activeSpecials.length === 0) return [];

  const businessIds = [...new Set(activeSpecials.map((special) => special.business_id))];
  const { data: businesses, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug, logo_url, status")
    .in("id", businessIds)
    .eq("status", "approved");

  if (businessError) {
    console.error("getLatestSpecials businesses failed:", businessError.message);
  }

  const businessMap = new Map((businesses ?? []).map((business) => [business.id, business]));

  return activeSpecials
    .slice(0, limit)
    .map((special) => ({
      ...special,
      business: businessMap.get(special.business_id),
    })) as Special[];
}

export async function getActiveSpecialsByBusinessId(
  businessId: string
): Promise<Special[]> {
  const supabase = await createCatalogClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("specials")
    .select("id, title, description, image_url, start_date, expiry_date, business_id, status, created_at")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .gte("expiry_date", today)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveSpecialsByBusinessId failed:", error.message);
    return [];
  }

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

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(`
      *,
      province:provinces(name, slug),
      city:cities(name, slug)
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .eq("is_paid", true)
    .gte("paid_until", new Date().toISOString())
    .maybeSingle();

  return data;
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

export async function getApprovedReviewsForBusiness(businessId: string) {
  const supabase = await createCatalogClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, comment, created_at")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getApprovedReviewsForBusiness failed:", error.message);
    return [];
  }

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
