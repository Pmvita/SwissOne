import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@swissone/shared"],
  // Use standalone output for Vercel deployment
  // Error pages are handled at runtime, not during static generation
  output: "standalone",
  // Set output file tracing root to monorepo root for proper workspace resolution
  outputFileTracingRoot: require("path").join(__dirname, "../.."),
  // Workaround for React 19 + Next.js 15 error page static generation issue
  // This tells Next.js to skip static optimization for error routes
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
  // Suppress Next.js 15 params/searchParams warnings from React DevTools
  // These are false positives from DevTools trying to serialize component props
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;

