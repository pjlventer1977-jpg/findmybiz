"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanByTier, MEMBERSHIP_PLANS, LEAD_CREDIT_PACKS } from "@/constants/membership";
import {
  getPromoPrice,
  LAUNCH_PROMO_LABEL,
  LAUNCH_PROMO_MONTHS,
} from "@/constants/launch-promo";
import { formatCurrency } from "@/lib/utils";
import type { MembershipTier } from "@/types";

interface BillingClientProps {
  businessId: string;
  currentTier: string;
  selectedTier: MembershipTier;
  businessStatus: string;
  hasActiveSubscription: boolean;
  launchPromoEnabled?: boolean;
  promoActive?: boolean;
  promoEndsAt?: string | null;
  promoFullAmount?: number | null;
  promoConvertedAt?: string | null;
  paymentReturn?: "success" | "cancelled" | null;
}

export function BillingClient({
  businessId,
  currentTier,
  selectedTier,
  businessStatus,
  hasActiveSubscription,
  launchPromoEnabled = false,
  promoActive = false,
  promoEndsAt = null,
  promoFullAmount = null,
  promoConvertedAt = null,
  paymentReturn = null,
}: BillingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(
    paymentReturn === "success" && !hasActiveSubscription
  );
  const selectedPlan = getPlanByTier(selectedTier);
  const launchPromo = launchPromoEnabled;
  /** Site launch promo UI for people who can still start a discounted plan. */
  const showPlanPromo =
    launchPromo && (!hasActiveSubscription || promoActive);
  const promoEndedOnSubscription =
    hasActiveSubscription && !promoActive && (Boolean(promoConvertedAt) || promoFullAmount != null);
  const hasPendingSelectedPlan =
    businessStatus === "approved" &&
    selectedTier !== "free" &&
    currentTier !== selectedTier;

  useEffect(() => {
    if (paymentReturn === "cancelled") {
      setError("Payment was cancelled. Your plan was not changed.");
      return;
    }
    if (paymentReturn !== "success") return;

    if (hasActiveSubscription) {
      setConfirmingPayment(false);
      setSuccess("Payment received. Your paid plan is now active.");
      return;
    }

    setConfirmingPayment(true);
    setSuccess("Payment received — confirming with PayFast and activating your plan…");

    let attempts = 0;
    const maxAttempts = 8;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        setConfirmingPayment(false);
        setSuccess(
          "Payment was submitted. If your plan is still Free after a minute, refresh this page or contact support — activation runs when PayFast notifies us."
        );
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [paymentReturn, hasActiveSubscription, router]);

  useEffect(() => {
    if (paymentReturn === "success" && hasActiveSubscription) {
      setConfirmingPayment(false);
      setSuccess("Payment received. Your paid plan is now active.");
    }
  }, [paymentReturn, hasActiveSubscription]);

  async function initiatePayment(type: string, data: Record<string, unknown>) {
    setLoading(type);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, business_id: businessId, ...data }),
      });

      const formData = await res.json();

      if (!res.ok) {
        setError(formData.error ?? "Could not start payment. Please try again.");
        setLoading(null);
        return;
      }

      if (!formData.action || !formData.fields) {
        setError("Invalid payment response from server.");
        setLoading(null);
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = formData.action;
      Object.entries(formData.fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Could not connect to payment service. Please try again.");
      setLoading(null);
    }
  }

  async function cancelSubscription() {
    const confirmed = window.confirm(
      "Cancel your paid plan? You will be moved to the Free plan immediately and recurring billing will stop."
    );
    if (!confirmed) return;

    setLoading("cancel");
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/payments/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not cancel subscription.");
        setLoading(null);
        return;
      }
      setSuccess("Subscription cancelled. You are now on the Free plan.");
      setLoading(null);
      router.refresh();
    } catch {
      setError("Could not cancel subscription. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {(success || confirmingPayment) && (
        <div className="rounded-lg border border-sa-green/40 bg-sa-green/10 px-4 py-3 text-sm text-sa-green">
          {success}
          {confirmingPayment && (
            <span className="mt-1 block text-slate-600">
              This usually takes a few seconds. Stay on this page while we finish activating your plan.
            </span>
          )}
        </div>
      )}

      {launchPromo && !hasActiveSubscription && (
        <div className="rounded-xl border border-sa-gold/50 bg-sa-gold/10 px-5 py-4">
          <p className="font-semibold text-sa-blue">{LAUNCH_PROMO_LABEL}</p>
          <p className="mt-1 text-sm text-slate-700">
            New paid plans are billed at 50% for the first {LAUNCH_PROMO_MONTHS}{" "}
            months, then automatically switch to the full monthly price via PayFast.
          </p>
        </div>
      )}

      {hasPendingSelectedPlan && (
        <div className="rounded-xl border border-sa-gold/50 bg-sa-gold/10 px-5 py-4">
          <p className="font-semibold text-sa-blue">
            Your business is approved — activate your {selectedPlan.name} plan to unlock paid
            benefits.
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {launchPromo ? (
              <>
                Launch special:{" "}
                <strong>{formatCurrency(getPromoPrice(selectedPlan.price))}/mo</strong> for{" "}
                {LAUNCH_PROMO_MONTHS} months, then {formatCurrency(selectedPlan.price)}/mo.
              </>
            ) : (
              <>
                Complete payment below when you are ready. Your selected plan is R
                {selectedPlan.price}/month.
              </>
            )}
          </p>
        </div>
      )}

      {hasActiveSubscription && currentTier !== "free" && (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-sa-blue">Current subscription</h2>
              <p className="text-sm text-slate-600">
                You are on the {getPlanByTier(currentTier as MembershipTier).name} plan.
                Cancel anytime to stop recurring PayFast billing.
              </p>
              {promoActive && promoEndsAt && promoFullAmount != null && (
                <p className="mt-2 text-sm text-sa-green">
                  Launch special active until{" "}
                  {new Date(promoEndsAt).toLocaleDateString("en-ZA")}. Then{" "}
                  {formatCurrency(Number(promoFullAmount))}/mo.
                </p>
              )}
              {promoEndedOnSubscription && (
                <p className="mt-2 text-sm text-slate-700">
                  Launch special ended
                  {promoConvertedAt
                    ? ` on ${new Date(promoConvertedAt).toLocaleDateString("en-ZA")}`
                    : ""}
                  . You are now billed at{" "}
                  <strong>
                    {formatCurrency(
                      Number(
                        promoFullAmount ??
                          getPlanByTier(currentTier as MembershipTier).price
                      )
                    )}
                    /mo
                  </strong>
                  .
                </p>
              )}
            </div>
            <Button
              variant="outline"
              disabled={loading === "cancel"}
              onClick={cancelSubscription}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              {loading === "cancel" ? "Cancelling..." : "Cancel plan"}
            </Button>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Membership Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEMBERSHIP_PLANS.filter((p) => p.tier !== "free").map((plan) => {
            const isSelectedPendingPlan = hasPendingSelectedPlan && plan.tier === selectedTier;
            const promoPrice = getPromoPrice(plan.price);
            return (
            <Card
              key={plan.tier}
              className={
                currentTier === plan.tier
                  ? "border-primary"
                  : isSelectedPendingPlan
                    ? "border-sa-gold ring-1 ring-sa-gold/40"
                    : ""
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                {showPlanPromo ? (
                  <div>
                    <p className="text-2xl font-bold text-sa-green">
                      {formatCurrency(promoPrice)}
                      <span className="text-sm font-normal">/mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(plan.price)}/mo
                    </p>
                    <p className="text-xs text-sa-gold mt-1">
                      50% off for {LAUNCH_PROMO_MONTHS} months
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">
                    {formatCurrency(plan.price)}
                    <span className="text-sm font-normal">/mo</span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 mb-4">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  disabled={
                    currentTier === plan.tier ||
                    loading === plan.tier ||
                    businessStatus !== "approved"
                  }
                  onClick={() =>
                    initiatePayment("subscription", {
                      tier: plan.tier,
                    })
                  }
                >
                  {loading === plan.tier
                    ? "Redirecting..."
                    : currentTier === plan.tier
                      ? "Current Plan"
                    : isSelectedPendingPlan
                      ? "Activate selected plan"
                      : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Lead Credit Packs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LEAD_CREDIT_PACKS.map((pack) => (
            <Card key={pack.credits}>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{pack.credits}</p>
                <p className="text-sm text-muted-foreground">credits</p>
                <p className="font-semibold mt-2">{formatCurrency(pack.price)}</p>
                <Button
                  className="w-full mt-3"
                  size="sm"
                  variant="outline"
                  disabled={loading === `credits-${pack.credits}`}
                  onClick={() =>
                    initiatePayment("lead_credits", {
                      credits: pack.credits,
                    })
                  }
                >
                  {loading === `credits-${pack.credits}` ? "Redirecting..." : "Buy"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
