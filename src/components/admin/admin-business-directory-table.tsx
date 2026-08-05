import Link from "next/link";
import type { AdminDirectoryBusiness } from "@/lib/queries/admin-businesses";
import { formatCurrency } from "@/lib/utils";
import { getPlanByTier } from "@/constants/membership";
import type { MembershipTier } from "@/types";

function statusClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-sa-green/10 text-sa-green";
    case "pending":
      return "bg-sa-gold/15 text-amber-800";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    case "suspended":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function AdminBusinessDirectoryTable({
  businesses,
}: {
  businesses: AdminDirectoryBusiness[];
}) {
  if (!businesses.length) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No businesses match this filter.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-3 font-medium">Business</th>
            <th className="px-3 py-3 font-medium">Contact</th>
            <th className="px-3 py-3 font-medium">Location</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Plan</th>
            <th className="px-3 py-3 font-medium text-right">Views</th>
            <th className="px-3 py-3 font-medium text-right">Leads</th>
            <th className="px-3 py-3 font-medium">Registered</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((business) => {
            const plan = getPlanByTier(
              (business.membership_tier as MembershipTier) || "free"
            );
            const categories = business.business_categories
              .map((row) => row.category?.name)
              .filter(Boolean)
              .join(", ");

            return (
              <tr key={business.id} className="border-b last:border-0 align-top">
                <td className="px-3 py-3">
                  <p className="font-medium text-sa-blue">{business.name}</p>
                  {categories && (
                    <p className="text-xs text-muted-foreground">{categories}</p>
                  )}
                  {business.slug && (
                    <Link
                      href={`/business/${business.slug}`}
                      className="text-xs text-primary hover:underline"
                      target="_blank"
                    >
                      View listing
                    </Link>
                  )}
                </td>
                <td className="px-3 py-3">
                  <p>{business.contact_person || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {business.email || "No email"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {business.phone || "No phone"}
                  </p>
                </td>
                <td className="px-3 py-3">
                  {business.city?.name || "—"}, {business.province?.name || "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusClass(business.status)}`}
                  >
                    {business.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <p className="capitalize">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {business.membership_tier === "free"
                      ? "Free"
                      : `${formatCurrency(plan.price)}/mo`}
                  </p>
                  {business.intended_membership_tier &&
                    business.intended_membership_tier !== business.membership_tier && (
                      <p className="text-xs text-sa-gold">
                        Intended: {business.intended_membership_tier}
                      </p>
                    )}
                </td>
                <td className="px-3 py-3 text-right font-medium">
                  {business.profile_views ?? 0}
                </td>
                <td className="px-3 py-3 text-right font-medium">
                  {business.leadCount}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  <p>
                    {new Date(business.created_at).toLocaleDateString("en-ZA")}
                  </p>
                  {business.approved_at && (
                    <p>
                      Approved{" "}
                      {new Date(business.approved_at).toLocaleDateString("en-ZA")}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
