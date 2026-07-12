import type { BizTrustInput } from "@/types";

const WEIGHTS = {
  emailVerified: 10,
  hasLogo: 10,
  hasProofOfAddress: 15,
  hasIdDocument: 15,
  hasCipcDocument: 10,
  profileCompleteness: 15,
  averageRating: 10,
  reviewCount: 5,
  leadResponseRate: 10,
};

export function calculateBizTrustScore(input: BizTrustInput): number {
  let score = 0;

  if (input.emailVerified) score += WEIGHTS.emailVerified;
  if (input.hasLogo) score += WEIGHTS.hasLogo;
  if (input.hasProofOfAddress) score += WEIGHTS.hasProofOfAddress;
  if (input.hasIdDocument) score += WEIGHTS.hasIdDocument;
  if (input.hasCipcDocument) score += WEIGHTS.hasCipcDocument;

  score += (input.profileCompleteness / 100) * WEIGHTS.profileCompleteness;

  if (input.reviewCount > 0) {
    score += (input.averageRating / 5) * WEIGHTS.averageRating;
    score += Math.min(input.reviewCount / 10, 1) * WEIGHTS.reviewCount;
  }

  score += (input.leadResponseRate / 100) * WEIGHTS.leadResponseRate;

  if (input.daysSinceApproval >= 30) score += 5;
  if (input.daysSinceApproval >= 90) score += 5;

  return Math.min(Math.round(score), 100);
}

export function getTrustBadgeLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: "Excellent",
      color: "bg-green-600",
      description: "Highly trusted business with verified credentials",
    };
  }
  if (score >= 60) {
    return {
      label: "Trusted",
      color: "bg-primary",
      description: "Verified business with good track record",
    };
  }
  if (score >= 40) {
    return {
      label: "Verified",
      color: "bg-blue-600",
      description: "Basic verification completed",
    };
  }
  return {
    label: "New",
    color: "bg-gray-500",
    description: "Recently joined — building trust score",
  };
}

export function calculateProfileCompleteness(business: {
  name?: string;
  description?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  website?: string;
  whatsapp?: string;
  categories?: unknown[];
}): number {
  const fields = [
    business.name,
    business.description,
    business.contact_person,
    business.phone,
    business.email,
    business.address,
    business.logo_url,
    business.whatsapp,
    business.categories?.length,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
