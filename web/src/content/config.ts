import { defineCollection, z } from 'astro:content';

// Define the Blog schema
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  draft: z.boolean().optional(),
  image: z.string().optional(),
  author: z.string().default('ONE'),
  tags: z.array(z.string()).default([]),
  category: z
    .enum(['tutorial', 'news', 'guide', 'review', 'article'])
    .default('article'),
  readingTime: z.number().optional(),
  featured: z.boolean().default(false),
});

// Define the Blog collection schema
const blog = defineCollection({
  type: 'content',
  schema: BlogSchema,
});

// Define the Stream schema - very flexible to accept any markdown file
// Shows real-time activity across the ONE platform
const StreamSchema = z.object({
  title: z.string(), // Required: title of the update
  date: z.date(), // Required: when this happened
  description: z.string().optional(), // Optional description
  author: z.string().optional().default('ONE'), // Who created this
  type: z.string().optional(), // Type of activity: file_created, feature_added, etc.
  tags: z.array(z.string()).optional().default([]), // Any tags
  image: z.string().optional(), // Optional image
  draft: z.boolean().optional().default(false), // Hide if draft
  // All other fields are optional and flexible
  category: z.string().optional(),
  readingTime: z.number().optional(),
  featured: z.boolean().optional(),
  path: z.string().optional(), // Original file path
  repo: z.string().optional(), // Which repo (web, backend, one, etc.)
});

// Define the Stream collection
const stream = defineCollection({
  type: 'content',
  schema: StreamSchema,
});

// Note: Installation-specific documentation is handled via file-resolver utility
// in Astro pages, not through content collections. This allows dynamic resolution
// based on INSTALLATION_NAME environment variable at runtime.

export const collections = {
  blog: blog,
  stream: stream,
};

// Export schema types
export type BlogSchema = z.infer<typeof BlogSchema>;
export type StreamSchema = z.infer<typeof StreamSchema>;
