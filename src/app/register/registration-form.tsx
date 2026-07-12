"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { uploadBusinessLogo, validateLogoFile } from "@/lib/storage/business-logo";
import type { Province, Category, City } from "@/types";

interface RegisterPageProps {
  provinces: Province[];
  categories: Category[];
}

export function BusinessRegistrationForm({
  provinces,
  categories,
}: RegisterPageProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login?redirect=/register");
    });
  }, [router]);

  useEffect(() => {
    if (!selectedProvince) return;
    const province = provinces.find((p) => p.slug === selectedProvince);
    if (!province) return;
    const supabase = createClient();
    supabase
      .from("cities")
      .select("*")
      .eq("province_id", province.id)
      .order("name")
      .then(({ data }) => setCities(data ?? []));
  }, [selectedProvince, provinces]);

  function updateField(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    const validationError = validateLogoFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const province = provinces.find((p) => p.slug === formData.province);
    const category = categories.find((c) => c.slug === formData.category);

    if (!province || !category) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (!logoFile) {
      setError("Please upload your company logo.");
      setLoading(false);
      return;
    }

    const slug = slugify(formData.name) + "-" + Date.now().toString(36);

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: formData.name,
        trading_name: formData.trading_name || null,
        slug,
        description: formData.description,
        contact_person: formData.contact_person,
        email: formData.email || user.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        website: formData.website || null,
        address: formData.address,
        province_id: province.id,
        city_id: formData.city_id,
        status: "pending",
      })
      .select()
      .single();

    if (bizError || !business) {
      setError(bizError?.message ?? "Failed to register business");
      setLoading(false);
      return;
    }

    await supabase.from("business_categories").insert({
      business_id: business.id,
      category_id: category.id,
    });

    try {
      await uploadBusinessLogo(supabase, user.id, business.id, logoFile);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Business created but logo upload failed. Add your logo from the dashboard."
      );
      setLoading(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({ role: "business_owner" })
      .eq("id", user.id);

    router.push("/dashboard?registered=true");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Business Information"}
            {step === 2 && "Location"}
            {step === 3 && "Category & Contact"}
            {step === 4 && "Documents"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label>Business Name *</Label>
                <Input
                  value={formData.name ?? ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Trading Name</Label>
                <Input
                  value={formData.trading_name ?? ""}
                  onChange={(e) => updateField("trading_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Contact Person *</Label>
                <Input
                  value={formData.contact_person ?? ""}
                  onChange={(e) => updateField("contact_person", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Business Description *</Label>
                <Textarea
                  value={formData.description ?? ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>Province *</Label>
                <Select
                  value={selectedProvince}
                  onValueChange={(v) => {
                    setSelectedProvince(v);
                    updateField("province", v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={p.slug}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City / Town *</Label>
                <Select
                  onValueChange={(v) => updateField("city_id", v)}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Physical Address *</Label>
                <Textarea
                  value={formData.address ?? ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>Primary Category *</Label>
                <Select onValueChange={(v) => updateField("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email ?? ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone ?? ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input
                  value={formData.whatsapp ?? ""}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website ?? ""}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload your company logo and verification documents. Documents can also be added later from your dashboard.
              </p>

              <div className="space-y-3">
                <Label>Company Logo *</Label>
                <div className="flex items-start gap-4">
                  <div className="h-24 w-24 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
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
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      Choose logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, or WebP. Max 5MB. Saved to your public profile.
                    </p>
                  </div>
                </div>
              </div>

              {[
                { type: "proof_of_address", label: "Proof of Address", required: true },
                { type: "id_document", label: "ID / Passport", required: true },
                { type: "cipc", label: "CIPC Registration (optional)", required: false },
              ].map((doc) => (
                <div key={doc.type}>
                  <Label>
                    {doc.label} {doc.required && "*"}
                  </Label>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1" />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, JPG, PNG. Your listing will be reviewed within 24–48 hours.
              </p>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button className="ml-auto" onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            ) : (
              <Button className="ml-auto" onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit for Verification"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
