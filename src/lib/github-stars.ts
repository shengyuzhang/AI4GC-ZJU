import type { HomeContent, LinkItem } from "@/types/lab";

export type GitHubStarsMap = Readonly<Record<string, number>>;

type GitHubRepoRef = {
  owner: string;
  repo: string;
};

type GitHubRepoResponse = {
  stargazers_count?: number;
};

const GITHUB_HOST = "github.com";

export function parseGitHubRepo(href: string): GitHubRepoRef | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (url.hostname.replace(/^www\./, "") !== GITHUB_HOST) {
    return null;
  }

  const [owner, rawRepo] = url.pathname.split("/").filter(Boolean);
  if (!owner || !rawRepo) {
    return null;
  }

  const repo = rawRepo.replace(/\.git$/i, "");
  if (!repo || ["tree", "blob", "releases", "issues", "pull"].includes(repo)) {
    return null;
  }

  return { owner, repo };
}

/**
 * True only for a bare repo-root link (`github.com/owner/repo`, no extra path or
 * `#anchor`). Star badges attach to these; secondary links to the same repo
 * (e.g. a `…#readme` doc link) should not duplicate the count.
 */
export function isGitHubRepoRootHref(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }

  if (url.hash || url.hostname.replace(/^www\./, "") !== GITHUB_HOST) {
    return false;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  return segments.length === 2 && parseGitHubRepo(href) !== null;
}

export function normalizeGitHubHref(href: string): string | null {
  const parsed = parseGitHubRepo(href);
  if (!parsed) {
    return null;
  }

  return `https://${GITHUB_HOST}/${parsed.owner}/${parsed.repo}`;
}

export function formatStarCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 10_000) {
    return `${Math.round(count / 100) / 10}k`.replace(/\.0k$/, "k");
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(count);
}

export function getGitHubStars(href: string, starsMap: GitHubStarsMap): number | undefined {
  const key = normalizeGitHubHref(href);
  if (!key) {
    return undefined;
  }
  return starsMap[key];
}

function collectLinksFromItems(items: Array<{ links: LinkItem[] }>): string[] {
  return items.flatMap((item) => item.links.map((link) => link.href));
}

export function collectGitHubHrefsFromHome(home: HomeContent): string[] {
  const hrefs: string[] = [];

  for (const homeModule of home.modules) {
    if (homeModule.type === "highlights" || homeModule.type === "projects") {
      hrefs.push(...collectLinksFromItems(homeModule.items));
    }
  }

  return hrefs;
}

export function collectGitHubHrefsFromNewsItems(
  items: Array<{ links: LinkItem[]; href?: string }>,
): string[] {
  return items.flatMap((item) => {
    if (item.links.length > 0) {
      return item.links.map((link) => link.href);
    }
    return item.href ? [item.href] : [];
  });
}

export function collectGitHubHrefsFromPublications(
  publications: Array<{ links: LinkItem[] }>,
): string[] {
  return publications.flatMap((pub) => pub.links.map((link) => link.href));
}

export function collectGitHubHrefsFromLinkItems(links: LinkItem[]): string[] {
  return links.map((link) => link.href);
}

async function fetchRepoStars(ref: GitHubRepoRef): Promise<number | null> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai4gc-lab-website",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com/repos/${ref.owner}/${ref.repo}`, {
    headers,
    next: { revalidate: 3600 },
  }).catch(() => null);

  if (!response) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GitHubRepoResponse;
  return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
}

export async function fetchGitHubStarsMap(hrefs: string[]): Promise<GitHubStarsMap> {
  const uniqueKeys = [
    ...new Set(
      hrefs
        .map((href) => normalizeGitHubHref(href))
        .filter((href): href is string => href !== null),
    ),
  ];

  const entries = await Promise.all(
    uniqueKeys.map(async (href) => {
      const parsed = parseGitHubRepo(href);
      if (!parsed) {
        return null;
      }

      const stars = await fetchRepoStars(parsed);
      return stars != null ? ([href, stars] as const) : null;
    }),
  );

  return Object.fromEntries(entries.filter((entry): entry is readonly [string, number] => entry !== null));
}
