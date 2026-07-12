"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AdminEventActions({
  eventId,
  adminId,
}: {
  eventId: string;
  adminId: string;
}) {
  const router = useRouter();

  async function moderate(status: "approved" | "rejected") {
    const supabase = createClient();
    await supabase.from("events").update({ status }).eq("id", eventId);
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action_type: status,
      target_type: "event",
      target_id: eventId,
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
