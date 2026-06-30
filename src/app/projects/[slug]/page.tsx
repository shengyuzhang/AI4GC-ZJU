import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectsPageClient from "@/components/projects/ProjectsPageClient";
import { getSiteConfig } from "@/lib/content";
import { getProjects } from "@/lib/content/projects";
import { enrichProjects } from "@/lib/projects/enrich";

type RouteParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjects().find((item) => item.id === slug);
  const site = getSiteConfig();

  if (!project) {
    return { title: site.pages.projects.title };
  }

  return {
    title: `${project.name} · ${site.pages.projects.title}`,
    description: project.desc ?? site.description,
    // The deep link renders the full list; canonical points at the index so it
    // isn't treated as duplicate content.
    alternates: { canonical: "/projects" },
    openGraph: {
      title: `${project.name} · ${site.name}`,
      description: project.desc ?? site.description,
      url: `/projects/${slug}`,
    },
  };
}

export default async function ProjectDeepLinkPage({ params }: RouteParams) {
  const { slug } = await params;
  const projects = getProjects();

  if (!projects.some((project) => project.id === slug)) {
    notFound();
  }

  const { enrichment, githubStars } = await enrichProjects(projects);

  return (
    <ProjectsPageClient
      projects={projects}
      enrichment={enrichment}
      githubStars={githubStars}
      focusSlug={slug}
    />
  );
}
