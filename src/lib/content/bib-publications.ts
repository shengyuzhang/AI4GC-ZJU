import { existsSync, readFileSync } from "fs";
import { parse as parseBib, type BibEntry } from "@retorquere/bibtex-parser";
import { publicationItemSchema } from "@/lib/content/schema";
import { normalizeHonorLabel, normalizeVenueLabel } from "@/lib/publications-utils";
import type { LinkItem, PublicationItem } from "@/types/lab";

type BibAuthor =
  | string
  | {
      lastName?: string;
      firstName?: string;
      von?: string;
      jr?: string;
    };

function formatAuthor(author: BibAuthor): string {
  if (typeof author === "string") {
    return author;
  }

  const parts = [author.von, author.firstName, author.lastName, author.jr].filter(Boolean);
  return parts.join(" ").trim();
}

function toAuthorList(authors: BibAuthor[] | string | undefined): string[] {
  if (!authors) return [];
  if (typeof authors === "string") {
    return authors
      .split(/\s+and\s+/i)
      .map((name) => name.trim())
      .filter(Boolean);
  }
  return authors.map(formatAuthor).filter(Boolean);
}

function formatAuthors(authors: BibAuthor[] | string | undefined): string {
  if (!authors) return "";
  if (typeof authors === "string") return authors;
  return authors.map(formatAuthor).join(", ");
}

// BibTeX `corresponding` field: author display names separated by " and " or ";".
function toCorrespondingList(fields: Record<string, unknown>): string[] {
  const raw = fieldToString(
    fields.corresponding ?? fields.correspondingauthor ?? fields.correspondingauthors,
  );
  if (!raw) return [];
  return raw
    .split(/\s+and\s+|;/i)
    .map((name) => name.trim())
    .filter(Boolean);
}

function fieldToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(fieldToString).join(" ");
  return "";
}

function extractYear(fields: Record<string, unknown>): string {
  const year = fieldToString(fields.year);
  if (year) return year;

  for (const key of ["booktitle", "journal", "venue"]) {
    const match = fieldToString(fields[key]).match(/\b(19|20)\d{2}\b/);
    if (match) return match[0];
  }

  return "";
}

function extractVenue(fields: Record<string, unknown>): string {
  const raw =
    fieldToString(fields.booktitle) ||
    fieldToString(fields.journal) ||
    fieldToString(fields.venue) ||
    fieldToString(fields.howpublished);

  return normalizeVenueLabel(raw);
}

function normalizeDoi(doi: string): string {
  const trimmed = doi.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://doi.org/${trimmed.replace(/^doi:/i, "")}`;
}

function firstNonEmptyField(fields: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = fieldToString(fields[key]).trim();
    if (value) {
      return value;
    }
  }
  return "";
}

