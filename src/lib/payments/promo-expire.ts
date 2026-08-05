import { createServiceClient } from "@/lib/supabase/server";
import { updatePayFastSubscriptionAmount } from "@/lib/payfast";
import { sendPromoEndedOwnerEmail } from "@/lib/email/business-notifications";
import type { MembershipTier } from "@/types";

export type PromoExpireResult = {
  business_id: string;
  ok: boolean;
  error?: string;
};

export type PromoExpireSummary = {
  processed: number;
  converted: number;
  failed: number;
  results: PromoExpireResult[];
};

/**
 * Converts expired launch-promo subscriptions to full PayFast recurring price.
 */
export async function runPromoExpireJob(): Promise<PromoExpireSummary> {
  const supabase = await createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: due, error } = await supabase
    .from("subscriptions")
    .select(
      "business_id, tier, payfast_token, promo_full_amount, promo_ends_at, status"
    )
    .eq("status", "active")
    .eq("promo_active", true)
    .not("payfast_token", "is", null)
    .not("promo_full_amount", "is", null)
    .lte("promo_ends_at", nowIso)
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  const results: PromoExpireResult[] = [];

  for (const sub of due ?? []) {
    const fullAmount = Number(sub.promo_full_amount);
    const token = sub.payfast_token as string;

    const update = await updatePayFastSubscriptionAmount(token, fullAmount);
    if (!update.success) {
      results.push({
        business_id: sub.business_id,
        ok: false,
        error: update.error,
      });
      continue;
    }

    await supabase
      .from("subscriptions")
      .update({
        promo_active: false,
        promo_converted_at: nowIso,
      })
      .eq("business_id", sub.business_id);

    const { data: business } = await supabase
      .from("businesses")
      .select("name, email, contact_person")
      .eq("id", sub.business_id)
      .single();

    if (business?.email) {
      await sendPromoEndedOwnerEmail({
        businessName: business.name,
        businessEmail: business.email,
        contactPerson: business.contact_person,
        tier: sub.tier as MembershipTier,
        fullAmount,
      });
    }

    results.push({ business_id: sub.business_id, ok: true });
  }

  return {
    processed: results.length,
    converted: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
