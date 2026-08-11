import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canUsePortfolio } from "@/lib/membership/plan-access";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { PortfolioDashboard } from "./portfolio-form";
import { Button } from "@/components/ui/button";
import type { MembershipTier } from "@/types";

export default async function DashboardPortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  if (!canUsePortfolio(business.membership_tier as MembershipTier)) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-xl font-semibold">Portfolio Gallery</h2>
        <p className="mb-4 text-muted-foreground">
          Upgrade to Professional or Enterprise to showcase your past work with a photo gallery on
          your public profile.
        </p>
        <Button asChild>
          <Link href="/pricing">View Plans</Link>
        </Button>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("business_portfolio")
    .select("id, image_url, caption, sort_order, created_at")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Gallery</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload photos of your past work. They appear on your public business profile.
        </p>
      </div>
      <PortfolioDashboard businessId={business.id} items={items ?? []} />
    </div>
  );
}
