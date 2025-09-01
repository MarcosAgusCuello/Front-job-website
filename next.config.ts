import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // This can cause double API calls in development
};

export default nextConfig;
