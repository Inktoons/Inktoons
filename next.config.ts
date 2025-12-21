import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: ["susann-organographical-seema.ngrok-free.dev", "*.ngrok-free.dev", "*.ngrok-free.app"]
};

export default nextConfig;
