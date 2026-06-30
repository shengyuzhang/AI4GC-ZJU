import type { Metadata } from "next";
import ProjectsPageClient from "@/components/projects/ProjectsPageClient";
import { getHomeContent } from "@/lib/content";
import { enrichProjects } from "@/lib/projects/enrich";
import { buildListPageMetadata } from "@/lib/site/page-metadata";
import type { HomeProject } from "@/types/lab";

export function generateMetadata(): Metadata {
  return buildListPageMetadata("projects", "/projects");
}

/** Projects come from the homepage `projects` module (already newest-first). */
function getProjects(): HomeProject[] {
  const home = getHomeContent();
  const projectsModule = home.modules.find((module) => module.type === "projects");
  return projectsModule?.type === "projects" ? projectsModule.items : [];
}

export default async function ProjectsPage() {
  const projects = getProjects();
  const { enrichment, githubStars } = await enrichProjects(projects);

  return (
    <ProjectsPageClient projects={projects} enrichment={enrichment} githubStars={githubStars} />
  );
}
