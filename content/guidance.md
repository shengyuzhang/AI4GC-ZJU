# 网站内容配置规范

`**content/guidance.md` 是本站所有内容的唯一规范。** 新增或修改新闻、论文、成员、博客、首页模块等，均须按本文档的字段、路径与命名规则编写；构建阶段由 Zod schema（`src/lib/content/schema.ts`）校验，`npm run check` 失败即表示内容与规范不一致。

文案与数据存放在 `content/`。修改后提交 Git 并重新部署即可生效。

---

## 目录


| 章节                                                | 内容                              |
| ------------------------------------------------- | ------------------------------- |
| [快速开始](#快速开始)                                     | 新增各类内容的最短路径                     |
| [目录结构](#目录结构)                                     | `content/` 树与静态资源               |
| [通用字段](#通用字段)                                     | `LinkItem`、`tags`、`id`          |
| [site.yaml](#contentsiteyaml)                     | 全站身份、导航、页脚、分页条数                 |
| [首页 home/](#首页-contenthome)                       | Hero、模块、`order.yaml`            |
| [新闻 news/](#新闻-contentnews)                       | 单条新闻 YAML / Markdown            |
| [博客 blog/](#博客-contentblog)                       | 文章文件夹 + `index.md`              |
| [论文 publications.bib](#论文-contentpublicationsbib) | 全站论文 BibTeX                     |
| [团队 team/](#团队-contentteam)                       | 成员 frontmatter、个人页、`papers.bib` |
| [静态资源](#静态资源路径)                                   | `content/assets/`、成员/博客本地资源     |
| [代码入口](#代码入口)                                     | 加载器与组件路径                        |
| [配置与文件对照](#配置与文件对照)                               | 页面内容 → 文件速查                     |
| [Admin 文件控制台](#admin-文件控制台可选)                     | `/admin` 本地编辑、预览、上传与保存规则        |
| [延伸阅读](#延伸阅读)                                     | README 与 Agent 指南               |


---

## 快速开始

按「要改什么」找文件，字段细节见对应章节。


| 目标                   | 操作                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------- |
| 改站点名、导航、页脚           | 编辑 `content/site.yaml`                                                              |
| 改首页 Hero / Spotlight | 编辑 `content/home/hero.yaml`；Spotlight 的 `featuredNews.id` 须对应 `content/news/` 中已有条目 |
| 改首页模块顺序              | 编辑 `content/home/order.yaml`                                                        |
| 改研究方向 / 项目 / 合作伙伴等模块 | 编辑 `content/home/modules/<module>.yaml` 或 `content/home/modules/<module>/index.yaml` |
| 新增新闻                 | 在 `content/news/` 新建 `*.yaml` 或 `*.md`（文件名 = `id`）                                  |
| 新增博客                 | 在 `content/blog/` 新建文件夹 + `index.md`（文件夹名 = URL）                                    |
| 新增 / 修改论文            | 编辑 `content/publications.bib`                                                       |
| 新增成员                 | 在 `content/team/{group}/{member-folder}/` 新建 `index.md`（及可选 `photo.*`、`papers.bib`） |
| 发布个人页                | 成员 frontmatter 设 `profile: true`；URL = `/{member-folder}`                           |
| 改招募文案                | 编辑 `content/site.yaml` → `team.openings`                                            |


**推荐流程：** 对照本文档写好内容 → `npm run dev` 预览 → `npm run check` 通过 → 提交并部署。

---

## 目录结构

```
content/
├── guidance.md
├── site.yaml
├── publications.bib
├── assets/
│   ├── ai4gclab/
│   ├── media/
│   ├── site/
│   └── zju/
├── home/
│   ├── hero.yaml
│   ├── order.yaml
│   └── modules/
│       ├── research-directions.yaml
│       ├── who-we-are/
│       │   └── index.md
│       ├── lab-projects/
│       │   ├── index.yaml
│       │   └── *.*              # project-local assets
│       └── lab-partners/
│           ├── index.yaml
│           └── *.*              # partner-local assets
├── news/
│   └── *.yaml | *.md
├── blog/
│   └── {post-folder}/
│       ├── index.md
│       └── *.*              # optional local assets
└── team/
    ├── pi/{name-slug}/              # e.g. shengyu-zhang
    │   ├── index.md
    │   └── photo.*
    ├── postdocs/{name-slug}-{year}-{student-or-staff-id}/index.md
    ├── phds/{name-slug}-{year}-{student-or-staff-id}/index.md
    ├── masters/{name-slug}-{year}-{student-or-staff-id}/index.md
    ├── undergrads/{name-slug}-{year}-{student-or-staff-id}/index.md
    └── alumni/{name-slug}-{year}-{student-or-staff-id}/index.md
```

静态资源：

- 站点级：`content/assets/`（URL 以 `/content-assets/` 开头，如 `/content-assets/ai4gclab/AI4GC.png`）
- 成员级：放在 `content/team/{group}/{member-folder}/` 下，在 frontmatter 或 Markdown 中用相对路径（如 `photo.jpeg`），运行时映射为 `/team-assets/{group}/{member-folder}/photo.jpeg`
- 博客级：放在 `content/blog/{post-folder}/` 下，在 Markdown 中用相对路径，运行时映射为 `/blog-assets/{post-folder}/...`
- `content/guidance.md` 是 Admin 默认打开的内容手册，只用于编辑说明，不作为公开页面展示。

不存在 `home/hero.yaml` 时，回退读取 `content/home.yaml`。
不存在 `content/pages/` — 个人页正文写在对应成员的 `index.md` 正文中。

---

## 通用字段

### `LinkItem`


| 字段         | 类型      | 必填  | 说明                                               |
| ---------- | ------- | --- | ------------------------------------------------ |
| `label`    | string  | 是   | 芯片/链接显示文字                                        |
| `href`     | string  | 是   | 站内路径或完整 URL                                      |
| `external` | boolean | 否   | `true` 时新标签页打开；省略时，`http://` / `https://` 开头视为外链 |


指向 `github.com/{owner}/{repo}` 的链接在构建时拉取 star 数并显示。可选环境变量 `GITHUB_TOKEN`（见项目根 `.env.example` → 复制为 `.env.local`）用于提高 GitHub API 限额。

### `tags` 与 `links`


| 配置                  | 说明        |
| ------------------- | --------- |
| `tags: string[]`    | 话题标签，静态展示 |
| `links: LinkItem[]` | 可点击链接芯片   |


### ID


| 场景         | 默认 `id`                                            |
| ---------- | -------------------------------------------------- |
| 显式 `id`    | 使用 YAML 中的值                                        |
| 新闻         | 文件名（无扩展名）                                          |
| 团队成员（PI）   | 文件夹名（如 `shengyu-zhang`）                            |
| 团队成员（非 PI） | 文件夹名，默认 `{name-slug}-{year}-{student-or-staff-id}` |
| 首页模块       | `modules/` 下文件名（无扩展名）                              |


Slug 逻辑：`src/lib/content/slug.ts`。

---

## `content/site.yaml`


| 字段                     | 类型            | 默认值                                 | 说明                                           |
| ---------------------- | ------------- | ----------------------------------- | -------------------------------------------- |
| `name`                 | string        | `AI4GC Lab`                         | 站点名称                                         |
| `tagline`              | string        | —                                   | 标语                                           |
| `description`          | string        | —                                   | SEO / metadata                               |
| `logo`                 | string        | `/content-assets/ai4gclab/AI4GC.png` | 导航 Logo                                      |
| `schoolLogo`           | string        | —                                   | 学校 Logo（导航旁）                                 |
| `schoolName`           | string        | `Zhejiang University`               | 学校名称                                         |
| `schoolHref`           | string        | ZJU 英文站 URL                         | 学校链接                                         |
| `favicon`              | string        | `/content-assets/site/favicon.jpeg` | Favicon                                      |
| `scholarUrl`           | string        | —                                   | PI 的 Google Scholar 主页；显示在 `/publications` 顶部与页脚 |
| `dblpUrl`              | string        | —                                   | PI 的 DBLP 主页；显示在 `/publications` 顶部与页脚         |
| `dblpPid`              | string        | —                                   | DBLP 作者 id（如 `47/3459-1`），供 `npm run pubs:sync` 使用 |
| `featuredNewsCount`    | number        | `4`                                 | 首页 featured 新闻默认条数                           |
| `newsPageVisibleCount` | number        | `12`                                | `/news` 每页条数（Previous / Next 分页）             |
| `blogPageVisibleCount` | number        | `10`                                | `/blog` 每页条数（Previous / Next 分页）             |
| `nav`                  | `LinkItem[]`  | `[]`                                | 顶部导航                                         |
| `footer.credit`        | string        | —                                   | 页脚署名后半句；与站点名组合为 `Copyright {name}. {credit}` |
| `footer.externalLinks` | `LinkItem[]`  | `[]`                                | 页脚外链                                         |
| `pages.*`              | `PageHero`    | —                                   | 内页 `title` / 可选 `kicker`                     |
| `team.openings`        | string | null | `null`                              | `/team` 招募文案                                 |
| `team.sponsors`        | string | null | `null`                              | `/team` 赞助文案                                 |


`PageHero` 字段：`title`、可选 `kicker`。全站 `subtitle` 仅用于 `content/home/hero.yaml`。

---

## 首页 `content/home/`

### `hero.yaml`


| 字段                   | 类型                  | 必填  | 说明                                                |
| -------------------- | ------------------- | --- | ------------------------------------------------- |
| `title`              | string              | 是   | 主标题                                               |
| `subtitle`           | string              | 是   | 副标题（**仅** homepage hero 使用）                       |
| `kicker`             | string              | 否   | 眉标；省略时用 `site.name`                               |
| `backgroundImage`    | string              | 否   | 背景图路径；省略时用默认渐变                                    |
| `brandMark`          | string              | 否   | Hero 右侧品牌图；推荐使用 `/content-assets/...`             |
| `featuredNews`       | object              | 否   | Hero 底部 Spotlight 条                               |
| `featuredNews.label` | string              | 否   | 默认 `Latest highlight`；与新闻日期以 `·` 连接显示             |
| `featuredNews.id`    | string              | 条件  | 配置 `featuredNews` 时必填；对应 `content/news/` 条目的 `id` |
| `actions`            | `LinkItem[]`        | 否   | Hero 主行动按钮（CTA），用于站内导航或转化动作                       |
| `channels`           | `HomeHeroChannel[]` | 否   | Hero 外部分发渠道入口；统一展示为 pill，可打开链接或展示二维码              |


`actions` 与 `channels` 的边界：

- `actions` = 用户下一步要做的动作，例如 Publications、Team、Recruiting Form。
- `channels` = 实验室的外部分发/关注渠道，例如 WeChat、RedNote、Newsletter；可以是链接，也可以是二维码。
- 不要把公众号、小红书等渠道放进 `actions`；也不要把页面导航 CTA 放进 `channels`。

`HomeHeroChannel` 字段：


| 字段        | 类型            | 必填  | 说明                                        |
| --------- | ------------- | --- | ----------------------------------------- |
| `label`   | string        | 是   | pill 主文案，例如 `WeChat` / `RedNote`          |
| `desc`    | string        | 是   | pill 副文案，例如 `AI4GC Lab`                   |
| `kind`    | `link` | `qr` | 是   | `link` 打开外链；`qr` 悬停展示二维码                  |
| `href`    | string        | 条件  | `kind: link` 时必填                          |
| `qrImage` | string        | 条件  | `kind: qr` 时必填；推荐使用 `/content-assets/...` |


Spotlight 数据来自 `featuredNews.id` 匹配的新闻条目：`image`、`title`、`desc`、`links`（或 `href` 作为 Paper）。`links` 非空时优先于 `href`。

```yaml
title: Efficient AI systems, from algorithm to deployment
subtitle: We study multimodal generation…
featuredNews:
  label: Latest highlight
  id: foreact-steering-your-vla-with-effic-26
actions:
  - label: Publications
    href: /publications
  - label: Team
    href: /team
```

### `order.yaml`


| 字段        | 类型       | 说明                       |
| --------- | -------- | ------------------------ |
| `modules` | string[] | 模块 `id` 渲染顺序；未列出的模块追加在末尾 |


### 模块公共字段


| 字段        | 类型      | 默认     | 说明           |
| --------- | ------- | ------ | ------------ |
| `id`      | string  | 文件名    | 模块标识         |
| `type`    | string  | —      | 见下文          |
| `enabled` | boolean | `true` | `false` 时不渲染 |
| `title`   | string  | —      | 模块标题         |

模块可以是 `modules/{id}.yaml`，也可以是 `modules/{id}/index.yaml`。当模块有自包含图片或附件时，推荐使用目录形式，并在 YAML 中写相对路径（如 `image: infigui-agent.svg`）。

---

### `type: highlights`


| 字段                 | 类型           | 说明     |
| ------------------ | ------------ | ------ |
| `items[].id`       | string       | 可选     |
| `items[].label`    | string       | 卡片标题   |
| `items[].content`  | string       | 描述     |
| `items[].tags`     | string[]     | 话题标签   |
| `items[].links`    | `LinkItem[]` | 链接芯片   |
| `items[].image`    | string       | 配图     |
| `items[].imageAlt` | string       | 配图 alt |


---

### `type: news`

从 `content/news/` 读取；模块文件内不写新闻正文。


| 字段                 | 类型                 | 默认          | 说明             |
| ------------------ | ------------------ | ----------- | -------------- |
| `source`           | `featured` | `all` | `featured`  | 筛选来源           |
| `limit`            | number             | —           | 最多条数           |
| `tags`             | string[]           | —           | 按 tag 过滤       |
| `loadMore.enabled` | boolean            | `true`      | 是否显示 Load More |
| `loadMore.label`   | string             | `Load More` | 按钮文案           |


`source: featured`：仅 `featured: true` 的条目；若无 featured 条目则回退为全部（按日期排序后截断）。

---

### `type: projects`


| 字段                 | 类型           | 说明               |
| ------------------ | ------------ | ---------------- |
| `items[].id`       | string       | 可选               |
| `items[].name`     | string       | 项目名称             |
| `items[].desc`     | string       | 描述               |
| `items[].period`   | string       | 如 `2024–present` |
| `items[].image`    | string       | 缩略图              |
| `items[].imageAlt` | string       | alt              |
| `items[].tags`     | string[]     | 话题标签             |
| `items[].links`    | `LinkItem[]` | 链接芯片             |


`items[].image` 推荐使用相对路径，指向 `content/home/modules/lab-projects/` 内同名资源。

首页 Projects 面板按响应式列数 × 最多 3 行分页，超出时显示 Previous / Next（客户端分页，非 YAML 配置）。

---

### `type: partners`


| 字段                    | 类型                           | 说明                                        |
| --------------------- | ---------------------------- | ----------------------------------------- |
| `items[].id`          | string                       | 可选                                        |
| `items[].name`        | string                       | 显示名称                                      |
| `items[].kind`        | `company` | `lab` | `person` | 省略时：有 `photo` 为 `person`，否则为 `company`    |
| `items[].logo`        | string                       | 机构 Logo（`image` 为别名）；`company` / `lab` 使用 |
| `items[].photo`       | string                       | 头像；`person` 使用                            |
| `items[].affiliation` | string                       | 附属信息；`person` 可选                          |
| `items[].desc`        | string                       | 说明                                        |
| `items[].href`        | string                       | 链接；`http(s)://` 为新标签页打开                   |


同一 marquee 内按 `kind` 渲染：`company` / `lab` 为 Logo，`person` 为头像 + 姓名（+ `affiliation`）。整项可点击。
`logo` / `photo` 推荐使用相对路径，指向 `content/home/modules/lab-partners/` 内同名资源。

---

### `type: prose`

段落模块，支持 YAML 段落数组或 Markdown 文件。

**方式 A — `modules/{id}.yaml`**


| 字段     | 类型       | 说明         |
| ------ | -------- | ---------- |
| `body` | string[] | 段落数组（至少一段） |


**方式 B — `modules/{id}/index.md`（推荐长文案）**

Frontmatter + Markdown 正文，文件夹名 = 模块 `id`（须在 `order.yaml` 中引用）。


| 字段        | 类型      | 说明           |
| --------- | ------- | ------------ |
| `type`    | `prose` | 必填           |
| `title`   | string  | 区块标题         |
| `id`      | string  | 可选；默认文件夹名    |
| `enabled` | boolean | 可选；默认 `true` |


正文支持标准 Markdown（链接、加粗、列表等），与博客/成员页共用渲染器。

```markdown
---
type: prose
title: Who we are
---

AI4GC Lab is a research group at Zhejiang University…

Our work spans edge–cloud collaborative intelligence…
```

---

### `type: links`


| 字段      | 类型           | 说明   |
| ------- | ------------ | ---- |
| `links` | `LinkItem[]` | 至少一条 |


---

## 新闻 `content/news/`

格式：YAML 或 Markdown + frontmatter，每条一个文件。


| 字段         | 类型           | 必填  | 说明                       |
| ---------- | ------------ | --- | ------------------------ |
| `id`       | string       | 否   | 默认文件名（无扩展名）              |
| `date`     | string       | 是   | `Mon YYYY`               |
| `title`    | string       | 是   | 标题                       |
| `desc`     | string       | 条件  | YAML 必填；Markdown 可省略，用正文 |
| `tags`     | string[]     | 否   | 话题标签                     |
| `featured` | boolean      | 否   | 进入 featured 池            |
| `href`     | string       | 否   | 无 `links` 时渲染为 Paper 链接  |
| `image`    | string       | 否   | 配图                       |
| `imageAlt` | string       | 否   | alt                      |
| `links`    | `LinkItem[]` | 否   | 链接芯片；优先于 `href`          |


排序：按 `date` 降序（`src/lib/content/date.ts`）。

`/news` 页面按 `site.yaml` → `newsPageVisibleCount` 分页，底部 Previous / Next 切换页码；排序可在页内切换 Newest / Oldest first。

---

## 博客 `content/blog/`

每篇文章一个文件夹，主文件为 `index.md`（YAML frontmatter + Markdown 正文）。**文件夹名 = 文章 id = URL**（`/blog/{文件夹名}`）。

```
content/blog/efficient-llm-serving-notes/
  index.md
  diagram.png          # 可选：文内相对路径引用
```


| 字段          | 类型       | 必填  | 说明                                                                                                        |
| ----------- | -------- | --- | --------------------------------------------------------------------------------------------------------- |
| `title`     | string   | 是   | 标题                                                                                                        |
| `date`      | string   | 是   | `Mon YYYY` 等，与新闻相同排序规则                                                                                    |
| `desc`      | string   | 否   | 列表页摘要；省略时从正文自动截取                                                                                          |
| `author`    | string   | 否   | 作者展示名；省略且设置了 `authorId` / `authorIds` 时，自动取成员 `name`                                                      |
| `authorId`  | string   | 否   | 单作者 id：团队成员文件夹名（即 `姓名-slug-入学年份-学号/工号`，如 `yurun-chen-2025-12551024`），详情页链到 `/{folder}`（`profile: true` 时） |
| `authorIds` | string[] | 否   | 多作者 id；每个值同 `authorId`，与 `authorId` 合并去重；构建时校验成员存在                                                        |
| `links`     | list     | 否   | 文章开头的资源按钮（在引言之后、首个 `##` 之前）；每项 `kind` + `href`（可选 `label`），`kind` ∈ `paper`/`code`/`xiaohongshu`/`wechat`/`website`，每种有专属图标 |
| `tags`      | string[] | 否   | 话题标签；详情页 Hero 姓名下方                                                                                        |
| `cover`     | string   | 否   | 封面图：相对路径或 `/content-assets/...`                                                                           |
| `coverAlt`  | string   | 否   | 封面 alt                                                                                                    |
| `draft`     | boolean  | 否   | `true` 时不发布                                                                                               |
| `id`        | string   | 否   | 默认等于文件夹名                                                                                                  |


正文支持标准 Markdown（GFM）：标题、列表、代码块、引用、图片、链接。文件夹内相对资源映射为 `/blog-assets/{post}/{file}`。正文中的外链按普通 inline 链接渲染；**无**文末自动 References 区块。

frontmatter 的 `links` 用于**文章开头的资源按钮行**（带专属图标、悬停动效），渲染在引言段之后、第一个 `##` 小标题之前；文末的「Further reading」等仍写在正文里（两者可并存）。示例：

```yaml
links:
  - kind: paper
    href: https://arxiv.org/abs/2510.00507
  - kind: code
    href: https://github.com/YurunChen/Graph2Eval
  - kind: xiaohongshu
    href: https://www.xiaohongshu.com/explore/xxxx
  - kind: wechat
    href: https://mp.weixin.qq.com/s/xxxx
```

`/blog` 列表按 `site.yaml` → `blogPageVisibleCount` 分页，底部 Previous / Next 切换页码；排序可在页内切换 Newest / Oldest first（与 `/news` 相同交互）。

设置了 `authorId` / `authorIds` 的文章会自动出现在对应成员个人页 `## @blog` 区块的 **On-site** 分组（按 `date` 降序）。须同时在该成员 `index.md` 正文中写 `## @blog …`，否则不会显示。author id 即成员 profile 文件夹名，默认格式为 `姓名-slug-入学年份-学号/工号`；PI 可使用姓名 slug（如 `shengyu-zhang`）。详情页作者名在成员已发布个人页（`profile: true`）时可点击跳转到 `/{成员文件夹名}`。

---

## 论文 `content/publications.bib`

BibTeX，一条一个 entry。


| BibTeX 字段                                    | 说明                                         |
| -------------------------------------------- | ------------------------------------------ |
| citation key                                 | `id`                                       |
| `title`                                      | 标题                                         |
| `author`                                     | 作者                                         |
| `corresponding`                              | 通讯作者姓名（多名用 ` and ` 或 `;` 分隔，须与 `author` 中写法一致）；列表中该作者名后加 ✉ 上角标，悬停提示「Corresponding author」。如 `corresponding={Shengyu Zhang}` |
| `booktitle` / `journal` / `venue`            | venue；无 `year` 时从 venue 提取年份               |
| `year`                                       | 追加到 venue 显示                               |
| `url`                                        | Paper 芯片                                   |
| `doi`                                        | 无 `url` 时转为 `https://doi.org/...`，Paper 芯片 |
| `github` / `code` / `codeurl` / `repository` | Project 芯片（含 star 数）                       |
| `blog` / `blogurl` / `blogslug`              | Blog 芯片，跳转到相关博客。填博客文件夹名（如 `blog={graph2eval-cvpr-2026}`，自动转 `/blog/{slug}`），也可填完整 URL |
| `keywords`                                   | 方向标签，逗号/分号分隔（如 `keywords={Agents, RAG}`）；用于 `/publications` 顶部的「方向」筛选，未填则该论文不参与标签筛选 |


**作者自动链接：** 论文作者名若与某位成员的 `name` 完全一致（忽略大小写/标点），在 `/publications` 与个人页论文列表中会自动渲染为指向该成员个人页的链接，无需额外配置。

**论文 ↔ 博客互链：** 给论文加 `blog=` 字段后，该论文会显示 Blog 芯片；对应博客文章页也会自动显示「Related paper」反向链接（反向链接以 `content/publications.bib` 为准）。注意成员 `papers.bib` 与全局 `publications.bib` 的 citation key 可能不同，需在各自文件的对应条目里分别添加 `blog=`。

`/publications` 顶部提供搜索框（标题/作者/会议）、按年份筛选、按方向标签筛选（来自 `keywords`，有标签才显示）；每条论文有「Copy BibTeX」按钮复制规范引用。列表按年份降序分组（当年分 Published / Preprints，往年默认折叠）。

**与 DBLP 同步（保持论文列表准确）：** `bib` 易手工出错,可用 `npm run pubs:sync` 按 `site.yaml` 的 `dblpPid` 核对 DBLP——报告标题大小写、作者/DOI 差异与「DBLP 上已发表但库里没有」的新论文(只读)；确认无误后:`npm run pubs:sync -- --apply` 追加新论文,`npm run pubs:sync -- --fix-titles` 用 DBLP 权威大小写回填标题(修正 `LLMs`/`GUI`/`AccKV` 等被小写的缩写)。仓库还配了每月自动核对的 GitHub Action（`.github/workflows/dblp-sync-check.yml`），有漂移时开 issue 提醒。

> 标题大小写:解析器默认会把标题做句首式大小写;`bib-publications.ts` 已设 `sentenceCase: false` 保留原文,因此 `.bib` 里的标题应写成正确大小写（缩写保持大写）。

**不收录的论文类型：** workshop / companion volume、abstract（如 Student Abstract）、short paper，以及 CDPD、CICAI 这两个 venue 一律不进入 `/publications`。`scripts/sync-dblp.mjs` 已内置过滤（`isMinorEntry` 按标题、`isExcludedVenue` 按 venue、`IGNORE_TITLES` 按具体标题），DBLP 同步不会再建议加入；如需永久排除某篇具体论文，把其标题加入 `IGNORE_TITLES`。

---

## 团队 `content/team/`

### 目录与文件

每位成员一个文件夹，**文件夹名即唯一标识**（内部 `id`、个人页 URL、资源路径均据此定位）。

**默认命名（非 PI）：** `{姓名 slug}-{入学年份}-{学号或工号}`

```
content/team/phds/jane-doe-2024-120010010/
  index.md
  photo.jpg
  papers.bib

content/team/postdocs/qinghao-hu-2022-020001/
  index.md
```

**PI 例外：** 可用 `{姓名 slug}`，如 `content/team/pi/shengyu-zhang/`。

同届重名时，学号或工号保证文件夹名全局唯一；`profile: true` 时个人页 URL 为 `/{文件夹名}`。构建阶段会检测重复 slug 并报错。

`id` 默认等于文件夹名；frontmatter 可写 `id:` 覆盖（一般不需要）。


| 目录            | 页面分组名                  |
| ------------- | ---------------------- |
| `pi/`         | Principal Investigator |
| `postdocs/`   | Postdoctoral           |
| `phds/`       | Ph.D                   |
| `masters/`    | Master                 |
| `undergrads/` | Undergraduate          |
| `alumni/`     | Graduated              |


### Frontmatter 字段

**最小示例（Ph.D. 成员 + 个人页）：**

```yaml
---
startDate: 2025
name: Yurun Chen
photo: photo.jpg
bio: One-line bio for team card and SEO.
profile: true
email: name@example.com
links:
  - label: Google Scholar
    href: https://scholar.google.com/...
    kind: social
---
```

正文写在 `---` 之后；`profile: true` 时发布为 `/{member-folder}`。完整字段见下表。


| 字段               | PI  | 其他  | 说明                                                                                                                                    |
| ---------------- | --- | --- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `name`           | 必填  | 必填  | 姓名                                                                                                                                    |
| `photo`          | 必填  | 必填  | 头像：`null` 为首字母占位；推荐使用成员文件夹内相对路径（如 `photo.jpg`），运行时映射为 `/team-assets/{group}/{member}/photo.jpg` |
| `heroBackground` | 可选  | —   | **PI 个人页 Hero 背景图**；省略则用默认渐变。路径规则同 `photo`                                                                                            |
| `bio`            | 必填  | 必填  | 简介（卡片与 SEO fallback）                                                                                                                  |
| `startDate`      | —   | 必填  | 入学/加入时间；纯年份显示为 `2020`。`/team` 卡片会加组前缀：**Enrolled**（phds/masters/undergrads/alumni）或 **Joined**（postdocs），见 `TEAM_MEMBER_START_LABELS` |
| `degree`         | 可选  | 可选  | **PI** 个人页 Hero 副标题；**Member** 仅在 `/team` 卡片元信息中展示                                                                                    |
| `order`          | 可选  | 可选  | 组内排序的手动权重（数值越小越靠前）；不填则同 `startDate` 内按 PR 提交先后排序                                                                  |
| `id`             | 可选  | 可选  | 默认等于文件夹名；一般无需填写                                                                                                                       |
| `profile`        | 可选  | 可选  | `true` 时发布个人页，URL 为 `/{成员文件夹名}`；省略或 `false` 则仅在 `/team` 展示                                                                            |
| `noindex`        | 可选  | 可选  | `true` 时该个人页**不被搜索引擎收录**（单页 noindex + 不进 sitemap），即使全站 `indexable: true`；仍照常在 `/team` 显示。用于模板/占位主页，改成真实内容后删掉                          |
| `links`          | 可选  | 可选  | `MemberLink[]`（邮箱请用 `email`，勿写 `mailto:`）                                                                                             |
| `tags`           | 可选  | 可选  | 话题标签；个人页 Hero 姓名下方与 `/team` 卡片展示。自由填写任意字符串，无固定词表；顺序即展示顺序，可增删改                                                                         |
| `email`          | 可选  | 可选  | 联系邮箱；个人页 Hero（tags 下方）与 `/team` 卡片头部（姓名/meta 下方）单独展示。`links` 中遗留的 `mailto:` 构建时自动提取                                                   |


组内排序：`startDate`（入组/入学时间）升序；**同一时间时，先提交 PR（最早被加入仓库）的成员排在前面**（按 git 添加顺序）。如需手动指定，可在 frontmatter 写 `order`（数值越小越靠前，优先级高于 PR 顺序）。**模板/占位主页（文件夹名以 `template-` 开头）始终排在本组最后。**

个人页 Hero：**PI**（`content/team/pi/`）为居中头像 + 姓名 + `degree`；可选 `heroBackground` 背景图，否则默认渐变；正文区域水平居中、文本左对齐。**Member** 为 compact 头像 Hero + 实验室 kicker（Hero **不**显示 `degree`）。`tags` / `email` / `links` 在 Hero 中展示。`bio` 用于 SEO、团队卡片及无 Markdown 时的 fallback。

### `MemberLink`

继承 `LinkItem`，增加 `kind`。Profile 中也区分 **action** 和 **channel**：

- Profile actions：`profile` / `social` / `website`，显示在个人页 Hero 或团队卡片的行动链接中。
- Publishing channels：`blog-channel`，只显示在个人页 Blog 区块，用于公众号、X、小红书等内容分发渠道。


| `kind`         | 说明                                              |
| -------------- | ----------------------------------------------- |
| `profile`      | 个人主页                                            |
| `social`       | 社交 / 学术                                         |
| `website`      | 个人网站                                            |
| `blog-channel` | 个人页 **Blog** 区块的外链渠道（微信公众号、X、小红书等）；**不**在 Hero 展示 |


`blog-channel` 可选字段：


| 字段     | 说明                                                                    |
| ------ | --------------------------------------------------------------------- |
| `desc` | 渠道卡片上的**小字说明**（显示在 `label` 标题下方）。平台类型由 `href` 域名自动识别（`mp.weixin.qq.com` → 微信公众号，`x.com` / `twitter.com` → X，`xiaohongshu.com` → 小红书），无需填写 `platform` |


```yaml
links:
  - label: Yurun Chen
    href: https://www.xiaohongshu.com/user/profile/...
    kind: blog-channel
    desc: Research notes and paper breakdowns.
  - label: AI4GC Lab
    href: https://mp.weixin.qq.com/...
    kind: blog-channel
    desc: Long-form lab updates on WeChat.
```

`profile: true` 时，`/team` 卡片上点击**头像**或**姓名**进入 `/{成员文件夹名}`；不再自动插入 `Profile` 链接芯片。`blog-channel` 链接**仅**在个人页 `## @blog` 区块的 **External**（站外）分组展示；`authorId` / `authorIds` 关联的站内文章出现在 **On-site**（站内）分组。GitHub / Scholar 等社交链接写在普通 `links`（不设 `blog-channel`），显示在 Hero 与团队卡片。X、小红书等若同时作为内容渠道，可额外用 `blog-channel` 挂在 **External** 分组（通常不再在 Hero 重复同一主页链接）。

`/team` 的 openings、sponsors 来自 `site.yaml` → `team.openings`、`team.sponsors`。

### 个人页 Markdown 正文

当 `profile: true` 时，`index.md` 中 frontmatter 之后的 Markdown 渲染为 `/{成员文件夹名}` 页面。

**Intro：** frontmatter 后、`##` 之前的段落，空行分段。

**结构化区块只支持 `@papers` 和 `@blog`。** 其它内容建议放在 Intro 中；未支持的 `@xxx` 标题不会触发特殊解析。


| 类型     | 声明示例                         | 格式                                             |
| ------ | ---------------------------- | ---------------------------------------------- |
| Papers | `## @papers Selected Papers` | 见下文                                            |
| Blog   | `## @blog Lab Notes`         | 见下文「`@blog` 区块」；须写 `@blog` 前缀才会渲染 |


`@papers` / `@blog` 前缀会在渲染时去掉；若省略自定义标题，分别使用 `Selected Papers` / `Blog`。普通 `## Selected Papers` 或 `## Blog` 不会触发结构化解析，必须写 `@papers` / `@blog`。

#### `@blog` 区块

个人页正文须包含 `## @blog …`（如 `## @blog Lab Notes`）。`Lab Notes` 仅为区块标题，不是第二个 magic 前缀。

| 内容来源 | frontmatter / 站点 | 页面分组 | 说明 |
| -------- | ------------------ | -------- | ---- |
| 站外渠道 | `links` 中 `kind: blog-channel` | **External** | 微信公众号、X、小红书主页等；`label` 为卡片标题，`desc` 为标题下方小字说明 |
| 站内文章 | `/blog/{post}/index.md` 的 `authorId` / `authorIds` | **On-site** | 按 `date` 降序；标题链到 `/blog/{post}` |

若两类内容皆无，整个 `@blog` 区块不渲染（即使写了 `## @blog` 标题）。

#### Papers：BibTeX 引用（唯一支持方式）

在成员文件夹内放置 `papers.bib`，再在正文中列出 citation key：

```markdown
## @papers Selected Papers

@bib papers.bib
- awqactivation2024
- safepredpredictive2026
```

若文件名为 `papers.bib`，可省略 `@bib` 行：

```markdown
## @papers Selected Papers

- awqactivation2024
- safepredpredictive2026
```


| `@bib` 值                  | 解析路径                                       |
| ------------------------- | ------------------------------------------ |
| `papers.bib`（默认）          | `content/team/{group}/{member}/papers.bib` |
| 其他相对文件名                   | 当前成员文件夹内                                   |
| `global` / `publications` | `content/publications.bib`（仅特殊场景，一般不用于个人页） |


- 每行一个 citation key（`-`、`*`、`+` 均可），顺序即展示顺序
- 推荐在 BibTeX 条目中写 `honor={Oral}` / `honor={Highlight}` / `honor={Spotlight}`；profile 正文里的 `- citekey | Oral` 仅用于临时覆盖 BibTeX 标注
- 缺失 key、无效 key 或找不到 bib 文件时 **构建失败**
- 论文段内的非列表正文会被忽略并在构建时输出 warning

BibTeX 字段与 `/publications` 相同（`url`/`doi` → Paper 芯片，`github`/`code` → Project 芯片，`honor`/`award`/`presentation` → Oral/Highlight 等标注）。**arXiv 预印本**建议写 `journal={arXiv}`；若写成 `arXiv preprint arXiv:xxxx.xxxxx`，构建时会规范显示为 `arXiv · {year}`。

---

## 静态资源路径


| 用途            | 路径                                                                         |
| ------------- | -------------------------------------------------------------------------- |
| 站点级资源         | `content/assets/` → URL `/content-assets/...`                              |
| Logo          | `content/assets/ai4gclab/`                                                 |
| Hero 渠道二维码    | `content/assets/media/`                                                    |
| Favicon 等公共资源 | `content/assets/site/`                                                     |
| 成员头像 / 成员本地资源 | `content/team/{group}/{member}/` → URL `/team-assets/{group}/{member}/...` |
| 博客本地资源        | `content/blog/{post}/` → URL `/blog-assets/{post}/...`                     |
| 首页项目资源        | `content/home/modules/lab-projects/` → URL `/home-assets/lab-projects/...` |
| 首页合作伙伴资源      | `content/home/modules/lab-partners/` → URL `/home-assets/lab-partners/...` |


资源归属规则：`content/assets/` 只存放全站公共资源；成员头像、博客图片、首页项目图、合作伙伴 Logo 等能被某个内容单元自包含的资源，应放在对应内容文件夹下，并使用相对路径配置。`public/` 不再作为内容图片目录使用。

首页模块目录可自包含 YAML 与资源，例如：

```
content/home/modules/lab-projects/
  index.yaml
  infigui-agent.svg

content/home/modules/lab-partners/
  index.yaml
  ant-group.svg
  alibaba.svg
```

---

## 代码入口


| 用途                   | 路径                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Schema               | `src/lib/content/schema.ts`                                                                                          |
| 类型                   | `src/types/lab.ts`                                                                                                   |
| 聚合导出                 | `src/lib/content.ts`                                                                                                 |
| 团队 / 个人页             | `src/lib/content/load-team.ts`                                                                                       |
| Profile 正文分段 + 论文    | `src/lib/content/resolve-profile-papers.ts`                                                                          |
| Markdown 渲染          | `src/components/markdown/MarkdownBody.tsx`                                                                           |
| Profile Markdown UI  | `src/components/site/MemberMarkdown.tsx`                                                                             |
| BibTeX → Publication | `src/lib/content/bib-publications.ts`                                                                                |
| 成员资源 URL             | `src/lib/content/team-assets.ts`                                                                                     |
| 博客 / 文章              | `src/lib/content/load-blog.ts`                                                                                       |
| 博客列表分页               | `src/components/blog/BlogPageClient.tsx`                                                                             |
| 博客 Markdown          | `src/components/blog/BlogPostBody.tsx`                                                                               |
| 博客资源 URL             | `src/lib/content/blog-assets.ts`                                                                                     |
| 博客列表路由               | `src/app/blog/page.tsx`                                                                                              |
| 博客详情路由               | `src/app/blog/[slug]/page.tsx`                                                                                       |
| 博客资源路由               | `src/app/blog-assets/[...path]/route.ts`                                                                             |
| 个人页路由与布局             | `src/app/[slug]/page.tsx`、`src/components/profile/ProfilePageContent.tsx`、`src/components/profile/PiProfileHero.tsx` |
| 个人页 `@blog` 区块 UI     | `src/components/profile/ProfileBlogPosts.tsx`（External / On-site 分组）                                                  |
| Publications 年份筛选    | `src/components/publications/PublicationsPageClient.tsx`                                                             |
| Venue 规范化（arXiv 等）   | `src/lib/publications-utils.ts`、`src/lib/content/bib-publications.ts`                                                |
| `/team` 卡片入学/入职前缀    | `src/lib/content/constants.ts` → `TEAM_MEMBER_START_LABELS`；`src/lib/content/slug.ts` → `formatMemberStartMeta`      |
| 安全响应头                | `src/lib/security/headers.ts`、`next.config.ts`                                                                       |
| 爬虫策略（noindex）        | `src/app/robots.ts`、`src/app/layout.tsx`                                                                             |
| 成员资源路由               | `src/app/team-assets/[...path]/route.ts`                                                                             |
| `/news` 分页           | `src/components/news/NewsPageClient.tsx`                                                                             |
| `/blog` 分页           | `src/components/blog/BlogPageClient.tsx`                                                                             |
| 首页 Projects 分页       | `src/components/home/ProjectsPanel.tsx`                                                                              |


---

## 配置与文件对照


| 内容               | 文件                                                      |
| ---------------- | ------------------------------------------------------- |
| 导航、页脚、全站元数据、新闻条数 | `content/site.yaml`                                     |
| Hero、Spotlight   | `content/home/hero.yaml` + `content/news/<id>.yaml`     |
| 首页模块顺序           | `content/home/order.yaml`                               |
| 研究方向             | `content/home/modules/research-directions.yaml`         |
| 首页新闻模块           | `content/home/modules/lab-news.yaml`                    |
| 首页项目             | `content/home/modules/lab-projects/index.yaml`          |
| 合作伙伴             | `content/home/modules/lab-partners/index.yaml`          |
| 单条新闻             | `content/news/<slug>.yaml`                              |
| 博客文章             | `content/blog/<post-folder>/index.md`                   |
| 论文               | `content/publications.bib`                              |
| 成员               | `content/team/<group>/<member-folder>/index.md`         |
| 个人页正文            | 同上成员 `index.md` 的 Markdown body（需 `profile:`）           |
| 团队招募/赞助          | `content/site.yaml` → `team.openings` / `team.sponsors` |


---

## Admin 文件控制台（可选）

默认通过 Git 编辑 `content/`。若部署时设置 `ADMIN_ENABLED=true` 及 `ADMIN_PASSWORD`、`ADMIN_SECRET`（见 `.env.example`），可在 `/admin` 通过浏览器浏览、编辑、新建、删除和上传同一套内容文件。

- Admin 是文件控制台，不是独立 CMS；`content/` 仍是唯一 source of truth。
- 打开 Admin 后默认选中 `content/guidance.md`，并以 Markdown Preview 展示本文档；切换到 Edit 可直接修改。
- 左侧文件树与真实 `content/` 对应。
- 在文件树中右键可执行 New File、New Folder、Upload Files、Upload Folder、Delete。
- 新建文件、文件夹和上传文件先作为本地草稿展示；只有点击 Save changes / Save drafts 后才写入 `content/`。
- Preview 使用选中文件对应的真实站点路由；图片文件在右侧直接预览图片内容。
- 写入路径与本文档字段一致；构建校验使用 `src/lib/content/schema.ts` 中的 Zod schema。
- 图片上传写入 `content/assets/` 或成员/博客资源目录（MIME 白名单）。
- 生产环境未启用 admin 时，`/admin` 与 `/api/admin/*` 返回 404。

---

## 延伸阅读

- 项目概览与开发命令：[README.md](../README.md)
- Agent / 贡献者约定：[AGENTS.md](../AGENTS.md)