function extractPublicationLinks(fields: Record<string, unknown>): LinkItem[] {
  const links: LinkItem[] = [];

  const url = fieldToString(fields.url).trim();
  const doi = fieldToString(fields.doi).trim();
  const paperHref = url || (doi ? normalizeDoi(doi) : "");

  if (paperHref) {
    links.push({ label: "Paper", href: paperHref, external: true });
  }

  const github = firstNonEmptyField(fields, ["github", "code", "codeurl", "repository"]);
  if (github) {
    links.push({ label: "Project", href: github, external: true });
  }

  const huggingFace = firstNonEmptyField(fields, ["huggingface", "hf"]);
  if (huggingFace) {
    links.push({ label: "Hugging Face", href: huggingFace, external: true });
  }

  const zhihu = firstNonEmptyField(fields, ["zhihu", "zhihuurl"]);
  if (zhihu) {
    links.push({ label: "Zhihu", href: zhihu, external: true });
  }

  const wechat = firstNonEmptyField(fields, ["wechat", "weixin", "wechaturl"]);
  if (wechat) {
    links.push({ label: "WeChat", href: wechat, external: true });
  }

  const blogHref = extractBlogHref(fields);
  if (blogHref) {
    links.push({ label: "Blog", href: blogHref, external: /^https?:\/\//i.test(blogHref) });
  }

  return links;
}

/**
 * Reads a related-blog reference from a BibTeX entry (`blog`/`blogurl`/`blogslug`).
 * A bare value or `blog/...` becomes an internal `/blog/{slug}` link; full URLs pass through.
 */
export function extractBlogHref(fields: Record<string, unknown>): string | undefined {
  const raw = firstNonEmptyField(fields, ["blog", "blogurl", "blogslug"]).trim();
  if (!raw) {
    return undefined;
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) {
    return raw;
  }
  return `/blog/${raw.replace(/^blog\//i, "")}`;
}

function extractTopics(fields: Record<string, unknown>): string[] {
  const raw = fields.keywords ?? fields.keyword ?? fields.topics;
  if (!raw) {
    return [];
  }

  // The parser may return keywords as a string or an array; handle both, then
  // split each piece on , / ; so "Agents, RAG" and ["Agents","RAG"] both work.
  const rawParts = Array.isArray(raw)
    ? raw.map((value) => fieldToString(value))
    : [fieldToString(raw)];

  const seen = new Set<string>();
  const topics: string[] = [];
  for (const part of rawParts) {
    for (const piece of part.split(/[;,]/)) {
      const value = piece.trim();
      const key = value.toLowerCase();
      if (value && !seen.has(key)) {
        seen.add(key);
        topics.push(value);
      }
    }
  }
  return topics;
}

/** Re-serializes a parsed entry into a clean, copy-ready BibTeX string. */
function toBibtex(entry: BibEntry): string {
  const fields = entry.fields as Record<string, unknown>;
  const type = (entry.type || "article").toLowerCase();
  const lines = [`@${type}{${entry.key},`];

  for (const [field, value] of Object.entries(fields)) {
    const serialized =
      field === "author" || field === "editor"
        ? toAuthorList(value as BibAuthor[] | string | undefined).join(" and ")
        : fieldToString(value).trim();
    if (serialized) {
      lines.push(`  ${field} = {${serialized}},`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

export function publicationFromBibEntry(entry: BibEntry): PublicationItem {
  const fields = entry.fields as Record<string, unknown>;
  const title = fieldToString(fields.title);
  const venue = extractVenue(fields);
  const year = extractYear(fields);
  const links = extractPublicationLinks(fields);
  const paperHref = links.find((link) => link.label === "Paper")?.href;
  const honor = firstNonEmptyField(fields, ["honor", "award", "presentation"]);

  return publicationItemSchema.parse({
    id: entry.key,
    title,
    authors: formatAuthors(fields.author as BibAuthor[] | string | undefined),
    authorList: toAuthorList(fields.author as BibAuthor[] | string | undefined),
    correspondingAuthors: toCorrespondingList(fields),
    venue: year && !venue.includes(year) ? `${venue} ${year}`.trim() : venue,
    href: paperHref,
    blogHref: extractBlogHref(fields),
    topics: extractTopics(fields),
    bibtex: toBibtex(entry),
    honor: honor ? normalizeHonorLabel(honor) : undefined,
    links,
  });
}

export function loadPublicationsFromBibFile(bibPath: string): PublicationItem[] {
  if (!existsSync(bibPath)) {
    throw new Error(`Missing BibTeX file: ${bibPath}`);
  }

  const raw = readFileSync(bibPath, "utf-8");
  // sentenceCase:false keeps titles verbatim from source, so acronyms like
  // "LLMs", "GUI", "AccKV" aren't folded to lowercase on display.
  const parsed = parseBib(raw, { sentenceCase: false });

  return parsed.entries.map(publicationFromBibEntry);
}

export function loadPublicationsFromBibKeys(bibPath: string, keys: string[]): PublicationItem[] {
  const all = loadPublicationsFromBibFile(bibPath);
  const byId = new Map(all.map((item) => [item.id, item]));

  return keys.map((key) => {
    const item = byId.get(key);
    if (!item) {
      throw new Error(`Missing BibTeX entry "${key}" in ${bibPath}`);
    }
    return item;
  });
}

export function extractYearFromPublicationId(id: string): number {
  const match = id.match(/\b(19|20)\d{2}\b/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

export function sortPublicationsByYear(items: PublicationItem[]): PublicationItem[] {
  return [...items].sort((a, b) => {
    const yearA = extractYearFromPublicationId(a.id) || extractYearFromPublicationId(a.venue);
    const yearB = extractYearFromPublicationId(b.id) || extractYearFromPublicationId(b.venue);
    return yearB - yearA;
  });
}
