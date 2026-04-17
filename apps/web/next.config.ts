import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@globalfolio/shared", "recharts", "victory-vendor", "d3-shape", "d3-path"],
};

export default nextConfig;
