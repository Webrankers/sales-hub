import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    allowedOrigins: ["localhost:3000"],
  },
};

export default nextConfig;
