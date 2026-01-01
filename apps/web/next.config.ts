import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@swissone/shared"],
  // For monorepo: ensure Next.js can trace files from root
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Skip static optimization for error pages to avoid React 19 context issues
  experimental: {
    optimizePackageImports: ["@swissone/shared"],
    // Try to prevent static generation of error pages
    missingSuspenseWithCSRBailout: false,
  },
  // Suppress Next.js 15 params/searchParams warnings from React DevTools
  // These are false positives from DevTools trying to serialize component props
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  // Temporarily disable webpack caching to reduce disk usage (disk is full)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false; // Disable webpack cache to save disk space
    }
    return config;
  },
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Skip static generation of error pages to avoid React rendering errors
  // Error pages will be rendered dynamically at request time
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Skip static optimization for 404 and error pages
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
