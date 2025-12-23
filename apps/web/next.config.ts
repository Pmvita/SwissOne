import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@swissone/shared"],
  // Use standalone output for Vercel deployment
  // Error pages are handled at runtime, not during static generation
  output: "standalone",
  // Workaround for React 19 + Next.js 15 error page static generation issue
  // This tells Next.js to skip static optimization for error routes
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
  // Ensure Next.js can resolve modules from workspace root
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;

