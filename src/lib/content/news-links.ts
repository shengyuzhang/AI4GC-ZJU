import type { LinkItem, NewsItem } from "@/types/lab";

/**
 * Resource chips shown under a news item.
 *
 * `href` drives only the clickable title (see NewsListItem); it is NOT turned
 * into a chip. Use explicit `links` for buttons — that way a title-only item
 * can link its title without also rendering a redundant "Paper" button.
 */
export function getNewsLinks(item: NewsItem): LinkItem[] {
  return item.links;
}

export function resolveHeroFeaturedNews(
  featuredNews: { id: string } | undefined,
  items: NewsItem[],
): NewsItem | null {
  if (!featuredNews?.id) {
    return null;
  }
  return items.find((item) => item.id === featuredNews.id) ?? null;
}
