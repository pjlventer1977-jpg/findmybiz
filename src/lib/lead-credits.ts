export function getLeadCreditsBalance(
  leadCredits: { balance: number }[] | { balance: number } | null | undefined
): number {
  if (!leadCredits) return 0;
  if (Array.isArray(leadCredits)) return leadCredits[0]?.balance ?? 0;
  return leadCredits.balance ?? 0;
}

export function getLeadCreditsAllocation(
  leadCredits:
    | { balance: number; monthly_allocation: number }[]
    | { balance: number; monthly_allocation: number }
    | null
    | undefined
): { balance: number; monthly_allocation: number } {
  if (!leadCredits) return { balance: 0, monthly_allocation: 0 };
  if (Array.isArray(leadCredits)) {
    return leadCredits[0] ?? { balance: 0, monthly_allocation: 0 };
  }
  return leadCredits;
}
