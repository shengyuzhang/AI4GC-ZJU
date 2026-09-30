import { existsSync, readdirSync } from "fs";
import path from "path";
import { CONTENT_PATHS } from "@/lib/content/paths";
import { parseNewsDateKey } from "@/lib/content/date";
import { findTeamMemberById } from "@/lib/content/load-team";
import { readYamlFile } from "@/lib/content/read-yaml";
import { recruitPageSchema, recruitProjectSchema } from "@/lib/content/schema";
import type { RecruitMentor, RecruitPage, RecruitProject } from "@/types/lab";

const PROJECT_FILE_PATTERN = /\.ya?ml$/i;

export function loadRecruitPage(): RecruitPage {
  return recruitPageSchema.parse(readYamlFile(CONTENT_PATHS.recruitPage));
}

function resolveMentor(id: string, projectId: string): RecruitMentor {
  const member = findTeamMemberById(id);
  if (!member) {
    throw new Error(`Recruit project "${projectId}": unknown mentor id "${id}"`);
  }
  return {
    id: member.id,
    name: member.name,
    photo: member.photo,
    href: member.profile ? `/${member.profile}` : null,
    tags: member.tags ?? [],
  };
}

/** Recruit projects: open first, then newest `postedAt` first. */
export function loadRecruitProjects(): RecruitProject[] {
  const dir = CONTENT_PATHS.recruitProjectsDir;
  if (!existsSync(dir)) {
    return [];
  }

  const projects = readdirSync(dir)
    .filter((file) => PROJECT_FILE_PATTERN.test(file))
    .map((file) => {
      const raw = readYamlFile<Record<string, unknown>>(path.join(dir, file)) ?? {};
      const id = file.replace(PROJECT_FILE_PATTERN, "");
      const parsed = recruitProjectSchema.parse({ id, ...raw });
      return {
        ...parsed,
        mentors: parsed.mentors.map((mentorId) => resolveMentor(mentorId, id)),
      };
    });

  return projects.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "open" ? -1 : 1;
    }
    return parseNewsDateKey(b.postedAt) - parseNewsDateKey(a.postedAt);
  });
}
