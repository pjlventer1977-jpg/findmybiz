"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Province, Category, City } from "@/types";

interface QuoteRequestFormProps {
  provinces: Province[];
  categories: Category[];
}

export function QuoteRequestForm({ provinces, categories }: QuoteRequestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(false);

  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }
    const province = provinces.find((p) => p.slug === selectedProvince);
    if (!province) return;

    const supabase = createClient();
    supabase
      .from("cities")
      .select("*")
      .eq("province_id", province.id)
      .order("name")
      .then(({ data }) => setCities(data ?? []));
  }, [selectedProvince, provinces]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!popiaConsent) {
      setError("Please accept the POPIA consent to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const provinceSlug = formData.get("province") as string;
    const cityId = formData.get("city") as string;
    const categorySlug = formData.get("category") as string;

    const province = provinces.find((p) => p.slug === provinceSlug);
    const category = categories.find((c) => c.slug === categorySlug);

    if (!province || !category) {
      setError("Please select province and category.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.get("name"),
          customer_email: formData.get("email"),
          customer_phone: formData.get("phone"),
          province_id: province.id,
          city_id: cityId,
          category_id: category.id,
          service_description: formData.get("description"),
          budget: formData.get("budget") || null,
          popia_consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");

      router.push(`/get-quotes/success?leads=${data.leads_routed}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-sa-blue">Request a Quote</CardTitle>
        <p className="text-sm text-slate-600">
          Share a few details and we&apos;ll match you with local businesses.
        </p>
      </CardHeader>
      <CardContent className="pt-4 sm:pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required className="h-11 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="082 123 4567"
                className="h-11 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" name="email" type="email" required className="h-11 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Province *</Label>
              <Select
                name="province"
                required
                onValueChange={setSelectedProvince}
              >
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={p.slug}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City / Town *</Label>
              <Select name="city" required disabled={!selectedProvince}>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Service Category *</Label>
            <Select name="category" required>
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue placeholder="What service do you need?" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Describe what you need *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Please describe the service you need in detail..."
              className="rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget (optional)</Label>
            <Input
              id="budget"
              name="budget"
              placeholder="e.g. R5,000 - R10,000"
              className="h-11 rounded-lg"
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="popia"
              checked={popiaConsent}
              onCheckedChange={(v) => setPopiaConsent(v === true)}
            />
            <Label htmlFor="popia" className="text-sm leading-relaxed">
              I consent to Find My Biz sharing my contact details with matched businesses
              for the purpose of receiving quotes, in accordance with the{" "}
              <Link href="/popia" className="text-primary underline">POPIA policy</Link>.
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-sa-gold text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
            size="lg"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Request 5 Quotes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
