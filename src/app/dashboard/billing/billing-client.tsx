"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanByTier, MEMBERSHIP_PLANS, LEAD_CREDIT_PACKS } from "@/constants/membership";
import { formatCurrency } from "@/lib/utils";
import type { MembershipTier } from "@/types";

interface BillingClientProps {
  businessId: string;
  currentTier: string;
  selectedTier: MembershipTier;
  businessStatus: string;
}

export function BillingClient({
  businessId,
  currentTier,
  selectedTier,
  businessStatus,
}: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedPlan = getPlanByTier(selectedTier);
  const hasPendingSelectedPlan =
    businessStatus === "approved" &&
    selectedTier !== "free" &&
    currentTier !== selectedTier;

  async function initiatePayment(type: string, data: Record<string, unknown>) {
    setLoading(type);
    setError(null);

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

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {hasPendingSelectedPlan && (
        <div className="rounded-xl border border-sa-gold/50 bg-sa-gold/10 px-5 py-4">
          <p className="font-semibold text-sa-blue">
            Your business is approved — activate your {selectedPlan.name} plan to unlock paid
            benefits.
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Complete payment below when you are ready. Your selected plan is R
            {selectedPlan.price}/month.
          </p>
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Membership Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEMBERSHIP_PLANS.filter((p) => p.tier !== "free").map((plan) => {
            const isSelectedPendingPlan = hasPendingSelectedPlan && plan.tier === selectedTier;
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
                <p className="text-2xl font-bold">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal">/mo</span>
                </p>
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
                      amount: plan.price,
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
                      amount: pack.price,
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
