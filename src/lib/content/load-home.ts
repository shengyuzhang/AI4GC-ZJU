import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import matter from "gray-matter";
import { HOME_MODULE_FILE_PATTERN } from "@/lib/content/constants";
import { CONTENT_PATHS } from "@/lib/content/paths";
import { readYamlFile } from "@/lib/content/read-yaml";
import {
  homeContentSchema,
  homeHeroSchema,
  homeHighlightSchema,
  homeModuleSchema,
  homePartnerSchema,
  homeProjectSchema,
  homeSectionsSchema,
} from "@/lib/content/schema";
import { resolveId } from "@/lib/content/slug";
import { loadSiteConfig } from "@/lib/content/load-site";
import type { HomeContent, HomeHighlight, HomeModule, HomePartner, HomeProject } from "@/types/lab";

function parseHighlights(raw: unknown): HomeHighlight[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item, index) => {
    const record = item as Record<string, unknown>;
    return homeHighlightSchema.parse({
      ...record,
      id: resolveId(
        typeof record.id === "string" ? record.id : undefined,
        typeof record.label === "string" ? record.label : `highlight-${index}`,
        String(index),
      ),
    });
  });
}

function parseHighlightItems(raw: unknown, fallback: HomeHighlight[]): HomeHighlight[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return parseHighlights(raw);
  }
  return fallback;
}

function isLocalPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !value.startsWith("/") &&
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.startsWith("#")
  );
}

function resolveHomeModuleAssetPath(value: unknown, moduleId?: string): unknown {
  if (!moduleId || !isLocalPath(value)) {
    return value;
  }

  return `/home-assets/${moduleId}/${value.replace(/^\.\//, "")}`;
}

function parseProjects(raw: unknown, moduleId?: string): HomeProject[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const projects = raw.map((item, index) => {
    const record = item as Record<string, unknown>;
    return homeProjectSchema.parse({
      ...record,
      image: resolveHomeModuleAssetPath(record.image, moduleId),
      id: resolveId(
        typeof record.id === "string" ? record.id : undefined,
        typeof record.name === "string" ? record.name : `project-${index}`,
        String(index),
      ),
    });
  });

  // Projects are authored oldest→newest (each new project is appended to the
  // YAML). Display newest first everywhere (homepage panel + /projects) so the
  // most recently submitted work leads.
  return projects.reverse();
}

function parsePartners(raw: unknown, moduleId?: string): HomePartner[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item, index) => {
    const record = item as Record<string, unknown>;
    const logo =
      typeof record.logo === "string"
        ? record.logo
        : typeof record.image === "string"
          ? record.image
          : undefined;
    const photo = typeof record.photo === "string" ? record.photo : undefined;

    return homePartnerSchema.parse({
      ...record,
      logo: resolveHomeModuleAssetPath(logo, moduleId),
      photo: resolveHomeModuleAssetPath(photo, moduleId),
      id: resolveId(
        typeof record.id === "string" ? record.id : undefined,
        typeof record.name === "string" ? record.name : `partner-${index}`,
        String(index),
      ),
    });
  });
}

function resolveModuleId(record: Record<string, unknown>, index: number, fallbackId?: string): string {
  if (typeof record.id === "string" && record.id.trim()) {
    return record.id.trim();
  }
  if (fallbackId) {
    return fallbackId;
  }
  const seed =
    typeof record.title === "string"
      ? record.title
      : typeof record.type === "string"
        ? record.type
        : `module-${index}`;
  return resolveId(undefined, seed, String(index));
}

function parseModuleRecord(
  record: Record<string, unknown>,
  index: number,
  legacyHighlights: HomeHighlight[],
  fallbackId?: string,
): HomeModule {
  const type = record.type;

  if (type === "highlights") {
    return homeModuleSchema.parse({
      ...record,
      id: resolveModuleId(record, index, fallbackId),
      items: parseHighlightItems(record.items, legacyHighlights),
    });
  }

  if (type === "projects") {
    return homeModuleSchema.parse({
      ...record,
      id: resolveModuleId(record, index, fallbackId),
      items: parseProjects(record.items, fallbackId),
    });
  }

  if (type === "partners") {
    return homeModuleSchema.parse({
      ...record,
      id: resolveModuleId(record, index, fallbackId),
      items: parsePartners(record.items, fallbackId),
    });
  }

  return homeModuleSchema.parse({
    ...record,
    id: resolveModuleId(record, index, fallbackId),
  });
}

function parseModulesFromArray(
  modulesRaw: unknown[],
  legacyHighlights: HomeHighlight[],
): HomeModule[] {
  return modulesRaw.map((item, index) =>
    parseModuleRecord(item as Record<string, unknown>, index, legacyHighlights),
  );
}

function parseModules(raw: Record<string, unknown>, legacyHighlights: HomeHighlight[]): HomeModule[] {
  if (Array.isArray(raw.modules) && raw.modules.length > 0) {
    return parseModulesFromArray(raw.modules, legacyHighlights);
  }

  const sections = homeSectionsSchema.parse(
    typeof raw.sections === "object" && raw.sections !== null ? raw.sections : {},
  );

  const legacyModules: HomeModule[] = [
    homeModuleSchema.parse({
      id: "research-directions",
      type: "highlights",
      title: sections.directionsTitle,
      items: legacyHighlights,
    }),
    homeModuleSchema.parse({
      id: "news",
      type: "news",
      title: sections.newsTitle,
      source: "featured",
    }),
  ];

  return legacyModules;
}

