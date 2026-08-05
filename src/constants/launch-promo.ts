/** Launch promo: 50% off paid plans for the first 3 billing months. */

export const LAUNCH_PROMO_DISCOUNT_PERCENT = 50;
export const LAUNCH_PROMO_MONTHS = 3;

export const LAUNCH_PROMO_LABEL = "Launch special — 50% off for 3 months";

export function isLaunchPromoActive(): boolean {
  return process.env.LAUNCH_PROMO_ENABLED !== "false";
}

/** Half-price rounded to 2 decimal places (ZAR). */
export function getPromoPrice(fullPrice: number): number {
  if (fullPrice <= 0) return 0;
  const discounted =
    fullPrice * ((100 - LAUNCH_PROMO_DISCOUNT_PERCENT) / 100);
  return Math.round(discounted * 100) / 100;
}

export function getPromoEndsAt(from: Date = new Date()): Date {
  const end = new Date(from);
  end.setUTCMonth(end.getUTCMonth() + LAUNCH_PROMO_MONTHS);
  return end;
}

export function resolveSubscriptionCheckoutAmount(fullPrice: number): {
  chargeAmount: number;
  fullAmount: number;
  promoApplied: boolean;
} {
  if (!isLaunchPromoActive() || fullPrice <= 0) {
    return {
      chargeAmount: fullPrice,
      fullAmount: fullPrice,
      promoApplied: false,
    };
  }
  return {
    chargeAmount: getPromoPrice(fullPrice),
    fullAmount: fullPrice,
    promoApplied: true,
  };
}
