import { BLOG_CHANNEL_PLATFORM_ORDER } from "@/lib/content/constants";
import type { BlogChannel, BlogChannelPlatform, MemberLink } from "@/types/lab";

export function inferBlogChannelPlatform(href: string): BlogChannelPlatform | null {
  const lower = href.trim().toLowerCase();
  if (lower.includes("xiaohongshu.com")) {
    return "xiaohongshu";
  }

  if (lower.includes("weixin.qq.com") || lower.includes("mp.weixin.qq.com")) {
    return "wechat";
  }

  if (
    lower.includes("x.com")
    || lower.includes("twitter.com")
    || lower.includes("screen_name=")
  ) {
    return "x";
  }

  return null;
}

export function resolveBlogChannelPlatform(
  link: MemberLink,
  pathLabel: string,
): BlogChannelPlatform {
  const inferred = inferBlogChannelPlatform(link.href);
  if (inferred) {
    return inferred;
  }

  throw new Error(
    `Blog channel "${link.label}" in ${pathLabel} needs a recognizable WeChat, X, or Xiaohongshu URL.`,
  );
}

export function extractBlogChannels(links: MemberLink[], pathLabel: string): BlogChannel[] {
  return links
    .filter((link) => link.kind === "blog-channel")
    .map((link) => ({
      label: link.label,
      href: link.href,
      platform: resolveBlogChannelPlatform(link, pathLabel),
      desc: link.desc,
    }))
    .sort((a, b) => BLOG_CHANNEL_PLATFORM_ORDER[a.platform] - BLOG_CHANNEL_PLATFORM_ORDER[b.platform]);
}

/** Links shown on profile hero (no self-profile link, no blog channels). */
export function filterHeroMemberLinks(links: MemberLink[]): MemberLink[] {
  return links.filter((link) => link.kind !== "profile" && link.kind !== "blog-channel");
}

/** Links shown on /team cards (profile entry is avatar/name, not a chip). */
export function filterTeamCardMemberLinks(links: MemberLink[]): MemberLink[] {
  return links.filter((link) => link.kind !== "blog-channel" && link.kind !== "profile");
}
