import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminReviewActions } from "./review-actions";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      business:businesses(name)
    `)
    .eq("status", "pending")
    .order("created_at");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Review Moderation</h1>
      {!reviews?.length ? (
        <p className="text-muted-foreground">No pending reviews.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{review.reviewer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(review.business as { name: string })?.name} — {review.rating}/5
                  </p>
                  <p className="mt-2">{review.comment}</p>
                </div>
                <AdminReviewActions reviewId={review.id} adminId={user!.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
