import { NextRequest, NextResponse } from "next/server";
import { runPromoExpireJob } from "@/lib/payments/promo-expire";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  // Vercel Cron sends this header when CRON_SECRET is configured
  const cronHeader = request.headers.get("x-vercel-cron-secret");
  if (cronHeader && cronHeader === secret) return true;
  return false;
}

/**
 * Converts expired launch-promo subscriptions to full PayFast recurring price.
 * Secure with CRON_SECRET. Vercel Cron: GET daily.
 */
export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runPromoExpireJob();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Promo cron failed";
    console.error("Promo cron failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
