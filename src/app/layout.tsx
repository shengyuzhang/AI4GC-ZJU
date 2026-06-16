import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/site/SiteFooter";
import JsonLd from "@/components/site/JsonLd";
import { getSiteConfig } from "@/lib/content";
import { absoluteUrl, getSiteUrl } from "@/lib/site/site-url";

const sourceSerif = localFont({
  src: "./fonts/source-serif-4.woff2",
  weight: "200 900",
  variable: "--font-display",
  display: "swap",
});

const sourceSans = localFont({
  src: "./fonts/source-sans-3.woff2",
  weight: "200 900",
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    icons: {
      icon: site.favicon,
      apple: site.logo,
    },
    appleWebApp: {
      capable: true,
      title: site.name,
      statusBarStyle: "default",
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: site.name,
      description: site.description,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
    },
    robots: site.indexable
      ? { index: true, follow: true }
      : {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        },
  };
}

export const viewport: Viewport = {
  themeColor: "#343f87",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getSiteConfig();
  const headerList = await headers();
  const isAdminRoute = headerList.get("x-admin-route") === "1";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: getSiteUrl(),
    logo: absoluteUrl(site.logo),
    description: site.description,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: site.schoolName,
      url: site.schoolHref,
    },
  };

  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${sourceSans.variable} ${ibmPlexMono.variable}`}
    >
      <body
        className={
          isAdminRoute
            ? "admin-body font-body antialiased"
            : "surface-shell flex min-h-dvh flex-col font-body antialiased"
        }
      >
        {!isAdminRoute ? <JsonLd data={organizationJsonLd} /> : null}
        {!isAdminRoute ? (
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
        ) : null}
        {!isAdminRoute ? (
          <Navbar
            name={site.name}
            logo={site.logo}
            schoolLogo={site.schoolLogo}
            schoolName={site.schoolName}
            schoolHref={site.schoolHref}
            nav={site.nav}
          />
        ) : null}
        <div id="main-content" tabIndex={-1} className="main-region">
          {children}
        </div>
        {!isAdminRoute ? (
          <SiteFooter
            name={site.name}
            tagline={site.tagline}
            nav={site.nav}
            footer={site.footer}
          />
        ) : null}
        {/* Vercel Web Analytics — cookieless page-view tracking on public pages.
            Script + beacon are same-origin (/_vercel/insights/*), so the CSP
            (script-src 'self', connect-src 'self') already allows it. */}
        {!isAdminRoute ? <Analytics /> : null}
      </body>
    </html>
  );
}
