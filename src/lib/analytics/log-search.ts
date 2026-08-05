import { createServiceClient } from "@/lib/supabase/server";

export async function logSearchAnalytics(params: {
  categoryId?: string | null;
  provinceId?: string | null;
  cityId?: string | null;
  searchTerm?: string | null;
  resultsCount?: number | null;
}) {
  try {
    const hasSignal =
      Boolean(params.categoryId) ||
      Boolean(params.searchTerm?.trim()) ||
      Boolean(params.provinceId) ||
      Boolean(params.cityId);

    if (!hasSignal) return;

    const supabase = await createServiceClient();
    await supabase.from("search_analytics").insert({
      category_id: params.categoryId ?? null,
      province_id: params.provinceId ?? null,
      city_id: params.cityId ?? null,
      search_term: params.searchTerm?.trim() || null,
      results_count: params.resultsCount ?? null,
    });
  } catch (error) {
    console.error("Failed to log search analytics:", error);
  }
}
