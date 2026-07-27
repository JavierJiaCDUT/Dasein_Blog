# Javier Jia

Personal website and blog for Javier Jia, built with Astro 6, Tailwind CSS 4, MDX, and Pagefind.

## Local development

```bash
bun install
bun run dev
```

The development server runs at `http://localhost:4321`.

## Content

Blog posts live in `src/content/blog/`. Project case studies live in `src/content/projects/`.

Both collections support local-only drafts:

```yaml
draft: true
```

Drafts are visible during local development. Production builds exclude them from generated pages, lists, tags, RSS, sitemap, and search.

## Production build

```bash
bun run build
bun run preview
```

The static site is generated in `dist/`.

## Deployment

The site is deployed to Cloudflare Workers using the configuration in `wrangler.jsonc`.

```bash
bun run build
npx wrangler deploy
```

## License and attribution

This repository is licensed under AGPL-3.0. The site is based on [Dasein](https://github.com/roicort/dasein) by Rodrigo Cortez.
