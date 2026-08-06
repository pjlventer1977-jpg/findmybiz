import { NextResponse } from "next/server";
import { getHomepageStats, searchBusinesses } from "@/lib/queries/public";

export const dynamic = "force-dynamic";

/** Lightweight check that public catalog queries return approved businesses. */
export async function GET() {
  const [stats, businesses] = await Promise.all([
    getHomepageStats(),
    searchBusinesses({ limit: 5 }),
  ]);

  return NextResponse.json({
    stats,
    searchCount: businesses.length,
    sample: businesses.map((business) => ({
      id: business.id,
      name: business.name,
      slug: business.slug,
      province: business.province?.name ?? null,
      city: business.city?.name ?? null,
    })),
  });
}
