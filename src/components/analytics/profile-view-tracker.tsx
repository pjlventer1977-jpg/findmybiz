"use client";

import { useEffect } from "react";

export function ProfileViewTracker({ businessId }: { businessId: string }) {
  useEffect(() => {
    const key = `fmb-view-${businessId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch("/api/analytics/profile-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    }).catch(() => {});
  }, [businessId]);

  return null;
}
