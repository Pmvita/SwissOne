import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@swissone/shared"],
  // Use standalone output for better React 19 compatibility
  output: "standalone",
};

export default nextConfig;

