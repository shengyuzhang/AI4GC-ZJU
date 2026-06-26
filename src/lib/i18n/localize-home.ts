import { pick, type Lang } from "@/lib/i18n/language-context";
import type {
  HomeContent,
  HomeModule,
  HomeProject,
  LinkItem,
  NewsItem,
} from "@/types/lab";

function localizeLink(link: LinkItem, lang: Lang): LinkItem {
  return { ...link, label: pick(lang, link.label, link.labelZh) };
}

function localizeModule(module: HomeModule, lang: Lang): HomeModule {
  const title = pick(lang, module.title, module.titleZh);

  switch (module.type) {
    case "highlights":
      return {
        ...module,
        title,
        items: module.items.map((item) => ({
          ...item,
          label: pick(lang, item.label, item.labelZh),
          content: pick(lang, item.content, item.contentZh),
          links: item.links.map((link) => localizeLink(link, lang)),
        })),
      };
    case "projects":
      return {
        ...module,
        title,
        items: module.items.map((project) => ({
          ...project,
          desc: pick(lang, project.desc, project.descZh),
          period: pick(lang, project.period, project.periodZh),
        })),
      };
    case "prose":
      return {
        ...module,
        title,
        markdown: pick(lang, module.markdown, module.markdownZh),
        body: lang === "zh" && module.bodyZh ? module.bodyZh : module.body,
      };
    case "news":
      return {
        ...module,
        title,
        loadMore: {
          ...module.loadMore,
          label: pick(lang, module.loadMore.label, module.loadMore.labelZh),
        },
      };
    case "links":
      return {
        ...module,
        title,
        links: module.links.map((link) => localizeLink(link, lang)),
      };
    case "partners":
    default:
      return { ...module, title };
  }
}

/** English `tags` stay stable for filtering; labels swap via aligned `tagsZh`. */
export function localizedProjectTagLabel(
  project: HomeProject,
  tag: string,
  lang: Lang,
): string {
  const index = (project.tags ?? []).indexOf(tag);
  if (lang === "zh" && index >= 0 && project.tagsZh?.[index]) {
    return project.tagsZh[index];
  }
  return tag;
}

export function localizedProjectTags(project: HomeProject, lang: Lang): string[] {
  return (project.tags ?? []).map((tag) => localizedProjectTagLabel(project, tag, lang));
}

export function localizedProjectTagFilterLabels(
  projects: HomeProject[],
  filterTags: string[],
  lang: Lang,
): Map<string, string> {
  const labels = new Map<string, string>();
  for (const tag of filterTags) {
    const owner = projects.find((project) => (project.tags ?? []).includes(tag));
    labels.set(tag, owner ? localizedProjectTagLabel(owner, tag, lang) : tag);
  }
  return labels;
}

/** Returns a HomeContent with its visible strings swapped to `lang` (English fallback). */
export function localizeHome(home: HomeContent, lang: Lang): HomeContent {
  if (lang === "en") {
    return home;
  }

  return {
    hero: {
      ...home.hero,
      title: pick(lang, home.hero.title, home.hero.titleZh),
      subtitle: pick(lang, home.hero.subtitle, home.hero.subtitleZh),
      kicker: pick(lang, home.hero.kicker, home.hero.kickerZh),
      actions: home.hero.actions.map((action) => localizeLink(action, lang)),
    },
    modules: home.modules.map((module) => localizeModule(module, lang)),
  };
}

function newsTypeSlug(type?: string): string | undefined {
  if (!type) return undefined;
  const slug = type
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || undefined;
}

/** Localizes news cards while keeping the badge colour keyed off the English type. */
export function localizeNews(items: NewsItem[], lang: Lang): NewsItem[] {
  if (lang === "en") {
    return items;
  }

  return items.map((item) => ({
    ...item,
    title: pick(lang, item.title, item.titleZh),
    desc: pick(lang, item.desc, item.descZh),
    type: pick(lang, item.type, item.typeZh),
    typeSlug: newsTypeSlug(item.type),
  }));
}
