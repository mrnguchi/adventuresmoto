import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // I use this address to preview the dev server from outside the container.
  allowedDevOrigins: ["localhost", "127.0.0.1", "172.20.10.4"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