function loadHero(siteName: string, raw: Record<string, unknown>): HomeContent["hero"] {
  const heroRaw =
    typeof raw.hero === "object" && raw.hero !== null
      ? (raw.hero as Record<string, unknown>)
      : raw;

  return homeHeroSchema.parse({
    ...heroRaw,
    kicker: typeof heroRaw.kicker === "string" ? heroRaw.kicker : siteName,
  });
}

type HomeModuleSource =
  | { kind: "yaml"; id: string; filePath: string }
  | { kind: "markdown"; id: string; filePath: string };

function listModuleSources(): HomeModuleSource[] {
  if (!existsSync(CONTENT_PATHS.homeModulesDir)) {
    return [];
  }

  const sources = new Map<string, HomeModuleSource>();

  for (const name of readdirSync(CONTENT_PATHS.homeModulesDir)) {
    const entryPath = path.join(CONTENT_PATHS.homeModulesDir, name);

    if (HOME_MODULE_FILE_PATTERN.test(name)) {
      const id = name.replace(/\.ya?ml$/i, "");
      sources.set(id, { kind: "yaml", id, filePath: entryPath });
      continue;
    }

    if (!statSync(entryPath).isDirectory()) {
      continue;
    }

    const indexYamlPath = path.join(entryPath, "index.yaml");
    const indexYmlPath = path.join(entryPath, "index.yml");
    const indexMarkdownPath = path.join(entryPath, "index.md");

    if (existsSync(indexYamlPath)) {
      sources.set(name, { kind: "yaml", id: name, filePath: indexYamlPath });
      continue;
    }

    if (existsSync(indexYmlPath)) {
      sources.set(name, { kind: "yaml", id: name, filePath: indexYmlPath });
      continue;
    }

    if (existsSync(indexMarkdownPath)) {
      sources.set(name, { kind: "markdown", id: name, filePath: indexMarkdownPath });
    }
  }

  return [...sources.values()];
}

function loadModuleSource(source: HomeModuleSource, index: number): HomeModule {
  if (source.kind === "markdown") {
    const { data, content } = matter(readFileSync(source.filePath, "utf-8"));
    const record: Record<string, unknown> = {
      ...(typeof data === "object" && data !== null ? data : {}),
      markdown: content.trim(),
    };
    delete record.body;

    // Optional Chinese body in a sibling `index.zh.md` (body only; frontmatter ignored).
    const zhPath = source.filePath.replace(/index\.md$/i, "index.zh.md");
    if (zhPath !== source.filePath && existsSync(zhPath)) {
      const { content: zhContent } = matter(readFileSync(zhPath, "utf-8"));
      const trimmed = zhContent.trim();
      if (trimmed) {
        record.markdownZh = trimmed;
      }
    }

    return parseModuleRecord(record, index, [], source.id);
  }

  const record = readYamlFile<Record<string, unknown>>(source.filePath);
  return parseModuleRecord(record, index, [], source.id);
}

function loadModuleOrder(moduleIds: string[]): string[] {
  if (!existsSync(CONTENT_PATHS.homeOrder)) {
    return moduleIds;
  }

  const orderRaw = readYamlFile<{ modules?: unknown }>(CONTENT_PATHS.homeOrder);
  if (!Array.isArray(orderRaw.modules)) {
    return moduleIds;
  }

  const ordered = orderRaw.modules.filter((id): id is string => typeof id === "string");
  const known = new Set(moduleIds);
  const result = ordered.filter((id) => known.has(id));

  for (const id of moduleIds) {
    if (!result.includes(id)) {
      result.push(id);
    }
  }

  return result;
}

function loadModulesFromDir(): HomeModule[] {
  const sources = listModuleSources();
  if (sources.length === 0) {
    return [];
  }

  const byId = new Map<string, HomeModule>();

  for (const [index, source] of sources.entries()) {
    const homeModule = loadModuleSource(source, index);
    byId.set(homeModule.id, homeModule);
  }

  const order = loadModuleOrder([...byId.keys()]);
  return order
    .map((id) => byId.get(id))
    .filter((entry): entry is HomeModule => entry !== undefined);
}

function loadHomeFromDir(): HomeContent {
  if (!existsSync(CONTENT_PATHS.homeHero)) {
    throw new Error("Missing content/home/hero.yaml");
  }

  const site = loadSiteConfig();
  const heroRaw = readYamlFile<Record<string, unknown>>(CONTENT_PATHS.homeHero);
  const hero = loadHero(site.name, heroRaw);
  const modules = loadModulesFromDir();

  if (modules.length === 0) {
    throw new Error("Missing homepage modules under content/home/modules/");
  }

  return homeContentSchema.parse({ hero, modules });
}

function loadHomeFromLegacyFile(): HomeContent {
  if (!existsSync(CONTENT_PATHS.home)) {
    throw new Error("Missing content/home/ (or legacy content/home.yaml)");
  }

  const site = loadSiteConfig();
  const raw = readYamlFile<Record<string, unknown>>(CONTENT_PATHS.home);
  const legacyHighlights = parseHighlights(raw.highlights);
  const hero = loadHero(site.name, raw);
  const modules = parseModules(raw, legacyHighlights);

  return homeContentSchema.parse({ hero, modules });
}

export function loadHomeContent(): HomeContent {
  if (existsSync(CONTENT_PATHS.homeHero)) {
    return loadHomeFromDir();
  }

  return loadHomeFromLegacyFile();
}
