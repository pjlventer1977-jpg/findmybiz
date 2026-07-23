import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createDocumentSignedUrl } from "@/lib/storage/business-documents";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: businessId, documentId } = await params;
  const supabase = await createServiceClient();

  const { data: document, error } = await supabase
    .from("business_documents")
    .select("id, business_id, file_url, file_name")
    .eq("id", documentId)
    .eq("business_id", businessId)
    .single();

  if (error || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const signedUrl = await createDocumentSignedUrl(supabase, document.file_url);
    return NextResponse.redirect(signedUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to open document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
