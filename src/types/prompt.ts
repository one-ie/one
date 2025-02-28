import { z } from 'zod';
import { partialSeoSchema } from './seo';

// Prompt source schema
export const promptSourceSchema = z.object({
  type: z.string().optional(),
  url: z.string().url().optional(),
  format: z.string().optional(),
  frequency: z.string().optional(),
});

// Prompt schema
export const promptSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  role: z.string().optional(),
  style: z.string().optional(),
  goal: z.string().optional(),
  maxResponseLength: z.number().optional(),
  tools: z.array(z.string()).optional(),
  context: z.string().optional(),
  sources: z.array(promptSourceSchema).optional(),
  // Add SEO support
  seo: partialSeoSchema.optional(),
});

export type PromptSource = z.infer<typeof promptSourceSchema>;
export type Prompt = z.infer<typeof promptSchema>; 