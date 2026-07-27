# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Dev server at localhost:4321
bun run build        # Production build to dist/
bun run preview      # Preview production build
```

## Architecture

**Astro 6 blog** with Tailwind CSS 4, MDX, and Pagefind search.

Site URL `https://javierjia-blog.javier-b09.workers.dev`, served at root (`base: "/"`). Package manager is **bun**.

### Content Collections (src/content.config.ts)

| Collection | Source | Schema |
|------------|--------|--------|
| `blog` | `src/content/blog/*.{md,mdx}` | Publishing fields plus required authorship/type fields and conditional OKF provenance |
| `projects` | `src/content/projects/*.{md,mdx}` | title, description, dates, image, tags, draft |
| `cv` | `src/content/cv.yml` | Sections with heading, items[] |
| `site` | `src/site-config.yml` | author info, social links |

### Layouts

- `BaseLayout.astro` → Shell with header/footer, applies to all pages
- `BlogPost.astro` → Individual blog post page
- `PageLayout.astro` → Static pages (about, etc.)
- `ProjectPost.astro` → Individual project page

### Theming

CSS variables in `src/styles/global.css`:
- Light/dark mode via `[data-theme="dark"]` on `:root`
- Key tokens: `--color-ink`, `--color-paper`, `--color-surface`, `--color-border`, `--color-muted`
- Grid system: `--grid-cell` based on viewport width (20 divisions)

**Prose colors**: All `.prose` content uses `--color-ink` with `!important` to ensure visibility in both modes:
- Light: `--color-ink: #000000` (black)
- Dark: `--color-ink: #f5f5f5` (white)

**Note**: Tailwind's `dark:prose-invert` doesn't work here because the site uses `[data-theme="dark"]` instead of Tailwind's default `.dark` class. Don't rely on Tailwind dark mode utilities for prose—use CSS variables directly.

### Key Config Files

- `astro.config.mjs` → Site URL, base path, integrations (mdx, sitemap, pagefind, icon)
- `src/site-config.yml` → Author name, bio, social links
- `src/utils/consts.ts` → `getSite()` helper to read site config

**heroImage type**: `BlogPost`/`ProjectPost` layouts expect `ImageMetadata` (a `src/assets/...` import). `BaseLayout` accepts `ImageMetadata | string`, so a plain string path (e.g. a `public/` URL) also works for the OG/meta image.

## Adding Content

Blog post frontmatter:
```yaml
---
type: Article
title: "Post Title"
description: "Brief description"
pubDate: 2025-01-15
updatedDate: 2025-01-20  # optional
author: "Jia XinYuan"
contentType: Original
language: [en]
heroImage: ../../assets/blog/post-name/hero.jpg  # optional
tags: [Topic One, Topic Two]
draft: false
---
```

### Attribution and Provenance

Every blog post must declare its authorship and content type. Use the following Open Knowledge Format (OKF) v0.2-compatible extension for translated, reposted, summarized, or externally authored articles.

```yaml
---
type: "Research Summary"
title: "Research Overview"
description: "One sentence describing the research's core value."
pubDate: 2026-07-27
updatedDate: 2026-07-27
author: "Research Authors"
contentType: "Bilingual Translation"
language: [en, zh-CN]
translationMethod: "AI-Assisted"
originalPubDate: 2026-05-21
resource: "https://example.com/directly-adapted-overview"
sources:
  - id: adapted-overview
    resource: "https://example.com/directly-adapted-overview"
    title: "Overview used for this post"
  - id: primary-paper
    resource: "https://example.com/primary-paper"
    title: "Original research paper"
    author: "Research Authors"
tags: [Topic One, Topic Two, Topic Three]
draft: false
---
```

Rules:

- `type`, `author`, `contentType`, and `language` are required for every blog post.
- Use a descriptive `type` such as `Article`, `Research Summary`, or `Guide`.
- Use `contentType` to distinguish `Original`, `Translation`, `Bilingual Translation`, `Repost`, `Summary`, or `Commentary`.
- `author` names the local author for original work and the source author or research team for externally sourced work.
- Use BCP 47 language tags such as `en` and `zh-CN`.
- Translated content must declare `translationMethod` as `AI-Assisted`, `Human`, or `Hybrid`.
- Use `translationMethod: AI-Assisted` for AI-assisted translation. Do not expose a specific model name in public metadata.
- `translator` is optional and is only for a named human translator or translation organization. `Human` and `Hybrid` translations must name one.
- `resource` points to the text directly translated, reposted, or adapted. Do not add a duplicate `sourceUrl`.
- `sources` records the complete provenance chain. Put the directly adapted source first and the primary article, paper, or project page second.
- `originalPubDate` records the publication date of `resource`. `pubDate` and `updatedDate` retain their normal site meanings.
- `Translation`, `Bilingual Translation`, `Repost`, and `Summary` require `resource`, `sources`, and `originalPubDate`.
- Do not infer authors, translators, dates, or sources from filenames or commit history. Verify them before publishing.
- Write tags in title case.
- Do not add a separate `timestamp`; `updatedDate` is the site's update field.
- Add `related` only when it points to real, directly related internal content.
- When adding an attribution field, update both `src/content.config.ts` and `BlogPost.astro` so the rule is validated and meaningful reader-facing information is visible.

