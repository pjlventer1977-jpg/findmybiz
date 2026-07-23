import type { SupabaseClient } from "@supabase/supabase-js";

const SPECIAL_BUCKET = "special-images";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateSpecialImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Image must be JPG, PNG, or WebP.";
  }
  if (file.size > MAX_SIZE) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

function specialImagePath(userId: string, specialId: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "png";
  return `${userId}/special-${specialId}.${safeExt === "jpeg" ? "jpg" : safeExt}`;
}

export async function uploadSpecialImage(
  supabase: SupabaseClient,
  userId: string,
  specialId: string,
  file: File
): Promise<string> {
  const validationError = validateSpecialImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const path = specialImagePath(userId, specialId, file);

  const { error: uploadError } = await supabase.storage
    .from(SPECIAL_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(SPECIAL_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
