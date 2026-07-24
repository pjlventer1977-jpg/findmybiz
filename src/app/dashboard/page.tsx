import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadge } from "@/components/business/business-card";
import { formatCurrency } from "@/lib/utils";
import { getLeadCreditsAllocation } from "@/lib/lead-credits";
import { getPlanByTier } from "@/constants/membership";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No Business Listed</h2>
        <p className="text-muted-foreground mb-4">
          Register your business to get started.
        </p>
        <Button asChild>
          <Link href="/register">Register Business</Link>
        </Button>
      </div>
    );
  }

  const { count: newLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("status", "new");

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id);

  const plan = getPlanByTier(business.membership_tier);
  const credits = getLeadCreditsAllocation(business.lead_credits);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {business.name}</p>
      </div>

      {business.status === "pending" && (
        <div className="p-4 rounded-lg bg-sa-gold/20 border border-sa-gold">
          <p className="font-medium">Pending Verification</p>
          <p className="text-sm text-muted-foreground">
            Please make sure all minimum requirements have been completed under your{" "}
            <Link href="/dashboard/profile" className="font-medium text-primary underline">
              Business Profile
            </Link>{" "}
            tab for approval. Review usually takes 24–48 hours once your profile is complete.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/dashboard/leads" className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{newLeads ?? 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/leads/received" className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leads Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalLeads ?? 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lead Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {credits.balance}
            </p>
            <p className="text-xs text-muted-foreground">
              of {plan.leadsPerMonth}/month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{business.profile_views}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">BizTrust Score</CardTitle>
          </CardHeader>
          <CardContent>
            <TrustBadge score={business.biz_trust_score} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membership: {plan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold mb-2">
            {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
            {plan.price > 0 && <span className="text-sm font-normal">/month</span>}
          </p>
          <ul className="text-sm space-y-1 mb-4">
            {plan.features.slice(0, 4).map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
          {business.membership_tier !== "enterprise" && (
            <Button asChild>
              <Link href="/dashboard/billing">Upgrade Plan</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
