import { formatStarCount, getGitHubStars, isGitHubRepoRootHref } from "@/lib/github-stars";
import type { GitHubStarsMap } from "@/lib/github-stars";
import type { BlogResourceKind, BlogResourceLink } from "@/types/lab";

type BlogResourceLinksProps = {
  links: BlogResourceLink[];
  githubStars?: GitHubStarsMap;
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function ResourceIcon({ kind }: { kind: BlogResourceKind }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "paper":
      return (
        <svg {...common}>
          <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M13 3v5h5" />
          <path d="M8.5 13h7M8.5 16.5h5" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m9 8-4 4 4 4" />
          <path d="m15 8 4 4-4 4" />
          <path d="m13 6-2 12" />
        </svg>
      );
    case "xiaohongshu":
      return (
        <svg {...common}>
          <path d="M5 4h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
          <path d="M8 9.5v4M16 9.5v4M12 8.5l-1.5 5M12 8.5l1.5 5" />
        </svg>
      );
    case "wechat":
      return (
        <svg {...common}>
          <path d="M9.5 5C5.9 5 3 7.4 3 10.4c0 1.7 1 3.2 2.5 4.2L5 17l2.6-1.2c.6.2 1.2.3 1.9.3" />
          <path d="M21 14.3c0-2.5-2.4-4.5-5.4-4.5s-5.4 2-5.4 4.5 2.4 4.5 5.4 4.5c.6 0 1.2-.1 1.8-.3L20 20l-.5-1.8c.9-.9 1.5-2 1.5-3.9Z" />
          <path d="M14 13.6h.01M17.2 13.6h.01" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.3 3.8 8.5S14.5 18.2 12 20.5c-2.5-2.3-3.8-5.3-3.8-8.5S9.5 5.8 12 3.5Z" />
        </svg>
      );
  }
}

export default function BlogResourceLinks({ links, githubStars = {} }: BlogResourceLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav className="blog-resource-bar" aria-label="Paper resources and links">
      {links.map((link) => {
        const external = isExternal(link.href);
        const stars = isGitHubRepoRootHref(link.href)
          ? getGitHubStars(link.href, githubStars)
          : undefined;
        return (
          <a
            key={`${link.kind}-${link.href}`}
            className={`blog-resource-link blog-resource-link--${link.kind}`}
            href={link.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            <span className="blog-resource-link__icon" aria-hidden="true">
              <ResourceIcon kind={link.kind} />
            </span>
            <span className="blog-resource-link__label">{link.label}</span>
            {stars != null ? (
              <span className="blog-resource-link__stars" aria-label={`${stars} stars`}>
                <span className="blog-resource-link__star-icon" aria-hidden="true">
                  ★
                </span>
                {formatStarCount(stars)}
              </span>
            ) : null}
            <span className="blog-resource-link__arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
