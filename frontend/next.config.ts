import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  logging: {
    serverFunctions: false,
  },
};

export default nextConfig;
