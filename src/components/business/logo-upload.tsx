"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { uploadBusinessLogo, validateLogoFile } from "@/lib/storage/business-logo";

interface LogoUploadProps {
  businessId: string;
  currentLogoUrl?: string | null;
  onUploaded?: (url: string) => void;
  onFileSelected?: (file: File | null) => void;
  deferUpload?: boolean;
  required?: boolean;
  label?: string;
}

export function LogoUpload({
  businessId,
  currentLogoUrl,
  onUploaded,
  onFileSelected,
  deferUpload = false,
  required = false,
  label = "Company Logo",
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setPendingFile(null);
      onFileSelected?.(null);
      return;
    }

    const validationError = validateLogoFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setPendingFile(file);
    onFileSelected?.(file);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    if (!deferUpload) {
      await uploadFile(file);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to upload a logo.");

      const publicUrl = await uploadBusinessLogo(
        supabase,
        user.id,
        businessId,
        file
      );
      try {
        const notification = await fetch(
          `/api/businesses/${businessId}/profile-change-notification`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ changedFields: ["Company logo"] }),
          }
        );
        if (!notification.ok) {
          console.warn("Profile review notification failed after logo upload.");
        }
      } catch {
        console.warn("Profile review notification failed after logo upload.");
      }

      setPreview(publicUrl);
      onUploaded?.(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleManualUpload() {
    if (pendingFile) {
      await uploadFile(pendingFile);
    }
  }

  return (
    <div className="space-y-3">
      <Label>
        {label} {required && "*"}
      </Label>

      <div className="flex items-start gap-4">
        <div className="h-24 w-24 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
          {preview ? (
            <Image
              src={preview}
              alt="Company logo preview"
              width={96}
              height={96}
              className="object-cover h-full w-full"
              unoptimized
            />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Choose logo"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 5MB.
          </p>
          {deferUpload && pendingFile && !uploading && (
            <Button type="button" size="sm" onClick={handleManualUpload}>
              Upload now
            </Button>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export async function uploadLogoForBusiness(
  businessId: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload a logo.");
  return uploadBusinessLogo(supabase, user.id, businessId, file);
}
