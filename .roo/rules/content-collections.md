---
description: Guidelines for using Astro content collections and MDX
glob_patterns:
  - "src/content/**/*.md"
  - "src/content/**/*.mdx"
  - "src/content/config.ts"
  - "src/pages/**/*.md"
  - "src/pages/**/*.mdx"
---

# Content Collections and MDX Guidelines

## Content Collections Structure

Organize content collections in a structured manner:

```
src/content/
├── blog/                # Blog posts
│   ├── post-1.md
│   └── post-2.mdx
├── docs/                # Documentation
│   ├── getting-started/
│   │   └── installation.md
│   └── features/
│       └── feature-1.md
├── prompts/             # AI prompts
│   └── chat-prompts.md
└── config.ts            # Collection configuration
```

## Collection Configuration

Define your collections with proper typing using Zod:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Blog collection schema
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

// Documentation collection schema
const docsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.string(),
    order: z.number().int().positive(),
    date: z.date().optional(),
  }),
});

// Export collections
export const collections = {
  'blog': blogCollection,
  'docs': docsCollection,
};
```

## Frontmatter Best Practices

Use consistent frontmatter across your content:

```markdown
---
title: "Your Post Title"
description: "A brief description of your post"
date: 2023-04-15
author: "Author Name"
image: "/images/post-image.jpg"
tags: ["tag1", "tag2"]
draft: false
---
```

For documentation pages:

```markdown
---
title: "Feature Documentation"
description: "Learn how to use this feature"
section: "Features"
order: 3
date: 2023-04-15
---
```

## Chat Configuration in MDX

For pages with AI chat capabilities:

```markdown
---
layout: ../layouts/Text.astro
title: "Your Page Title"
description: "Your page description"
chatConfig:
  provider: openai
  model: "gpt-4o-mini"
  temperature: 0.7
  maxTokens: 4000
  systemPrompt:
    - type: text
      text: "Define your AI assistant's role and expertise here"
  welcome:
    message: "👋 Your welcome message here"
    avatar: "/your-icon.svg"
    suggestions:
      - label: "First Option"
        prompt: "What would you like to know about...?"
---
```

## MDX Components

Create reusable MDX components:

```tsx
// src/components/mdx/Callout.tsx
export function Callout({ type = 'info', title, children }) {
  return (
    <div className={`callout callout-${type}`}>
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}
```

Use them in your MDX files:

```mdx
import { Callout } from '@/components/mdx/Callout';

# My MDX Page

<Callout type="warning" title="Important Note">
  This is an important warning you should pay attention to.
</Callout>
```

## Content Querying

Query your content collections efficiently:

```astro
---
import { getCollection } from 'astro:content';

// Get all blog posts
const allPosts = await getCollection('blog');

// Get published posts, sorted by date
const publishedPosts = allPosts
  .filter(post => !post.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

// Get posts with a specific tag
const taggedPosts = allPosts
  .filter(post => post.data.tags?.includes('featured'));
---
```

## Content Rendering

Render content with proper metadata:

```astro
---
import { getCollection } from 'astro:content';
import BlogLayout from '@/layouts/BlogLayout.astro';

// Get a specific blog post by slug
export async function getStaticPaths() {
  const blogPosts = await getCollection('blog');
  
  return blogPosts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogLayout frontmatter={post.data}>
  <Content />
</BlogLayout>
```

## Documentation Organization

Organize documentation with clear sections and ordering:

```astro
---
import { getCollection } from 'astro:content';

// Get all documentation pages
const allDocs = await getCollection('docs');

// Group by section
const docsBySection = allDocs.reduce((acc, doc) => {
  const section = doc.data.section;
  if (!acc[section]) {
    acc[section] = [];
  }
  acc[section].push(doc);
  return acc;
}, {});

// Sort each section by order
Object.keys(docsBySection).forEach(section => {
  docsBySection[section].sort((a, b) => a.data.order - b.data.order);
});
---
```

## Content Styling Best Practices

Use consistent styling for your content:

```astro
<style is:global>
  /* Base styles for markdown content */
  .content h1 {
    @apply text-3xl font-bold mb-6;
  }
  
  .content h2 {
    @apply text-2xl font-semibold mt-8 mb-4;
  }
  
  .content p {
    @apply mb-4 leading-relaxed;
  }
  
  .content ul, .content ol {
    @apply mb-4 ml-6;
  }
  
  .content li {
    @apply mb-2;
  }
  
  .content a {
    @apply text-blue-600 hover:underline;
  }
  
  .content blockquote {
    @apply border-l-4 border-gray-300 pl-4 italic my-4;
  }
  
  .content pre {
    @apply p-4 rounded-lg overflow-x-auto mb-4;
  }
  
  .content code {
    @apply font-mono text-sm;
  }
</style>
```

## AI-Enhanced Content

For pages with AI chat capabilities, structure your content to help the AI understand the topic:

1. **Clear Headings**
   ```markdown
   # Main Title
   
   ## Key Section
   
   ### Subsection
   ```

2. **Structured Information**
   ```markdown
   ## Key Points
   
   - **First Point** - Detailed explanation
   - **Second Point** - More details
   ```

3. **Organized Sections**
   ```markdown
   ## Topic Area
   
   1. **Main Concept**
      - Detail one
      - Detail two
   
   2. **Another Concept**
      - More information
      - Additional details
   ```

## Performance Optimization

Optimize your content for performance:

- Use responsive images with proper dimensions
- Lazy load images below the fold
- Minimize the use of heavy components in MDX
- Use appropriate image formats (WebP, AVIF)
- Implement proper caching strategies 