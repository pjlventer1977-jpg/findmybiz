import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getPromoEndsAt,
  getPromoPrice,
  resolveSubscriptionCheckoutAmount,
} from "@/constants/launch-promo";

describe("launch promo pricing", () => {
  const prev = process.env.LAUNCH_PROMO_ENABLED;

  beforeEach(() => {
    process.env.LAUNCH_PROMO_ENABLED = "true";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.LAUNCH_PROMO_ENABLED;
    else process.env.LAUNCH_PROMO_ENABLED = prev;
  });

  it("halves plan prices to two decimals", () => {
    expect(getPromoPrice(149)).toBe(74.5);
    expect(getPromoPrice(299)).toBe(149.5);
    expect(getPromoPrice(500)).toBe(250);
  });

  it("resolves checkout with promo when enabled", () => {
    expect(resolveSubscriptionCheckoutAmount(149)).toEqual({
      chargeAmount: 74.5,
      fullAmount: 149,
      promoApplied: true,
    });
  });

  it("skips promo when disabled", () => {
    process.env.LAUNCH_PROMO_ENABLED = "false";
    expect(resolveSubscriptionCheckoutAmount(149)).toEqual({
      chargeAmount: 149,
      fullAmount: 149,
      promoApplied: false,
    });
  });

  it("computes promo end three months out", () => {
    const from = new Date("2026-08-05T12:00:00.000Z");
    expect(getPromoEndsAt(from).toISOString()).toBe("2026-11-05T12:00:00.000Z");
  });
});
