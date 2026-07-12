import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [
    { count: pendingBusinesses },
    { count: pendingEvents },
    { count: pendingReviews },
    { count: totalBusinesses },
    { count: totalLeads },
  ] = await Promise.all([
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("leads").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Pending Businesses", value: pendingBusinesses, href: "/admin/businesses" },
          { label: "Approved Businesses", value: totalBusinesses, href: "/admin/businesses" },
          { label: "Pending Events", value: pendingEvents, href: "/admin/events" },
          { label: "Pending Reviews", value: pendingReviews, href: "/admin/reviews" },
          { label: "Total Leads", value: totalLeads, href: "/admin/reports" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value ?? 0}</p>
              <Link href={stat.href} className="text-xs text-primary hover:underline">
                Manage
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button asChild><Link href="/admin/businesses">Business Approvals</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/events">Event Moderation</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/reviews">Review Moderation</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/reports">Reports</Link></Button>
      </div>
    </div>
  );
}
