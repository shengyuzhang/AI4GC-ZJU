"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import LinkChip from "@/components/site/LinkChip";
import SegmentedControl from "@/components/site/SegmentedControl";
import Tag from "@/components/site/Tag";
import { pick, useLang } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/initials";
import {
  motionEase,
  motionListEnter,
  motionListExit,
  motionListItemTransition,
  motionListShow,
  motionRevealEnter,
  motionRevealShow,
  motionDuration,
} from "@/lib/motion";
import type { GitHubStarsMap } from "@/lib/github-stars";
import type { HomeProject } from "@/types/lab";

const ALL_FILTER = "all";
const PROJECT_GRID_MAX_ROWS = 3;

const PROJECT_GRID_COLUMN_QUERIES = [
  { query: "(min-width: 1280px)", columns: 4 },
  { query: "(min-width: 1024px)", columns: 3 },
  { query: "(min-width: 768px)", columns: 2 },
] as const;

function useProjectGridColumns(): number {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const mediaQueries = PROJECT_GRID_COLUMN_QUERIES.map(({ query, columns: cols }) => ({
      mq: window.matchMedia(query),
      columns: cols,
    }));

    function syncColumns() {
      const match = mediaQueries.find(({ mq }) => mq.matches);
      setColumns(match?.columns ?? 1);
    }

    syncColumns();

    for (const { mq } of mediaQueries) {
      mq.addEventListener("change", syncColumns);
    }

    return () => {
      for (const { mq } of mediaQueries) {
        mq.removeEventListener("change", syncColumns);
      }
    };
  }, []);

  return columns;
}

type ProjectsPanelProps = {
  projects: HomeProject[];
  githubStars: GitHubStarsMap;
};

