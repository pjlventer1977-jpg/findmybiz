import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { canUseBizCard } from "@/lib/membership/plan-access";
import { getOwnerPrimaryBusiness } from "@/lib/queries/dashboard";
import { Button } from "@/components/ui/button";
import { BizCardGenerator } from "./bizcard-client";
import type { MembershipTier } from "@/types";

export default async function BizCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const business = await getOwnerPrimaryBusiness(user!.id);

  if (!business) return <p>Register a business first.</p>;

  if (!canUseBizCard(business.membership_tier as MembershipTier)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">BizCard QR</h2>
        <p className="text-muted-foreground mb-4">
          Upgrade to Starter or above to get your Digital BizCard with QR code.
        </p>
        <Button asChild>
          <Link href="/pricing">View Plans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Digital BizCard</h1>
      <BizCardGenerator slug={business.slug} businessName={business.name} />
    </div>
  );
}
