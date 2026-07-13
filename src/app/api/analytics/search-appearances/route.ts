import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const businessIds = body?.businessIds;
    const searchTerm = typeof body?.searchTerm === "string" ? body.searchTerm : null;

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json({ error: "businessIds is required" }, { status: 400 });
    }

    const ids = businessIds.filter((id): id is string => typeof id === "string");
    if (!ids.length) {
      return NextResponse.json({ error: "No valid business IDs" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { error: insertError } = await supabase
      .from("search_appearance_analytics")
      .insert(
        ids.map((businessId) => ({
          business_id: businessId,
          search_term: searchTerm,
        }))
      );

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, search_appearances")
      .in("id", ids);

    if (businesses?.length) {
      await Promise.all(
        businesses.map((business) =>
          supabase
            .from("businesses")
            .update({
              search_appearances: (business.search_appearances ?? 0) + 1,
            })
            .eq("id", business.id)
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
