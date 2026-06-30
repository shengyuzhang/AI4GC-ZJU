import { z } from "zod";
import { normalizeMemberEmail } from "@/lib/content/member-email";

export const linkItemSchema = z.object({
  label: z.string(),
  labelZh: z.string().optional(),
  href: z.string(),
  external: z.boolean().optional(),
});

export const memberLinkSchema = linkItemSchema.extend({
  kind: z.enum(["profile", "social", "website", "blog-channel"]).optional(),
  desc: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
});

const optionalImagePath = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

export const newsItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  titleZh: z.string().optional(),
  desc: z.string(),
  descZh: z.string().optional(),
  href: z.string().optional(),
  featured: z.boolean().optional(),
  /** Short category label shown as a badge on the news image (e.g. "Paper", "Open Source"). */
  type: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  typeZh: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  image: optionalImagePath,
  imageAlt: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  links: z.array(linkItemSchema).default([]),
});

export const publicationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.string(),
  authorList: z.array(z.string()).default([]),
  /** Display names of corresponding authors; matching authorList entries get a ✉ marker. */
  correspondingAuthors: z.array(z.string()).default([]),
  venue: z.string(),
  honor: z.string().optional(),
  href: z.string().optional(),
  blogHref: z.string().optional(),
  topics: z.array(z.string()).default([]),
  bibtex: z.string().default(""),
  links: z.array(linkItemSchema).default([]),
});

export const newsFilterSchema = z.object({
  filter: z.enum(["featured", "all"]).default("featured"),
  limit: z.number().int().positive().optional(),
});

export const blogPostFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  desc: z.string().optional(),
  author: z.string().optional(),
  /** Team member folder id (default: {name-slug}-{year}-{student-or-staff-id}). Links author to profile. */
  authorId: z.string().optional(),
  /** Multiple team member folder ids; merged with authorId when both are set. */
  authorIds: z.array(z.string()).optional(),
  /** Prominent resource buttons rendered after the intro (paper / code / 小红书 / 微信公众号). */
  links: z
    .array(
      z.object({
        kind: z.enum(["paper", "code", "xiaohongshu", "wechat", "website"]),
        href: z.string().min(1),
        label: z.string().optional(),
      }),
    )
    .default([]),
  tags: z.array(z.string()).default([]),
  cover: optionalImagePath,
  coverAlt: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  draft: z.boolean().optional(),
  id: z.string().optional(),
});

export const blogPostSchema = blogPostFrontmatterSchema
  .pick({
    title: true,
    date: true,
    author: true,
    tags: true,
    cover: true,
    coverAlt: true,
  })
  .extend({
    id: z.string(),
    desc: z.string(),
    body: z.string(),
    authors: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        profileHref: z.string().optional(),
      }),
    ),
    links: z
      .array(
        z.object({
          kind: z.enum(["paper", "code", "xiaohongshu", "wechat", "website"]),
          href: z.string(),
          label: z.string(),
        }),
      )
      .default([]),
  });

/** Shared team member frontmatter — PI and all groups use the same fields in *.md headers. */
export const teamMemberFrontmatterSchema = z.object({
  name: z.string().min(1),
  /** Relative to member folder (e.g. photo.jpeg) or site path (/content-assets/...). Served at /team-assets/{group}/{folder}/... */
  photo: z.union([z.string(), z.null()]).optional().transform((value) => value ?? null),
  /** PI profile hero background image. Omit for default gradient. Same path rules as photo. */
  heroBackground: z.union([z.string(), z.null()]).optional().transform((value) => value ?? null),
  bio: z.string(),
  degree: z.string().optional(),
  startDate: z.union([z.string(), z.number()]).optional(),
  order: z.number().optional(),
  /** When true, publish a profile page at /{member-folder}. Folder name is the canonical slug. */
  profile: z.boolean().optional(),
  /** When true, keep the profile out of search engines (per-page noindex + excluded from sitemap), even when the site is indexable. Useful for template/placeholder profiles. */
  noindex: z.boolean().optional(),
  /** Optional override for member id (defaults to member folder name). */
  id: z.string().optional(),
  /** Topic labels shown on profile intro and team card. */
  tags: z.array(z.string()).default([]),
  /** Contact email — rendered separately from link chips (hero + team card). */
  email: z
    .string()
    .optional()
    .transform((value) => normalizeMemberEmail(value))
    .pipe(z.union([z.undefined(), z.email()])),
  links: z.array(memberLinkSchema).default([]),
});

