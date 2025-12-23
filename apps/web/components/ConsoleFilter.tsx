"use client";

import { useEffect } from "react";

/**
 * Filters out Next.js 15 params/searchParams warnings from React DevTools
 * These are false positives from DevTools trying to serialize component props
 * during inspection, not actual runtime errors in our code.
 */
export function ConsoleFilter() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // Only filter in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const originalError = console.error;
    const originalWarn = console.warn;

    // Filter out Next.js 15 params/searchParams warnings from React DevTools
    const shouldFilter = (args: any[]): boolean => {
      if (!args || args.length === 0) return false;
      
      const message = String(args[0] || "");
      const stack = args.length > 1 ? String(args[1] || "") : "";
      const fullMessage = message + " " + stack;

      // Filter specific Next.js 15 warnings about params/searchParams
      if (
        message.includes("params are being enumerated") ||
        message.includes("The keys of `searchParams` were accessed directly") ||
        message.includes("should be unwrapped with React.use()") ||
        fullMessage.includes("params.browser.dev.js") ||
        fullMessage.includes("search-params.browser.dev.js") ||
        fullMessage.includes("intercept-console-error.js")
      ) {
        return true;
      }
      return false;
    };

    console.error = (...args: any[]) => {
      if (!shouldFilter(args)) {
        originalError.apply(console, args);
      }
    };

    console.warn = (...args: any[]) => {
      if (!shouldFilter(args)) {
        originalWarn.apply(console, args);
      }
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}

