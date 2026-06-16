type SecurityHeader = {
  key: string;
  value: string;
};

const SHARED_SECURITY_HEADERS: SecurityHeader[] = [
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Site-wide crawler block — sent only when indexing is disabled
// (content/site.yaml → indexable: false). When indexing is enabled we must NOT
// send this header, or it overrides per-page robots meta and search engines
// refuse to index ("noindex detected in X-Robots-Tag").
const NOINDEX_HEADER: SecurityHeader = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow, noarchive, nosnippet",
};

const PRODUCTION_SECURITY_HEADERS: SecurityHeader[] = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

export function getSecurityHeaders(options: { indexable?: boolean } = {}): SecurityHeader[] {
  const headers = [...SHARED_SECURITY_HEADERS];

  // Block crawlers site-wide only when indexing is turned off.
  if (!options.indexable) {
    headers.push(NOINDEX_HEADER);
  }

  if (process.env.NODE_ENV === "production") {
    headers.push(...PRODUCTION_SECURITY_HEADERS);
  }

  return headers;
}
