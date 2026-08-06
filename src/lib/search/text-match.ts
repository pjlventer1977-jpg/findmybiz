/** Split a user query into individual search words. */
export function parseSearchTerms(query: string): string[] {
  return query.trim().split(/\s+/).filter(Boolean);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `term` appears as a whole word in `text` (not inside another word). */
export function matchesWholeWord(text: string | null | undefined, term: string): boolean {
  if (!text || !term) return false;
  const pattern = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
  return pattern.test(text);
}

export function categoryMatchesSearchTerm(
  category: { name: string; slug: string },
  term: string
): boolean {
  if (!term) return false;
  if (matchesWholeWord(category.name, term)) return true;
  const lower = term.toLowerCase();
  return category.slug.split("-").some((segment) => segment === lower);
}

export function categoryMatchesAllSearchTerms(
  category: { name: string; slug: string },
  terms: string[]
): boolean {
  if (terms.length === 0) return false;
  return terms.every((term) => categoryMatchesSearchTerm(category, term));
}

export function businessMatchesSearchTerm(
  business: {
    name: string;
    trading_name?: string | null;
    description?: string | null;
  },
  term: string
): boolean {
  return (
    matchesWholeWord(business.name, term) ||
    matchesWholeWord(business.trading_name ?? null, term) ||
    matchesWholeWord(business.description ?? null, term)
  );
}

export function businessMatchesAllSearchTerms(
  business: {
    name: string;
    trading_name?: string | null;
    description?: string | null;
  },
  terms: string[]
): boolean {
  if (terms.length === 0) return false;
  return terms.every((term) => businessMatchesSearchTerm(business, term));
}
