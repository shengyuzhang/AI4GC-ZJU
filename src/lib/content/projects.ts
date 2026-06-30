import { getHomeContent } from "@/lib/content";
import type { HomeProject } from "@/types/lab";

/**
 * Projects shown on `/projects` (and the homepage panel) — the homepage
 * `projects` module, already ordered newest-first by `parseProjects`.
 */
export function getProjects(): HomeProject[] {
  const home = getHomeContent();
  const projectsModule = home.modules.find((module) => module.type === "projects");
  return projectsModule?.type === "projects" ? projectsModule.items : [];
}
