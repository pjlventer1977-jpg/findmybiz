import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { seedAfrikaansTestEvent } from "@/lib/events/seed-test-event";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Admin-only: insert/update the Afrikaans in die Wolke test event listing. */
export async function POST() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = await createServiceClient();
    const result = await seedAfrikaansTestEvent(supabase);
    return NextResponse.json({
      ok: true,
      message: "Test event seeded for /events and homepage.",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test event seed failed";
    console.error("Admin seed test event failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
