"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { registerBusinessAccount } from "./actions";

export function BusinessRegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await registerBusinessAccount({
      businessName: String(formData.get("businessName") ?? ""),
      contactPerson: String(formData.get("contactPerson") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!result.ok) {
      setError(result.error ?? "Could not create your account. Please try again.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (signInError) {
      setError(
        "Your account was created, but you need to confirm your email before signing in."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard/profile?registered=true");
  }

  return (
    <Card className="mx-auto max-w-xl rounded-2xl border-slate-200 bg-white shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl text-sa-blue">Create your business account</CardTitle>
        <p className="text-sm leading-relaxed text-slate-600">
          Start with the essentials. You can add your logo, documents, location, and services
          from your profile after signing up.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input id="businessName" name="businessName" required className="h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input id="contactPerson" name="contactPerson" required className="h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Contact Number *</Label>
            <Input id="phone" name="phone" type="tel" required className="h-11 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Create Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              className="h-11 rounded-lg"
            />
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5 text-sa-green" aria-hidden />
              Use at least 6 characters.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-sa-gold text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
            disabled={loading}
          >
            {loading ? "Creating your account..." : "Create Account & Register Business"}
          </Button>
        </form>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-sa-green" aria-hidden />
          Your business will be submitted for review after registration.
        </p>
      </CardContent>
    </Card>
  );
}
