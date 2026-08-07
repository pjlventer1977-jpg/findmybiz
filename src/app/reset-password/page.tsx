"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { HERO_BACKGROUND_IMAGE } from "@/data/homepage";

function ResetPasswordForm() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sa-blue">Set a new password</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Choose a new password for your FindMyBiz account.
        </p>
      </div>

      {checkingSession ? (
        <div className="space-y-4">
          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-11 animate-pulse rounded-lg bg-sa-gold/30" />
        </div>
      ) : success ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Button
            asChild
            className="h-11 w-full rounded-lg bg-sa-gold text-sm font-semibold text-slate-900 shadow-sm hover:bg-sa-gold/90"
          >
            <Link href="/login">Go to Sign In</Link>
          </Button>
        </div>
      ) : !hasSession ? (
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-lg"
          >
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-11 rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-11 rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-sa-gold text-sm font-semibold text-slate-900 shadow-sm hover:bg-sa-gold/90"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden py-8 sm:py-12">
      <Image
        src={HERO_BACKGROUND_IMAGE}
        alt=""
        fill
        priority
        className="object-cover object-center opacity-30"
        sizes="100vw"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-slate-50/85"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-[1180px] px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-lg backdrop-blur-sm">
              <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-52 animate-pulse rounded bg-slate-100" />
              <div className="mt-7 space-y-4">
                <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </section>
  );
}
