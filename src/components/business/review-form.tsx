"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  businessSlug: string;
  isAuthenticated: boolean;
}

export function ReviewForm({ businessSlug, isAuthenticated }: ReviewFormProps) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug,
          reviewerName,
          rating,
          comment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to submit review");
      }

      setSuccessMessage(result.message);
      setReviewerName("");
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  const displayRating = hoverRating || rating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience. Reviews are moderated before they appear publicly.
        </p>
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in to leave a review for this business.
            </p>
            <Button asChild variant="outline">
              <Link href={`/login?redirect=/business/${businessSlug}`}>Sign in to review</Link>
            </Button>
          </div>
        ) : successMessage ? (
          <p className="text-sm text-green-700">{successMessage}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reviewerName" className="text-sm font-medium">
                Your name
              </label>
              <Input
                id="reviewerName"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="How should we display your name?"
                maxLength={80}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Rating</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  const filled = starValue <= displayRating;

                  return (
                    <button
                      key={starValue}
                      type="button"
                      className="rounded p-0.5"
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starValue)}
                      aria-label={`Rate ${starValue} out of 5`}
                      disabled={loading}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          filled ? "fill-sa-gold text-sa-gold" : "text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reviewComment" className="text-sm font-medium">
                Comment (optional)
              </label>
              <Textarea
                id="reviewComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..."
                rows={4}
                maxLength={1000}
                disabled={loading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
