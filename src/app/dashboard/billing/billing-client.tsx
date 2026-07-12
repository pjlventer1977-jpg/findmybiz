"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MEMBERSHIP_PLANS, LEAD_CREDIT_PACKS } from "@/constants/membership";
import { formatCurrency } from "@/lib/utils";

interface BillingClientProps {
  businessId: string;
  currentTier: string;
}

export function BillingClient({ businessId, currentTier }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function initiatePayment(type: string, data: Record<string, unknown>) {
    setLoading(type);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, business_id: businessId, ...data }),
      });
      const formData = await res.json();

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
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Membership Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEMBERSHIP_PLANS.filter((p) => p.tier !== "free").map((plan) => (
            <Card key={plan.tier} className={currentTier === plan.tier ? "border-primary" : ""}>
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
                  disabled={currentTier === plan.tier || loading === plan.tier}
                  onClick={() =>
                    initiatePayment("subscription", {
                      tier: plan.tier,
                      amount: plan.price,
                    })
                  }
                >
                  {currentTier === plan.tier ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
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
                  Buy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
