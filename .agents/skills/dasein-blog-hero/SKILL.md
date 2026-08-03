---
name: dasein-blog-hero
description: Create, analyze, regenerate, or review hero images for Dasein_Blog articles. Use this skill whenever the user asks to 给文章配图, 生成文章封面, 创建 heroImage, design a blog header, update an article image, or make a visual for any file under src/content/blog, even if they do not mention this skill. Read the complete article, derive one evidence-based visual thesis, choose the project template, save a reproducible brief, render or generate the image, update Front Matter when authorized, and verify the result.
compatibility: Requires Bun, sharp, local project files, and imagegen only for non-deterministic raster artwork.
---

# Dasein Blog Hero

Create article images that are specific to the article and consistent with Javier's editorial visual system.

## Required reading

Before acting:

1. Read the target article completely, including Front Matter.
2. Read `docs/design/hero-image-system.md` completely.
3. Read `references/acceptance-checklist.md` before verification.
4. Read `references/prompt-template.md` only when the work requires `imagegen`.
5. Read `references/examples.md` when choosing between templates or reviewing consistency.

Resolve all project-relative paths from the repository root.

## Workflow

### 1. Establish the visual thesis

Extract one sentence that states the article's most important visual relationship. Base it on the article itself, not only the title, filename, tags, or outside assumptions.

Identify the strongest carrier of that thesis:

- a number or measurable change
- a concept or contrast
- a person and their idea
- a concrete object or scene

Record the thesis in `src/assets/blog/<article-slug>/hero-brief.yml`.

### 2. Choose the rendering path

Use a deterministic template when the image is primarily typography, numbers, modules, diagrams, grids, lines, or other geometric editorial elements. Deterministic rendering protects spelling, spacing, colors, and repeatability.

Choose:

- `editorial-data` for statistics, versions, comparisons, and research results
- `editorial-concept` for ideas, systems, methods, and conceptual arguments
- `editorial-person` for interviews, profiles, speeches, and externally authored viewpoints

Use `imagegen` only for photography, complex illustration, real materials, or visual metaphors that the SVG templates cannot express well. Keep generated artwork subordinate to the project grid and typography.

### 3. Create the brief

Start from the closest example in `docs/design/hero-image-system.md` or `scripts/hero-images/examples/`. Include only meaningful fields. Keep image text short and verify every factual word or number against the article.

Use the article asset directory:

```text
src/assets/blog/<article-slug>/
```

Do not overwrite an approved image silently. The renderer refuses overwrites unless `--force` is explicitly supplied.

### 4. Render or generate

For deterministic templates:

```bash
bun run hero:render -- src/assets/blog/<article-slug>/hero-brief.yml
```

For preview-only validation, direct the result to `/tmp` with `--out`.

For `imagegen`, use the built-in image generation tool and the structured prompt in `references/prompt-template.md`. Save the selected project-bound asset into the article asset directory. Preserve the generated original and avoid destructive replacement.

### 5. Inspect

Inspect the actual saved image. Check:

- exact text and numbers
- 2:1 ratio
- central safe area
- hierarchy at full size
- readability at approximately 320 px wide
- absence of invented copy, watermarks, logos, and visual clichés

If one issue is found in an `imagegen` result, iterate with one targeted change. Do not rewrite the entire direction unless the visual thesis is wrong.

### 6. Connect to the article

When the user asked to create or apply the image, add or update:

```yaml
heroImage: ../../assets/blog/<article-slug>/hero.<ext>
```

Do not modify unrelated Front Matter or content. Preserve existing user changes and migrations.

### 7. Verify

Run the deterministic checks in `references/acceptance-checklist.md`. Run `bun run build` in proportion to the task. If the build hangs or fails for an unrelated existing reason, stop the process safely and report the boundary instead of claiming success.

## Output report

Report:

- final image and brief paths
- selected template or imagegen mode
- visual thesis
- dimensions and format
- article connection status
- verification result and any unresolved blocker

For an `imagegen` output, also report the final generation prompt as required by the image generation workflow.
