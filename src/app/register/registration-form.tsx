"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CategoryMultiSelect } from "@/components/categories/category-multi-select";
import {
  ServiceAreasSelect,
  type ServiceAreaSelection,
} from "@/components/business/service-areas-select";
import {
  getPromoPrice,
  LAUNCH_PROMO_LABEL,
  LAUNCH_PROMO_MONTHS,
} from "@/constants/launch-promo";
import { MEMBERSHIP_PLANS } from "@/constants/membership";
import { formatCurrency } from "@/lib/utils";
import { registerBusinessAccount } from "./actions";
import type { Category, Province } from "@/types";

type BusinessRegistrationFormProps = {
  launchPromoEnabled?: boolean;
  provinces: Province[];
  categories: Category[];
};

export function BusinessRegistrationForm({
  launchPromoEnabled = false,
  provinces,
  categories,
}: BusinessRegistrationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState("free");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaSelection[]>([]);
  const [primaryCityId, setPrimaryCityId] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (categoryIds.length === 0) {
      setError("Please select at least one service subcategory.");
      setLoading(false);
      return;
    }

    if (serviceAreas.length === 0 || !primaryCityId) {
      setError("Please add at least one service area and mark a primary city.");
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const result = await registerBusinessAccount({
      businessName: String(formData.get("businessName") ?? ""),
      contactPerson: String(formData.get("contactPerson") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      selectedTier: selectedTier as "free" | "starter" | "professional" | "enterprise",
      categoryIds,
      serviceCityIds: serviceAreas.map((a) => a.cityId),
      primaryCityId,
    });

    if (!result.ok) {
      setError(result.error ?? "Could not create your account. Please try again.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (signInError) {
      setError(
        "Your account was created, but you need to confirm your email before signing in."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard/profile?registered=true");
  }

  return (
    <Card className="mx-auto max-w-2xl rounded-2xl border-slate-200 bg-white shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl text-sa-blue">Create your business account</CardTitle>
        <p className="text-sm leading-relaxed text-slate-600">
          Tell us what you do and where you work. You can refine your listing from your profile
          after signing up.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input id="businessName" name="businessName" required className="h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input id="contactPerson" name="contactPerson" required className="h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Contact Number *</Label>
            <Input id="phone" name="phone" type="tel" required className="h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Create Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              className="h-11 rounded-lg"
            />
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5 text-sa-green" aria-hidden />
              Use at least 6 characters.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <CategoryMultiSelect
              categories={categories}
              value={categoryIds}
              onChange={setCategoryIds}
              required
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <ServiceAreasSelect
              provinces={provinces}
              value={serviceAreas}
              onChange={setServiceAreas}
              primaryCityId={primaryCityId}
              onPrimaryChange={setPrimaryCityId}
              required
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Choose your plan</legend>
            <p className="text-xs text-slate-500">
              Payment is only required after your business is approved.
            </p>
            {launchPromoEnabled && (
              <p className="rounded-lg border border-sa-gold/40 bg-sa-gold/10 px-3 py-2 text-xs font-medium text-sa-blue">
                {LAUNCH_PROMO_LABEL}. Then full price from month {LAUNCH_PROMO_MONTHS + 1}.
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {MEMBERSHIP_PLANS.map((plan) => {
                const showPromo = launchPromoEnabled && plan.price > 0;
                const promoPrice = getPromoPrice(plan.price);

                return (
                  <label
                    key={plan.tier}
                    className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                      selectedTier === plan.tier
                        ? "border-sa-gold bg-sa-gold/10 ring-1 ring-sa-gold/40"
                        : "border-slate-200 hover:border-sa-gold/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedTier"
                      value={plan.tier}
                      checked={selectedTier === plan.tier}
                      onChange={() => setSelectedTier(plan.tier)}
                      className="sr-only"
                    />
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sa-blue">{plan.name}</span>
                      {showPromo ? (
                        <span className="text-right">
                          <span className="block text-sm font-bold text-sa-green">
                            {formatCurrency(promoPrice)}/mo
                          </span>
                          <span className="block text-xs text-slate-500 line-through">
                            {formatCurrency(plan.price)}/mo
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-900">
                          {plan.price === 0 ? "Free" : `${formatCurrency(plan.price)}/mo`}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      {plan.leadsPerMonth} lead{plan.leadsPerMonth === 1 ? "" : "s"} per month
                      {showPromo && (
                        <span className="text-sa-gold">
                          {" "}
                          · 50% off for {LAUNCH_PROMO_MONTHS} months
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-sa-gold text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
            disabled={loading}
          >
            {loading ? "Creating your account..." : "Create Account & Register Business"}
          </Button>
        </form>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-sa-green" aria-hidden />
          Your business will be submitted for review after registration.
        </p>
      </CardContent>
    </Card>
  );
}
