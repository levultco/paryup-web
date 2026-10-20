import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [58, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
    ],
  },
};

export default nextConfig;
