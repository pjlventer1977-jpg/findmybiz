import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyPendingBusinessRegistration } from "@/lib/email/registration-notifications";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: businessId } = await params;
  const result = await notifyPendingBusinessRegistration(businessId, user.id);

  if ("error" in result && !result.ok) {
    const status =
      result.error === "Business not found"
        ? 404
        : result.error === "Forbidden"
          ? 403
          : result.error === "Business is not pending approval"
            ? 409
            : 500;

    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    success: result.ok,
    admin_recipient: result.admin_recipient,
    admin_email: result.admin_email,
    owner_email: result.owner_email,
  });
}
