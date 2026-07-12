import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MEMBERSHIP_PLANS, LEAD_CREDIT_PACKS } from "@/constants/membership";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Pricing",
  description: "Find My Biz membership plans for South African businesses.",
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose the plan that fits your business. All plans include verified listing and lead delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
        {MEMBERSHIP_PLANS.map((plan) => (
          <Card
            key={plan.tier}
            className={plan.tier === "professional" ? "border-primary shadow-lg scale-105" : ""}
          >
            <CardHeader>
              {plan.tier === "professional" && (
                <span className="text-xs bg-primary text-white px-2 py-1 rounded w-fit mb-2">
                  Most Popular
                </span>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-bold">
                {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                {plan.price > 0 && <span className="text-sm font-normal">/mo</span>}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild variant={plan.tier === "professional" ? "default" : "outline"}>
                <Link href="/register">
                  {plan.price === 0 ? "Get Started" : "Choose Plan"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Lead Credit Top-Ups</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {LEAD_CREDIT_PACKS.map((pack) => (
            <div key={pack.credits} className="p-4 border rounded-lg">
              <p className="text-2xl font-bold">{pack.credits}</p>
              <p className="text-sm text-muted-foreground">credits</p>
              <p className="font-semibold">{formatCurrency(pack.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
