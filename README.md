# AI4GC Lab Website

Official website for AI4GC Lab, a frontier research group focused on efficient AI systems, multimodal generation, agent workflows, and deployable model optimization.

Built for academic visitors, prospective students, collaborators, and research engineers who need a clear view of the lab's focus, recent work, publications, and team.

## Pages

| Route | Description |
| --- | --- |
| `/` | Lab overview and recent updates |
| `/news` | News and announcements (Previous / Next pagination) |
| `/publications` | Selected publications |
| `/team` | Team members |
| `/blog` | Lab blog posts (Previous / Next pagination, Newest / Oldest sort) |
| `/recruit` | Research internships on PhD-led projects |
| `/{member-folder}` | Member profile when `profile: true` (e.g. `/shengyu-zhang`, `/yurun-chen-2025-12551024`) |
| `/admin` | Optional content file console (disabled unless `ADMIN_ENABLED=true`) |

## Local development

Requires [Node.js](https://nodejs.org/) 24+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build      # production build
npm run start      # serve production build
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run check      # lint + typecheck + test + build
```

## Contributing

Lab members: see **[CONTRIBUTING.md](CONTRIBUTING.md)** (中文) for the Fork → Pull Request workflow and the current list of content tasks. `master` is protected — all changes land via reviewed PRs.

## Content

Site copy, structured data, and site-level assets live in **`content/`**. By default you edit files in git and redeploy. An optional admin file console can edit the same files when enabled.

### Admin file console (optional)

Set in `.env.local` (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `ADMIN_ENABLED` | Must be `true` to expose `/admin` and `/api/admin/*` |
| `ADMIN_PASSWORD` | Login password |
| `ADMIN_SECRET` | HMAC secret for httpOnly session cookie |
| `ADMIN_ALLOWED_IPS` | Optional comma-separated IP allowlist |

When enabled, sign in at `/admin/login` to browse, edit, create, delete, and upload files for the source-of-truth `content/` tree. The admin is intentionally a file console, not a separate CMS schema. Admin routes return **404** when `ADMIN_ENABLED` is not `true`.

### Authoritative specification

**[content/guidance.md](content/guidance.md) is the single source of truth for content authoring.** Every field name, file path, naming convention, and profile-section format is defined there. When adding news, publications, team members, blog posts, or homepage modules, follow that document — do not invent parallel formats. Build-time Zod validation (`src/lib/content/schema.ts`) enforces the same rules; failures appear when you run `npm run check`.

| If you want to… | See guidance.md section |
| --- | --- |
| Change site name, nav, footer | [`site.yaml`](content/guidance.md#contentsiteyaml) |
| Edit homepage hero / spotlight | [`home/hero.yaml`](content/guidance.md#heroyaml) |
| Add news or blog posts | [`news/`](content/guidance.md#新闻-contentnews), [`blog/`](content/guidance.md#博客-contentblog) |
| Add or edit publications | [`publications.bib`](content/guidance.md#论文-contentpublicationsbib) |
| Add team members or profile pages | [`team/`](content/guidance.md#团队-contentteam) |
| Look up which file backs a page | [`配置与文件对照`](content/guidance.md#配置与文件对照) |

### Directory overview

```
content/
  guidance.md              # content authoring manual shown first in /admin
  site.yaml                 # identity, nav, footer, display limits
  publications.bib          # BibTeX for /publications
  assets/                   # public, site-wide assets only
  home/
    hero.yaml               # homepage hero
    order.yaml              # module order
    modules/
      lab-projects/
        index.yaml          # module data
        *.svg               # project-local assets
      lab-partners/
        index.yaml          # module data
        *.svg               # partner-local assets
  news/                     # one file per item (filename = id)
  team/
    {group}/{member-folder}/
      index.md              # frontmatter + optional profile body
      photo.*               # optional local asset
      papers.bib            # optional profile papers
  blog/
    {post-folder}/index.md  # folder name = URL slug
```

Static assets: site-wide files under `content/assets/` (served as `/content-assets/...`). Self-contained assets live beside their content: member files under each member folder (`/team-assets/...`), blog assets under each post folder (`/blog-assets/...`), and homepage module assets under their module folder (`/home-assets/...`). Path rules are in [guidance.md → 静态资源](content/guidance.md#静态资源路径).

### Workflow

1. **Read [content/guidance.md](content/guidance.md)** for the content type you are editing
2. Edit files under `content/`
3. `npm run dev` — local preview at [http://localhost:3000](http://localhost:3000)
4. `npm run check` — lint, typecheck, tests, and build (must pass before merge)
5. Commit and push — deploy picks up changes

### Environment

Optional: copy [`.env.example`](.env.example) to `.env.local` and set `GITHUB_TOKEN` for higher GitHub API rate limits when fetching repository star counts on link chips. The site works without it.

### Production & security

- **Content:** file-based only — no database; optional admin writes the same files under `content/`.
- **Crawlers:** controlled by `content/site.yaml` → `indexable`. When `true`, `src/app/robots.ts` allows crawling and emits the sitemap; when `false`, all bots are disallowed and pages set `noindex`. Individual member profiles can opt out via frontmatter `noindex: true`.
- **HTTP headers:** production responses include HSTS, CSP, and baseline hardening via `src/lib/security/headers.ts` and `next.config.ts`.
- **Asset routes:** `/content-assets/`, `/home-assets/`, `/team-assets/`, and `/blog-assets/` validate paths and MIME types before serving files from `content/`.

To toggle search indexing, set `content/site.yaml` → `indexable` (drives both `robots.ts` and per-page robots metadata).

One-time migration scripts (legacy): `scripts/migrate-content.mjs`, `scripts/migrate-team-to-md.mjs`, `scripts/migrate-team-to-folders.mjs`.

For agent / contributor conventions, see also [AGENTS.md](AGENTS.md).

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Design principles

- Research first, decoration second.
- Use restraint as a sign of confidence.
- Let hierarchy solve alignment.
- Preserve institutional credibility on every page.

Target WCAG AA contrast, readable line lengths, keyboard-visible focus states, and stable responsive layouts.
