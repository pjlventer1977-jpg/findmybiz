import Link from "next/link";
import { Check, Inbox, Mail, TrendingUp } from "lucide-react";
import { SectionShell } from "@/components/home/section-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LEAD_CREDIT_PACKS,
  MEMBERSHIP_PLANS,
  type MembershipTier,
} from "@/constants/membership";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Pricing",
  description: "Find My Biz membership plans for South African businesses.",
};

const ALL_PLANS_INCLUDE = [
  "Verified listing",
  "Email lead delivery",
  "Dashboard lead inbox",
  "SA-wide coverage",
] as const;

function formatPlanLimit(value: number, unlimitedAt = 999): string {
  return value >= unlimitedAt ? "Unlimited" : String(value);
}

function priorityRoutingLabel(tier: MembershipTier): string {
  switch (tier) {
    case "enterprise":
      return "Highest";
    case "professional":
      return "Priority";
    case "starter":
      return "Improved";
    default:
      return "Standard";
  }
}

function leadsLabel(count: number): string {
  return count === 1 ? "1 lead per month" : `${count} leads per month`;
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <SectionShell>
        <section className="mx-auto mb-10 max-w-6xl overflow-hidden rounded-3xl border border-sa-blue/10 bg-gradient-to-br from-sa-blue/10 via-white to-sa-gold/10 px-6 py-8 text-center shadow-sm sm:px-8 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight text-sa-blue sm:text-4xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium leading-relaxed text-sa-green sm:text-lg">
            Each lead is a customer enquiry from Get 5 Quotes — delivered to your email and dashboard.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Choose the plan that fits your business. Scale up as your lead volume grows.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              { label: "Leads to your inbox", icon: Mail },
              { label: "Manage in your dashboard", icon: Inbox },
              { label: "Grow at your pace", icon: TrendingUp },
            ].map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-sa-green/20 bg-white/80 px-3 py-1.5 text-xs font-semibold text-sa-blue shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-sa-green" aria-hidden />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-sa-gold">
            Start free · Upgrade when you&apos;re ready
          </p>
        </section>

        <div className="mx-auto mb-10 max-w-5xl rounded-2xl border border-sa-green/20 bg-gradient-to-r from-sa-green/5 via-white to-sa-gold/5 px-4 py-4 shadow-sm sm:px-6">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-sa-blue">
          All plans include
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {ALL_PLANS_INCLUDE.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <Check className="h-4 w-4 shrink-0 text-sa-green" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        </div>

        <div className="mx-auto mb-16 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {MEMBERSHIP_PLANS.map((plan) => {
          const isPopular = plan.tier === "professional";

          return (
            <Card
              key={plan.tier}
              className={cn(
                "flex flex-col rounded-2xl border-slate-200 shadow-sm transition-shadow hover:shadow-md",
                isPopular && "border-sa-gold shadow-lg ring-1 ring-sa-gold/30 lg:scale-[1.02]"
              )}
            >
              <CardHeader className="pb-3">
                {isPopular && (
                  <span className="mb-2 w-fit rounded-full bg-sa-gold px-2.5 py-0.5 text-xs font-bold text-slate-900">
                    Most Popular
                  </span>
                )}
                <CardTitle className="text-sa-blue">{plan.name}</CardTitle>
                <p
                  className={cn(
                    "text-2xl font-bold leading-tight sm:text-3xl",
                    isPopular ? "text-sa-gold" : "text-sa-green"
                  )}
                >
                  {leadsLabel(plan.leadsPerMonth)}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                  {plan.price > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-slate-700">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-sa-green"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "w-full font-semibold",
                    isPopular && "bg-sa-gold text-slate-900 hover:bg-sa-gold/90"
                  )}
                  asChild
                  variant={isPopular ? "default" : "outline"}
                >
                  <Link href="/register">
                    {plan.price === 0 ? "Get Started" : "Choose Plan"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>

        <section className="mx-auto mb-16 max-w-5xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-sa-blue">
          Compare plans
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          See how lead volume and visibility grow across tiers.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Leads / month</th>
                <th className="px-4 py-3 font-semibold">Categories</th>
                <th className="px-4 py-3 font-semibold">Specials / month</th>
                <th className="px-4 py-3 font-semibold">Lead routing</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERSHIP_PLANS.map((plan) => (
                <tr
                  key={plan.tier}
                  className={cn(
                    "border-b last:border-0",
                    plan.tier === "professional" && "bg-sa-gold/5"
                  )}
                >
                  <td className="px-4 py-3 font-semibold text-sa-blue">
                    {plan.name}
                  </td>
                  <td className="px-4 py-3 font-semibold text-sa-green">
                    {plan.leadsPerMonth}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatPlanLimit(plan.categoriesLimit)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatPlanLimit(plan.specialsPerMonth)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {priorityRoutingLabel(plan.tier)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </section>

        <section className="mx-auto max-w-3xl border-t border-slate-200 pt-12 text-center">
        <h2 className="mb-3 text-2xl font-bold text-sa-blue">Lead Credit Top-Ups</h2>
        <p className="mx-auto mb-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Need more enquiries after your monthly allowance? Buy lead credits anytime.
          <strong className="font-semibold text-slate-800"> 1 credit = 1 extra lead</strong>{" "}
          — each credit unlocks one additional Get 5 Quotes enquiry routed to your
          inbox when your plan&apos;s monthly leads are used up.
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          Credits never replace your plan allowance — they extend it when you&apos;re
          busy.
        </p>
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
          {LEAD_CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className="rounded-2xl border border-sa-gold/30 bg-gradient-to-b from-sa-gold/10 to-white p-4 shadow-sm"
            >
              <p className="text-2xl font-bold text-sa-blue">{pack.credits}</p>
              <p className="text-sm text-muted-foreground">lead credits</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatCurrency(pack.price)}
              </p>
            </div>
          ))}
        </div>
        </section>

        <section className="mx-auto mt-12 max-w-5xl rounded-2xl bg-gradient-to-r from-sa-green to-sa-blue px-6 py-8 text-center text-white shadow-lg sm:px-8">
          <h2 className="text-2xl font-bold">Ready to receive leads in your inbox?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/85">
            List your business for free and be ready when customers request quotes.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="h-11 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
              asChild
            >
              <Link href="/register">Register Your Business Free</Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-lg border-white/50 bg-transparent text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/get-quotes">See how Get 5 Quotes works</Link>
            </Button>
          </div>
        </section>
      </SectionShell>
    </main>
  );
}
