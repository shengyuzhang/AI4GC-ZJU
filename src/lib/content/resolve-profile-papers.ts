import { existsSync } from "fs";
import path from "path";
import { loadPublicationsFromBibKeys } from "@/lib/content/bib-publications";
import { CONTENT_PATHS } from "@/lib/content/paths";
import { normalizeHonorLabel } from "@/lib/publications-utils";
import { memberDirPath, type TeamContentGroup } from "@/lib/content/team-assets";
import type { BlogChannel, BlogPost, PublicationItem } from "@/types/lab";

const DEFAULT_MEMBER_BIB = "papers.bib";
const SECTION_TYPE_PREFIX = /^@([a-z-]+)\s*:?\s*(.*)$/i;
const BULLET_LINE = /^[-*+]\s+(.*)$/;
const PAPER_LIST_ENTRY =
  /^([A-Za-z][A-Za-z0-9:_-]*)(?:\s*(?:\||\/)\s*(.+))?$/;

const GLOBAL_BIB_ALIASES = new Set(["global", "publications", "publications.bib"]);

export type ProfileMarkdownSegment = {
  kind: "markdown";
  content: string;
};

export type ProfilePapersSegment = {
  kind: "papers";
  title: string;
  publications: PublicationItem[];
};

export type ProfileBlogSegment = {
  kind: "blog";
  title: string;
  channels: BlogChannel[];
  posts: BlogPost[];
};

export type ProfileBodySegment =
  | ProfileMarkdownSegment
  | ProfilePapersSegment
  | ProfileBlogSegment;

export type ResolvedProfileBody = {
  segments: ProfileBodySegment[];
};

type PaperListEntry = {
  key: string;
  honor?: string;
};

function resolveBibPath(
  group: TeamContentGroup,
  memberFolder: string,
  bibRef: string,
): string {
  const normalized = bibRef.trim().replace(/^\.\//, "");
  const memberPath = path.join(memberDirPath(group, memberFolder), normalized);

  if (existsSync(memberPath)) {
    return memberPath;
  }

  if (GLOBAL_BIB_ALIASES.has(normalized.toLowerCase())) {
    return CONTENT_PATHS.publicationsBib;
  }

  throw new Error(
    `BibTeX file not found: content/team/${group}/${memberFolder}/${normalized}`,
  );
}

export type ParsedSectionHeader = {
  kind: "markdown" | "papers" | "blog";
  title: string;
};

export function parseSectionHeader(rawTitle: string): ParsedSectionHeader {
  const explicit = rawTitle.match(SECTION_TYPE_PREFIX);
  if (explicit) {
    const type = explicit[1].toLowerCase();
    const customTitle = explicit[2]?.trim() ?? "";

    if (type === "papers") {
      return {
        kind: "papers",
        title: customTitle || "Selected Papers",
      };
    }

    if (type === "blog") {
      return {
        kind: "blog",
        title: customTitle || "Blog",
      };
    }
  }

  return { kind: "markdown", title: rawTitle.trim() };
}

export function attachProfileBlogPosts(
  segments: ProfileBodySegment[],
  posts: BlogPost[],
  channels: BlogChannel[] = [],
): ProfileBodySegment[] {
  if (posts.length === 0 && channels.length === 0) {
    return segments.filter((segment) => segment.kind !== "blog");
  }

  let blogTitle = "Blog";
  let insertAt = -1;
  const nonBlog: ProfileBodySegment[] = [];

  for (const segment of segments) {
    if (segment.kind === "blog") {
      if (insertAt < 0) {
        blogTitle = segment.title;
        insertAt = nonBlog.length;
      }
      continue;
    }

    nonBlog.push(segment);
  }

  const blogSegment: ProfileBlogSegment = {
    kind: "blog",
    title: blogTitle,
    channels,
    posts,
  };

  if (insertAt >= 0) {
    return [
      ...nonBlog.slice(0, insertAt),
      blogSegment,
      ...nonBlog.slice(insertAt),
    ];
  }

  return [...nonBlog, blogSegment];
}

export function parseBulletLines(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .map((line) => {
      const match = line.match(BULLET_LINE);
      return match ? match[1].trim() : null;
    })
    .filter((line): line is string => Boolean(line));
}

function parsePaperListEntry(line: string): PaperListEntry | null {
  const match = line.trim().match(PAPER_LIST_ENTRY);
  if (!match) {
    return null;
  }

  const honor = match[2]?.trim();
  return {
    key: match[1],
    honor: honor ? normalizeHonorLabel(honor) : undefined,
  };
}

function warnIgnoredPaperSectionContent(lines: string[]): void {
  if (lines.length === 0) {
    return;
  }

  console.warn(
    `[profile-papers] Ignoring non-list content in paper section:\n${lines.map((line) => `  ${line}`).join("\n")}`,
  );
}

function parsePaperSectionBody(body: string): { bib: string; entries: PaperListEntry[] } {
  const bibMatch = body.match(/^@bib\s+(\S+)\s*$/im);
  const remainder = bibMatch ? body.replace(bibMatch[0], "").trim() : body.trim();

  const ignoredLines = remainder
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^@bib\s+/i.test(line) && !BULLET_LINE.test(line));
  warnIgnoredPaperSectionContent(ignoredLines);

  const bulletLines = parseBulletLines(remainder);
  const entries: PaperListEntry[] = [];

  for (const line of bulletLines) {
    const entry = parsePaperListEntry(line);
    if (!entry) {
      throw new Error(
        `Invalid paper cite key "${line}". Use BibTeX keys only (optional honor: \`- citekey | Oral\`).`,
      );
    }
    entries.push(entry);
  }

  if (entries.length === 0) {
    throw new Error(
      "Paper section must list BibTeX cite keys as bullet items (`-`, `*`, or `+`; optional honor: `- citekey | Oral`).",
    );
  }

  return {
    bib: bibMatch?.[1] ?? DEFAULT_MEMBER_BIB,
    entries,
  };
}

