import { searchListingsTool } from "@/lib/assistant/tools";
import type { AssistantListing } from "@/lib/assistant/types";

export async function fallbackAssistantReply(
  userText: string
): Promise<{ message: string; listings: AssistantListing[] }> {
  const text = userText.toLowerCase();

  if (
    /list (my |a |our )?business|register|sign up|membership|pricing|subscribe|how much/.test(
      text
    )
  ) {
    return {
      listings: [],
      message:
        "You can list on FindMyBiz for free. Go to /register, complete your profile (logo, category, area), then wait for admin approval. Paid plans start at R149/month (Starter) — see /pricing. Launch promo may apply. Questions: support@findmybiz.co.za",
    };
  }

  if (/quote|get 5|how (do|does) (the )?quotes/.test(text)) {
    return {
      listings: [],
      message:
        "Get 5 Quotes: describe the job on /get-quotes (name, contact, town, category). We match up to 5 approved businesses in your area. You must consent so they can contact you. They reply directly — FindMyBiz does not email you the quotes.",
    };
  }

  if (/event/.test(text)) {
    return {
      listings: [],
      message:
        "Browse events at /events. Organisers can list a poster at /events/list (from R99/week, admin approval).",
    };
  }

  const inPlace = userText.match(/\bin\s+([A-Za-z][A-Za-z\s-]{1,40})$/i);
  const search = await searchListingsTool({
    q: userText.replace(/\bin\s+[A-Za-z][A-Za-z\s-]{1,40}$/i, "").trim() || userText,
    city: inPlace?.[1],
  });
  if (search.listings.length > 0) {
    return {
      listings: search.listings,
      message:
        "I found these approved listings. Open a profile, or request up to 5 quotes at /get-quotes if you need more matches.",
    };
  }

  return {
    listings: [],
    message:
      "I can help you find a local business or request quotes. Try a service and town (e.g. plumber in Krugersdorp), open /search or /get-quotes, or email support@findmybiz.co.za.",
  };
}
