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
    specialsPerMonth: 1,
    features: [
      "Verified listing",
      "Company logo & contact details",
      "Basic search visibility",
      "1 special per month",
      "Email lead delivery",
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
export const EVENT_DURATION_OPTIONS = [
  { weeks: 1, label: "1 week", price: EVENT_PRICE_WEEKLY },
  { weeks: 2, label: "2 weeks", price: EVENT_PRICE_WEEKLY * 2 },
  { weeks: 4, label: "4 weeks", price: EVENT_PRICE_WEEKLY * 4 },
] as const;
export const FEATURED_AD_WEEKLY = 49;
export const FEATURED_AD_MONTHLY = 199;
export const BANNER_HOME_WEEKLY = 299;
export const BANNER_HOME_MONTHLY = 999;
export const BANNER_CATEGORY_WEEKLY = 199;
export const BANNER_CATEGORY_MONTHLY = 699;

export type AdProductType = "featured_ad" | "banner_home" | "banner_category";
export type AdBillingPeriod = "week" | "month";

/** Banners render at 3:1 (see AdBannerStrip). */
export const AD_BANNER_ASPECT_RATIO = "3:1";
export const AD_BANNER_RECOMMENDED_WIDTH = 1200;
export const AD_BANNER_RECOMMENDED_HEIGHT = 400;
export const AD_BANNER_IMAGE_HINT = `${AD_BANNER_RECOMMENDED_WIDTH}×${AD_BANNER_RECOMMENDED_HEIGHT}px (${AD_BANNER_ASPECT_RATIO} wide banner). JPG, PNG, or WebP. Max 5MB.`;

export interface AdProductConfig {
  type: AdProductType;
  title: string;
  description: string;
  weekly: number;
  monthly: number;
  requiresImage: boolean;
  requiresCategory: boolean;
  uploadHint?: string;
}

export const AD_PRODUCTS: AdProductConfig[] = [
  {
    type: "featured_ad",
    title: "Featured listing",
    description: "Homepage featured placement with premium visibility.",
    weekly: FEATURED_AD_WEEKLY,
    monthly: FEATURED_AD_MONTHLY,
    requiresImage: false,
    requiresCategory: false,
    uploadHint: "Uses your existing business logo and listing — no image upload.",
  },
  {
    type: "banner_home",
    title: "Home banner",
    description: "Banner on the FindMyBiz homepage.",
    weekly: BANNER_HOME_WEEKLY,
    monthly: BANNER_HOME_MONTHLY,
    requiresImage: true,
    requiresCategory: false,
    uploadHint: AD_BANNER_IMAGE_HINT,
  },
  {
    type: "banner_category",
    title: "Category banner",
    description: "Banner on search results for your chosen category.",
    weekly: BANNER_CATEGORY_WEEKLY,
    monthly: BANNER_CATEGORY_MONTHLY,
    requiresImage: true,
    requiresCategory: true,
    uploadHint: AD_BANNER_IMAGE_HINT,
  },
];

export function getAdProduct(type: AdProductType): AdProductConfig {
  const product = AD_PRODUCTS.find((item) => item.type === type);
  if (!product) throw new Error("Unknown ad product");
  return product;
}

export function getAdPrice(type: AdProductType, period: AdBillingPeriod): number {
  const product = getAdProduct(type);
  return period === "week" ? product.weekly : product.monthly;
}

export function getAdDurationDays(period: AdBillingPeriod): number {
  return period === "week" ? 7 : 30;
}

export const LOCAL_CHAMPION_SLOTS = 3;

export function getPlanByTier(tier: MembershipTier): MembershipPlan {
  return MEMBERSHIP_PLANS.find((p) => p.tier === tier) ?? MEMBERSHIP_PLANS[0];
}
