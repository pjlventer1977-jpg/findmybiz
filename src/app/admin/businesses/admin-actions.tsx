"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AdminBusinessActionsProps {
  businessId: string;
}

export function AdminBusinessActions({ businessId }: AdminBusinessActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: "approved" | "rejected" | "suspended") {
    setLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Action failed");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!!loading}
          onClick={() => handleAction("approved")}
        >
          {loading === "approved" ? "Approving..." : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => handleAction("rejected")}
        >
          {loading === "rejected" ? "Rejecting..." : "Reject"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={!!loading}
          onClick={() => handleAction("suspended")}
        >
          {loading === "suspended" ? "Suspending..." : "Suspend"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
