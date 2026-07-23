import Link from "next/link";
import { CheckCircle2, Circle, FileText, Info } from "lucide-react";
import { AdminBusinessActions } from "./admin-actions";
import { DOCUMENT_TYPE_LABELS } from "@/lib/storage/business-documents";
import {
  APPROVAL_FIELD_LABELS,
  canApprove,
  canVerifiedApprove,
  getProfileCompleteness,
  getMissingVerificationDocuments,
} from "@/lib/business/profile-readiness";
import type { BusinessDocument } from "@/types";

interface AdminBusinessCardProps {
  business: {
    id: string;
    name: string;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    logo_url?: string | null;
    province_id?: string | null;
    city_id?: string | null;
    province?: { name: string } | null;
    city?: { name: string } | null;
    business_categories?: { category_id: string }[];
    business_documents?: BusinessDocument[];
  };
}

export function AdminBusinessCard({ business }: AdminBusinessCardProps) {
  const documents = business.business_documents ?? [];
  const primaryCategoryId = business.business_categories?.[0]?.category_id;
  const readiness = getProfileCompleteness(
    business,
    primaryCategoryId,
    Boolean(business.logo_url)
  );
  const missingDocuments = getMissingVerificationDocuments(documents);
  const approvalAllowed = canApprove(
    business,
    primaryCategoryId,
    Boolean(business.logo_url)
  );
  const verifiedApprovalAllowed = canVerifiedApprove(
    business,
    documents,
    primaryCategoryId,
    Boolean(business.logo_url)
  );

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{business.name}</h3>
          <p className="text-sm text-muted-foreground">
            {business.city?.name ?? "No city"}, {business.province?.name ?? "No province"}
          </p>
          {business.description && (
            <p className="mt-2 text-sm">{business.description.slice(0, 200)}...</p>
          )}

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Listing readiness</p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {APPROVAL_FIELD_LABELS.map((field) => {
                const complete = !readiness.missingFields.includes(field);
                const Icon = complete ? CheckCircle2 : Circle;
                return (
                  <li
                    key={field}
                    className={
                      complete
                        ? "flex items-center gap-1.5 text-xs text-sa-green"
                        : "flex items-center gap-1.5 text-xs text-muted-foreground"
                    }
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {field}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Verification Documents</p>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="font-medium">
                          {DOCUMENT_TYPE_LABELS[doc.document_type]}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {doc.file_name ?? "Uploaded file"} ·{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString("en-ZA")}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/api/admin/businesses/${business.id}/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View document
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {missingDocuments.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-sa-gold" aria-hidden />
                No Verified badge — documents not uploaded:{" "}
                {missingDocuments
                  .map((type) => DOCUMENT_TYPE_LABELS[type])
                  .join(", ")}
              </p>
            )}
          </div>
        </div>

        <AdminBusinessActions
          businessId={business.id}
          canApprove={approvalAllowed}
          canVerifiedApprove={verifiedApprovalAllowed}
        />
      </div>
    </div>
  );
}
