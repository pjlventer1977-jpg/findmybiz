"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AdminBusinessActionsProps {
  businessId: string;
  canApprove: boolean;
  canVerifiedApprove: boolean;
  canResendApprovalEmail: boolean;
  isPending: boolean;
}

export function AdminBusinessActions({
  businessId,
  canApprove,
  canVerifiedApprove,
  canResendApprovalEmail,
  isPending,
}: AdminBusinessActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleAction(
    action: "approved" | "verified_approved" | "rejected" | "suspended"
  ) {
    setLoading(action);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        const requirements = [
          ...(data.missingFields ?? []),
          ...(data.missingDocuments ?? []),
        ];
        throw new Error(
          [data.error ?? "Action failed", requirements.join(", ")].filter(Boolean).join(": ")
        );
      }

      if (data.email_notification) {
        const { status, recipient, error: emailError } = data.email_notification;
        if (status === "failed") {
          setError(`Business approved, but the approval email failed: ${emailError ?? "Unknown error"}`);
        } else {
          setNotice(`Approval email sent to ${recipient}.`);
        }
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleApprovalEmailResend() {
    setLoading("resend_email");
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/approval-email`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not resend the approval email.");
      }

      setNotice(`Approval email sent to ${data.recipient}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {isPending && (
          <>
            <Button
              size="sm"
              disabled={!!loading || !canApprove}
              onClick={() => handleAction("approved")}
            >
              {loading === "approved" ? "Approving..." : "Approve"}
            </Button>
            <Button
              size="sm"
              className="bg-sa-green text-white hover:bg-sa-green/90"
              disabled={!!loading || !canVerifiedApprove}
              onClick={() => handleAction("verified_approved")}
            >
              {loading === "verified_approved" ? "Approving..." : "Verified & Approved"}
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
          </>
        )}
        {canResendApprovalEmail && (
          <Button
            size="sm"
            variant="outline"
            disabled={!!loading}
            onClick={handleApprovalEmailResend}
          >
            {loading === "resend_email" ? "Sending..." : "Resend Approval Email"}
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {notice && <p className="text-xs text-sa-green">{notice}</p>}
    </div>
  );
}
