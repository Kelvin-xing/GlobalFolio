import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@globalfolio/shared"],
};

export default nextConfig;