Workflow examples:

| Workflow | Required attribution fields |
|----------|-----------------------------|
| Original | `contentType: Original`; local `author`; no external source fields required |
| AI-assisted translation | `contentType: Bilingual Translation`; `translationMethod: AI-Assisted`; source provenance required |
| Human translation | `contentType: Translation`; `translationMethod: Human`; named `translator`; source provenance required |
| Hybrid translation | `contentType: Bilingual Translation`; `translationMethod: Hybrid`; named human reviewer in `translator`; source provenance required |
| Repost | `contentType: Repost`; `resource`, `sources`, and `originalPubDate`; no translation fields unless translated |

### Image Placement

| 图片类型 | 存放位置 | 引用方式 |
|----------|----------|----------|
| 封面图 (heroImage) | `src/assets/blog/<post-name>/` | frontmatter: `heroImage: ../../assets/blog/<post-name>/hero.jpg` |
| 文章内联图 | `public/blog/<post-name>/` | markdown: `![alt](/blog/<post-name>/fig.jpg)` |

**推荐尺寸**（2倍图适配 Retina）：
- 封面图：3200 × 1600 px（2:1 比例）—— 确保 featured 全宽卡片在 Retina 屏幕下清晰
- 内联图：宽度 ≤ 1792 px，高度自由

**注意**：
- `src/assets/` 图片会被 Astro 优化（压缩、格式转换）
- `public/` 图片原样复制，不处理
- `public/` 内的文件在 markdown 中用**绝对路径**引用（以 `/` 开头，例如 `/blog/...`；站点 base 为 `/`，无子路径前缀）
- `src/assets/` 内的文件在 frontmatter 中用**相对路径**引用（`../../assets/...`）
- 不要在两个位置放重复文件
- 格式优先使用 `.jpg` 或 `.webp`

### File Naming Convention

**必须遵守的命名规范**（否则文章无法显示）：
- ✅ 使用 kebab-case：`file-name-example.md`
- ✅ 或首字母大写+短横线：`File-Name-Example.md`
- ❌ **绝对不要使用空格**：`File Name Example.md`

**原因**：文件名中的空格会导致：
1. URL 路由解析失败（空格被转义为 `%20` 或直接失败）
2. 构建系统可能跳过该文件
3. Git 版本控制时容易出错

### Math Support

支持 LaTeX 公式（remark-math + rehype-katex）：
- 行内公式：`$E = mc^2$`
- 块级公式：`$$\sum_{i=1}^n x_i$$`

## Deployment

Static output to `dist/`, served at root (`base: "/"`). Primary target is **Cloudflare Workers**.

### Cloudflare Workers

```bash
bun run build && npx wrangler deploy
```

配置文件：`wrangler.jsonc`（`name: "javierjia-blog"`，`assets.directory: "./dist"`）。

> 注意：仓库当前没有 `.github/workflows/` CI 配置，部署需手动执行上面的命令（不是 push 到 main 自动发布）。

### Git Push 大文件问题

如果推送包含大量图片的 commit 时遇到网络错误：

```bash
# 错误示例
error: RPC failed; curl 16 Error in the HTTP2 framing layer
error: RPC failed; curl 55 Send failure: Broken pipe
```

**解决方案**：

```bash
# 1. 增加 HTTP buffer 大小（500MB）
git config http.postBuffer 524288000

# 2. 切换到更稳定的 HTTP/1.1 协议
git config --local http.version HTTP/1.1

# 3. 重新推送
git push origin main
```

**预防措施**：
- 图片优先使用压缩格式（WebP、优化的 JPEG）
- 单次 commit 避免添加超过 5MB 的文件
- 考虑使用 Git LFS 管理大型资源文件

## 开发/生产环境区分

本项目有两个功能仅在开发环境（`npm run dev`）中生效，生产构建（`npm run build`）时自动隐藏。

### 1. 草稿文章（Draft Posts）

在 frontmatter 中添加 `draft: true`，文章仅在本地 dev 模式可见，生产构建不生成页面：

```yaml
---
title: "WIP Post"
draft: true
tags: [AI]
---
```

- **实现**：`src/utils/content.ts` 中的 `getPublishedPosts()` 函数统一处理过滤逻辑
- **规则**：所有博客查询**必须使用 `getPublishedPosts()`** 而非直接调用 `getCollection('blog')`
- **默认值**：`draft` 默认为 `false`（不写即为已发布）

### 2. Debug 按钮

导航栏的 Debug 按钮（切换调试边框）仅在开发模式渲染：

- **实现**：`src/components/Header.astro` 中用 `{import.meta.env.DEV && (...)}` 条件渲染
- **包含**：桌面端 `#debug-toggle` 和移动端 `#mobile-debug` 两个按钮
