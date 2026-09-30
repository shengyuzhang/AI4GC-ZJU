import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";
import { CONTENT_DIR, readText, resolveContentPath, writeText } from "@/lib/admin/content-store";

export const EDITABLE_CONTENT_EXTENSIONS = new Set([
  ".yaml",
  ".yml",
  ".md",
  ".bib",
  ".txt",
  ".json",
]);

export type AdminFileEntry = {
  path: string;
  name: string;
  kind: "file" | "directory";
  section: string;
  size?: number;
  updatedAt?: string;
};

export const CONTENT_SECTIONS = [
  {
    id: "site",
    label: "Site",
    description: "Global identity, navigation, footer, page heroes, and team copy.",
    root: "",
    match: (relativePath: string) => relativePath === "site.yaml",
  },
  {
    id: "home",
    label: "Home",
    description: "Homepage hero, section order, research directions, projects, news, and partners.",
    root: "home",
    match: (relativePath: string) => relativePath === "home.yaml" || relativePath.startsWith("home/"),
  },
  {
    id: "news",
    label: "News",
    description: "Dated updates shown on the home and news pages.",
    root: "news",
    match: (relativePath: string) => relativePath.startsWith("news/"),
  },
  {
    id: "blog",
    label: "Blog",
    description: "Markdown posts and local blog assets.",
    root: "blog",
    match: (relativePath: string) => relativePath.startsWith("blog/"),
  },
  {
    id: "team",
    label: "Team",
    description: "Member profiles, profile bodies, local photos, and per-member BibTeX.",
    root: "team",
    match: (relativePath: string) => relativePath.startsWith("team/"),
  },
  {
    id: "recruit",
    label: "Recruit",
    description: "Internship page copy and PhD-led projects open for interns.",
    root: "recruit",
    match: (relativePath: string) => relativePath.startsWith("recruit/"),
  },
  {
    id: "publications",
    label: "Publications",
    description: "Global publication BibTeX used by the publications page.",
    root: "",
    match: (relativePath: string) => relativePath === "publications.bib",
  },
  {
    id: "assets",
    label: "Assets",
    description: "Site-level assets served from content/assets via /content-assets/.",
    root: "assets",
    match: (relativePath: string) => relativePath.startsWith("assets/"),
  },
];

function normalizeContentPath(input: string): string {
  return input.replace(/\\/g, "/").replace(/^\/+/, "").trim();
}

export function assertEditableContentFile(relativePath: string): string {
  const normalized = normalizeContentPath(relativePath);
  if (!normalized) {
    throw new Error("Missing content file path.");
  }

  const absolute = resolveContentPath(normalized);
  const extension = path.extname(normalized).toLowerCase();
  if (!EDITABLE_CONTENT_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported editable file type: ${extension || "(none)"}.`);
  }

  if (existsSync(absolute) && !statSync(absolute).isFile()) {
    throw new Error("Path is not a file.");
  }

  return normalized;
}

export function assertContentDirectory(relativePath: string): string {
  const normalized = normalizeContentPath(relativePath);
  if (!normalized) {
    throw new Error("Missing content directory path.");
  }

  const absolute = resolveContentPath(normalized);
  if (existsSync(absolute) && !statSync(absolute).isDirectory()) {
    throw new Error("Path is not a directory.");
  }

  return normalized;
}

export function readContentFile(relativePath: string): string {
  return readText(assertEditableContentFile(relativePath));
}

export function writeContentFile(relativePath: string, content: string): void {
  writeText(assertEditableContentFile(relativePath), content);
}

export function createContentDirectory(relativePath: string): void {
  mkdirSync(resolveContentPath(assertContentDirectory(relativePath)), { recursive: true });
}

export function getContentSection(relativePath: string): string {
  return CONTENT_SECTIONS.find((section) => section.match(relativePath))?.id ?? "content";
}

function listDirectory(relativeRoot: string, entries: AdminFileEntry[]): void {
  const absoluteRoot = resolveContentPath(relativeRoot);
  if (!existsSync(absoluteRoot)) {
    return;
  }

  for (const dirent of readdirSync(absoluteRoot, { withFileTypes: true })) {
    if (dirent.name.startsWith(".")) {
      continue;
    }

    const relativePath = [relativeRoot, dirent.name].filter(Boolean).join("/");
    const absolutePath = path.join(absoluteRoot, dirent.name);
    const stats = statSync(absolutePath);
    const section = getContentSection(relativePath);

    if (dirent.isDirectory()) {
      entries.push({
        path: relativePath,
        name: dirent.name,
        kind: "directory",
        section,
        updatedAt: stats.mtime.toISOString(),
      });
      listDirectory(relativePath, entries);
      continue;
    }

    if (!dirent.isFile()) {
      continue;
    }

    entries.push({
      path: relativePath,
      name: dirent.name,
      kind: "file",
      section,
      size: stats.size,
      updatedAt: stats.mtime.toISOString(),
    });
  }
}

export function listContentEntries(): AdminFileEntry[] {
  const entries: AdminFileEntry[] = [];
  listDirectory("", entries);
  return entries.sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === "directory" ? -1 : 1;
    }
    return a.path.localeCompare(b.path);
  });
}

export function getContentRootRelativePath(): string {
  return path.relative(process.cwd(), CONTENT_DIR).replace(/\\/g, "/");
}
