"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";

/**
 * Wrapper for Vercel Analytics that only renders on the client
 * This prevents issues during static generation
 */
export function AnalyticsWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only mount on client side, never during static generation
    if (typeof window !== "undefined") {
      setMounted(true);
    }
  }, []);

  // Don't render during static generation or SSR
  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return <Analytics />;
}

