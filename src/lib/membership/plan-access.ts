import { getPlanByTier, TIER_PRIORITY, type MembershipTier } from "@/constants/membership";

export function tierAtLeast(tier: MembershipTier, minimum: MembershipTier): boolean {
  return TIER_PRIORITY[tier] >= TIER_PRIORITY[minimum];
}

export function getCategoriesLimit(tier: MembershipTier): number {
  return getPlanByTier(tier).categoriesLimit;
}

export function canUseWhatsAppLeadCards(tier: MembershipTier): boolean {
  return tierAtLeast(tier, "professional");
}

export function canCollectReviews(tier: MembershipTier): boolean {
  return tierAtLeast(tier, "starter");
}

export function canUsePortfolio(tier: MembershipTier): boolean {
  return tierAtLeast(tier, "professional");
}

export function canUseBizCard(tier: MembershipTier): boolean {
  return tierAtLeast(tier, "starter");
}

export function canUseDemandInsights(tier: MembershipTier): boolean {
  return tierAtLeast(tier, "professional");
}
