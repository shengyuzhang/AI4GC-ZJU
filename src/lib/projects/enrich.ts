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

/** First canonical GitHub repo-root link on a project, if any. */
function projectRepoHref(project: HomeProject): string | undefined {
  return project.links.find((link) => isGitHubRepoRootHref(link.href))?.href;
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

  await Promise.all(
    projects.map(async (project) => {
      const href = projectRepoHref(project);
      if (!href) {
        return;
      }
      const ref = parseGitHubRepo(href);
      if (!ref) {
        return;
      }
      const data = await fetchRepo(ref.owner, ref.repo);
      if (!data) {
        return;
      }

      const stars = typeof data.stargazers_count === "number" ? data.stargazers_count : undefined;
      enrichment[project.id] = {
        repoUrl: data.html_url ?? normalizeGitHubHref(href) ?? undefined,
        stars,
        description: data.description?.trim() || undefined,
        language: data.language?.trim() || undefined,
        topics: Array.isArray(data.topics) && data.topics.length > 0 ? data.topics.slice(0, 6) : undefined,
        updatedAt: data.pushed_at || data.updated_at || undefined,
        homepage: data.homepage?.trim() || undefined,
        ownerAvatar: data.owner?.avatar_url || undefined,
      };

      const key = normalizeGitHubHref(href);
      if (key && stars != null) {
        githubStars[key] = stars;
      }
    }),
  );

  return { enrichment, githubStars };
}
