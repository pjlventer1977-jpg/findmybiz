import type { SupabaseClient } from "@supabase/supabase-js";

const LOGO_BUCKET = "business-logos";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateLogoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Logo must be JPG, PNG, or WebP.";
  }
  if (file.size > MAX_SIZE) {
    return "Logo must be 5MB or smaller.";
  }
  return null;
}

function logoStoragePath(userId: string, businessId: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "png";
  return `${userId}/logo-${businessId}.${safeExt === "jpeg" ? "jpg" : safeExt}`;
}

export async function uploadBusinessLogo(
  supabase: SupabaseClient,
  userId: string,
  businessId: string,
  file: File
): Promise<string> {
  const validationError = validateLogoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const path = logoStoragePath(userId, businessId, file);

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ logo_url: publicUrl })
    .eq("id", businessId)
    .eq("owner_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return publicUrl;
}
