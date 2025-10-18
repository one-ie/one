# Add Content Collection

**Category:** astro
**Version:** 1.0.0
**Used By:** agent-frontend, agent-builder

## Purpose

Creates Astro content collection with schema.

## Example

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
