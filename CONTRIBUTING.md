# 为 AI4GC 实验室主页贡献内容

欢迎大家一起完善实验室主页！本仓库已设为公开，`master` 分支受保护——**所有改动都通过 Pull Request（PR）提交，经老师 review 后合并**。本文是给同学的简版上手指南，格式细节以 [`content/guidance.md`](content/guidance.md) 为准。

> 💡 **强烈建议用 Vibe Coding 来做。** 把你的任务和 [`content/guidance.md`](content/guidance.md) 一起丢给 AI 编程助手（Claude Code / Cursor / VS Code + Copilot 等），让它帮你定位文件、按格式改内容、跑检查、甚至生成 PR。你只需要描述「我要加一篇我自己的博客，关联这篇论文和小红书链接」，剩下交给它，再自己核对结果即可。

---

## 一、提交流程（Fork + Pull Request）

绝大多数内容都在 `content/` 目录下，是 Markdown / YAML / BibTeX 纯文本，**不需要懂前端代码**也能改。

1. **Fork**：点开仓库页面右上角 **Fork**，复制一份到你自己的 GitHub 账号。
2. **拿到代码**，二选一：
   - **本地**：`git clone` 你 fork 的仓库 →（见下方「环境准备」）。
   - **网页/在线**：直接在你 fork 的页面按 `.` 打开网页版 VS Code，或用 **Codespaces**，纯改内容无需本地环境。
3. **新建分支**：如 `git checkout -b my-profile` / `add-blog-xxx`（不要直接在 `master` 上改）。
4. **只修改属于你自己的内容**（你的成员文件夹、你自己的博客、你自己的论文条目等）。
5. **本地预览 + 自检**（强烈建议，见下）：
   ```bash
   npm run dev     # 打开 http://localhost:3000 预览
   npm run check   # lint + 类型检查 + 测试 + 构建，必须全绿才能合并
   ```
6. **提交并推送到你的 fork**：`git add -A && git commit && git push`。
7. **发起 PR**：在 GitHub 上向本仓库（`shengyuzhang/AI4GC-ZJU`）的 `master` 分支发起 Pull Request，按模板填写说明。
8. **等待 review**：PR 里的自动检查（Content & build check）要 ✅ 通过；老师 review 后合并，网站自动更新。

> 改完不确定格式对不对？没关系——先提 PR，自动检查会告诉你哪里有问题，老师也会在 PR 里给反馈。

---

## 二、环境准备（本地开发时）

需要 [Node.js](https://nodejs.org/) **24+**。

```bash
npm install     # 安装依赖
npm run dev     # 本地预览
npm run check   # 提交前自检
```

只改 `content/` 里的文字/图片时，用 GitHub 网页版或 Codespaces 也完全可以，不一定要本地装环境。

---

## 三、当前重点完善的工作

下面是目前最需要大家补充的几块（**不限于此**，欢迎自行发现并完善）。认领后请在 PR 标题或群里说明，避免重复。每项都先读 [`content/guidance.md`](content/guidance.md) 里对应的小节。

### 1. 个人主页，并关联自己的 Blog
- 在 `content/team/{分组}/{你的文件夹}/index.md` 新建/完善个人页（照片放同文件夹，`profile: true` 才会发布）。
- 文件夹命名、字段（`name`/`startDate`/`tags`/`email`/`bio` 等）见 guidance「成员与个人主页」一节。
- 个人页正文加 `## @blog Lab Notes`（或自定义标题），才会显示 Blog 区块。
- 站外渠道（小红书、公众号、X 等长期主页）写在 frontmatter `links` 里并设 `kind: blog-channel` + `desc`（小字说明），显示在 **External** 分组；同一主页不必再在 Hero 重复一条普通 `links`。
- GitHub / Scholar 等写在普通 `links`（不设 `blog-channel`），显示在页面顶部 Hero。
- 在博客文章的 frontmatter 里写 `authorId` 指向你的成员文件夹 id，文章会出现在个人页 **On-site** 分组。

### 2. Blog：补齐**所有一作文章**的内容，并关联微信公众号 / 小红书
- 每篇一作论文对应建一篇 `content/blog/{文章文件夹}/index.md`（封面、配图放同文件夹）。
- 用 frontmatter 的 `links` 数组放资源按钮（`kind` 支持 `paper` / `code` / `wechat` / `xiaohongshu` / `website`），会渲染成文章开头的按钮行。
- 正文用 Markdown；写清楚研究问题、方法、结论，配图说明。

### 3. Publications 关联 Blog
- 在 `content/publications.bib` 里给对应论文条目加 `blog={你的博客文件夹名}`，论文列表会出现 Blog 芯片，博客页也会反向显示「Related paper」。
- 注意：成员 `papers.bib` 与全局 `publications.bib` 的 citation key 可能不同，需各自添加。

### 4. 首页 Projects
- 编辑 `content/home/modules/lab-projects/index.yaml`，补充：
  - **论文对应的开源仓库**（GitHub 链接、简介、标签）；
  - **大家手上正在做的 Vibe Coding 项目**（即使还没发论文也欢迎展示）。
- 每个项目可配一张图（放同目录），格式见 guidance「首页模块 / Projects」一节。

### 5. News（首页 News 栏 + News 页面）
- 在 `content/news/` 下按条目添加 `*.yaml` 或 `*.md`（获奖、论文录用、活动、新成员加入等）。
- 标记为 featured 的会出现在首页 News 栏，全部会出现在 `/news` 页面。

---

## 四、几条须知

- ✅ **只改自己的内容**；不确定的、涉及他人或全站结构的，先在群里 / Issue 里和老师沟通。
- ✅ 一切格式以 [`content/guidance.md`](content/guidance.md) 为准；用真实内容，公开页面不要留占位符。
- ✅ 图片放进对应的文件夹，文件名用英文、无空格。
- ✅ 提交前尽量跑 `npm run check`，PR 里的自动检查必须全绿。
- ⚠️ 一般**不要改 `src/` 下的代码**；确有需要（比如要加新功能）请先和老师确认。

有问题随时在实验室群里问，或在仓库开一个 Issue。感谢贡献！🎉
