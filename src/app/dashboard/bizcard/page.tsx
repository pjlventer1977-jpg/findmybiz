import { createClient } from "@/lib/supabase/server";
import { BizCardGenerator } from "./bizcard-client";

export default async function BizCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("slug, name, membership_tier")
    .eq("owner_id", user!.id)
    .single();

  if (!business) return <p>Register a business first.</p>;

  if (business.membership_tier === "free") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">BizCard QR</h2>
        <p className="text-muted-foreground mb-4">
          Upgrade to Starter or above to get your Digital BizCard with QR code.
        </p>
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
