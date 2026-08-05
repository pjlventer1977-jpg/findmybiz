const DAY_MS = 24 * 60 * 60 * 1000;
export const SUBSCRIPTION_PERIOD_DAYS = 30;

export type ItnCompleteBranch =
  | { kind: "first_payment" }
  | { kind: "renewal" }
  | { kind: "ignore"; reason: string };

/**
 * Decide how to handle a COMPLETE ITN after signature/validate succeed.
 * - pending payment → first-time fulfillment
 * - completed payment (or missing pending) + active token match → renewal
 */
export function resolveCompleteItnBranch(params: {
  paymentStatus: string | null | undefined;
  hasMatchingActiveSubscription: boolean;
}): ItnCompleteBranch {
  if (params.paymentStatus === "pending") {
    return { kind: "first_payment" };
  }

  if (
    (params.paymentStatus === "completed" ||
      params.paymentStatus === null ||
      params.paymentStatus === undefined) &&
    params.hasMatchingActiveSubscription
  ) {
    return { kind: "renewal" };
  }

  if (params.paymentStatus === "completed") {
    return { kind: "ignore", reason: "already_processed" };
  }

  return { kind: "ignore", reason: "no_payment_or_subscription" };
}

export function extendPeriodEnd(
  currentPeriodEnd: string | null | undefined,
  fromDate: Date = new Date(),
  periodDays = SUBSCRIPTION_PERIOD_DAYS
): { periodStart: string; periodEnd: string } {
  const base =
    currentPeriodEnd && new Date(currentPeriodEnd).getTime() > fromDate.getTime()
      ? new Date(currentPeriodEnd)
      : fromDate;

  const periodStart = fromDate.toISOString();
  const periodEnd = new Date(base.getTime() + periodDays * DAY_MS).toISOString();
  return { periodStart, periodEnd };
}

export function isFailureItnStatus(status: string | undefined): boolean {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return normalized === "FAILED" || normalized === "CANCELLED";
}
