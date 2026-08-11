import type { SupabaseClient } from "@supabase/supabase-js";

const PORTFOLIO_BUCKET = "portfolio-images";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePortfolioImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Image must be JPG, PNG, or WebP.";
  }
  if (file.size > MAX_SIZE) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

function portfolioImagePath(
  userId: string,
  portfolioId: string,
  file: File
): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "png";
  return `${userId}/portfolio-${portfolioId}.${safeExt === "jpeg" ? "jpg" : safeExt}`;
}

export async function uploadPortfolioImage(
  supabase: SupabaseClient,
  userId: string,
  portfolioId: string,
  file: File
): Promise<string> {
  const validationError = validatePortfolioImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const path = portfolioImagePath(userId, portfolioId, file);

  const { error: uploadError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export function extractPortfolioStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${PORTFOLIO_BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export async function deletePortfolioImage(
  supabase: SupabaseClient,
  imageUrl: string
): Promise<void> {
  const path = extractPortfolioStoragePath(imageUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(PORTFOLIO_BUCKET).remove([path]);
  if (error) {
    throw new Error(error.message);
  }
}
