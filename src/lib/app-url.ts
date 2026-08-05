/**
 * Canonical public site URL for absolute links and PayFast callbacks.
 *
 * Apex findmybiz.co.za 308-redirects to www on Vercel. PayFast ITN does not
 * follow redirects, so notify_url must already be the www host.
 */
export function getCanonicalAppUrl(
  raw: string | undefined = process.env.NEXT_PUBLIC_APP_URL
): string {
  const fallback = "https://www.findmybiz.co.za";
  const input = (raw ?? fallback).trim().replace(/\/+$/, "");
  if (!input) return fallback;

  try {
    const url = new URL(input);
    if (url.hostname === "findmybiz.co.za") {
      url.hostname = "www.findmybiz.co.za";
    }
    return url.origin;
  } catch {
    return fallback;
  }
}
