"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  DOCUMENT_TYPE_LABELS,
  uploadBusinessDocument,
  validateDocumentFile,
} from "@/lib/storage/business-documents";
import type { BusinessDocument, BusinessDocumentType } from "@/types";

interface DocumentUploadProps {
  businessId: string;
  documentType: BusinessDocumentType;
  label: string;
  required?: boolean;
  existing?: BusinessDocument | null;
  onUploaded?: () => void;
}

export function DocumentUpload({
  businessId,
  documentType,
  label,
  required = false,
  existing,
  onUploaded,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(
    existing?.file_name ?? null
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    const validationError = validateDocumentFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to upload documents.");
      }

      await uploadBusinessDocument(
        supabase,
        user.id,
        businessId,
        file,
        documentType
      );
      try {
        const notification = await fetch(
          `/api/businesses/${businessId}/profile-change-notification`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ changedFields: [`${label} document`] }),
          }
        );
        if (!notification.ok) {
          console.warn("Profile review notification failed after document upload.");
        }
      } catch {
        console.warn("Profile review notification failed after document upload.");
      }

      onUploaded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setFileName(existing?.file_name ?? null);
    } finally {
      setUploading(false);
    }
  }

  const isUploaded = Boolean(existing || fileName);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Label>
            {label} {required && "*"}
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {DOCUMENT_TYPE_LABELS[documentType]} — PDF, JPG, or PNG. Max 10MB.
          </p>
          {isUploaded ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{fileName ?? existing?.file_name}</span>
              {existing?.uploaded_at && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  · {new Date(existing.uploaded_at).toLocaleDateString("en-ZA")}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-700">Not uploaded</p>
          )}
        </div>

        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isUploaded ? (
              "Replace"
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
