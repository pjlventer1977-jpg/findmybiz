import Link from "next/link";
import { AlertTriangle, FileText } from "lucide-react";
import { AdminBusinessActions } from "./admin-actions";
import {
  DOCUMENT_TYPE_LABELS,
  REQUIRED_DOCUMENT_TYPES,
} from "@/lib/storage/business-documents";
import type { BusinessDocument, BusinessDocumentType } from "@/types";

interface AdminBusinessCardProps {
  business: {
    id: string;
    name: string;
    description?: string | null;
    province?: { name: string } | null;
    city?: { name: string } | null;
    business_documents?: BusinessDocument[];
  };
}

function hasDocumentType(
  documents: BusinessDocument[],
  type: BusinessDocumentType
) {
  return documents.some((doc) => doc.document_type === type);
}

export function AdminBusinessCard({ business }: AdminBusinessCardProps) {
  const documents = business.business_documents ?? [];
  const missingRequired = REQUIRED_DOCUMENT_TYPES.filter(
    (type) => !hasDocumentType(documents, type)
  );

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{business.name}</h3>
            {missingRequired.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                <AlertTriangle className="h-3 w-3" />
                Missing required documents
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {business.city?.name}, {business.province?.name}
          </p>
          <p className="mt-2 text-sm">{business.description?.slice(0, 200)}...</p>

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
            {missingRequired.length > 0 && (
              <p className="text-xs text-amber-800">
                Missing:{" "}
                {missingRequired
                  .map((type) => DOCUMENT_TYPE_LABELS[type])
                  .join(", ")}
              </p>
            )}
          </div>
        </div>

        <AdminBusinessActions businessId={business.id} />
      </div>
    </div>
  );
}
