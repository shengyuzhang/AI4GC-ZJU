import type { Metadata } from "next";
import { loadSiteConfig } from "@/lib/content/load-site";

type ListPageKey = "team" | "news" | "publications" | "projects" | "blog";

/** Builds canonical + Open Graph metadata for a top-level list page using its configured hero title. */
export function buildListPageMetadata(pageKey: ListPageKey, path: string): Metadata {
  const site = loadSiteConfig();
  const title = site.pages[pageKey].title;
  const description = site.description;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
    },
  };
}
