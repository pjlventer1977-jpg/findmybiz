"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: formData.get("name") as string },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/register?verified=pending");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{isRegister ? "Create Account" : "Sign In"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Sign Up" : "Sign In"}
            </Button>
          </form>
          <p className="text-sm text-center mt-4">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </p>
          {!isRegister && (
            <p className="text-sm text-center mt-2">
              <Link href="/register" className="text-primary underline">
                Register your business
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
