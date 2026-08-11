import { createServiceClient } from "@/lib/supabase/server";

export type AdminBusinessStatus =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export interface AdminDirectoryBusiness {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  membership_tier: string;
  intended_membership_tier: string | null;
  slug: string | null;
  profile_views: number;
  created_at: string;
  approved_at: string | null;
  contact_person: string | null;
  province: { name: string } | null;
  city: { name: string } | null;
  business_categories: { category_id: string; category?: { name: string } | null }[];
  leadCount: number;
}

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

async function attachAdminRelations(
  supabase: ServiceClient,
  businesses: Array<{
    id: string;
    province_id: string | null;
    city_id: string | null;
  }>
): Promise<{
  provinceById: Map<string, { name: string }>;
  cityById: Map<string, { name: string }>;
  categoriesByBusiness: Map<
    string,
    { category_id: string; category?: { name: string } | null }[]
  >;
  leadCounts: Map<string, number>;
}> {
  const ids = businesses.map((business) => business.id);
  const provinceIds = [
    ...new Set(
      businesses.map((business) => business.province_id).filter(Boolean) as string[]
    ),
  ];
  const cityIds = [
    ...new Set(businesses.map((business) => business.city_id).filter(Boolean) as string[]),
  ];

  const [
    { data: provinces },
    { data: cities },
    { data: categoryLinks },
    { data: leads },
  ] = await Promise.all([
    provinceIds.length
      ? supabase.from("provinces").select("id, name").in("id", provinceIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    cityIds.length
      ? supabase.from("cities").select("id, name").in("id", cityIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ids.length
      ? supabase
          .from("business_categories")
          .select("business_id, category_id")
          .in("business_id", ids)
      : Promise.resolve({ data: [] as { business_id: string; category_id: string }[] }),
    ids.length
      ? supabase.from("leads").select("business_id").in("business_id", ids)
      : Promise.resolve({ data: [] as { business_id: string }[] }),
  ]);

  const provinceById = new Map(
    (provinces ?? []).map((province) => [province.id, { name: province.name }])
  );
  const cityById = new Map((cities ?? []).map((city) => [city.id, { name: city.name }]));

  const categoryIds = [
    ...new Set((categoryLinks ?? []).map((row) => row.category_id)),
  ];
  const { data: categoryRows } = categoryIds.length
    ? await supabase.from("categories").select("id, name").in("id", categoryIds)
    : { data: [] as { id: string; name: string }[] };
  const categoryNameById = new Map(
    (categoryRows ?? []).map((category) => [category.id, category.name])
  );

  const categoriesByBusiness = new Map<
    string,
    { category_id: string; category?: { name: string } | null }[]
  >();

  for (const row of categoryLinks ?? []) {
    const existing = categoriesByBusiness.get(row.business_id) ?? [];
    existing.push({
      category_id: row.category_id,
      category: categoryNameById.has(row.category_id)
        ? { name: categoryNameById.get(row.category_id)! }
        : null,
    });
    categoriesByBusiness.set(row.business_id, existing);
  }

  const leadCounts = new Map<string, number>();
  for (const lead of leads ?? []) {
    leadCounts.set(lead.business_id, (leadCounts.get(lead.business_id) ?? 0) + 1);
  }

  return { provinceById, cityById, categoriesByBusiness, leadCounts };
}

export async function getAdminBusinessDirectory(params: {
  status?: AdminBusinessStatus;
  q?: string;
}): Promise<AdminDirectoryBusiness[]> {
  const supabase = await createServiceClient();
  const status = params.status ?? "all";

  let query = supabase
    .from("businesses")
    .select(
      `
      id,
      name,
      email,
      phone,
      status,
      membership_tier,
      intended_membership_tier,
      slug,
      profile_views,
      created_at,
      approved_at,
      contact_person,
      province_id,
      city_id
    `
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (params.q?.trim()) {
    const term = params.q.trim().replace(/[%_,]/g, " ");
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,contact_person.ilike.%${term}%`
    );
  }

  const { data: businesses, error } = await query;
  if (error) {
    console.error("Admin directory query failed:", error.message, error.details, error.hint);
    return [];
  }

  const rows = businesses ?? [];
  if (rows.length === 0) return [];

  const { provinceById, cityById, categoriesByBusiness, leadCounts } =
    await attachAdminRelations(supabase, rows);

  return rows.map((business) => ({
    id: business.id,
    name: business.name,
    email: business.email,
    phone: business.phone,
    status: business.status,
    membership_tier: business.membership_tier,
    intended_membership_tier: business.intended_membership_tier,
    slug: business.slug,
    profile_views: business.profile_views ?? 0,
    created_at: business.created_at,
    approved_at: business.approved_at,
    contact_person: business.contact_person,
    province: business.province_id
      ? provinceById.get(business.province_id) ?? null
      : null,
    city: business.city_id ? cityById.get(business.city_id) ?? null : null,
    business_categories: categoriesByBusiness.get(business.id) ?? [],
    leadCount: leadCounts.get(business.id) ?? 0,
  }));
}

export async function getAdminBusinessStatusCounts() {
  const supabase = await createServiceClient();
  const statuses = ["pending", "approved", "rejected", "suspended"] as const;

  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("status", status);
      return [status, count ?? 0] as const;
    })
  );

  const { count: all } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true });

  return {
    all: all ?? 0,
    pending: results.find(([s]) => s === "pending")?.[1] ?? 0,
    approved: results.find(([s]) => s === "approved")?.[1] ?? 0,
    rejected: results.find(([s]) => s === "rejected")?.[1] ?? 0,
    suspended: results.find(([s]) => s === "suspended")?.[1] ?? 0,
  };
}

export async function getAdminBusinessForEdit(businessId: string) {
  const supabase = await createServiceClient();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      "id, name, description, phone, email, website, province_id, city_id, status, slug, logo_url, owner_id, membership_tier"
    )
    .eq("id", businessId)
    .maybeSingle();

  if (error || !business) return null;

  const [
    { data: documents },
    { data: categoryLinks },
    { data: serviceAreas },
    { data: wholeProvinces },
  ] = await Promise.all([
    supabase
      .from("business_documents")
      .select("*")
      .eq("business_id", businessId)
      .order("uploaded_at", { ascending: false }),
    supabase.from("business_categories").select("category_id").eq("business_id", businessId),
    supabase.from("business_service_areas").select("city_id").eq("business_id", businessId),
    supabase
      .from("business_service_provinces")
      .select("province_id")
      .eq("business_id", businessId),
  ]);

  const cityIds = (serviceAreas ?? []).map((row) => row.city_id);
  const { data: cities } = cityIds.length
    ? await supabase.from("cities").select("id, name, province_id").in("id", cityIds)
    : { data: [] as { id: string; name: string; province_id: string }[] };

  const provinceIdsForAreas = [
    ...new Set((cities ?? []).map((city) => city.province_id)),
  ];
  const { data: areaProvinces } = provinceIdsForAreas.length
    ? await supabase.from("provinces").select("id, name").in("id", provinceIdsForAreas)
    : { data: [] as { id: string; name: string }[] };
  const provinceNameById = new Map(
    (areaProvinces ?? []).map((province) => [province.id, province.name])
  );

  const serviceAreaSelections = (cities ?? []).map((city) => ({
    cityId: city.id,
    cityName: city.name,
    provinceId: city.province_id,
    provinceName: provinceNameById.get(city.province_id) ?? "",
  }));

  return {
    business,
    documents: documents ?? [],
    categoryIds: (categoryLinks ?? []).map((row) => row.category_id),
    serviceAreas: serviceAreaSelections,
    wholeProvinceIds: (wholeProvinces ?? []).map((row) => row.province_id),
  };
}
