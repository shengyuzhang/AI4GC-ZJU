import { afterEach, describe, expect, it, vi } from "vitest";
import { getSecurityHeaders } from "./headers";

describe("getSecurityHeaders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes clickjacking protections in all environments", () => {
    const keys = getSecurityHeaders().map((header) => header.key);

    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
  });

  it("sends X-Robots-Tag noindex only when the site is not indexable", () => {
    const blocked = getSecurityHeaders({ indexable: false });
    expect(blocked.find((h) => h.key === "X-Robots-Tag")?.value).toContain("noindex");

    // Default (no option) is treated as not-indexable → still blocked.
    expect(getSecurityHeaders().map((h) => h.key)).toContain("X-Robots-Tag");

    // When indexing is enabled, the header must be absent so search engines can index.
    const indexable = getSecurityHeaders({ indexable: true });
    expect(indexable.map((h) => h.key)).not.toContain("X-Robots-Tag");
  });

  it("adds HSTS and CSP only in production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const devKeys = getSecurityHeaders().map((header) => header.key);
    expect(devKeys).not.toContain("Strict-Transport-Security");
    expect(devKeys).not.toContain("Content-Security-Policy");

    vi.stubEnv("NODE_ENV", "production");
    const prodKeys = getSecurityHeaders().map((header) => header.key);
    expect(prodKeys).toContain("Strict-Transport-Security");
    expect(prodKeys).toContain("Content-Security-Policy");
  });
});
