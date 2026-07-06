import type { MetadataRoute } from "next";
import { listBlogPostSlugs } from "@/lib/content/load-blog";
import { listIndexableMemberProfileSlugs } from "@/lib/content/load-team";
import { getSiteUrl } from "@/lib/site/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticPaths = ["/", "/news", "/publications", "/projects", "/team", "/blog"];
  const profilePaths = listIndexableMemberProfileSlugs().map((slug) => `/${slug}`);
  const blogPaths = listBlogPostSlugs().map((slug) => `/blog/${slug}`);

  return [...staticPaths, ...profilePaths, ...blogPaths].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
  }));
}
