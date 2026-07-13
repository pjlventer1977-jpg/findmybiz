"use client";

import { useEffect } from "react";

export function SearchAppearanceTracker({
  businessIds,
  searchTerm,
}: {
  businessIds: string[];
  searchTerm?: string;
}) {
  useEffect(() => {
    if (!businessIds.length) return;

    const key = `fmb-search-${businessIds.join(",")}-${searchTerm ?? ""}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch("/api/analytics/search-appearances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessIds, searchTerm }),
    }).catch(() => {});
  }, [businessIds, searchTerm]);

  return null;
}
