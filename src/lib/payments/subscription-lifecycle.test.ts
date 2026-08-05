import { describe, expect, it } from "vitest";
import {
  extendPeriodEnd,
  isFailureItnStatus,
  resolveCompleteItnBranch,
} from "./subscription-lifecycle";

describe("resolveCompleteItnBranch", () => {
  it("routes pending payments to first_payment", () => {
    expect(
      resolveCompleteItnBranch({
        paymentStatus: "pending",
        hasMatchingActiveSubscription: false,
      })
    ).toEqual({ kind: "first_payment" });
  });

  it("routes completed payment with active token to renewal", () => {
    expect(
      resolveCompleteItnBranch({
        paymentStatus: "completed",
        hasMatchingActiveSubscription: true,
      })
    ).toEqual({ kind: "renewal" });
  });

  it("routes missing payment with active token to renewal", () => {
    expect(
      resolveCompleteItnBranch({
        paymentStatus: null,
        hasMatchingActiveSubscription: true,
      })
    ).toEqual({ kind: "renewal" });
  });

  it("ignores completed payment without subscription match", () => {
    expect(
      resolveCompleteItnBranch({
        paymentStatus: "completed",
        hasMatchingActiveSubscription: false,
      })
    ).toEqual({ kind: "ignore", reason: "already_processed" });
  });
});

describe("extendPeriodEnd", () => {
  it("extends from now when period already ended", () => {
    const from = new Date("2026-08-05T12:00:00.000Z");
    const { periodEnd } = extendPeriodEnd("2026-07-01T00:00:00.000Z", from, 30);
    expect(periodEnd).toBe("2026-09-04T12:00:00.000Z");
  });

  it("extends from current period end when still active", () => {
    const from = new Date("2026-08-05T12:00:00.000Z");
    const { periodEnd } = extendPeriodEnd("2026-08-20T00:00:00.000Z", from, 30);
    expect(periodEnd).toBe("2026-09-19T00:00:00.000Z");
  });
});

describe("isFailureItnStatus", () => {
  it("detects FAILED and CANCELLED", () => {
    expect(isFailureItnStatus("FAILED")).toBe(true);
    expect(isFailureItnStatus("cancelled")).toBe(true);
    expect(isFailureItnStatus("COMPLETE")).toBe(false);
  });
});
