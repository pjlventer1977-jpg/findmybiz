import type { MembershipTier } from "@/types";
import { TIER_PRIORITY, LOCAL_CHAMPION_SLOTS } from "@/constants/membership";

export interface LeadRoutingCandidate {
  id: string;
  membership_tier: MembershipTier;
  city_id: string;
  province_id: string;
  category_ids: string[];
  lead_credits_balance: number;
  is_local_champion: boolean;
  lead_response_rate: number;
  biz_trust_score: number;
}

export interface QuoteRequestInput {
  province_id: string;
  city_id: string;
  category_id: string;
}

export function routeLeadsToBusinesses(
  candidates: LeadRoutingCandidate[],
  request: QuoteRequestInput,
  maxLeads: number = 5
): LeadRoutingCandidate[] {
  const eligible = candidates.filter((c) => {
    if (c.lead_credits_balance <= 0) return false;
    if (!c.category_ids.includes(request.category_id)) return false;
    if (c.province_id !== request.province_id) return false;
    return true;
  });

  const sorted = eligible.sort((a, b) => {
    const tierDiff =
      TIER_PRIORITY[b.membership_tier] - TIER_PRIORITY[a.membership_tier];
    if (tierDiff !== 0) return tierDiff;

    const cityMatchA = a.city_id === request.city_id ? 1 : 0;
    const cityMatchB = b.city_id === request.city_id ? 1 : 0;
    if (cityMatchB !== cityMatchA) return cityMatchB - cityMatchA;

    if (b.is_local_champion !== a.is_local_champion) {
      return b.is_local_champion ? 1 : -1;
    }

    if (b.lead_response_rate !== a.lead_response_rate) {
      return b.lead_response_rate - a.lead_response_rate;
    }

    return b.biz_trust_score - a.biz_trust_score;
  });

  return sorted.slice(0, maxLeads);
}

export function buildWhatsAppLeadMessage(lead: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_description: string;
  budget?: string;
  city_name?: string;
  province_name?: string;
}): string {
  const lines = [
    "🔔 *New Lead from Find My Biz*",
    "",
    `*Customer:* ${lead.customer_name}`,
    `*Phone:* ${lead.customer_phone}`,
  ];

  if (lead.customer_email) {
    lines.push(`*Email:* ${lead.customer_email}`);
  }

  lines.push(
    `*Location:* ${lead.city_name ?? ""}, ${lead.province_name ?? ""}`,
    `*Service:* ${lead.service_description}`
  );

  if (lead.budget) {
    lines.push(`*Budget:* ${lead.budget}`);
  }

  lines.push("", "Reply promptly to improve your BizTrust Score!");

  return lines.join("\n");
}

export function canBeLocalChampion(
  currentChampionsInArea: number
): boolean {
  return currentChampionsInArea < LOCAL_CHAMPION_SLOTS;
}
