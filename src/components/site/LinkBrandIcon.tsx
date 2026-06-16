export type LinkPlatform =
  | "scholar"
  | "github"
  | "dblp"
  | "linkedin"
  | "x"
  | "xiaohongshu"
  | "homepage";

/** Detects a known profile-link platform from its label or href. */
export function detectLinkPlatform(label: string, href: string): LinkPlatform | null {
  const l = label.toLowerCase();
  const h = href.toLowerCase();

  if (h.includes("scholar.google") || l.includes("scholar")) return "scholar";
  if (h.includes("github.com") || l === "github") return "github";
  if (h.includes("dblp.org") || h.includes("dblp.uni") || l.includes("dblp")) return "dblp";
  if (h.includes("linkedin.com") || l.includes("linkedin")) return "linkedin";
  if (
    h.includes("x.com")
    || h.includes("twitter.com")
    || h.includes("screen_name=")
    || l === "x"
    || l.startsWith("x ")
    || /\btwitter\b/i.test(label)
  ) {
    return "x";
  }
  if (
    h.includes("xiaohongshu.com")
    || l.includes("xiaohongshu")
    || l.includes("rednote")
    || label.includes("小红书")
  ) {
    return "xiaohongshu";
  }
  if (
    /\bhomepage\b/i.test(label)
    || /\bwebsite\b/i.test(label)
    || /\bpersonal\b/i.test(label)
    || /\bhome\s+page\b/i.test(label)
  ) {
    return "homepage";
  }
  return null;
}

type LinkBrandIconProps = {
  label: string;
  href: string;
};

/** Renders a recognizable monochrome icon for a known platform, or null. */
export default function LinkBrandIcon({ label, href }: LinkBrandIconProps) {
  const platform = detectLinkPlatform(label, href);
  if (!platform) {
    return null;
  }

  const stroke = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (platform) {
    case "github":
      return (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.7 18 5 18 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .78 23.2 0 22.22 0Z" />
        </svg>
      );
    case "scholar":
      return (
        <svg {...stroke}>
          <path d="M12 4 2 9l10 5 10-5-10-5Z" />
          <path d="M6 11.3V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.7" />
          <path d="M22 9v5" />
        </svg>
      );
    case "dblp":
      return (
        <svg {...stroke}>
          <path d="M4 4v16" />
          <path d="M8.5 4v16" />
          <path d="m13 5 4.4 15" />
          <rect x="2.5" y="4" width="2" height="16" rx="0.5" />
        </svg>
      );
    case "x":
      return (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "xiaohongshu":
      return (
        <svg {...stroke}>
          <path d="M5 4h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
          <path d="M8 9.5v4M16 9.5v4M12 8.5l-1.5 5M12 8.5l1.5 5" />
        </svg>
      );
    case "homepage":
    default:
      return (
        <svg {...stroke}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19" />
          <path d="M12 2.5c2.5 2.6 3.9 5.9 3.9 9.5S14.5 18.9 12 21.5c-2.5-2.6-3.9-5.9-3.9-9.5S9.5 5.1 12 2.5Z" />
        </svg>
      );
  }
}
