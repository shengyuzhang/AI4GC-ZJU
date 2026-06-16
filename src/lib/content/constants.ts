import type { TeamGroup } from "@/lib/content/paths";
import type { BlogChannelPlatform } from "@/types/lab";

export const NEWS_FILE_PATTERN = /\.(ya?ml|md)$/i;
export const MEMBER_INDEX_FILE = "index.md";
export const BLOG_INDEX_FILE = "index.md";
export const HOME_MODULE_FILE_PATTERN = /\.ya?ml$/i;

export const TEAM_PI_LABEL = "Principal Investigator";
export const TEAM_OPENINGS_LABEL = "Openings";

/** Team card meta prefix before `startDate` (team page only). */
export const TEAM_MEMBER_START_LABELS: Record<TeamGroup, string> = {
  postdocs: "Joined",
  phds: "Enrolled",
  masters: "Enrolled",
  undergrads: "Enrolled",
  alumni: "Enrolled",
};

export const TEAM_GROUP_LABELS: Record<TeamGroup, string> = {
  postdocs: "Postdoctoral",
  phds: "Ph.D",
  masters: "Master",
  undergrads: "Undergraduate",
  alumni: "Graduated",
};

export const BLOG_CHANNEL_PLATFORM_ORDER: Record<BlogChannelPlatform, number> = {
  wechat: 0,
  x: 1,
  xiaohongshu: 2,
};
