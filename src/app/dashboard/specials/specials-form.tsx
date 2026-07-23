"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanByTier } from "@/constants/membership";
import { validateSpecialImageFile } from "@/lib/storage/special-image";
import type { MembershipTier, Special } from "@/types";

interface SpecialsDashboardProps {
  businessId: string;
  tier: MembershipTier;
  existingCount: number;
  specials: Pick<Special, "id" | "image_url" | "created_at">[];
}

export function SpecialsDashboard({
  businessId,
  tier,
  existingCount,
  specials,
}: SpecialsDashboardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const plan = getPlanByTier(tier);
  const canPost = existingCount < plan.specialsPerMonth;
  const limitLabel =
    plan.specialsPerMonth >= 999 ? "Unlimited" : plan.specialsPerMonth.toString();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    const validationError = validateSpecialImageFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canPost || !selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("businessId", businessId);
      formData.append("image", selectedFile);

      const response = await fetch("/api/specials", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to upload special");
      }

      setSelectedFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  if (plan.specialsPerMonth === 0) {
    return (
      <p className="text-muted-foreground">
        Upgrade to Starter or above to upload specials.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {specials.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {specials.map((special) => (
            <div
              key={special.id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              {special.image_url ? (
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={special.image_url}
                    alt="Uploaded special"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-muted text-xs text-muted-foreground">
                  Processing...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Specials</CardTitle>
          <p className="text-sm text-muted-foreground">
            {existingCount} of {limitLabel} specials used this month
          </p>
        </CardHeader>
        <CardContent>
          {!canPost ? (
            <p className="text-sm text-muted-foreground">
              You have reached your monthly upload limit. New uploads will be available next month.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative flex h-40 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border bg-muted">
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Special preview"
                      fill
                      sizes="320px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImagePlus className="h-10 w-10 text-muted-foreground" />
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
                    disabled={loading}
                    onClick={() => inputRef.current?.click()}
                  >
                    Choose image
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Upload a promotional image for your special. JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={!selectedFile || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Special"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