export const teamMemberSchema = teamMemberFrontmatterSchema
  .pick({
    name: true,
    photo: true,
    heroBackground: true,
    bio: true,
    degree: true,
    order: true,
    tags: true,
    email: true,
    links: true,
    noindex: true,
  })
  .extend({
    id: z.string(),
    startDate: z.string().optional(),
    profile: z.string().optional(),
  });

export const homeHighlightSchema = z.object({
  id: z.string(),
  label: z.string(),
  labelZh: z.string().optional(),
  content: z.string(),
  contentZh: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  links: z.array(linkItemSchema).default([]),
});

export const homeProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  desc: z.string().optional(),
  descZh: z.string().optional(),
  period: z.string().optional(),
  periodZh: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  tagsZh: z.array(z.string()).optional(),
  links: z.array(linkItemSchema).default([]),
});

export const partnerKindSchema = z.enum(["company", "lab", "person"]);

export const homePartnerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    kind: partnerKindSchema.optional(),
    logo: z.string().optional(),
    image: z.string().optional(),
    photo: z.string().optional(),
    affiliation: z.string().optional(),
    desc: z.string().optional(),
    href: z.string().optional(),
  })
  .transform(({ image, logo, photo, kind, ...rest }) => {
    const resolvedLogo = logo ?? image;
    const resolvedPhoto = photo;
    const resolvedKind = kind ?? (resolvedPhoto ? "person" : "company");

    return {
      ...rest,
      kind: resolvedKind,
      logo: resolvedLogo,
      photo: resolvedPhoto,
    };
  });

export const homeHeroFeaturedNewsSchema = z.object({
  label: z.string().default("Latest highlight"),
  id: z.string().min(1),
});

export const homeHeroChannelSchema = z
  .object({
    label: z.string().min(1),
    desc: z.string().min(1),
    kind: z.enum(["link", "qr"]),
    href: z.string().url().optional(),
    qrImage: z.string().optional(),
  })
  .superRefine((channel, ctx) => {
    if (channel.kind === "link" && !channel.href) {
      ctx.addIssue({
        code: "custom",
        message: "Home hero link channel requires href.",
        path: ["href"],
      });
    }

    if (channel.kind === "qr" && !channel.qrImage) {
      ctx.addIssue({
        code: "custom",
        message: "Home hero QR channel requires qrImage.",
        path: ["qrImage"],
      });
    }
  });

export const homeHeroSchema = z.object({
  title: z.string(),
  titleZh: z.string().optional(),
  subtitle: z.string(),
  subtitleZh: z.string().optional(),
  kicker: z.string().optional(),
  kickerZh: z.string().optional(),
  backgroundImage: z.string().optional(),
  brandMark: z.string().optional(),
  featuredNews: homeHeroFeaturedNewsSchema.optional(),
  actions: z.array(linkItemSchema).default([]),
  channels: z.array(homeHeroChannelSchema).default([]),
});

export const homeSectionsSchema = z.object({
  directionsTitle: z.string().default("Research directions"),
  newsTitle: z.string().default("Recent updates"),
});

const homeModuleBaseSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  titleZh: z.string().optional(),
});

export const homeHighlightsModuleSchema = homeModuleBaseSchema.extend({
  type: z.literal("highlights"),
  title: z.string(),
  items: z.array(homeHighlightSchema),
});

export const homeNewsModuleSchema = homeModuleBaseSchema.extend({
  type: z.literal("news"),
  title: z.string(),
  source: z.enum(["featured", "all"]).default("featured"),
  limit: z.number().int().positive().optional(),
  loadMore: z
    .object({
      enabled: z.boolean().default(true),
      label: z.string().default("Load More"),
      labelZh: z.string().optional(),
    })
    .default({ enabled: true, label: "Load More" }),
});

