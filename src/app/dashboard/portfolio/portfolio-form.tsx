"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { validatePortfolioImageFile } from "@/lib/storage/portfolio-image";

export interface PortfolioItem {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

interface PortfolioDashboardProps {
  businessId: string;
  items: PortfolioItem[];
}

export function PortfolioDashboard({ businessId, items }: PortfolioDashboardProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const canUpload = items.length < 20;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    const validationError = validatePortfolioImageFile(file);
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
    if (!canUpload || !selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("businessId", businessId);
      formData.append("image", selectedFile);
      if (caption.trim()) formData.append("caption", caption.trim());

      const response = await fetch(`/api/businesses/${businessId}/portfolio`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to upload image");
      }

      setSelectedFile(null);
      setPreview(null);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Remove this image from your portfolio?")) return;

    setDeletingId(itemId);
    setError(null);

    try {
      const response = await fetch(
        `/api/businesses/${businessId}/portfolio?itemId=${itemId}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete image");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={item.image_url}
                  alt={item.caption ?? "Portfolio image"}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              {item.caption && (
                <p className="px-3 py-2 text-xs text-muted-foreground line-clamp-2">
                  {item.caption}
                </p>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={deletingId === item.id}
                onClick={() => handleDelete(item.id)}
                aria-label="Delete portfolio image"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Portfolio Images</CardTitle>
          <p className="text-sm text-muted-foreground">
            {items.length} of 20 images used
          </p>
        </CardHeader>
        <CardContent>
          {!canUpload ? (
            <p className="text-sm text-muted-foreground">
              You have reached the portfolio limit. Remove an image to upload a new one.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative flex h-40 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border bg-muted">
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Portfolio preview"
                      fill
                      sizes="320px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImagePlus className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-3">
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
                  <Input
                    placeholder="Optional caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={200}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Showcase past work on your public profile. JPG, PNG, or WebP. Max 5MB.
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
                  "Upload Image"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
