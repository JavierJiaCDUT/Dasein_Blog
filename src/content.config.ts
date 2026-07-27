import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const contentTypeSchema = z.enum([
  'Original',
  'Translation',
  'Bilingual Translation',
  'Repost',
  'Summary',
  'Commentary',
]);

const translationMethodSchema = z.enum(['AI-Assisted', 'Human', 'Hybrid']);

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        // Transform string to Date object
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        type: z.string().min(1),
        author: z.string().min(1),
        contentType: contentTypeSchema,
        language: z.array(z.string().min(1)).min(1),
        translationMethod: translationMethodSchema.optional(),
        translator: z.string().min(1).optional(),
        originalPubDate: z.coerce.date().optional(),
        resource: z.string().url().optional(),
        sources: z
          .array(
            z.object({
              id: z.string().optional(),
              resource: z.string().url(),
              title: z.string().optional(),
              author: z.string().optional(),
            }),
          )
          .min(1)
          .optional(),
        heroImage: image().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
      })
      .superRefine((data, context) => {
        const translationTypes = new Set(['Translation', 'Bilingual Translation']);
        const externallySourcedTypes = new Set([
          'Translation',
          'Bilingual Translation',
          'Repost',
          'Summary',
        ]);

        if (translationTypes.has(data.contentType) && !data.translationMethod) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['translationMethod'],
            message: 'Translated content must declare a translationMethod.',
          });
        }

        if (
          (data.translationMethod === 'Human' || data.translationMethod === 'Hybrid') &&
          !data.translator
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['translator'],
            message: 'Human and Hybrid translations must name the translator.',
          });
        }

        if (externallySourcedTypes.has(data.contentType)) {
          if (!data.originalPubDate) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['originalPubDate'],
              message: 'Externally sourced content must declare originalPubDate.',
            });
          }

          if (!data.resource) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['resource'],
              message: 'Externally sourced content must declare its primary resource.',
            });
          }

          if (!data.sources?.length) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['sources'],
              message: 'Externally sourced content must include at least one source.',
            });
          }
        }
      }),
});

const projects = defineCollection({
  // Load Markdown and MDX files in the `src/content/projects/` directory.
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

const site = defineCollection({
  loader: file('src/site-config.yml'),
});

const cv = defineCollection({
  loader: file("src/content/cv.yml"),
  schema: z.object({
    id: z.string().optional(),
    heading: z.string(),
    component: z.string().optional(),
    collection: z.string().optional(),
    limit: z.number().optional(),
    viewAllHref: z.string().optional(),
    viewAllLabel: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          datetime: z.string().optional(),
          href: z.string().optional(),
        }),
      )
      .optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
        }),
      )
      .optional(),
  }),
});

// Export types for use in other files
export type CVEntry = {
  id: string;
  data: {
    id?: string;
    heading: string;
    component?: string;
    collection?: string;
    limit?: number;
    viewAllHref?: string;
    viewAllLabel?: string;
    items?: Array<{
      title: string;
      description?: string;
      datetime?: string;
      href?: string;
    }>;
    links?: Array<{
      label: string;
      href: string;
    }>;
  };
};

export const collections = { blog, cv, projects, site };
