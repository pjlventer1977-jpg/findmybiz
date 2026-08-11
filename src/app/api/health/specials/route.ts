import { NextResponse } from "next/server";
import { getLatestSpecials } from "@/lib/queries/public";

export const dynamic = "force-dynamic";

/** Lightweight check that public specials queries return active deals. */
export async function GET() {
  const specials = await getLatestSpecials(5);

  return NextResponse.json({
    count: specials.length,
    sample: specials.map((special) => ({
      id: special.id,
      title: special.title,
      business: special.business?.name ?? null,
      expiry_date: special.expiry_date,
      has_image: Boolean(special.image_url),
    })),
  });
}
