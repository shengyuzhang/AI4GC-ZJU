import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  const site = getSiteConfig();

  return {
    name: site.name,
    short_name: "AI4GC",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6f8",
    theme_color: "#343f87",
    icons: [
      {
        src: site.logo,
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
