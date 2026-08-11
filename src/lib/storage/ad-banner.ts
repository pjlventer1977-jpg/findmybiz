import type { SupabaseClient } from "@supabase/supabase-js";

const AD_BANNER_BUCKET = "event-banners";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateAdBannerFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Banner must be JPG, PNG, or WebP.";
  }
  if (file.size > MAX_SIZE) {
    return "Banner must be 5MB or smaller.";
  }
  return null;
}

export async function uploadAdBanner(
  supabase: SupabaseClient,
  userId: string,
  bannerId: string,
  file: File
): Promise<string> {
  const validationError = validateAdBannerFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "png";
  const path = `${userId}/ad-banner-${bannerId}.${safeExt === "jpeg" ? "jpg" : safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(AD_BANNER_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(AD_BANNER_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
