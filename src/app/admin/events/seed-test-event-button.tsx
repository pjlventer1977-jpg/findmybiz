"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSeedTestEventButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function seedTestEvent() {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/seed-test-event", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not seed test event.");
      }

      setMessage(data.message ?? "Test event added.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not seed test event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-sa-gold/40 bg-sa-gold/5 p-4">
      <h2 className="font-semibold text-sa-blue">Test event listing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add the Afrikaans in die Wolke poster to /events and the homepage (approved, paid for 4
        weeks).
      </p>
      <Button
        type="button"
        className="mt-3 bg-sa-gold text-slate-900 hover:bg-sa-gold/90"
        disabled={loading}
        onClick={seedTestEvent}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding test event...
          </>
        ) : (
          "Add Afrikaans in die Wolke test event"
        )}
      </Button>
      {message && <p className="mt-2 text-sm text-sa-green">{message}</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
