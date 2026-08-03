# Hero Image Acceptance Checklist

## Content

- [ ] The complete article and Front Matter were read.
- [ ] The brief contains one evidence-based `visualThesis`.
- [ ] Every number, person, source, and claim in the image is supported by the article.
- [ ] The image does not merely repeat the complete article title.
- [ ] No required information exists only inside the image.

## Visual system

- [ ] The image uses one template or a documented imagegen exception.
- [ ] The first visual communicates the article's core idea.
- [ ] The image uses no more than one accent color.
- [ ] Typography has no more than three levels.
- [ ] Essential content stays within the central 86% width safe area.
- [ ] The image remains recognizable at approximately 320 px wide.
- [ ] Homepage, Blog index, and tag-page cards show the complete image inside a fixed 2:1 area without cropping.
- [ ] No generic AI brain, robot, code rain, decorative network, or irrelevant screenshot appears.
- [ ] No unauthorized logo, portrait, trademark, or watermark appears.

## File

- [ ] Dimensions are 3200 × 1600 for deterministic output, or exactly 2:1 for an imagegen source.
- [ ] The file uses RGB color.
- [ ] The final asset is stored under `src/assets/blog/<article-slug>/`.
- [ ] A reproducible `hero-brief.yml` exists beside the image.
- [ ] The asset is not duplicated under `public/`.
- [ ] The article uses the correct relative `heroImage` path.

## Verification

- [ ] The deterministic renderer completed without unresolved placeholders.
- [ ] The saved image was inspected directly.
- [ ] The article image can be resolved by Astro.
- [ ] `bun run build` completed, or its independent blocker was reported precisely.
- [ ] Existing unrelated Git changes were preserved.
