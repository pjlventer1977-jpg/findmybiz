import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const businessId = body?.businessId;

    if (typeof businessId !== "string" || !businessId) {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const referrer = request.headers.get("referer") ?? null;
    const viewerIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const { error: insertError } = await supabase
      .from("profile_view_analytics")
      .insert({
        business_id: businessId,
        referrer,
        viewer_ip: viewerIp,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("profile_views")
      .eq("id", businessId)
      .single();

    if (business) {
      await supabase
        .from("businesses")
        .update({ profile_views: (business.profile_views ?? 0) + 1 })
        .eq("id", businessId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
