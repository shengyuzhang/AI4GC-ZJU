---
startDate: 2025
name: "Template: Master's Student"
bio: >-
  模板主页（硕士生）· 复制本文件夹改成你自己的信息。展示可用的字段与版块：tags、email、
  外链、研究兴趣、教育经历、论文（@papers）、Blog 渠道（公众号/小红书）等。
tags:
  - Your Topic A
  - Your Topic B
  - Your Topic C
email: you@example.com
profile: true
noindex: true  # 模板示例：不被搜索引擎收录；改成你自己的内容后删掉此行
links:
  - label: Google Scholar
    href: https://scholar.google.com/
  - label: GitHub
    href: https://github.com/
  - label: Homepage
    href: https://example.com/
  - label: LinkedIn
    href: https://www.linkedin.com/
  - label: 微信公众号
    href: https://mp.weixin.qq.com/
    kind: blog-channel
    desc: 论文解读与实验室动态（公众号）。
  - label: 小红书
    href: https://www.xiaohongshu.com/
    kind: blog-channel
    desc: 科研笔记与图文分享。
---
<!--
  这是「硕士生」模板主页，供参考与启发。复制本文件夹到
  content/team/masters/<你的文件夹>/，文件夹名用 {name-slug}-{入学年}-{学号}
  （如 zhang-san-2025-22012345），把下面内容换成你自己的，并删除本段注释。
  完整格式见 content/guidance.md。

  小贴士：
  - 照片：把图片放进本文件夹（如 photo.jpg），并在上方 frontmatter 加 `photo: photo.jpg`；不填则显示姓名首字母。
  - 结构化版块只支持 `## @papers` 和 `## @blog`，其它 `## 小节` 会按普通 Markdown 渲染。
  - @papers：列出 BibTeX cite key；`@bib publications` 表示引用全局 content/publications.bib，
    也可在本文件夹放 papers.bib 后改用 `@bib papers.bib`。可选荣誉标注：`- citekey | Oral`。
  - @blog：正文写 `## @blog Lab Notes`；`kind: blog-channel` 的链接显示在 **External**（站外）分组；`authorId` 关联的站内文章显示在 **On-site**（站内）分组。
-->

## About Me

Hi! I'm a **master's student** at AI4GC Lab, Zhejiang University, advised by Shengyu Zhang.
用两三句话介绍你是谁、研究什么、以及你为什么觉得这件事有意思。结尾可以写一句欢迎合作 / 联系方式。

## Research Interests

- **Direction A** — 一句话描述你关注的研究问题与你的切入点。
- **Direction B** — ……
- **Direction C** — ……

## Education

- **2025 – present** · M.S. in Computer Science, Zhejiang University
- **2021 – 2025** · B.S. in Your Major, Your University

## @papers Selected Papers

@bib publications

- forwardonceallstructural2025
- dietcustomizedslimming2024

## @blog Lab Notes
