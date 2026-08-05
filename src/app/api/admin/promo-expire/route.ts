import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { runPromoExpireJob } from "@/lib/payments/promo-expire";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Admin-only manual trigger for launch-promo → full-price conversion. */
export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const summary = await runPromoExpireJob();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Promo expire failed";
    console.error("Admin promo expire failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
