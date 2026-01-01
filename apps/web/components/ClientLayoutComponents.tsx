"use client";

import { ConsoleFilter } from "@/components/ConsoleFilter";
import { AnalyticsWrapper } from "@/components/AnalyticsWrapper";

/**
 * Client-side wrapper for layout components
 * These components handle their own mounting logic to prevent static generation issues
 */
export function ClientLayoutComponents() {
  // These components already handle their own mounting checks
  // They will return null during static generation/SSR
  return (
    <>
      <ConsoleFilter />
      <AnalyticsWrapper />
    </>
  );
}

