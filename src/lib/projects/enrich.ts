import {
  isGitHubRepoRootHref,
  normalizeGitHubHref,
  parseGitHubRepo,
  type GitHubStarsMap,
} from "@/lib/github-stars";
import type { HomeProject } from "@/types/lab";

/**
 * Live metadata auto-extracted from a project's GitHub repository at build time.
 * Every field is optional — the page falls back to authored content (and the
 * build stays green) when GitHub is unreachable or a project has no repo link.
 */
export type ProjectEnrichment = {
  repoUrl?: string;
  stars?: number;
  /** Repo `description`, used only as a fallback when no `desc` is authored. */
  description?: string;
  /** Primary language reported by GitHub (e.g. "TypeScript"). */
  language?: string;
  topics?: string[];
  /** ISO timestamp of the last push, shown as "Updated {Mon YYYY}". */
  updatedAt?: string;
  /** Repo `homepage`, used as a fallback project-page link. */
  homepage?: string;
  /** Owner avatar, used as a visual fallback when a project has no image. */
  ownerAvatar?: string;
};

export type ProjectsEnrichmentResult = {
  enrichment: Record<string, ProjectEnrichment>;
  /** Stars keyed by canonical repo href, for `LinkChip` star badges. */
  githubStars: GitHubStarsMap;
};

type GitHubRepoResponse = {
  stargazers_count?: number;
  description?: string | null;
  language?: string | null;
  topics?: string[];
  pushed_at?: string;
  updated_at?: string;
  homepage?: string | null;
  owner?: { avatar_url?: string };
  html_url?: string;
};

/** Canonical GitHub repo-root keys on a project, in link order, deduped. */
function projectRepoKeys(project: HomeProject): string[] {
  const keys: string[] = [];
  for (const link of project.links) {
    if (!isGitHubRepoRootHref(link.href)) continue;
    const key = normalizeGitHubHref(link.href);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

async function fetchRepo(owner: string, repo: string): Promise<GitHubRepoResponse | null> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai4gc-lab-website",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    next: { revalidate: 3600 },
  }).catch(() => null);

  if (!response || !response.ok) {
    return null;
  }

  return (await response.json().catch(() => null)) as GitHubRepoResponse | null;
}

export async function enrichProjects(projects: HomeProject[]): Promise<ProjectsEnrichmentResult> {
  const enrichment: Record<string, ProjectEnrichment> = {};
  const githubStars: Record<string, number> = {};

  // Fetch every distinct repo once (a project like InfiGUI Series links several).
  const repoData = new Map<string, GitHubRepoResponse>();
  const allKeys = [...new Set(projects.flatMap(projectRepoKeys))];
  await Promise.all(
    allKeys.map(async (key) => {
      const ref = parseGitHubRepo(key);
      if (!ref) return;
      const data = await fetchRepo(ref.owner, ref.repo);
      if (!data) return;
      repoData.set(key, data);
      if (typeof data.stargazers_count === "number") {
        // Star badge for each individual link chip (InfiGUIAgent / -R1 / -G1).
        githubStars[key] = data.stargazers_count;
      }
    }),
  );

  for (const project of projects) {
    const keys = projectRepoKeys(project);
    if (keys.length === 0) continue;

    // Metadata (language/topics/updated/avatar/desc) comes from the first repo;
    // the row's ★ total sums stars across all the project's repos.
    const primary = repoData.get(keys[0]);
    let starSum = 0;
    let hasStars = false;
    for (const key of keys) {
      const count = repoData.get(key)?.stargazers_count;
      if (typeof count === "number") {
        starSum += count;
        hasStars = true;
      }
    }

    const topics = primary?.topics;
    enrichment[project.id] = {
      repoUrl: primary?.html_url ?? keys[0],
      stars: hasStars ? starSum : undefined,
      description: primary?.description?.trim() || undefined,
      language: primary?.language?.trim() || undefined,
      topics: Array.isArray(topics) && topics.length > 0 ? topics.slice(0, 6) : undefined,
      updatedAt: primary?.pushed_at || primary?.updated_at || undefined,
      homepage: primary?.homepage?.trim() || undefined,
      ownerAvatar: primary?.owner?.avatar_url || undefined,
    };
  }

  return { enrichment, githubStars };
}
