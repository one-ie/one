---
title: Content Types
description: Complete guide to ONE's content collection system
date: 2024-02-02
section: Core Features
order: 3
---

# Content Types System

ONE uses Astro's content collections with Zod validation to provide a powerful, type-safe content management system. This guide covers all content types, their schemas, and integration features.

## Quick Start

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Define collection with schema
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([])
  })
});

// Export collections
export const collections = {
  blog
};
```

## Base Schema

All content types extend from common base fields:

```typescript
const CommonFields = {
  // Required fields
  title: z.string(),
  
  // Optional fields
  description: z.string().optional(),
  date: z.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  image: z.string().optional(),
  
  // SEO fields
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional()
  }).optional()
};
```

## Content Collections

### 1. Pages
General website pages with flexible layouts.

```typescript
const PagesSchema = z.object({
  ...CommonFields,
  layout: z.enum(['default', 'wide', 'landing']),
  sections: z.array(z.object({
    id: z.string(),
    type: z.enum(['hero', 'features', 'cta', 'pricing']),
    content: z.record(z.unknown())
  })),
  menu: z.object({
    visible: z.boolean(),
    order: z.number()
  }).optional()
});

// Example usage
---
title: Home Page
layout: landing
sections:
  - id: hero
    type: hero
    content:
      heading: "Welcome to ONE"
      subheading: "Build AI-powered applications"
menu:
  visible: true
  order: 1
---
```

### 2. Documentation
Technical documentation and guides.

```typescript
const DocsSchema = z.object({
  ...CommonFields,
  section: z.string(),
  order: z.number(),
  prev: z.string().optional(),
  next: z.string().optional(),
  aiConfig: z.object({
    systemPrompt: z.string(),
    suggestions: z.array(z.object({
      label: z.string(),
      prompt: z.string()
    }))
  }).optional()
});

// Example usage
---
title: Getting Started
section: Introduction
order: 1
aiConfig:
  systemPrompt: "You are a documentation expert..."
  suggestions:
    - label: "🚀 Quick Start"
      prompt: "Show me how to get started"
---
```

### 3. Blog Posts
Rich content articles with AI assistance.

```typescript
const BlogSchema = z.object({
  ...CommonFields,
  author: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional()
  }),
  category: z.string(),
  featured: z.boolean().default(false),
  aiSummary: z.boolean().default(true),
  relatedContent: z.array(z.string()).optional()
});

// Example usage
---
title: Building AI Agents
author:
  name: John Doe
  avatar: /authors/john.jpg
category: Tutorials
featured: true
aiSummary: true
---
```

### 4. Courses
Educational content with structured lessons.

```typescript
const CoursesSchema = z.object({
  ...CommonFields,
  duration: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  prerequisites: z.array(z.string()),
  modules: z.array(z.object({
    title: z.string(),
    lessons: z.array(z.object({
      title: z.string(),
      duration: z.string(),
      type: z.enum(['video', 'text', 'quiz'])
    }))
  })),
  instructor: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string()
  })
});
```

### 5. AI Prompts
Reusable AI conversation templates.

```typescript
const PromptsSchema = z.object({
  ...CommonFields,
  category: z.string(),
  systemPrompt: z.string(),
  examples: z.array(z.object({
    user: z.string(),
    assistant: z.string()
  })),
  parameters: z.object({
    temperature: z.number(),
    maxTokens: z.number()
  }).optional()
});

// Example usage
---
title: Technical Interviewer
category: Interviews
systemPrompt: "You are an expert technical interviewer..."
examples:
  - user: "Tell me about your experience with TypeScript"
    assistant: "That's a great question..."
parameters:
  temperature: 0.7
  maxTokens: 2000
---
```

## Stream Integration

The stream system unifies content from all collections:

```typescript
// src/lib/stream.ts
import { getCollection } from 'astro:content';

export type StreamItem = {
  id: string;
  type: string;
  title: string;
  description?: string;
  date: Date;
  data: unknown;
};

export async function getStream(options?: {
  limit?: number;
  offset?: number;
  filter?: (item: StreamItem) => boolean;
}): Promise<StreamItem[]> {
  // Fetch from all collections
  const [blog, docs, courses] = await Promise.all([
    getCollection('blog'),
    getCollection('docs'),
    getCollection('courses')
  ]);

  // Combine and transform
  const items: StreamItem[] = [
    ...blog.map(post => ({
      id: post.id,
      type: 'blog',
      title: post.data.title,
      date: post.data.date,
      data: post.data
    })),
    // ... transform other collections
  ];

  // Sort by date
  items.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Apply options
  let result = items;
  if (options?.filter) {
    result = result.filter(options.filter);
  }
  if (options?.offset) {
    result = result.slice(options.offset);
  }
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}
```

## AI Integration

Each content type can include AI-specific configuration:

```typescript
const AIConfig = z.object({
  // System behavior
  systemPrompt: z.string(),
  
  // Quick suggestions
  suggestions: z.array(z.object({
    label: z.string(),
    prompt: z.string()
  })),
  
  // Content processing
  summarize: z.boolean().default(true),
  generateKeywords: z.boolean().default(true),
  
  // Response configuration
  temperature: z.number().default(0.7),
  maxTokens: z.number().default(2000)
});
```

## Best Practices

1. **Schema Organization**
   - Keep schemas modular and reusable
   - Use common fields consistently
   - Document schema properties

2. **Content Structure**
   - Organize content logically
   - Use clear, descriptive filenames
   - Follow naming conventions

3. **Type Safety**
   - Always use Zod validation
   - Define explicit types
   - Handle optional fields properly

4. **AI Integration**
   - Configure AI per content type
   - Provide clear system prompts
   - Include helpful suggestions

5. **Performance**
   - Use appropriate collection types
   - Optimize image assets
   - Implement proper caching

## Troubleshooting

1. **Schema Validation**
   ```typescript
   try {
     const data = schema.parse(frontmatter);
   } catch (error) {
     console.error("Validation failed:", error.issues);
   }
   ```

2. **Collection Issues**
   - Verify file organization
   - Check frontmatter format
   - Validate schema definitions

3. **Stream Problems**
   - Monitor memory usage
   - Implement pagination
   - Cache results appropriately

For more help:
- [Content Collections Guide](/docs/content-collections)
- [AI Integration Guide](/docs/ai-integration)
- Support: support@one.ie
