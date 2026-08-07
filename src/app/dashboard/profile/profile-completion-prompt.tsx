"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, CheckCircle2, Circle, MapPin, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProfileCompletionPromptProps = {
  needsCategories: boolean;
  needsServiceAreas: boolean;
};

export function ProfileCompletionPrompt({
  needsCategories,
  needsServiceAreas,
}: ProfileCompletionPromptProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const justRegistered = searchParams.get("registered") === "true";
  const incomplete = needsCategories || needsServiceAreas;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!justRegistered || incomplete) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("registered");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [incomplete, justRegistered, pathname, router, searchParams]);

  if (dismissed || !incomplete) return null;

  function scrollToListingDetails() {
    const target = document.getElementById("listing-details");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="rounded-2xl border border-sa-gold/40 bg-gradient-to-br from-sa-gold/15 via-white to-sa-green/10 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sa-blue">
              {justRegistered ? "Welcome — one more step" : "Finish your listing"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-sa-blue">
              {justRegistered
                ? "Your account is ready. Complete these details so we can approve your business."
                : "Add your categories and service areas so customers can find you."}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              These details power search results. You can finish them now in the form below,
              then save your profile.
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              {needsCategories ? (
                <Circle className="h-4 w-4 text-slate-400" aria-hidden />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-sa-green" aria-hidden />
              )}
              <Tags className="h-4 w-4 text-sa-green" aria-hidden />
              <span className={needsCategories ? "text-slate-800" : "text-sa-green"}>
                Service categories
              </span>
            </li>
            <li className="flex items-center gap-2">
              {needsServiceAreas ? (
                <Circle className="h-4 w-4 text-slate-400" aria-hidden />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-sa-green" aria-hidden />
              )}
              <MapPin className="h-4 w-4 text-sa-green" aria-hidden />
              <span className={needsServiceAreas ? "text-slate-800" : "text-sa-green"}>
                Service areas &amp; primary base city
              </span>
            </li>
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button
            type="button"
            onClick={scrollToListingDetails}
            className="rounded-lg bg-sa-gold text-slate-900 hover:bg-sa-gold/90"
          >
            Complete listing details
            <ArrowDown className="h-4 w-4" aria-hidden />
          </Button>
          {!justRegistered && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
            >
              Dismiss for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
