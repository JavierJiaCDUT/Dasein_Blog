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
heroImage: ../../assets/blog/image.jpg  # optional
tags: [tag1, tag2]
---
```

## Deployment

Static output to `dist/`. Currently configured for GitHub Pages at `/dasein` base path. Change `site` and `base` in `astro.config.mjs` for other deployments.
