"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoUpload } from "@/components/business/logo-upload";
import { DocumentUpload } from "@/components/business/document-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessDocument } from "@/types";

interface ProfileFormProps {
  business: {
    id: string;
    name: string;
    description?: string | null;
    phone: string;
    email: string;
    website?: string | null;
    status: string;
    slug: string;
    logo_url?: string | null;
  };
  documents: BusinessDocument[];
}

export function ProfileForm({ business, documents }: ProfileFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState(business.description ?? "");
  const [phone, setPhone] = useState(business.phone);
  const [email, setEmail] = useState(business.email);
  const [website, setWebsite] = useState(business.website ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const proofOfAddress = documents.find(
    (doc) => doc.document_type === "proof_of_address"
  );
  const idDocument = documents.find((doc) => doc.document_type === "id_document");
  const cipcDocument = documents.find((doc) => doc.document_type === "cipc");

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/businesses/${business.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          phone,
          email,
          website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save profile");
        return;
      }

      setMessage("Profile updated successfully.");
      router.refresh();
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUpload
            businessId={business.id}
            currentLogoUrl={business.logo_url}
            onUploaded={() => router.refresh()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Documents</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload or replace your verification documents. Replacing a document will require re-review.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <DocumentUpload
            businessId={business.id}
            documentType="proof_of_address"
            label="Proof of Address"
            required
            existing={proofOfAddress}
            onUploaded={() => router.refresh()}
          />
          <DocumentUpload
            businessId={business.id}
            documentType="id_document"
            label="ID / Passport"
            required
            existing={idDocument}
            onUploaded={() => router.refresh()}
          />
          <DocumentUpload
            businessId={business.id}
            documentType="cipc"
            label="CIPC Registration"
            existing={cipcDocument}
            onUploaded={() => router.refresh()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your public business details. Available on all plans.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <p id="business-name" className="text-sm">
                {business.name}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Tell customers about your business and services"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.yourbusiness.co.za"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <p className="text-sm capitalize">{business.status}</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {business.status === "approved" && (
                <a
                  href={`/business/${business.slug}`}
                  className="text-sm text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View public profile
                </a>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
