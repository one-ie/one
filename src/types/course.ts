import { z } from "zod";

// Base schemas
export const LessonSchema = z.object({
  name: z.string(),
  value: z.string()
});

export const ModuleDetailsSchema = z.object({
  overview: z.string(),
  benefits: z.array(z.string()),
  implementation: z.array(z.string())
});

export const ModuleSchema = z.object({
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  details: ModuleDetailsSchema.optional()
});

export const CourseDetailsSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  originalPrice: z.string(),
  currentPrice: z.string(),
  guarantee: z.string(),
  ctaText: z.string(),
  valueProposition: z.string(),
  spots: z.object({
    total: z.number(),
    remaining: z.number()
  }),
  launchDate: z.string()
});

// Derived types
export type Lesson = z.infer<typeof LessonSchema>;
export type ModuleDetails = z.infer<typeof ModuleDetailsSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type CourseDetails = z.infer<typeof CourseDetailsSchema>;

// Component Props
export interface ModuleContentProps {
  module?: Module;
  lessons?: Lesson[];
  moduleNumber?: number;
}

export interface CourseHeroProps {
  courseDetails: CourseDetails;
  heroStats: Array<{
    value: string;
    label: string;
  }>;
}

// Legacy interfaces (to be migrated)
export interface LegacyModule {
  title: string;
  description: string;
  objective: string;
  mainDescription: string;
  output: string;
  lessons: Lesson[];
} 