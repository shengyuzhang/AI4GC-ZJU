export type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type BlogChannelPlatform = "wechat" | "x" | "xiaohongshu";

export type BlogChannel = {
  label: string;
  href: string;
  platform: BlogChannelPlatform;
  desc?: string;
};

/** Team member link — profile pages, social accounts, personal sites. */
export type MemberLink = LinkItem & {
  kind?: "profile" | "social" | "website" | "blog-channel";
  /** Optional one-line note shown on the profile Blog channel card. */
  desc?: string;
};

export type NewsItem = {
  id: string;
  date: string;
  title: string;
  desc: string;
  href?: string;
  featured?: boolean;
  image?: string;
  imageAlt?: string;
  links: LinkItem[];
};

export type BlogAuthorRef = {
  id: string;
  name: string;
  profileHref?: string;
};

/** Prominent resource buttons shown near the top of a blog post. */
export type BlogResourceKind = "paper" | "code" | "xiaohongshu" | "wechat" | "website";

export type BlogResourceLink = {
  kind: BlogResourceKind;
  href: string;
  label: string;
};

export type BlogPost = {
  id: string;
  title: string;
  date: string;
  desc: string;
  author?: string;
  authors: BlogAuthorRef[];
  links: BlogResourceLink[];
  tags: string[];
  cover?: string;
  coverAlt?: string;
  body: string;
};

export type HomeHeroFeaturedNews = {
  label: string;
  id: string;
};

export type HomeHeroChannel = {
  label: string;
  desc: string;
  kind: "link" | "qr";
  href?: string;
  qrImage?: string;
};

export type PublicationItem = {
  id: string;
  title: string;
  authors: string;
  /** Individual author display names, in order — used to link group-member authors to profiles. */
  authorList: string[];
  /** Display names flagged as corresponding authors (BibTeX `corresponding` field). */
  correspondingAuthors: string[];
  venue: string;
  honor?: string;
  href?: string;
  /** Internal link to a related blog post (e.g. /blog/{slug}) when the BibTeX entry has a `blog` field. */
  blogHref?: string;
  /** Topic tags from the BibTeX `keywords` field, used for filtering. */
  topics: string[];
  /** Clean re-serialized BibTeX entry for the "Copy BibTeX" button. */
  bibtex: string;
  links: LinkItem[];
};

export type TeamMember = {
  id: string;
  name: string;
  photo: string | null;
  heroBackground?: string | null;
  degree?: string;
  bio: string;
  startDate?: string;
  order?: number;
  profile?: string;
  /** Keep this profile out of search engines (per-page noindex + excluded from sitemap). */
  noindex?: boolean;
  tags?: string[];
  email?: string;
  links: MemberLink[];
};

export type TeamContent = {
  pi: TeamMember;
  postdocs: TeamMember[];
  phds: TeamMember[];
  masters: TeamMember[];
  undergrads: TeamMember[];
  alumni: TeamMember[];
  openings: string | null;
  openingsForm: LinkItem | null;
  sponsors: string | null;
};

export type HomeHighlight = {
  id: string;
  label: string;
  content: string;
  image?: string;
  imageAlt?: string;
  links: LinkItem[];
};

export type HomeHero = {
  title: string;
  subtitle: string;
  kicker?: string;
  backgroundImage?: string;
  brandMark?: string;
  featuredNews?: HomeHeroFeaturedNews;
  actions: LinkItem[];
  channels: HomeHeroChannel[];
};

export type HomeModuleBase = {
  id: string;
  enabled: boolean;
};

export type HomeHighlightsModule = HomeModuleBase & {
    type: "highlights";
    title: string;
    items: HomeHighlight[];
  };

export type HomeNewsModule = HomeModuleBase & {
    type: "news";
    title: string;
    source: "featured" | "all";
    limit?: number;
    loadMore: {
      enabled: boolean;
      label: string;
    };
  };

export type HomeProseModule = HomeModuleBase & {
    type: "prose";
    title: string;
    body?: string[];
    markdown?: string;
  };

export type HomeProject = {
  id: string;
  name: string;
  desc?: string;
  period?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  links: LinkItem[];
};

export type PartnerKind = "company" | "lab" | "person";

export type HomePartner = {
  id: string;
  name: string;
  kind: PartnerKind;
  logo?: string;
  photo?: string;
  affiliation?: string;
  desc?: string;
  href?: string;
};

export type HomeLinksModule = HomeModuleBase & {
    type: "links";
    title: string;
    links: LinkItem[];
  };

export type HomeProjectsModule = HomeModuleBase & {
    type: "projects";
    title: string;
    items: HomeProject[];
  };

export type HomePartnersModule = HomeModuleBase & {
    type: "partners";
    title: string;
    items: HomePartner[];
  };

export type HomeModule =
  | HomeHighlightsModule
  | HomeNewsModule
  | HomeProseModule
  | HomeLinksModule
  | HomeProjectsModule
  | HomePartnersModule;

export type HomeContent = {
  hero: HomeHero;
  modules: HomeModule[];
};

export type PageHero = {
  title: string;
  kicker?: string;
};

export type SitePages = {
  team: PageHero;
  news: PageHero;
  publications: PageHero;
  blog: PageHero;
};

export type SiteFooter = {
  credit: string;
  externalLinks: LinkItem[];
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  indexable: boolean;
  logo: string;
  schoolLogo?: string;
  schoolName: string;
  schoolHref: string;
  favicon: string;
  scholarUrl: string;
  dblpUrl: string;
  dblpPid: string;
  featuredNewsCount: number;
  newsPageVisibleCount: number;
  blogPageVisibleCount: number;
  nav: LinkItem[];
  footer: SiteFooter;
  pages: SitePages;
  team: {
    openings: string | null;
    openingsForm?: LinkItem | null;
    sponsors: string | null;
  };
};

export type NewsFilter = {
  filter: "featured" | "all";
  limit?: number;
};

export type MemberProfile = {
  slug: string;
  body: string;
  segments: import("@/lib/content/resolve-profile-papers").ProfileBodySegment[];
  member: TeamMember;
  group: import("@/lib/content/team-assets").TeamContentGroup;
};
