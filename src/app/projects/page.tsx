import type { Metadata } from "next";
import ProjectsPageClient from "@/components/projects/ProjectsPageClient";
import { getProjects } from "@/lib/content/projects";
import { enrichProjects } from "@/lib/projects/enrich";
import { buildListPageMetadata } from "@/lib/site/page-metadata";

export function generateMetadata(): Metadata {
  return buildListPageMetadata("projects", "/projects");
}

export default async function ProjectsPage() {
  const projects = getProjects();
  const { enrichment, githubStars } = await enrichProjects(projects);

  return (
    <ProjectsPageClient projects={projects} enrichment={enrichment} githubStars={githubStars} />
  );
}
