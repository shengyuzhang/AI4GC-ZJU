import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security/headers";

// Read the site-wide indexing switch directly from content/site.yaml (kept
// dependency-free so next.config stays light). Drives the X-Robots-Tag header.
function isSiteIndexable(): boolean {
  try {
    const yaml = readFileSync(path.join(process.cwd(), "content/site.yaml"), "utf8");
    return /^indexable:\s*true\b/m.test(yaml);
  } catch {
    return false;
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Serve modern formats (smaller than JPEG/PNG) for next/image-optimized assets.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const securityHeaders = getSecurityHeaders({ indexable: isSiteIndexable() });
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
