import { describe, expect, it } from "vitest";
import {
  attachProfileBlogPosts,
  parseBulletLines,
  parseSectionHeader,
  resolveProfileBody,
} from "@/lib/content/resolve-profile-papers";
import type { BlogPost } from "@/types/lab";

const samplePost: BlogPost = {
  id: "efficient-llm-serving-notes",
  title: "Notes on Efficient LLM Serving",
  date: "May 2026",
  desc: "Serving notes",
  author: "Yurun Chen",
  authors: [{ id: "yurun-chen-2025-12551024", name: "Yurun Chen", profileHref: "/yurun-chen-2025-12551024" }],
  links: [],
  tags: ["LLM Systems"],
  body: "Body",
};

describe("parseSectionHeader", () => {
  it("detects explicit @papers sections", () => {
    expect(parseSectionHeader("@papers Selected Papers")).toEqual({
      kind: "papers",
      title: "Selected Papers",
    });
  });

  it("detects explicit @blog sections", () => {
    expect(parseSectionHeader("@blog Lab Notes")).toEqual({
      kind: "blog",
      title: "Lab Notes",
    });
  });

  it("leaves unsupported @sections as markdown", () => {
    expect(parseSectionHeader("@custom")).toEqual({
      kind: "markdown",
      title: "@custom",
    });
    expect(parseSectionHeader("@custom Work History")).toEqual({
      kind: "markdown",
      title: "@custom Work History",
    });
  });
});

describe("parseBulletLines", () => {
  it("accepts -, *, and + list markers", () => {
    const body = ["- one", "* two", "+ three"].join("\n");
    expect(parseBulletLines(body)).toEqual(["one", "two", "three"]);
  });
});

describe("resolveProfileBody", () => {
  it("resolves @papers from member folder bib", () => {
    const resolved = resolveProfileBody(
      "## @papers Selected Papers\n\n- safepredpredictive2026\n- osagentssurvey2025",
      "phds",
      "yurun-chen-2025-12551024",
    );

    const papers = resolved.segments.find((segment) => segment.kind === "papers");
    expect(papers?.kind).toBe("papers");
    if (papers?.kind !== "papers") {
      return;
    }

    expect(papers.title).toBe("Selected Papers");
    expect(papers.publications).toHaveLength(2);
    expect(papers.publications[0]?.title).toContain("SafePred");
    expect(papers.publications[1]?.honor).toBe("Oral");
  });

  it("does not treat generic bullet lists as paper sections", () => {
    const resolved = resolveProfileBody(
      "## Tools\n\n- python\n- pytorch\n- numpy",
      "phds",
      "yurun-chen-2025-12551024",
    );

    expect(resolved.segments).toHaveLength(1);
    expect(resolved.segments[0]?.kind).toBe("markdown");
    if (resolved.segments[0]?.kind === "markdown") {
      expect(resolved.segments[0].content).toContain("## Tools");
      expect(resolved.segments[0].content).toContain("- python");
    }
  });

  it("does not clean unsupported @section titles", () => {
    const resolved = resolveProfileBody(
      "## @custom\n\n- One item",
      "phds",
      "yurun-chen-2025-12551024",
    );

    const markdown = resolved.segments.find((segment) => segment.kind === "markdown");
    expect(markdown?.kind).toBe("markdown");
    if (markdown?.kind === "markdown") {
      expect(markdown.content).toMatch(/^## @custom/);
    }
  });

  it("does not infer papers from plain headings", () => {
    const resolved = resolveProfileBody(
      "## Selected Papers\n\n- safepredpredictive2026",
      "phds",
      "yurun-chen-2025-12551024",
    );

    expect(resolved.segments).toEqual([
      { kind: "markdown", content: "## Selected Papers\n\n- safepredpredictive2026" },
    ]);
  });

  it("creates a blog placeholder segment for @blog sections", () => {
    const resolved = resolveProfileBody(
      "## @blog Lab Notes",
      "phds",
      "yurun-chen-2025-12551024",
    );

    expect(resolved.segments).toEqual([
      { kind: "blog", title: "Lab Notes", channels: [], posts: [] },
    ]);
  });

  it("splits intro and multiple markdown sections", () => {
    const resolved = resolveProfileBody(
      "Intro paragraph.\n\n## Notes\n\n### Topic\n\nDetails.",
      "pi",
      "shengyu-zhang",
    );

    expect(resolved.segments).toHaveLength(2);
    expect(resolved.segments[0]).toEqual({ kind: "markdown", content: "Intro paragraph." });
    expect(resolved.segments[1]?.kind).toBe("markdown");
    if (resolved.segments[1]?.kind === "markdown") {
      expect(resolved.segments[1].content).toMatch(/^## Notes/);
    }
  });
});

const sampleChannel = {
  label: "Yurun Chen",
  href: "https://www.xiaohongshu.com/user/profile/abc",
  platform: "xiaohongshu" as const,
  desc: "Notes",
};

describe("attachProfileBlogPosts", () => {
  it("appends a blog section when posts exist", () => {
    const segments = attachProfileBlogPosts(
      [{ kind: "markdown", content: "Intro" }],
      [samplePost],
    );

    expect(segments).toHaveLength(2);
    expect(segments[1]).toEqual({
      kind: "blog",
      title: "Blog",
      channels: [],
      posts: [samplePost],
    });
  });

  it("appends a blog section when only channels exist", () => {
    const segments = attachProfileBlogPosts(
      [{ kind: "markdown", content: "Intro" }],
      [],
      [sampleChannel],
    );

    expect(segments[1]).toEqual({
      kind: "blog",
      title: "Blog",
      channels: [sampleChannel],
      posts: [],
    });
  });

  it("fills an existing @blog placeholder", () => {
    const segments = attachProfileBlogPosts(
      [{ kind: "blog", title: "Lab Notes", channels: [], posts: [] }],
      [samplePost],
      [sampleChannel],
    );

    expect(segments).toEqual([
      {
        kind: "blog",
        title: "Lab Notes",
        channels: [sampleChannel],
        posts: [samplePost],
      },
    ]);
  });

  it("removes empty blog placeholders when there are no posts or channels", () => {
    const segments = attachProfileBlogPosts(
      [
        { kind: "markdown", content: "Intro" },
        { kind: "blog", title: "Blog", channels: [], posts: [] },
      ],
      [],
    );

    expect(segments).toEqual([{ kind: "markdown", content: "Intro" }]);
  });

  it("merges duplicate @blog placeholders into one section", () => {
    const segments = attachProfileBlogPosts(
      [
        { kind: "markdown", content: "Intro" },
        { kind: "blog", title: "Lab Notes", channels: [], posts: [] },
        { kind: "papers", title: "Selected Papers", publications: [] },
        { kind: "blog", title: "Ignored duplicate", channels: [], posts: [] },
      ],
      [samplePost],
      [sampleChannel],
    );

    expect(segments).toEqual([
      { kind: "markdown", content: "Intro" },
      {
        kind: "blog",
        title: "Lab Notes",
        channels: [sampleChannel],
        posts: [samplePost],
      },
      { kind: "papers", title: "Selected Papers", publications: [] },
    ]);
  });
});