function collectTags(projects: HomeProject[]): string[] {
  const tags = new Set<string>();
  for (const project of projects) {
    for (const tag of project.tags ?? []) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

function ProjectCardVisual({ project }: { project: HomeProject }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = project.image;
  const alt = project.imageAlt ?? `${project.name} preview`;
  const showFallback = !imageSrc || failed;

  return (
    <div
      className={cn("project-card__visual", showFallback && "project-card__visual--fallback")}
    >
      {showFallback ? (
        <span className="project-card__fallback-initials" aria-hidden="true">
          {getInitials(project.name)}
        </span>
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="project-card__cover"
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function ProjectCard({
  project,
  githubStars,
}: {
  project: HomeProject;
  githubStars: GitHubStarsMap;
}) {
  const { lang } = useLang();
  const tags = project.tags ?? [];
  const descRef = useRef<HTMLParagraphElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTitleId = useId();
  const [truncated, setTruncated] = useState(false);

  const measureTruncation = useCallback(() => {
    const el = descRef.current;
    const card = el?.closest(".project-card");
    if (!el || !card) {
      return;
    }

    el.classList.remove("project-card__desc--clamped");
    const fullHeight = el.scrollHeight;
    const maxHeight = Number.parseFloat(
      getComputedStyle(card).getPropertyValue("--project-card-desc-block-height"),
    );
    setTruncated(Number.isFinite(maxHeight) && fullHeight > maxHeight + 1);
  }, []);

  useLayoutEffect(() => {
    measureTruncation();
  }, [project.desc, measureTruncation]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureTruncation();
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [measureTruncation]);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <article className="project-card">
      <ProjectCardVisual project={project} />
      <div className="project-card__body">
        <div className="project-card__intro">
          <h3 className="project-card__name">{project.name}</h3>
          {project.period ? <p className="project-card__period">{project.period}</p> : null}
        </div>
        {project.desc ? (
          <div className="project-card__desc-block">
            <div
              className={cn(
                "project-card__desc-view",
                truncated && "project-card__desc-view--truncated",
              )}
            >
              <p
                ref={descRef}
                className={cn("project-card__desc", truncated && "project-card__desc--clamped")}
              >
                {project.desc}
              </p>
            </div>
            <div className="project-card__desc-foot">
              {truncated ? (
                <button
                  type="button"
                  className="project-card__desc-more"
                  aria-haspopup="dialog"
                  onClick={openDialog}
                >
                  {pick(lang, "Read more", "阅读全文")}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        {tags.length > 0 || project.links.length > 0 ? (
          <footer className="project-card__footer">
            {tags.length > 0 ? (
              <div className="site-tag-list project-card__tags">
                {tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            ) : null}
            {project.links.length > 0 ? (
              <div className="site-link-chip-list project-card__links">
                {project.links.map((link) => (
                  <LinkChip key={link.href} link={link} githubStars={githubStars} />
                ))}
              </div>
            ) : null}
          </footer>
        ) : null}
        {project.desc ? (
          <dialog
            ref={dialogRef}
            className="project-card__dialog"
            aria-labelledby={dialogTitleId}
            onClose={closeDialog}
            onClick={(event) => {
              const dialog = dialogRef.current;
              if (!dialog) {
                return;
              }

              const rect = dialog.getBoundingClientRect();
              const clickedBackdrop =
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom;

              if (clickedBackdrop) {
                closeDialog();
              }
            }}
          >
            <div className="project-card__dialog-panel">
              <button
                type="button"
                className="project-card__dialog-close"
                aria-label={pick(lang, "Close", "关闭")}
                onClick={closeDialog}
              >
                <X aria-hidden size={16} strokeWidth={2.25} />
              </button>
              <div className="project-card__dialog-body">
                <h2 id={dialogTitleId} className="project-card__dialog-title">
                  {project.name}
                </h2>
                <p className="project-card__dialog-desc">{project.desc}</p>
              </div>
            </div>
          </dialog>
        ) : null}
      </div>
    </article>
  );
}

export default function ProjectsPanel({ projects, githubStars }: ProjectsPanelProps) {
  const { lang } = useLang();
  const reduceMotion = useReducedMotion();
  const gridColumns = useProjectGridColumns();
  const tags = useMemo(() => collectTags(projects), [projects]);
  const [activeTag, setActiveTag] = useState<string>(ALL_FILTER);
  const [page, setPage] = useState(0);

  const filterOptions = useMemo(
    () => [
      { value: ALL_FILTER, label: pick(lang, "All", "全部") },
      ...tags.map((tag) => ({ value: tag, label: tag })),
    ],
    [tags, lang],
  );

  const filteredProjects = useMemo(() => {
    if (activeTag === ALL_FILTER) {
      return projects;
    }
    return projects.filter((project) => (project.tags ?? []).includes(activeTag));
  }, [activeTag, projects]);

  const pageSize = gridColumns * PROJECT_GRID_MAX_ROWS;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const pageIndex = Math.min(page, totalPages - 1);

  const visibleProjects = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, pageIndex, pageSize]);

  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < totalPages - 1;

  function handleTagChange(value: string) {
    setActiveTag(value);
    setPage(0);
  }

  return (
    <div className="projects-panel">
      {tags.length > 0 ? (
        <div className="projects-panel__toolbar">
          <SegmentedControl
            value={activeTag}
            options={filterOptions}
            onChange={handleTagChange}
            ariaLabel={pick(lang, "Filter projects by topic", "按主题筛选项目")}
            className="projects-panel__filters"
          />
        </div>
      ) : null}
      <div className="projects-panel__stage">
        <AnimatePresence mode="wait" initial={false}>
          {visibleProjects.length > 0 ? (
            <motion.ul
              key={`project-grid-${activeTag}-${pageIndex}`}
              className="project-grid"
              layout
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : motionDuration.fast, ease: motionEase }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleProjects.map((project, index) => (
                <motion.li
                  key={project.id}
                  className="project-grid__item"
                  layout
                  initial={reduceMotion ? false : motionListEnter}
                  animate={motionListShow}
                  exit={
                    reduceMotion
                      ? undefined
                      : { ...motionListExit, transition: { duration: motionDuration.fast } }
                  }
                  transition={motionListItemTransition(index, reduceMotion)}
                >
                    <ProjectCard project={project} githubStars={githubStars} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <motion.p
              key="empty"
              className="projects-panel__empty"
            initial={reduceMotion ? false : motionRevealEnter}
            animate={motionRevealShow}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{
              duration: reduceMotion ? 0 : motionDuration.normal,
              ease: motionEase,
            }}
            >
              {pick(lang, "No projects match this filter.", "没有符合该筛选条件的项目。")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {totalPages > 1 ? (
        <nav
          className="section-actions section-actions--pagination projects-panel__pagination"
          aria-label={pick(lang, "Projects pagination", "项目翻页")}
        >
          <button
            type="button"
            className="hero-button hero-button--secondary"
            disabled={!canGoPrevious}
            onClick={() => setPage((current) => current - 1)}
          >
            {pick(lang, "Previous", "上一页")}
          </button>
          <span className="section-actions__page">
            {pageIndex + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="hero-button hero-button--secondary"
            disabled={!canGoNext}
            onClick={() => setPage((current) => current + 1)}
          >
            {pick(lang, "Next", "下一页")}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
