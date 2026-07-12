import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Tag,
  Calendar,
  QrCode,
  Settings,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLeadCreditsBalance } from "@/lib/lead-credits";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
  { href: "/dashboard/specials", label: "Specials", icon: Tag },
  { href: "/dashboard/events", label: "Events", icon: Calendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/bizcard", label: "BizCard QR", icon: QrCode },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  const { data: business } = await supabase
    .from("businesses")
    .select("name, membership_tier, lead_credits(balance)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-2">
            {business && (
              <div className="p-4 rounded-lg border bg-card mb-4">
                <p className="font-semibold text-sm truncate">{business.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {business.membership_tier} plan
                </p>
                <p className="text-xs mt-1">
                  Credits: {getLeadCreditsBalance(business.lead_credits)}
                </p>
              </div>
            )}
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="lg:col-span-4">{children}</main>
      </div>
    </div>
  );
}
