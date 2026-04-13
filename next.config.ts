import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "tradetrack-alpha.vercel.app",
        "tradetrack-sumanthbngl-2769s-projects.vercel.app",
        "tradetrack-git-main-sumanthbngl-2769s-projects.vercel.app",
      ],
    },
  },
};

export default nextConfig;
