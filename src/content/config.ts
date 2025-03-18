import { defineCollection, z } from 'astro:content';

/**
 * Common Fields – Shared Across Content Types
 * 
 * These fields provide consistent metadata across all content types.
 */
const CommonFields = {
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.date().optional().nullable(),
  status: z.enum(['private', 'public']).default('private'),
  tags: z.array(z.string()).optional().nullable(),
  image: z.string().optional().nullable(),
};

/**
 * Pages Schema
 * For static pages and landing pages
 */
const PagesSchema = z.object({
  ...CommonFields,
  layout: z.string().optional(),
  sections: z.array(z.string()).optional(),
  menu: z.boolean().optional()
});

/**
 * Blog Schema
 * For blog posts and articles
 */
const BlogSchema = z.object({
  ...CommonFields,
  author: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  featured: z.boolean().optional().nullable(),
});

/**
 * Docs Schema
 * For documentation pages
 */
const DocsSchema = z.object({
  ...CommonFields,
  section: z.string().optional().nullable(),
  order: z.number().optional().nullable(),
});

/**
 * Videos Schema
 * For video content across platforms
 */
const VideosSchema = z.object({
  ...CommonFields,
  url: z.string(),
  duration: z.number().optional(),
  thumbnail: z.string().optional(),
  transcript: z.string().optional()
});

/**
 * Podcasts Schema
 * For audio content and episodes
 */
const PodcastsSchema = z.object({
  ...CommonFields,
  audioUrl: z.string(),
  duration: z.number(),
  transcript: z.string().optional()
});

/**
 * Software Schema
 * For software projects and tools
 */
const SoftwareSchema = z.object({
  ...CommonFields,
  url: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
  language: z.string().optional(),
  video: z.string().optional()
});

/**
 * Courses Schema
 * For structured learning content
 */
const CoursesSchema = z.object({
  ...CommonFields,
  duration: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  prerequisites: z.array(z.string()).optional(),
  modules: z.array(z.string()).optional(),
  instructor: z.string().optional()
});

/**
 * Lessons Schema
 * For individual course lessons
 */
const LessonsSchema = z.object({
  ...CommonFields,
  courseId: z.string(),
  moduleId: z.string().optional(),
  duration: z.number().optional(),
  order: z.number(),
  content: z.string().optional()
});

/**
 * News Schema
 * For news articles and updates
 */
const NewsSchema = z.object({
  ...CommonFields,
  category: z.string().optional(),
  featured: z.boolean().optional(),
  author: z.string().optional(),
  source: z.string().optional()
});

/**
 * Prompts Schema
 * For AI prompts and templates
 */
const PromptsSchema = z.object({
  ...CommonFields,
  category: z.string().optional()
});

/**
 * Tutorials Schema
 * For step-by-step guides
 */
const TutorialsSchema = z.object({
  ...CommonFields,
  category: z.string().optional()
});

/**
 * Events Schema
 * For events and webinars
 */
const EventsSchema = z.object({
  ...CommonFields,
  startDate: z.date(),
  endDate: z.date().optional(),
  location: z.string().optional(),
  virtual: z.boolean().optional()
});

// Define collections
export const pages = defineCollection({ type: 'content', schema: PagesSchema });
export const blog = defineCollection({ type: 'content', schema: BlogSchema });
export const docs = defineCollection({ type: 'content', schema: DocsSchema });
export const videos = defineCollection({ type: 'content', schema: VideosSchema });
export const podcasts = defineCollection({ type: 'content', schema: PodcastsSchema });
export const software = defineCollection({ type: 'content', schema: SoftwareSchema });
export const courses = defineCollection({ type: 'content', schema: CoursesSchema });
export const lessons = defineCollection({ type: 'content', schema: LessonsSchema });
export const news = defineCollection({ type: 'content', schema: NewsSchema });
export const prompts = defineCollection({ type: 'content', schema: PromptsSchema });
export const tutorials = defineCollection({ type: 'content', schema: TutorialsSchema });
export const events = defineCollection({ type: 'content', schema: EventsSchema });

// Export collections object
export const collections = {
  pages,
  blog,
  docs,
  videos,
  podcasts,
  software,
  courses,
  lessons,
  news,
  prompts,
  tutorials,
  events,
};

// Export type inference
export type Pages = z.infer<typeof PagesSchema>;
export type Blog = z.infer<typeof BlogSchema>;
export type Docs = z.infer<typeof DocsSchema>;
export type Videos = z.infer<typeof VideosSchema>;
export type Podcasts = z.infer<typeof PodcastsSchema>;
export type Software = z.infer<typeof SoftwareSchema>;
export type Courses = z.infer<typeof CoursesSchema>;
export type Lessons = z.infer<typeof LessonsSchema>;
export type News = z.infer<typeof NewsSchema>;
export type Prompts = z.infer<typeof PromptsSchema>;
export type Tutorials = z.infer<typeof TutorialsSchema>;
export type Events = z.infer<typeof EventsSchema>;

// Stream type for unified content
export type StreamItem = {
  type: keyof typeof collections;
  data: z.infer<typeof PagesSchema> |
        z.infer<typeof BlogSchema> |
        z.infer<typeof DocsSchema> |
        z.infer<typeof VideosSchema> |
        z.infer<typeof PodcastsSchema> |
        z.infer<typeof SoftwareSchema> |
        z.infer<typeof CoursesSchema> |
        z.infer<typeof LessonsSchema> |
        z.infer<typeof NewsSchema> |
        z.infer<typeof PromptsSchema> |
        z.infer<typeof TutorialsSchema> |
        z.infer<typeof EventsSchema>;
};
