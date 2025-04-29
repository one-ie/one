import { z } from 'zod';

export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  lessons: z.array(z.string()), // Array of lesson slugs
  duration: z.number(), // Total duration in minutes
  status: z.enum(['draft', 'public', 'private']).default('draft'),
});

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  duration: z.number(), // Total duration in minutes
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'public', 'private']).default('draft'),
  modules: z.array(ModuleSchema),
  instructors: z.array(z.object({
    name: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  })).default([]),
  features: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })).default([]),
  aiConfig: z.object({
    systemPrompt: z.array(z.object({
      type: z.literal('text'),
      text: z.string()
    })).optional(),
    welcomeMessage: z.string().optional(),
    suggestions: z.array(z.object({
      label: z.string(),
      prompt: z.string()
    })).optional()
  }).optional()
});

export type Module = z.infer<typeof ModuleSchema>;
export type Course = z.infer<typeof CourseSchema>; 