export type MembershipTier = "free" | "starter" | "professional" | "enterprise";

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  price: number;
  badge?: string;
  leadsPerMonth: number;
  categoriesLimit: number;
  specialsPerMonth: number;
  features: string[];
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    leadsPerMonth: 1,
    categoriesLimit: 1,
    specialsPerMonth: 0,
    features: [
      "Verified listing",
      "Company logo & contact details",
      "Basic search visibility",
    ],
  },
  {
    tier: "starter",
    name: "Starter",
    price: 149,
    badge: "Starter Member",
    leadsPerMonth: 3,
    categoriesLimit: 5,
    specialsPerMonth: 2,
    features: [
      "Everything in Free",
      "Up to 5 categories",
      "Customer reviews",
      "2 specials per month",
      "Digital BizCard QR",
      "Improved search ranking",
    ],
  },
  {
    tier: "professional",
    name: "Professional",
    price: 299,
    badge: "Professional Member",
    leadsPerMonth: 10,
    categoriesLimit: 10,
    specialsPerMonth: 5,
    features: [
      "Everything in Starter",
      "Portfolio gallery",
      "WhatsApp lead cards",
      "Lead management dashboard",
      "Demand insights",
      "Priority lead routing",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 500,
    badge: "Enterprise Member",
    leadsPerMonth: 20,
    categoriesLimit: 999,
    specialsPerMonth: 999,
    features: [
      "Everything in Professional",
      "Local Champion badge",
      "Homepage featured placement",
      "Unlimited categories & specials",
      "Highest priority routing",
    ],
  },
];

export const LEAD_CREDIT_PACKS = [
  { credits: 5, price: 50 },
  { credits: 15, price: 120 },
  { credits: 50, price: 350 },
  { credits: 100, price: 600 },
];

export const TIER_PRIORITY: Record<MembershipTier, number> = {
  enterprise: 4,
  professional: 3,
  starter: 2,
  free: 1,
};

export const EVENT_PRICE_WEEKLY = 99;
export const FEATURED_AD_WEEKLY = 49;
export const FEATURED_AD_MONTHLY = 199;
export const BANNER_HOME_WEEKLY = 299;
export const BANNER_HOME_MONTHLY = 999;
export const BANNER_CATEGORY_WEEKLY = 199;
export const BANNER_CATEGORY_MONTHLY = 699;

export const LOCAL_CHAMPION_SLOTS = 3;

export function getPlanByTier(tier: MembershipTier): MembershipPlan {
  return MEMBERSHIP_PLANS.find((p) => p.tier === tier) ?? MEMBERSHIP_PLANS[0];
}
