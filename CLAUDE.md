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

**Astro 5 blog** with Tailwind CSS 4, MDX, and Pagefind search.

### Content Collections (src/content.config.ts)

| Collection | Source | Schema |
|------------|--------|--------|
| `blog` | `src/content/blog/*.{md,mdx}` | title, description, pubDate, updatedDate?, heroImage?, tags[] |
| `projects` | `src/content/projects/*.{md,mdx}` | Same as blog |
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

## Adding Content

Blog post frontmatter:
```yaml
---
title: "Post Title"
description: "Brief description"
pubDate: 2025-01-15
updatedDate: 2025-01-20  # optional
heroImage: ../../assets/blog/post-name/hero.jpg  # optional
tags: [tag1, tag2]
---
```

### Image Placement

| 图片类型 | 存放位置 | 引用方式 |
|----------|----------|----------|
| 封面图 (heroImage) | `src/assets/blog/<post-name>/` | frontmatter: `heroImage: ../../assets/blog/<post-name>/hero.jpg` |
| 文章内联图 | `public/blog/<post-name>/` | markdown: `![alt](/dasein/blog/<post-name>/fig.jpg)` |

**推荐尺寸**（2倍图适配 Retina）：
- 封面图：2040 × 1020 px（2:1 比例）
- 内联图：宽度 ≤ 1792 px，高度自由

**注意**：
- `src/assets/` 图片会被 Astro 优化（压缩、格式转换）
- `public/` 图片原样复制，不处理
- markdown 内联图片路径必须包含 base path `/dasein`
- 不要在两个位置放重复文件
- 格式优先使用 `.jpg` 或 `.webp`

### Math Support

支持 LaTeX 公式（remark-math + rehype-katex）：
- 行内公式：`$E = mc^2$`
- 块级公式：`$$\sum_{i=1}^n x_i$$`

## Deployment

Static output to `dist/`. Base path `/dasein`.

### GitHub Pages

已配置好，push 到 main 即可。

### Cloudflare Workers

```bash
npm run build && npx wrangler deploy
```

配置文件：`wrangler.jsonc`（指定 `assets.directory: "./dist"`）
