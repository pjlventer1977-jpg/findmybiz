"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminPromoExpireButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runPromoExpire() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/promo-expire", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not run promo expire.");
        return;
      }
      setResult(
        `Processed ${data.processed}: ${data.converted} converted, ${data.failed} failed.`
      );
    } catch {
      setError("Could not reach promo expire endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-sa-blue">Launch promo tools</h2>
        <p className="text-sm text-slate-600">
          Converts subscriptions where the 3-month launch special has ended to full
          PayFast recurring price. First set{" "}
          <code className="text-xs">promo_ends_at</code> in the past in Supabase for a
          test business, then run this.
        </p>
      </div>
      <Button type="button" onClick={runPromoExpire} disabled={loading}>
        {loading ? "Running…" : "Run promo expire now"}
      </Button>
      {result && (
        <p className="text-sm text-sa-green">{result}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
