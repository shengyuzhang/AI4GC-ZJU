import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGitHubStarsMap, isGitHubRepoRootHref } from "./github-stars";

describe("isGitHubRepoRootHref", () => {
  it("accepts a bare repo-root link", () => {
    expect(isGitHubRepoRootHref("https://github.com/owner/repo")).toBe(true);
    expect(isGitHubRepoRootHref("https://www.github.com/owner/repo")).toBe(true);
  });

  it("rejects anchor and subpath links to the same repo", () => {
    expect(isGitHubRepoRootHref("https://github.com/owner/repo#readme")).toBe(false);
    expect(isGitHubRepoRootHref("https://github.com/owner/repo/tree/main")).toBe(false);
  });

  it("rejects non-GitHub and malformed links", () => {
    expect(isGitHubRepoRootHref("https://example.com/owner/repo")).toBe(false);
    expect(isGitHubRepoRootHref("not a url")).toBe(false);
  });
});

describe("fetchGitHubStarsMap", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ignores GitHub fetch failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );

    await expect(fetchGitHubStarsMap(["https://github.com/example/repo"])).resolves.toEqual({});
  });
});
