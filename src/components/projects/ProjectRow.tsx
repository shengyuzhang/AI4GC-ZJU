"use client";

import { useState } from "react";
import LinkChip from "@/components/site/LinkChip";
import Tag from "@/components/site/Tag";
import { formatStarCount, type GitHubStarsMap } from "@/lib/github-stars";
import { getInitials } from "@/lib/initials";
import { pick, useLang } from "@/lib/i18n/language-context";
import { localizedProjectTagLabel } from "@/lib/i18n/localize-home";
import type { ProjectEnrichment } from "@/lib/projects/enrich";
import { cn } from "@/lib/utils";
import type { HomeProject } from "@/types/lab";

type ProjectRowProps = {
  project: HomeProject;
  enrichment?: ProjectEnrichment;
  githubStars: GitHubStarsMap;
};

/** GitHub-style language dots; falls back to the brand accent for the long tail. */
const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  C: "#555555",
  "C++": "#f34b7d",
  Cuda: "#3A4E3A",
  Rust: "#dea584",
  Go: "#00ADD8",
  Shell: "#89e051",
  Java: "#b07219",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

function languageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "var(--color-brand)";
}

function formatMonthYear(iso: string): string | undefined {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export default function ProjectRow({ project, enrichment, githubStars }: ProjectRowProps) {
  const { lang } = useLang();
  const [imageFailed, setImageFailed] = useState(false);

  const desc = pick(lang, project.desc, project.descZh) || enrichment?.description;
  const period = pick(lang, project.period, project.periodZh);
  const tags = project.tags ?? [];

  const imageSrc = imageFailed ? undefined : (project.image ?? enrichment?.ownerAvatar);
  const language = enrichment?.language;
  const stars = enrichment?.stars;
  const updated = enrichment?.updatedAt ? formatMonthYear(enrichment.updatedAt) : undefined;
  const hasStats = Boolean(language) || stars != null || Boolean(updated);

  return (
    <article className="project-row">
      <div className={cn("project-row__visual", !imageSrc && "project-row__visual--fallback")}>
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- source may be a remote GitHub avatar
          <img
            className="project-row__cover"
            src={imageSrc}
            alt={project.imageAlt ?? `${project.name} preview`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="project-row__initials" aria-hidden="true">
            {getInitials(project.name)}
          </span>
        )}
      </div>

      <div className="project-row__main">
        <header className="project-row__head">
          <div className="project-row__titles">
            <h2 className="project-row__name">{project.name}</h2>
            {period ? <p className="project-row__period">{period}</p> : null}
          </div>
          {hasStats ? (
            <div className="project-row__stats" aria-label={pick(lang, "Repository stats", "仓库指标")}>
              {language ? (
                <span className="project-row__stat">
                  <span
                    className="project-row__lang-dot"
                    style={{ background: languageColor(language) }}
                    aria-hidden="true"
                  />
                  {language}
                </span>
              ) : null}
              {stars != null ? (
                <span className="project-row__stat">
                  <span className="project-row__star" aria-hidden="true">
                    ★
                  </span>
                  {formatStarCount(stars)}
                </span>
              ) : null}
              {updated ? (
                <span className="project-row__stat project-row__stat--muted">
                  {pick(lang, "Updated", "更新于")} {updated}
                </span>
              ) : null}
            </div>
          ) : null}
        </header>

        {desc ? <p className="project-row__desc">{desc}</p> : null}

        {tags.length > 0 ? (
          <div className="site-tag-list project-row__tags">
            {tags.map((tag) => (
              <Tag key={tag} label={localizedProjectTagLabel(project, tag, lang)} />
            ))}
          </div>
        ) : null}

        {project.links.length > 0 ? (
          <div className="site-link-chip-list project-row__links">
            {project.links.map((link) => (
              <LinkChip key={link.href} link={link} githubStars={githubStars} showIcon />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
