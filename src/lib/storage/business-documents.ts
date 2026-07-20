import type { SupabaseClient } from "@supabase/supabase-js";

export const DOCUMENT_BUCKET = "business-documents";
export const DOCUMENT_TYPES = [
  "proof_of_address",
  "id_document",
  "cipc",
] as const;

export type BusinessDocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<BusinessDocumentType, string> = {
  proof_of_address: "Proof of Address",
  id_document: "ID / Passport",
  cipc: "CIPC Registration",
};

export const REQUIRED_DOCUMENT_TYPES: BusinessDocumentType[] = [
  "proof_of_address",
  "id_document",
];

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export function validateDocumentFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Document must be PDF, JPG, or PNG.";
  }
  if (file.size > MAX_SIZE) {
    return "Document must be 10MB or smaller.";
  }
  return null;
}

function documentStoragePath(
  userId: string,
  businessId: string,
  documentType: BusinessDocumentType,
  file: File
): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const safeExt = ["jpg", "jpeg", "png", "pdf"].includes(ext) ? ext : "pdf";
  return `${userId}/${businessId}/${documentType}.${safeExt === "jpeg" ? "jpg" : safeExt}`;
}

export async function uploadBusinessDocument(
  supabase: SupabaseClient,
  userId: string,
  businessId: string,
  file: File,
  documentType: BusinessDocumentType
): Promise<string> {
  const validationError = validateDocumentFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const path = documentStoragePath(userId, businessId, documentType, file);

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: existing } = await supabase
    .from("business_documents")
    .select("id")
    .eq("business_id", businessId)
    .eq("document_type", documentType)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from("business_documents")
      .update({
        file_url: path,
        file_name: file.name,
        verified: false,
        uploaded_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("business_documents").insert({
      business_id: businessId,
      document_type: documentType,
      file_url: path,
      file_name: file.name,
      verified: false,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return path;
}

export async function createDocumentSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed URL");
  }

  return data.signedUrl;
}
