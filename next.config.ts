import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination:
          "https://studysprint-aiagent-server.onrender.com/api/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
