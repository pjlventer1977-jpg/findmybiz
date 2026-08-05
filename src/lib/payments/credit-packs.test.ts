import { describe, expect, it } from "vitest";
import { resolveLeadCreditPack } from "./credit-packs";

describe("resolveLeadCreditPack", () => {
  it("returns server price for known packs", () => {
    expect(resolveLeadCreditPack(5)).toEqual({ credits: 5, price: 50 });
    expect(resolveLeadCreditPack(15)).toEqual({ credits: 15, price: 120 });
    expect(resolveLeadCreditPack(50)).toEqual({ credits: 50, price: 350 });
    expect(resolveLeadCreditPack(100)).toEqual({ credits: 100, price: 600 });
  });

  it("rejects unknown or invalid credit counts", () => {
    expect(resolveLeadCreditPack(7)).toBeNull();
    expect(resolveLeadCreditPack(0)).toBeNull();
    expect(resolveLeadCreditPack(-5)).toBeNull();
    expect(resolveLeadCreditPack("nope")).toBeNull();
    expect(resolveLeadCreditPack(undefined)).toBeNull();
  });

  it("ignores client-supplied prices by only accepting credits", () => {
    const pack = resolveLeadCreditPack(5);
    expect(pack?.price).toBe(50);
    expect(pack?.price).not.toBe(1);
  });
});
