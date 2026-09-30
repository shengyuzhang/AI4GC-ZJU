"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Cpu,
  FileText,
  Hourglass,
  MapPin,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import HomeReveal from "@/components/home/HomeReveal";
import MemberAvatar from "@/components/site/MemberAvatar";
import { newsDateTimeAttr } from "@/lib/content/date";
import { pick, useLang, type Lang } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import type { RecruitMentor, RecruitPage, RecruitProject } from "@/types/lab";

const ALL_FILTER = "all";

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  mentor: UserRound,
  paper: FileText,
  compute: Cpu,
  path: Compass,
};

type RecruitPageClientProps = {
  page: RecruitPage;
  projects: RecruitProject[];
  publicationCount: number;
};

/** Localized list: the `*Zh` array when in 中文 mode and non-empty, else English. */
function pickList(lang: Lang, en: string[], zh?: string[]): string[] {
  return lang === "zh" && zh && zh.length > 0 ? zh : en;
}

function uniqueMentors(projects: RecruitProject[]): RecruitMentor[] {
  const seen = new Map<string, RecruitMentor>();
  for (const project of projects) {
    for (const mentor of project.mentors) {
      seen.set(mentor.id, mentor);
    }
  }
  return Array.from(seen.values());
}

export default function RecruitPageClient({
  page,
  projects,
  publicationCount,
}: RecruitPageClientProps) {
  const { lang } = useLang();
  const [activeTag, setActiveTag] = useState<string>(ALL_FILTER);

  const openProjects = projects.filter((project) => project.status === "open");
  const mentors = useMemo(() => uniqueMentors(openProjects), [openProjects]);
  const openSeats = openProjects.reduce((sum, project) => sum + (project.openings ?? 1), 0);

  // English tags are the stable filter keys; labels swap via aligned tagsZh.
  const tagOptions = useMemo(() => {
    const labels = new Map<string, string>();
    for (const project of projects) {
      project.tags.forEach((tag, index) => {
        if (!labels.has(tag)) {
          labels.set(tag, pick(lang, tag, project.tagsZh?.[index]));
        }
      });
    }
    return Array.from(labels, ([value, label]) => ({ value, label }));
  }, [projects, lang]);

  const effectiveTag =
    activeTag === ALL_FILTER || tagOptions.some((option) => option.value === activeTag)
      ? activeTag
      : ALL_FILTER;
  const filtered =
    effectiveTag === ALL_FILTER
      ? projects
      : projects.filter((project) => project.tags.includes(effectiveTag));

  const applyLabel = pick(lang, page.apply.label, page.apply.labelZh);

  return (
    <main className="recruit">
      <section className="recruit-hero">
        <div className="recruit-hero__glow" aria-hidden="true" />
        <div className="site-container recruit-hero__inner">
          <div className="recruit-hero__main">
            {page.hero.kicker ? (
              <p className="recruit-hero__kicker">
                <span className="recruit-live-dot" aria-hidden="true" />
                {pick(lang, page.hero.kicker, page.hero.kickerZh)}
              </p>
            ) : null}
            <h1 className="recruit-hero__title">{pick(lang, page.hero.title, page.hero.titleZh)}</h1>
            {page.hero.subtitle ? (
              <p className="recruit-hero__subtitle">
                {pick(lang, page.hero.subtitle, page.hero.subtitleZh)}
              </p>
            ) : null}
            <div className="recruit-hero__actions">
              <a href="#open-projects" className="recruit-btn recruit-btn--primary">
                {pick(lang, "Browse open projects", "查看开放项目")}
                <ArrowRight aria-hidden="true" size={16} />
              </a>
              <a href="#how-it-works" className="recruit-btn recruit-btn--ghost">
                {pick(lang, "How it works", "了解流程")}
              </a>
            </div>
          </div>

          <aside className="recruit-hero__panel" aria-label={pick(lang, "At a glance", "概览")}>
            <dl className="recruit-stats">
              <div className="recruit-stat">
                <dt>{pick(lang, "Open projects", "开放项目")}</dt>
                <dd>{openProjects.length}</dd>
              </div>
              <div className="recruit-stat">
                <dt>{pick(lang, "Intern seats", "实习名额")}</dt>
                <dd>{openSeats}</dd>
              </div>
              <div className="recruit-stat">
                <dt>{pick(lang, "Lab publications", "实验室论文")}</dt>
                <dd>{publicationCount}+</dd>
              </div>
            </dl>
            {mentors.length > 0 ? (
              <div className="recruit-hero__mentors">
                <p className="recruit-hero__mentors-label">
                  {pick(lang, "Mentored by our PhD students", "由实验室博士生带队")}
                </p>
                <ul className="recruit-avatar-stack">
                  {mentors.map((mentor) => (
                    <li key={mentor.id} title={mentor.name}>
                      <MemberAvatar src={mentor.photo} name={mentor.name} size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {page.steps.length > 0 ? (
        <section className="recruit-section" id="how-it-works">
          <div className="site-container">
            <HomeReveal>
              <header className="recruit-section__head">
                <p className="recruit-eyebrow">{pick(lang, "How it works", "如何运作")}</p>
                <h2 className="recruit-section__title">
                  {pick(lang, "One PhD student. One project. You.", "一位博士生，一个项目，还有你。")}
                </h2>
              </header>
            </HomeReveal>
            <ol className="recruit-steps">
              {page.steps.map((step, index) => (
                <li key={step.title} className="recruit-step">
                  <HomeReveal delay={index * 0.06}>
                    <span className="recruit-step__index">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="recruit-step__title">{pick(lang, step.title, step.titleZh)}</h3>
                    <p className="recruit-step__desc">{pick(lang, step.desc, step.descZh)}</p>
                  </HomeReveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {page.benefits.length > 0 ? (
        <section className="recruit-section recruit-section--soft">
          <div className="site-container">
            <HomeReveal>
              <header className="recruit-section__head">
                <p className="recruit-eyebrow">{pick(lang, "Why intern with us", "为什么加入")}</p>
                <h2 className="recruit-section__title">
                  {pick(lang, "Research experience that actually counts", "真正算数的科研经历")}
                </h2>
              </header>
            </HomeReveal>
            <ul className="recruit-benefits">
              {page.benefits.map((benefit, index) => {
                const Icon = BENEFIT_ICONS[benefit.icon ?? ""] ?? Check;
                return (
                  <li key={benefit.title}>
                    <HomeReveal delay={index * 0.06} className="recruit-benefit">
                      <span className="recruit-benefit__icon" aria-hidden="true">
                        <Icon size={20} strokeWidth={1.8} />
                      </span>
                      <h3 className="recruit-benefit__title">
                        {pick(lang, benefit.title, benefit.titleZh)}
                      </h3>
                      <p className="recruit-benefit__desc">{pick(lang, benefit.desc, benefit.descZh)}</p>
                    </HomeReveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="recruit-section" id="open-projects">
        <div className="site-container">
          <HomeReveal>
            <header className="recruit-section__head">
              <p className="recruit-eyebrow">{pick(lang, "Open projects", "开放项目")}</p>
              <h2 className="recruit-section__title">
                {pick(lang, "Pick the project you want to build", "挑一个你想做的项目")}
              </h2>
              {tagOptions.length > 1 ? (
                <div
                  className="recruit-filter"
                  role="group"
                  aria-label={pick(lang, "Filter projects by topic", "按主题筛选项目")}
                >
                  {[{ value: ALL_FILTER, label: pick(lang, "All", "全部") }, ...tagOptions].map(
                    (option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="recruit-filter__chip"
                        aria-pressed={effectiveTag === option.value}
                        onClick={() => setActiveTag(option.value)}
                      >
                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              ) : null}
            </header>
          </HomeReveal>

          {filtered.length > 0 ? (
            <ul className="recruit-projects">
              {filtered.map((project) => (
                <li key={project.id} id={project.id}>
                  <RecruitProjectCard
                    project={project}
                    lang={lang}
                    applyHref={project.applyHref ?? page.apply.href}
                    applyLabel={applyLabel}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="recruit-empty">
              {pick(lang, "No projects match this filter.", "没有符合该筛选条件的项目。")}
            </p>
          )}
        </div>
      </section>

      {page.faq.length > 0 ? (
        <section className="recruit-section recruit-section--soft">
          <div className="site-container recruit-faq-layout">
            <header className="recruit-section__head">
              <p className="recruit-eyebrow">FAQ</p>
              <h2 className="recruit-section__title">{pick(lang, "Good questions", "常见问题")}</h2>
            </header>
            <div className="recruit-faq">
              {page.faq.map((item) => (
                <details key={item.q} className="recruit-faq__item">
                  <summary>
                    <span>{pick(lang, item.q, item.qZh)}</span>
                    <ChevronDown aria-hidden="true" size={18} className="recruit-faq__chevron" />
                  </summary>
                  <p>{pick(lang, item.a, item.aZh)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="recruit-cta">
        <div className="site-container recruit-cta__inner">
          <div>
            <h2 className="recruit-cta__title">
              {pick(lang, "Ready to build something real?", "准备好做点真东西了吗？")}
            </h2>
            {page.apply.note ? (
              <p className="recruit-cta__note">{pick(lang, page.apply.note, page.apply.noteZh)}</p>
            ) : null}
          </div>
          <a
            href={page.apply.href}
            className="recruit-btn recruit-btn--primary recruit-btn--lg"
            {...(page.apply.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {applyLabel}
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}

type RecruitProjectCardProps = {
  project: RecruitProject;
  lang: Lang;
  applyHref: string;
  applyLabel: string;
};

function RecruitProjectCard({ project, lang, applyHref, applyLabel }: RecruitProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isOpen = project.status === "open";

  const tasks = pickList(lang, project.tasks, project.tasksZh);
  const requirements = pickList(lang, project.requirements, project.requirementsZh);
  const niceToHave = pickList(lang, project.niceToHave, project.niceToHaveZh);
  const hasDetails =
    tasks.length > 0 || requirements.length > 0 || niceToHave.length > 0 || project.links.length > 0;
  const detailsId = `${project.id}-details`;

  const meta = [
    { icon: Hourglass, value: pick(lang, project.duration, project.durationZh) },
    { icon: Clock, value: pick(lang, project.commitment, project.commitmentZh) },
    { icon: MapPin, value: pick(lang, project.mode, project.modeZh) },
  ].filter((item): item is { icon: LucideIcon; value: string } => Boolean(item.value));

  const seats = project.openings ?? 1;

  return (
    <article className={cn("recruit-card", !isOpen && "recruit-card--filled")}>
      <div className="recruit-card__top">
        <span className={cn("recruit-status", isOpen ? "recruit-status--open" : "recruit-status--filled")}>
          {isOpen ? (
            <>
              <span className="recruit-live-dot" aria-hidden="true" />
              {pick(lang, `Open · ${seats} ${seats > 1 ? "seats" : "seat"}`, `招募中 · ${seats} 个名额`)}
            </>
          ) : (
            pick(lang, "Filled", "已招满")
          )}
        </span>
        <span className="recruit-card__meta-top">
          <code className="recruit-card__id" title={pick(lang, "Project ID", "项目编号")}>
            #{project.id}
          </code>
          <time className="recruit-card__date" dateTime={newsDateTimeAttr(project.postedAt)}>
            {project.postedAt}
          </time>
        </span>
      </div>

      <h3 className="recruit-card__title">{pick(lang, project.title, project.titleZh)}</h3>
      <p className="recruit-card__summary">{pick(lang, project.summary, project.summaryZh)}</p>

      {project.tags.length > 0 ? (
        <div className="site-tag-list">
          {project.tags.map((tag, index) => (
            <span key={tag} className="site-tag site-tag--brand">
              {pick(lang, tag, project.tagsZh?.[index])}
            </span>
          ))}
        </div>
      ) : null}

      {meta.length > 0 ? (
        <ul className="recruit-card__meta">
          {meta.map(({ icon: Icon, value }) => (
            <li key={value}>
              <Icon aria-hidden="true" size={15} strokeWidth={1.9} />
              {value}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="recruit-card__mentors">
        {project.mentors.map((mentor) => {
          const body = (
            <>
              <MemberAvatar src={mentor.photo} name={mentor.name} size="sm" className="recruit-mentor__avatar" />
              <span className="recruit-mentor__text">
                <span className="recruit-mentor__role">{pick(lang, "PhD mentor", "博士生导师")}</span>
                <span className="recruit-mentor__name">{mentor.name}</span>
              </span>
            </>
          );
          return mentor.href ? (
            <Link key={mentor.id} href={mentor.href} className="recruit-mentor recruit-mentor--link">
              {body}
            </Link>
          ) : (
            <span key={mentor.id} className="recruit-mentor">
              {body}
            </span>
          );
        })}
      </div>

      {hasDetails ? (
        <div id={detailsId} className="recruit-card__details" hidden={!expanded}>
          <RecruitList title={pick(lang, "What you'll do", "你将参与")} items={tasks} />
          <RecruitList title={pick(lang, "We're looking for", "我们希望你")} items={requirements} />
          <RecruitList title={pick(lang, "Nice to have", "加分项")} items={niceToHave} />
          {project.links.length > 0 ? (
            <div className="recruit-card__links">
              <p className="recruit-list__title">{pick(lang, "Related work", "相关工作")}</p>
              <div className="site-link-chip-list">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="site-link-chip"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pick(lang, link.label, link.labelZh)}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="recruit-card__footer">
        {hasDetails ? (
          <button
            type="button"
            className="recruit-card__toggle"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? pick(lang, "Hide details", "收起详情") : pick(lang, "View details", "查看详情")}
            <ChevronDown aria-hidden="true" size={16} className="recruit-card__toggle-icon" />
          </button>
        ) : (
          <span />
        )}
        {isOpen ? (
          <a
            href={applyHref}
            className="recruit-btn recruit-btn--primary recruit-btn--sm"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${applyLabel} — ${project.title}`}
          >
            {pick(lang, "Apply", "申请")}
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        ) : null}
      </div>

    </article>
  );
}

function RecruitList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="recruit-list">
      <p className="recruit-list__title">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Check aria-hidden="true" size={15} strokeWidth={2.2} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
