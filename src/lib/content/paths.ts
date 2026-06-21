import path from "path";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export const CONTENT_PATHS = {
  site: path.join(CONTENT_DIR, "site.yaml"),
  home: path.join(CONTENT_DIR, "home.yaml"),
  homeDir: path.join(CONTENT_DIR, "home"),
  homeHero: path.join(CONTENT_DIR, "home", "hero.yaml"),
  homeOrder: path.join(CONTENT_DIR, "home", "order.yaml"),
  homeModulesDir: path.join(CONTENT_DIR, "home", "modules"),
  teamDir: path.join(CONTENT_DIR, "team"),
  newsDir: path.join(CONTENT_DIR, "news"),
  blogDir: path.join(CONTENT_DIR, "blog"),
  publicationsBib: path.join(CONTENT_DIR, "publications.bib"),
} as const;

export const TEAM_CONTENT_GROUPS = [
  "pi",
  "postdocs",
  "phds",
  "masters",
  "undergrads",
  "interns",
  "alumni",
] as const;

export const TEAM_GROUPS = [
  "postdocs",
  "phds",
  "masters",
  "undergrads",
  "interns",
  "alumni",
] as const;

export type TeamContentGroup = (typeof TEAM_CONTENT_GROUPS)[number];
export type TeamGroup = (typeof TEAM_GROUPS)[number];
