# Content Types Architecture

## Overview

This document outlines the structure and schema for all content types in our application.

## Common Fields Schema

All content types will share these base fields:
```typescript
const CommonFields = {
  title: z.string(),
  description: z.string().optional().nullable(),
  date: z.date().optional().nullable(),
  draft: z.boolean().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  image: z.string().optional().nullable(),
}
```

## Content Type Schemas

### 1. Pages
```typescript
const PagesSchema = z.object({
  ...CommonFields,
  layout: z.string().optional(),
  sections: z.array(z.string()).optional(),
  menu: z.boolean().optional()
})
```

### 2. Videos
```typescript
const VideosSchema = z.object({
  ...CommonFields,
  url: z.string(),
  duration: z.number().optional(),
  thumbnail: z.string().optional(),
  transcript: z.string().optional(),
  platform: z.enum(['youtube', 'vimeo', 'other']).optional()
})
```

### 3. Podcasts
```typescript
const PodcastsSchema = z.object({
  ...CommonFields,
  audioUrl: z.string(),
  duration: z.number(),
  episode: z.number().optional(),
  season: z.number().optional(),
  transcript: z.string().optional()
})
```

### 4. Software
```typescript
const SoftwareSchema = z.object({
  ...CommonFields,
  version: z.string(),
  repository: z.string().optional(),
  documentation: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  installation: z.string().optional()
})
```

### 5. Resources
```typescript
const ResourcesSchema = z.object({
  ...CommonFields,
  type: z.enum(['guide', 'template', 'tool', 'library', 'other']),
  url: z.string().optional(),
  downloadUrl: z.string().optional(),
  category: z.string().optional()
})
```

### 6. Courses
```typescript
const CoursesSchema = z.object({
  ...CommonFields,
  duration: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  prerequisites: z.array(z.string()).optional(),
  modules: z.array(z.string()).optional(),
  instructor: z.string().optional()
})
```

### 7. Lessons
```typescript
const LessonsSchema = z.object({
  ...CommonFields,
  courseId: z.string(),
  moduleId: z.string().optional(),
  duration: z.number().optional(),
  order: z.number(),
  content: z.string().optional()
})
```

### 8. News
```typescript
const NewsSchema = z.object({
  ...CommonFields,
  category: z.string().optional(),
  featured: z.boolean().optional(),
  author: z.string().optional(),
  source: z.string().optional()
})
```

### 9. Tutorials
```typescript
const TutorialsSchema = z.object({
  ...CommonFields,
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  timeToComplete: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  category: z.string().optional()
})
```

### 10. Events
```typescript
const EventsSchema = z.object({
  ...CommonFields,
  startDate: z.date(),
  endDate: z.date().optional(),
  location: z.string().optional(),
  virtual: z.boolean().optional(),
  registration: z.string().optional(),
  capacity: z.number().optional()
})
```

## Collection Exports

Each content type should be exported as a collection:

```typescript
export const collections = {
  pages: defineCollection({ type: 'content', schema: PagesSchema }),
  videos: defineCollection({ type: 'content', schema: VideosSchema }),
  podcasts: defineCollection({ type: 'content', schema: PodcastsSchema }),
  software: defineCollection({ type: 'content', schema: SoftwareSchema }),
  resources: defineCollection({ type: 'content', schema: ResourcesSchema }),
  courses: defineCollection({ type: 'content', schema: CoursesSchema }),
  lessons: defineCollection({ type: 'content', schema: LessonsSchema }),
  blog: defineCollection({ type: 'content', schema: BlogSchema }),
  news: defineCollection({ type: 'content', schema: NewsSchema }),
  docs: defineCollection({ type: 'content', schema: DocsSchema }),
  tutorials: defineCollection({ type: 'content', schema: TutorialsSchema }),
  events: defineCollection({ type: 'content', schema: EventsSchema }),
  prompts: defineCollection({ type: 'content', schema: PromptsSchema })
};
```

## Stream Implementation

The stream functionality will be implemented through a utility function that combines and sorts content from all collections:

```typescript
export type StreamItem = {
  type: keyof typeof collections;
  data: z.infer<typeof collections[keyof typeof collections]['schema']>;
};

export async function getStream(): Promise<StreamItem[]> {
  // Implementation will fetch from all collections
  // Sort by date
  // Return unified stream
}
```

## Next Steps

1. Implement this schema in `src/content/config.ts`
2. Create folder structure for each content type
3. Add example content for testing
4. Create content rendering components
5. Implement the stream functionality