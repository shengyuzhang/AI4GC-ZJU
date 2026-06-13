import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Serve modern formats (smaller than JPEG/PNG) for next/image-optimized assets.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const securityHeaders = getSecurityHeaders();
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/songhan",
        destination: "/shengyu-zhang",
        permanent: true,
      },
      {
        source: "/song-han",
        destination: "/shengyu-zhang",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
