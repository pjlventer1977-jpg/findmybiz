"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getPlanByTier } from "@/constants/membership";
import type { MembershipTier } from "@/types";

interface SpecialsDashboardProps {
  businessId: string;
  tier: MembershipTier;
  existingCount: number;
}

export function SpecialsDashboard({ businessId, tier, existingCount }: SpecialsDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const plan = getPlanByTier(tier);
  const canPost = existingCount < plan.specialsPerMonth;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canPost) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    await supabase.from("specials").insert({
      business_id: businessId,
      title: formData.get("title"),
      description: formData.get("description"),
      start_date: formData.get("start_date"),
      expiry_date: formData.get("expiry_date"),
      status: "approved",
    });

    router.refresh();
    setLoading(false);
  }

  if (plan.specialsPerMonth === 0) {
    return (
      <p className="text-muted-foreground">
        Upgrade to Starter or above to post specials.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post a Special</CardTitle>
        <p className="text-sm text-muted-foreground">
          {existingCount} of {plan.specialsPerMonth} specials used this month
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required disabled={!canPost} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" disabled={!canPost} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input id="start_date" name="start_date" type="date" required disabled={!canPost} />
            </div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input id="expiry_date" name="expiry_date" type="date" required disabled={!canPost} />
            </div>
          </div>
          <Button type="submit" disabled={!canPost || loading}>
            {loading ? "Posting..." : "Post Special"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