export const homeProseModuleSchema = homeModuleBaseSchema
  .extend({
    type: z.literal("prose"),
    title: z.string(),
    body: z.array(z.string()).optional(),
    bodyZh: z.array(z.string()).optional(),
    markdown: z.string().optional(),
    markdownZh: z.string().optional(),
  })
  .superRefine((module, ctx) => {
    const hasBody = Array.isArray(module.body) && module.body.length > 0;
    const hasMarkdown = typeof module.markdown === "string" && module.markdown.trim().length > 0;

    if (!hasBody && !hasMarkdown) {
      ctx.addIssue({
        code: "custom",
        message: "Prose module requires body paragraphs or markdown content.",
        path: ["body"],
      });
    }
  });

export const homeLinksModuleSchema = homeModuleBaseSchema.extend({
  type: z.literal("links"),
  title: z.string(),
  links: z.array(linkItemSchema).min(1),
});

export const homeProjectsModuleSchema = homeModuleBaseSchema.extend({
  type: z.literal("projects"),
  title: z.string(),
  items: z.array(homeProjectSchema).min(1),
});

export const homePartnersModuleSchema = homeModuleBaseSchema.extend({
  type: z.literal("partners"),
  title: z.string(),
  items: z.array(homePartnerSchema).min(1),
});

export const homeModuleSchema = z.discriminatedUnion("type", [
  homeHighlightsModuleSchema,
  homeNewsModuleSchema,
  homeProseModuleSchema,
  homeLinksModuleSchema,
  homeProjectsModuleSchema,
  homePartnersModuleSchema,
]);

export const homeContentSchema = z.object({
  hero: homeHeroSchema,
  modules: z.array(homeModuleSchema).min(1),
});

export const pageHeroSchema = z.object({
  title: z.string(),
  kicker: z.string().optional(),
});

export const sitePagesSchema = z.object({
  team: pageHeroSchema.default({ title: "Team" }),
  news: pageHeroSchema.default({ title: "News" }),
  publications: pageHeroSchema.default({ title: "Publications" }),
  projects: pageHeroSchema.default({ title: "Projects" }),
  blog: pageHeroSchema.default({ title: "Blog" }),
});

export const siteFooterSchema = z.object({
  credit: z.string().default(""),
  externalLinks: z.array(linkItemSchema).default([]),
});

export const siteConfigSchema = z.object({
  name: z.string().default("AI4GC Lab"),
  tagline: z.string().default(""),
  taglineZh: z.string().optional(),
  description: z.string().default(""),
  /** Absolute production URL (e.g. https://ai4gc.zju.edu.cn); overridden by SITE_URL env. */
  url: z.string().default(""),
  /** When true, search engines may index the site (robots + page meta). Keep false until launch. */
  indexable: z.boolean().default(false),
  logo: z.string().default("/content-assets/ai4gclab/AI4GC.png"),
  schoolLogo: z.string().optional(),
  schoolName: z.string().default("Zhejiang University"),
  schoolHref: z.string().default("https://www.zju.edu.cn/english/"),
  favicon: z.string().default("/content-assets/site/favicon.jpeg"),
  scholarUrl: z.string().default(""),
  dblpUrl: z.string().default(""),
  dblpPid: z.string().default(""),
  featuredNewsCount: z.number().int().positive().default(4),
  newsPageVisibleCount: z.number().int().positive().default(12),
  blogPageVisibleCount: z.number().int().positive().default(10),
  nav: z.array(linkItemSchema).default([]),
  footer: siteFooterSchema.default({ credit: "", externalLinks: [] }),
  pages: sitePagesSchema.default({
    team: { title: "Team" },
    news: { title: "News" },
    publications: { title: "Publications" },
    projects: { title: "Projects" },
    blog: { title: "Blog" },
  }),
  team: z.object({
    openings: z.string().nullable().default(null),
    openingsForm: linkItemSchema.nullable().optional(),
    sponsors: z.string().nullable().default(null),
  }),
});

export type NewsItemInput = z.infer<typeof newsItemSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberFrontmatterSchema>;
