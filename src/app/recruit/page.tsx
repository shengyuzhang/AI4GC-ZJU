import type { Metadata } from "next";
import RecruitPageClient from "@/components/recruit/RecruitPageClient";
import { loadRecruitPage, loadRecruitProjects } from "@/lib/content/load-recruit";
import { buildListPageMetadata } from "@/lib/site/page-metadata";

export function generateMetadata(): Metadata {
  return buildListPageMetadata("recruit", "/recruit");
}

export default function RecruitPage() {
  return (
    <RecruitPageClient
      page={loadRecruitPage()}
      projects={loadRecruitProjects()}
    />
  );
}
