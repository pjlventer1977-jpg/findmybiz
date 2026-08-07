"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getCanonicalAppUrl } from "@/lib/app-url";
import { HERO_BACKGROUND_IMAGE } from "@/data/homepage";

type FormMode = "sign-in" | "forgot-password";

const OWNER_BULLETS = [
  "Leads delivered to your business email",
  "Get 5 Quotes customer requests",
  "Manage leads in your dashboard",
] as const;

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<FormMode>("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const supabase = createClient();

    try {
      if (mode === "forgot-password") {
        const redirectTo = `${getCanonicalAppUrl()}/auth/callback?next=/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (resetError) {
          setError(resetError.message);
          setLoading(false);
          return;
        }

        setMessage(
          "If an account exists for that email, we sent a password reset link. Check your inbox."
        );
        setLoading(false);
        return;
      }

      const password = formData.get("password") as string;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .maybeSingle();
      const defaultRedirect = profile?.role === "admin" ? "/admin" : "/dashboard/profile";
      const redirect = searchParams.get("redirect") ?? defaultRedirect;
      const safeRedirect =
        redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : defaultRedirect;
      // Full navigation ensures auth cookies are sent to middleware/server
      window.location.assign(safeRedirect);
    } catch {
      setError(
        mode === "forgot-password"
          ? "Could not send the reset email. Please check your connection and try again."
          : "Sign in failed. Please check your connection and try again."
      );
      setLoading(false);
    }
  }

  function switchMode(nextMode: FormMode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    setShowPassword(false);
  }

  return (
    <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
      <div className="order-2 text-center lg:order-1 lg:text-left">
        <div className="mx-auto flex max-w-lg flex-col items-center lg:mx-0 lg:items-start">
          <Image
            src="/findmybiz-logo-transparent.png"
            alt="FindMyBiz"
            width={230}
            height={64}
            className="h-auto w-[190px] sm:w-[230px]"
            priority
          />
          <p className="mt-3 text-xs font-bold tracking-[0.18em] text-sa-green sm:text-sm">
            FIND. CONNECT. GROW.
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            South Africa&apos;s Business Directory
          </p>

          <div className="mt-5 hidden w-full sm:block lg:mt-8">
            <h1 className="text-3xl font-bold tracking-tight text-sa-blue lg:text-4xl">
              Welcome back
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-slate-700">
              Sign in to manage your business, track leads, and stay connected with customers.
            </p>

            <ul className="mt-6 space-y-3 text-left">
              {OWNER_BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sa-green" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div
              className="mt-7 hidden max-w-sm overflow-hidden rounded-xl border border-sa-gold/30 bg-white/85 text-left shadow-sm backdrop-blur-sm lg:block"
              aria-hidden
            >
              <div className="flex items-center gap-2 bg-sa-blue px-3 py-2 text-white">
                <Mail className="h-3.5 w-3.5 text-sa-gold" />
                <span className="text-xs font-semibold">New Lead — FindMyBiz</span>
                <span className="ml-auto rounded-full bg-sa-gold/20 px-2 py-0.5 text-[9px] font-medium text-sa-gold">
                  Just now
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-800">Plumbing repair — burst pipe</p>
                <p className="mt-1 text-xs text-slate-600">Sandton, Gauteng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-sa-blue">
              {mode === "sign-in" ? "Sign In" : "Reset password"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              {mode === "sign-in"
                ? "Enter your details to access your dashboard."
                : "Enter your email and we will send you a reset link."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-11 rounded-lg"
              />
            </div>
            {mode === "sign-in" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="text-sm font-medium text-sa-green transition-colors hover:text-sa-blue"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="current-password"
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
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-sa-green">{message}</p>}
            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-sa-gold text-sm font-semibold text-slate-900 shadow-sm hover:bg-sa-gold/90"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "sign-in"
                  ? "Sign In"
                  : "Send reset link"}
            </Button>
            {mode === "forgot-password" && (
              <button
                type="button"
                onClick={() => switchMode("sign-in")}
                className="w-full text-center text-sm font-medium text-slate-600 transition-colors hover:text-sa-blue"
              >
                Back to sign in
              </button>
            )}
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-sa-green transition-colors hover:text-sa-blue"
            >
              Register your business
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
              <div className="h-7 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-52 animate-pulse rounded bg-slate-100" />
              <div className="mt-7 space-y-4">
                <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-11 animate-pulse rounded-lg bg-sa-gold/30" />
              </div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
