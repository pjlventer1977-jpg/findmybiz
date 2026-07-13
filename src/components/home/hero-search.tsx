"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSearch() {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action="/search"
      method="GET"
      onSubmit={() => setSubmitting(true)}
      className="flex w-full flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-md sm:flex-row"
    >
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          type="search"
          placeholder="What are you looking for?"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green"
        />
      </div>
      <div className="relative min-w-0 flex-1 sm:max-w-[220px]">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="location"
          type="search"
          placeholder="Enter your town or suburb"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sa-green"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className={cn(
          "h-11 shrink-0 rounded-lg bg-sa-blue px-5 text-sm font-semibold text-white hover:bg-sa-blue/90",
          submitting && "opacity-80"
        )}
      >
        {submitting ? "Searching..." : "Search Businesses"}
      </Button>
    </form>
  );
}
