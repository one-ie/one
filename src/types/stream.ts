import { z } from 'zod';
import { partialSeoSchema } from './seo';

// Stream schema
export const streamSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.date().optional(),
  draft: z.boolean().default(false).optional(),
  featured: z.boolean().default(false).optional(),
  image: z.string().optional(),
  video: z.string().optional(),
  audio: z.string().optional(),
  tags: z.array(z.string()).default([]).optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  // Add SEO support
  seo: partialSeoSchema.optional(),
});

export type Stream = z.infer<typeof streamSchema>; 