function resolvePaperSection(
  title: string,
  body: string,
  group: TeamContentGroup,
  memberFolder: string,
): ProfilePapersSegment {
  const { bib, entries } = parsePaperSectionBody(body);
  const bibPath = resolveBibPath(group, memberFolder, bib);
  const keys = entries.map((entry) => entry.key);
  const publications = loadPublicationsFromBibKeys(bibPath, keys);

  return {
    kind: "papers",
    title,
    publications: publications.map((publication, index) => {
      const honor = entries[index]?.honor;
      if (!honor) {
        return publication;
      }

      return { ...publication, honor };
    }),
  };
}

export function resolveProfileBody(
  body: string,
  group: TeamContentGroup,
  memberFolder: string,
): ResolvedProfileBody {
  const trimmed = body.trim();
  if (!trimmed) {
    return { segments: [] };
  }

  const chunks = trimmed.split(/^## /m);
  const segments: ProfileBodySegment[] = [];

  const intro = chunks[0]?.trim() ?? "";
  if (intro) {
    segments.push({ kind: "markdown", content: intro });
  }

  for (const chunk of chunks.slice(1)) {
    const newlineIndex = chunk.indexOf("\n");
    const rawTitle = newlineIndex === -1 ? chunk.trim() : chunk.slice(0, newlineIndex).trim();
    const sectionBody = newlineIndex === -1 ? "" : chunk.slice(newlineIndex + 1).trim();
    const header = parseSectionHeader(rawTitle);

    if (header.kind === "papers") {
      segments.push(
        resolvePaperSection(header.title, sectionBody, group, memberFolder),
      );
      continue;
    }

    if (header.kind === "blog") {
      segments.push({
        kind: "blog",
        title: header.title,
        channels: [],
        posts: [],
      });
      continue;
    }

    segments.push({
      kind: "markdown",
      content: `## ${header.title}${sectionBody ? `\n\n${sectionBody}` : ""}`,
    });
  }

  return { segments };
}
