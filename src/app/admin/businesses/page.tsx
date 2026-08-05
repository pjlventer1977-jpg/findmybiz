import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBusinessCard } from "./business-card";
import { AdminBusinessDirectoryTable } from "@/components/admin/admin-business-directory-table";
import {
  getAdminBusinessDirectory,
  getAdminBusinessStatusCounts,
  type AdminBusinessStatus,
} from "@/lib/queries/admin-businesses";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { value: AdminBusinessStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const statusFilter = STATUS_FILTERS.some((f) => f.value === params.status)
    ? (params.status as AdminBusinessStatus)
    : "all";
  const q = params.q?.trim() ?? "";

  const businessSelect = `
    *,
    province:provinces(name),
    city:cities(name),
    business_categories(category_id),
    business_documents(*),
    email_notifications(id, notification_type, recipient, status, error_message, created_at)
  `;

  const [{ data: pendingBusinesses }, directory, counts] = await Promise.all([
    statusFilter === "all" || statusFilter === "pending"
      ? supabase
          .from("businesses")
          .select(businessSelect)
          .eq("status", "pending")
          .order("created_at")
      : Promise.resolve({ data: [] as never[] }),
    getAdminBusinessDirectory({ status: statusFilter, q: q || undefined }),
    getAdminBusinessStatusCounts(),
  ]);

  function hrefFor(status: AdminBusinessStatus) {
    const sp = new URLSearchParams();
    if (status !== "all") sp.set("status", status);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/businesses?${qs}` : "/admin/businesses";
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Directory</h1>
          <p className="text-sm text-muted-foreground">
            All registered businesses with contact, plan, views, and leads.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Dashboard</Link>
          </Button>
        </div>
      </div>

      {(statusFilter === "all" || statusFilter === "pending") &&
        !q &&
        (pendingBusinesses?.length ?? 0) > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Pending approvals</h2>
              <p className="text-sm text-muted-foreground">
                Review readiness and documents before approving.
              </p>
            </div>
            <div className="space-y-4">
              {pendingBusinesses!.map((business) => (
                <AdminBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </section>
        )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-xl font-semibold">
            {statusFilter === "all"
              ? "All registered businesses"
              : `${statusFilter.charAt(0).toUpperCase()}${statusFilter.slice(1)} businesses`}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({directory.length})
            </span>
          </h2>
          <form className="flex w-full max-w-md gap-2" action="/admin/businesses" method="get">
            {statusFilter !== "all" && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, phone…"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={hrefFor(filter.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                statusFilter === filter.value
                  ? "border-sa-blue bg-sa-blue text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-sa-blue/40"
              )}
            >
              {filter.label}
              <span className="ml-1 opacity-80">
                ({counts[filter.value]})
              </span>
            </Link>
          ))}
        </div>

        <AdminBusinessDirectoryTable businesses={directory} />
      </section>
    </div>
  );
}
