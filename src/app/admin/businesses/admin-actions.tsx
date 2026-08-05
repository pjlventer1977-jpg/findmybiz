"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type StatusAction =
  | "approved"
  | "verified_approved"
  | "rejected"
  | "suspended"
  | "unsuspended";

interface AdminBusinessActionsProps {
  businessId: string;
  businessName: string;
  status: string;
  canApprove?: boolean;
  canVerifiedApprove?: boolean;
  canResendApprovalEmail?: boolean;
  /** Compact layout for directory table rows */
  compact?: boolean;
}

export function AdminBusinessActions({
  businessId,
  businessName,
  status,
  canApprove = false,
  canVerifiedApprove = false,
  canResendApprovalEmail = false,
  compact = false,
}: AdminBusinessActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isSuspended = status === "suspended";
  const isRejected = status === "rejected";

  async function handleAction(action: StatusAction) {
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
        const { status: emailStatus, recipient, error: emailError } = data.email_notification;
        if (emailStatus === "failed") {
          setError(
            `Action saved, but email failed: ${emailError ?? "Unknown error"}`
          );
        } else if (recipient) {
          setNotice(`Email sent to ${recipient}.`);
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

  async function handleDelete() {
    const typed = window.prompt(
      `Permanently delete "${businessName}" and the owner login?\n\nType the business name to confirm:`
    );
    if (typed == null) return;
    if (typed.trim().toLowerCase() !== businessName.trim().toLowerCase()) {
      setError("Deletion cancelled — name did not match.");
      return;
    }

    const confirmed = window.confirm(
      `This cannot be undone.\n\nDelete business "${businessName}" and remove the owner account?`
    );
    if (!confirmed) return;

    setLoading("deleted");
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_name: typed.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Delete failed");
      }
      if (data.warning) {
        setNotice(data.warning);
      } else {
        setNotice(
          data.user_deleted
            ? "Business and owner account deleted."
            : "Business deleted (owner kept — other listings remain)."
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${compact ? "items-stretch" : "items-end"}`}>
      <div className={`flex flex-wrap gap-2 ${compact ? "" : "justify-end"}`}>
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
          </>
        )}

        {(isRejected || isSuspended) && (
          <Button
            size="sm"
            disabled={!!loading || (isRejected && !canApprove)}
            onClick={() => handleAction(isSuspended ? "unsuspended" : "approved")}
            title={
              isRejected && !canApprove
                ? "Profile must be complete to restore"
                : undefined
            }
          >
            {loading === "unsuspended" || loading === "approved"
              ? "Restoring..."
              : isSuspended
                ? "Unsuspend"
                : "Restore / Approve"}
          </Button>
        )}

        {(isPending || isApproved || isRejected) && (
          <Button
            size="sm"
            variant="outline"
            disabled={!!loading}
            onClick={() => {
              if (
                window.confirm(
                  `Suspend "${businessName}"?\n\nListing will be hidden and any paid plan cancelled.`
                )
              ) {
                void handleAction("suspended");
              }
            }}
          >
            {loading === "suspended" ? "Suspending..." : "Suspend"}
          </Button>
        )}

        {canResendApprovalEmail && isApproved && (
          <Button
            size="sm"
            variant="outline"
            disabled={!!loading}
            onClick={handleApprovalEmailResend}
          >
            {loading === "resend_email" ? "Sending..." : "Resend Approval Email"}
          </Button>
        )}

        <Button
          size="sm"
          variant="destructive"
          disabled={!!loading}
          onClick={handleDelete}
        >
          {loading === "deleted" ? "Deleting..." : "Delete"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {notice && <p className="text-xs text-sa-green">{notice}</p>}
    </div>
  );
}
