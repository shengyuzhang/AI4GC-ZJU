"use client";

import { useEffect, useMemo, useState } from "react";
import ContentSection from "@/components/layout/ContentSection";
import ProjectRow from "@/components/projects/ProjectRow";
import SegmentedControl from "@/components/site/SegmentedControl";
import type { GitHubStarsMap } from "@/lib/github-stars";
import { pick, useLang } from "@/lib/i18n/language-context";
import { localizedProjectTagLabel, sortProjectTags } from "@/lib/i18n/localize-home";
import type { ProjectEnrichment } from "@/lib/projects/enrich";
import type { HomeProject } from "@/types/lab";

const ALL_FILTER = "all";

type ProjectsPageClientProps = {
  projects: HomeProject[];
  enrichment: Record<string, ProjectEnrichment>;
  githubStars: GitHubStarsMap;
  /** When set (deep link /projects/{slug}), scroll that row to center + flash. */
  focusSlug?: string;
};

export default function ProjectsPageClient({
  projects,
  enrichment,
  githubStars,
  focusSlug,
}: ProjectsPageClientProps) {
  const { lang } = useLang();
  const [activeTag, setActiveTag] = useState<string>(ALL_FILTER);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const project of projects) {
      for (const tag of project.tags ?? []) {
        set.add(tag);
      }
    }
    return sortProjectTags(Array.from(set));
  }, [projects]);

  const effectiveTag = activeTag === ALL_FILTER || tags.includes(activeTag) ? activeTag : ALL_FILTER;

  const filtered = useMemo(
    () =>
      effectiveTag === ALL_FILTER
        ? projects
        : projects.filter((project) => (project.tags ?? []).includes(effectiveTag)),
    [projects, effectiveTag],
  );

  // English tags are the stable filter keys; labels swap via aligned tagsZh.
  const tagLabel = (tag: string): string => {
    for (const project of projects) {
      if ((project.tags ?? []).includes(tag)) {
        return localizedProjectTagLabel(project, tag, lang);
      }
    }
    return tag;
  };

  const filterOptions = [
    { value: ALL_FILTER, label: pick(lang, "All", "全部") },
    ...tags.map((tag) => ({ value: tag, label: tagLabel(tag) })),
  ];

  // Deep link /projects/{slug}: center the target row (visible by default since
  // the filter starts on "All") and flash a brief highlight once it's laid out.
  useEffect(() => {
    if (!focusSlug) return;
    let raf = 0;
    let timeout = 0;
    const focus = (remaining: number) => {
      const target = document.getElementById(focusSlug);
      if (!target) {
        if (remaining > 0) raf = requestAnimationFrame(() => focus(remaining - 1));
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.remove("project-row--flash");
      void target.offsetWidth;
      target.classList.add("project-row--flash");
      timeout = window.setTimeout(() => target.classList.remove("project-row--flash"), 2600);
    };
    focus(40);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [focusSlug]);

  return (
    <main>
      <ContentSection className="section-page-body">
        <div className="projects-page">
          <header className="projects-page__head">
            <h1 className="section-title-lg">{pick(lang, "Projects", "研究项目")}</h1>
            <p className="projects-page__lead">
              {pick(
                lang,
                "Open-source systems, agents, and benchmarks from AI4GC Lab. Live metrics — stars, language, and last update — are pulled automatically from each project's GitHub repository.",
                "AI4GC 实验室的开源系统、智能体与基准测试。下方的实时指标（星标、主要语言、最近更新）均自动取自各项目的 GitHub 仓库。",
              )}
            </p>
          </header>

          {tags.length > 0 ? (
            <div className="projects-page__toolbar">
              <SegmentedControl
                value={effectiveTag}
                options={filterOptions}
                onChange={setActiveTag}
                ariaLabel={pick(lang, "Filter projects by topic", "按主题筛选项目")}
              />
            </div>
          ) : null}

          {filtered.length > 0 ? (
            <ul className="project-row-list">
              {filtered.map((project) => (
                <li key={project.id} className="project-row-list__item">
                  <ProjectRow
                    project={project}
                    enrichment={enrichment[project.id]}
                    githubStars={githubStars}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="projects-panel__empty">
              {pick(lang, "No projects match this filter.", "没有符合该筛选条件的项目。")}
            </p>
          )}
        </div>
      </ContentSection>
    </main>
  );
}
