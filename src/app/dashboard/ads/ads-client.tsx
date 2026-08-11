"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AD_PRODUCTS,
  type AdBillingPeriod,
  type AdProductType,
} from "@/constants/membership";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/types";

interface AdsDashboardProps {
  businessId: string;
  businessName: string;
  categories: Pick<Category, "id" | "name">[];
}

export function AdsDashboard({ businessId, businessName, categories }: AdsDashboardProps) {
  const [period, setPeriod] = useState<AdBillingPeriod>("week");
  const [loadingType, setLoadingType] = useState<AdProductType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handlePurchase(productType: AdProductType) {
    setLoadingType(productType);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("productType", productType);
      formData.append("period", period);
      formData.append("businessId", businessId);

      const product = AD_PRODUCTS.find((item) => item.type === productType)!;

      if (product.requiresCategory) {
        if (!categoryId) {
          throw new Error("Choose a category for your banner.");
        }
        formData.append("categoryId", categoryId);
      }

      if (product.requiresImage) {
        const file = fileRefs.current[productType]?.files?.[0];
        if (!file) {
          throw new Error("Choose a banner image before continuing to payment.");
        }
        formData.append("banner", file);
      }

      const response = await fetch("/api/ads/purchase", {
        method: "POST",
        body: formData,
      });
      const payment = await response.json();

      if (!response.ok) {
        throw new Error(payment.error ?? "Could not start payment.");
      }

      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = payment.action;

      Object.entries(payment.fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value);
        paymentForm.appendChild(input);
      });

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not start.");
      setLoadingType(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sa-gold/30 bg-sa-gold/5 p-4">
        <p className="text-sm text-slate-700">
          Purchase homepage featured placement or banner advertising for{" "}
          <strong>{businessName}</strong>. Payment is processed securely via PayFast.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Billing period</legend>
        <div className="flex flex-wrap gap-2">
          {(["week", "month"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                period === option
                  ? "bg-sa-blue text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-sa-blue/40"
              }`}
            >
              {option === "week" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        {AD_PRODUCTS.map((product) => {
          const price = period === "week" ? product.weekly : product.monthly;
          const isLoading = loadingType === product.type;

          return (
            <Card key={product.type} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg text-sa-blue">{product.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{period}
                  </span>
                </p>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                {product.requiresCategory && (
                  <div className="space-y-2">
                    <Label htmlFor={`category-${product.type}`}>Category</Label>
                    <select
                      id={`category-${product.type}`}
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {product.requiresImage && (
                  <div className="space-y-2">
                    <Label htmlFor={`banner-${product.type}`}>Banner image</Label>
                    <input
                      id={`banner-${product.type}`}
                      ref={(element) => {
                        fileRefs.current[product.type] = element;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sa-gold/20 file:px-3 file:py-1 file:text-sm file:font-medium"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended wide banner. JPG, PNG, or WebP. Max 5MB.
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-sa-gold text-slate-900 hover:bg-sa-gold/90"
                  disabled={Boolean(loadingType)}
                  onClick={() => handlePurchase(product.type)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to PayFast...
                    </>
                  ) : (
                    `Buy ${product.title}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
