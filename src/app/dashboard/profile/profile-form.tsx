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
import { CategoryMultiSelect } from "@/components/categories/category-multi-select";
import {
  ServiceAreasSelect,
  type ServiceAreaSelection,
} from "@/components/business/service-areas-select";
import type { BusinessDocument, Category, Province } from "@/types";

interface ProfileFormProps {
  business: {
    id: string;
    name: string;
    description?: string | null;
    phone: string;
    email: string;
    website?: string | null;
    province_id?: string | null;
    city_id?: string | null;
    status: string;
    slug: string;
    logo_url?: string | null;
  };
  documents: BusinessDocument[];
  provinces: Province[];
  categories: Category[];
  categoryIds: string[];
  serviceAreas: ServiceAreaSelection[];
  wholeProvinceIds: string[];
  /** Override default owner profile API (used by admin edit). */
  saveUrl?: string;
  allowNameEdit?: boolean;
  adminMode?: boolean;
}

export function ProfileForm({
  business,
  documents,
  provinces,
  categories,
  categoryIds: initialCategoryIds,
  serviceAreas: initialServiceAreas,
  wholeProvinceIds: initialWholeProvinceIds,
  saveUrl,
  allowNameEdit = false,
  adminMode = false,
}: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(business.name);
  const [description, setDescription] = useState(business.description ?? "");
  const [phone, setPhone] = useState(business.phone);
  const [email, setEmail] = useState(business.email);
  const [website, setWebsite] = useState(business.website ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(initialCategoryIds);
  const [serviceAreas, setServiceAreas] =
    useState<ServiceAreaSelection[]>(initialServiceAreas);
  const [wholeProvinceIds, setWholeProvinceIds] = useState<string[]>(
    initialWholeProvinceIds
  );
  const [primaryCityId, setPrimaryCityId] = useState(
    business.city_id ?? initialServiceAreas[0]?.cityId ?? ""
  );
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
      if (categoryIds.length === 0) {
        setError("Please select at least one service subcategory.");
        setSaving(false);
        return;
      }

      if ((serviceAreas.length === 0 && wholeProvinceIds.length === 0) || !primaryCityId) {
        setError(
          "Please add at least one city/town or whole province, and choose a primary base city."
        );
        setSaving(false);
        return;
      }

      const primary = serviceAreas.find((a) => a.cityId === primaryCityId);

      const res = await fetch(
        saveUrl ?? `/api/businesses/${business.id}/profile`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(allowNameEdit ? { name: name.trim() } : {}),
            description,
            phone,
            email,
            website,
            provinceId: primary?.provinceId ?? null,
            cityId: primaryCityId,
            categoryIds,
            serviceCityIds: serviceAreas.map((a) => a.cityId),
            wholeProvinceIds,
          }),
        }
      );

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
            Verification documents are optional for listing approval. Upload Proof of Address and
            ID/Passport if you want a Verified badge on your public listing. CIPC is optional.
            Replacing a document after approval may require re-review.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <DocumentUpload
            businessId={business.id}
            documentType="proof_of_address"
            label="Proof of Address"
            existing={proofOfAddress}
            onUploaded={() => router.refresh()}
          />
          <DocumentUpload
            businessId={business.id}
            documentType="id_document"
            label="ID / Passport"
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

      <Card id="listing-details" className="scroll-mt-24">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            {adminMode
              ? "Admin edits update the live listing immediately."
              : "Add the details customers need to find and contact your business. Service categories and areas are required before we can approve your listing."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              {allowNameEdit ? (
                <Input
                  id="business-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              ) : (
                <p id="business-name" className="text-sm">
                  {business.name}
                </p>
              )}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div id="service-categories" className="scroll-mt-24 space-y-2">
              <CategoryMultiSelect
                categories={categories}
                value={categoryIds}
                onChange={setCategoryIds}
                required
              />
            </div>

            <div id="service-areas" className="scroll-mt-24 space-y-2">
              <ServiceAreasSelect
                provinces={provinces}
                value={serviceAreas}
                onChange={setServiceAreas}
                wholeProvinceIds={wholeProvinceIds}
                onWholeProvincesChange={setWholeProvinceIds}
                primaryCityId={primaryCityId}
                onPrimaryChange={setPrimaryCityId}
                required
              />
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
