"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import client components with SSR disabled to prevent static generation issues
const ConsoleFilter = dynamic(() => import("@/components/ConsoleFilter").then(mod => ({ default: mod.ConsoleFilter })), {
  ssr: false,
});

const AnalyticsWrapper = dynamic(() => import("@/components/AnalyticsWrapper").then(mod => ({ default: mod.AnalyticsWrapper })), {
  ssr: false,
});

/**
 * Client-side wrapper for layout components that should not be rendered during SSR/static generation
 * This prevents React rendering errors during Next.js build process
 */
export function ClientLayoutComponents() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render during static generation or SSR
  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return (
    <>
      <ConsoleFilter />
      <AnalyticsWrapper />
    </>
  );
}

