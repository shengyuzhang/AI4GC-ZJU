import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Serve images as-is (no Vercel Image Optimization). The optimizer's monthly
    // transformation quota was being exhausted, returning 402
    // (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) and breaking every next/image on
    // the site, while the plain <img> tags on /projects kept working. Unoptimized
    // delivery is quota-free and matches that behaviour. Drop this flag to
    // re-enable optimization if the account regains capacity.
    unoptimized: true,
    // Kept for when optimization is re-enabled: prefer modern formats.
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
};

export default nextConfig;
