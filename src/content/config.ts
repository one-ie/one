import { defineCollection, z } from 'astro:content';

/**
 * Common Fields – Shared Across Content Types
 * 
 * These fields provide consistent metadata across all content types.
 */
const CommonFields = {
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.date().or(z.string()).optional(),
  status: z.enum(['draft', 'public', 'private']).default('draft').optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
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
  author: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
});

const TabSchema = z.object({
  value: z.string(),
  label: z.string(),
  content: z.string()
});

/**
 * Docs Schema
 * For documentation pages
 */
const DocsSchema = z.object({
  ...CommonFields,
  section: z.string().optional(),
  order: z.number().optional(),
  tabs: z.array(TabSchema).optional(),
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
  role: z.string().optional(),
  style: z.string().optional(),
  goal: z.string().optional(),
  maxResponseLength: z.number().optional(),
  tools: z.array(z.string()).optional(),
  context: z.string().optional(),
  sources: z.array(z.object({
    type: z.string().optional(),
    url: z.string().url().optional(),
    format: z.string().optional(),
    frequency: z.string().optional()
  })).optional(),
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

/**
 * Book Schema
 * For ebook content and chapters
 */
const BookSchema = z.object({
  ...CommonFields,
  author: z.string().default("Anthony O'Connell"),
  language: z.string().default('en-US'),
  publisher: z.string().default('ONE Publishing'),
  rights: z.string().default("© 2024 Anthony O'Connell. All rights reserved."),
  identifier: z.object({
    scheme: z.string().default('ISBN-13'),
    text: z.string().default('978-1-916-12345-6')
  }).default({}),
  creator: z.string().default("Anthony O'Connell"),
  contributor: z.string().default('ONE Team'),
  subject: z.string().default('Ecommerce, AI, Business Growth, Digital Marketing'),
  css: z.string().optional(),
  coverImage: z.string().optional(),
  chapter: z.number().optional(),
  order: z.number().optional(),
  status: z.enum(['draft', 'review', 'published']).default('draft'),

  // Schema.org fields
  '@type': z.literal('Book').optional(),
  '@context': z.literal('https://schema.org').optional(),
  bookFormat: z.enum(['EBook', 'Paperback', 'Hardcover']).optional(),
  inLanguage: z.string().optional(),
  datePublished: z.string().optional(),
  dateModified: z.string().optional(),
  numberOfPages: z.number().optional(),
  bookEdition: z.string().optional(),
  isbn: z.string().optional(),
  price: z.object({
    amount: z.number().optional(),
    currency: z.string().optional()
  }).optional(),
  audience: z.object({
    '@type': z.literal('Audience').optional(),
    audienceType: z.string().optional()
  }).optional(),
  workExample: z.array(z.object({
    '@type': z.literal('Chapter').optional(),
    name: z.string(),
    position: z.number(),
    url: z.string().optional()
  })).optional()
});

// --- LMS SCHEMAS ---

// Lesson Schema
const LessonSchema = z.object({
  ...CommonFields,
  slug: z.string(), // for routing
  courseId: z.string(),
  order: z.number().optional(),
  content: z.string().optional(), // fallback for MDX body
  video: z.object({
    platform: z.enum(['youtube', 'vimeo']).default('youtube'),
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    timestamp: z.string().optional(),
    params: z.string().optional(),
  }).optional(),
  aiConfig: z.any().optional(),
});

// Course Schema (no modules)
const CourseSchema = z.object({
  ...CommonFields,
  id: z.string(),
  lessons: z.array(z.string()), // array of lesson slugs/ids
  instructors: z.array(z.object({
    name: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  })).optional(),
  aiConfig: z.any().optional(),
});

// Define collections
const lessonsCollection = defineCollection({
  type: 'content',
  schema: LessonSchema
});

const coursesCollection = defineCollection({
  type: 'data',
  schema: CourseSchema
});

export const collections = {
  pages: defineCollection({ schema: PagesSchema }),
  blog: defineCollection({ schema: BlogSchema }),
  docs: defineCollection({ schema: DocsSchema }),
  videos: defineCollection({ schema: VideosSchema }),
  podcasts: defineCollection({ schema: PodcastsSchema }),
  software: defineCollection({ schema: SoftwareSchema }),
  news: defineCollection({ schema: NewsSchema }),
  prompts: defineCollection({ schema: PromptsSchema }),
  tutorials: defineCollection({ schema: TutorialsSchema }),
  events: defineCollection({ schema: EventsSchema }),
  book: defineCollection({ schema: BookSchema })
};

// Export type inference
export type Pages = z.infer<typeof PagesSchema>;
export type Blog = z.infer<typeof BlogSchema>;
export type Docs = z.infer<typeof DocsSchema>;
export type Videos = z.infer<typeof VideosSchema>;
export type Podcasts = z.infer<typeof PodcastsSchema>;
export type Software = z.infer<typeof SoftwareSchema>;
export type News = z.infer<typeof NewsSchema>;
export type Prompts = z.infer<typeof PromptsSchema>;
export type Tutorials = z.infer<typeof TutorialsSchema>;
export type Events = z.infer<typeof EventsSchema>;
export type Book = z.infer<typeof BookSchema>;

// Stream type for unified content
export type StreamItem = {
  type: keyof typeof collections;
  data: z.infer<typeof PagesSchema> |
        z.infer<typeof BlogSchema> |
        z.infer<typeof DocsSchema> |
        z.infer<typeof VideosSchema> |
        z.infer<typeof PodcastsSchema> |
        z.infer<typeof SoftwareSchema> |
        z.infer<typeof LessonSchema> |
        z.infer<typeof NewsSchema> |
        z.infer<typeof PromptsSchema> |
        z.infer<typeof TutorialsSchema> |
        z.infer<typeof EventsSchema> |
        z.infer<typeof BookSchema>;
};
