import { searchBusinesses } from "@/lib/queries/public";
import type { AssistantListing } from "@/lib/assistant/types";

export type { AssistantListing } from "@/lib/assistant/types";

const PROVINCE_ALIASES: Record<string, string> = {
  gauteng: "gauteng",
  gp: "gauteng",
  "western cape": "western-cape",
  westerncape: "western-cape",
  wc: "western-cape",
  "kwazulu natal": "kwazulu-natal",
  kzn: "kwazulu-natal",
  "eastern cape": "eastern-cape",
  ec: "eastern-cape",
  "northern cape": "northern-cape",
  nc: "northern-cape",
  "free state": "free-state",
  fs: "free-state",
  limpopo: "limpopo",
  lp: "limpopo",
  mpumalanga: "mpumalanga",
  mp: "mpumalanga",
  "north west": "north-west",
  nw: "north-west",
};

export const SEARCH_LISTINGS_TOOL = {
  type: "function" as const,
  function: {
    name: "search_listings",
    description:
      "Search approved FindMyBiz business listings. Use when the visitor wants a local service or named business. Province and city should be slugs when possible.",
    parameters: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "Service, trade, category, or business name, e.g. plumber or solar",
        },
        province: {
          type: "string",
          description: "Province name or slug, e.g. gauteng or Western Cape",
        },
        city: {
          type: "string",
          description: "Town or city name or slug, e.g. krugersdorp",
        },
      },
    },
  },
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProvince(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const key = value.trim().toLowerCase().replace(/-/g, " ");
  return PROVINCE_ALIASES[key] ?? slugify(value);
}

export async function searchListingsTool(args: {
  q?: string;
  province?: string;
  city?: string;
}): Promise<{ listings: AssistantListing[]; message: string }> {
  const q = args.q?.trim() || undefined;
  const province = normalizeProvince(args.province);
  const city = args.city?.trim() ? slugify(args.city) : undefined;

  const businesses = await searchBusinesses({
    q,
    province,
    city,
    limit: 5,
  });

  const listings: AssistantListing[] = businesses.map((business) => ({
    name: business.name,
    slug: business.slug,
    href: `/business/${business.slug}`,
    city: business.city?.name ?? null,
    province: business.province?.name ?? null,
  }));

  if (listings.length === 0) {
    return {
      listings: [],
      message:
        "No approved listings matched. Suggest /get-quotes or /search, and ask for a different town if needed.",
    };
  }

  return {
    listings,
    message: `Found ${listings.length} approved listing(s). Only recommend these names.`,
  };
}
