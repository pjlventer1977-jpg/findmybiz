import { NextResponse } from "next/server";
import { createCatalogClient } from "@/lib/supabase/server";
import { getLatestSpecials } from "@/lib/queries/public";

export const dynamic = "force-dynamic";

/** Lightweight check that public specials queries return active deals. */
export async function GET() {
  const supabase = await createCatalogClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    specials,
    { data: allSpecials, error: allError },
    { data: approvedSpecials, error: approvedError },
    { data: datedSpecials, error: datedError },
  ] = await Promise.all([
    getLatestSpecials(5),
    supabase.from("specials").select("id, status, start_date, expiry_date, image_url, business_id").limit(10),
    supabase.from("specials").select("id, status, start_date, expiry_date, image_url, business_id").eq("status", "approved").limit(10),
    supabase
      .from("specials")
      .select("id, status, start_date, expiry_date, image_url, business_id")
      .eq("status", "approved")
      .gte("expiry_date", today)
      .limit(10),
  ]);

  return NextResponse.json({
    today,
    count: specials.length,
    sample: specials.map((special) => ({
      id: special.id,
      title: special.title,
      business: special.business?.name ?? null,
      expiry_date: special.expiry_date,
      has_image: Boolean(special.image_url),
    })),
    debug: {
      allError: allError?.message ?? null,
      approvedError: approvedError?.message ?? null,
      datedError: datedError?.message ?? null,
      allCount: allSpecials?.length ?? 0,
      approvedCount: approvedSpecials?.length ?? 0,
      datedCount: datedSpecials?.length ?? 0,
      rawSample: allSpecials?.[0] ?? null,
    },
  });
}
