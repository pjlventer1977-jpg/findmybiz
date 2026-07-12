"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AdminReviewActions({
  reviewId,
  adminId,
}: {
  reviewId: string;
  adminId: string;
}) {
  const router = useRouter();

  async function moderate(status: "approved" | "rejected") {
    const supabase = createClient();
    await supabase.from("reviews").update({ status }).eq("id", reviewId);
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action_type: status,
      target_type: "review",
      target_id: reviewId,
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => moderate("approved")}>Approve</Button>
      <Button size="sm" variant="outline" onClick={() => moderate("rejected")}>Reject</Button>
    </div>
  );
}
