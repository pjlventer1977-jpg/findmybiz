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
      province:provinces(name),
      city:cities(name),
      business_categories(category_id, category:categories(name))
    `
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    query = query.or(
      `name.ilike.${term},email.ilike.${term},phone.ilike.${term},contact_person.ilike.${term}`
    );
  }

  const { data: businesses, error } = await query;
  if (error) {
    console.error("Admin directory query failed:", error.message);
    return [];
  }

  const ids = (businesses ?? []).map((b) => b.id);
  const leadCounts = new Map<string, number>();

  if (ids.length) {
    const { data: leads } = await supabase
      .from("leads")
      .select("business_id")
      .in("business_id", ids);

    for (const lead of leads ?? []) {
      leadCounts.set(
        lead.business_id,
        (leadCounts.get(lead.business_id) ?? 0) + 1
      );
    }
  }

  return (businesses ?? []).map((business) => {
    const provinceRaw = business.province as unknown;
    const cityRaw = business.city as unknown;
    const province = Array.isArray(provinceRaw)
      ? (provinceRaw[0] as { name: string } | undefined) ?? null
      : (provinceRaw as { name: string } | null);
    const city = Array.isArray(cityRaw)
      ? (cityRaw[0] as { name: string } | undefined) ?? null
      : (cityRaw as { name: string } | null);

    const catsRaw = (business.business_categories ?? []) as unknown as Array<{
      category_id: string;
      category?: { name: string } | { name: string }[] | null;
    }>;

    const business_categories = catsRaw.map((row) => {
      const cat = row.category;
      const category = Array.isArray(cat) ? cat[0] ?? null : cat ?? null;
      return { category_id: row.category_id, category };
    });

    return {
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
      province,
      city,
      business_categories,
      leadCount: leadCounts.get(business.id) ?? 0,
    };
  });
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
