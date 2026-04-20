---
name: ai-sdk-structured-data
description: Generate type-safe structured data with Vercel AI SDK using generateObject and streamObject with Zod schemas for JSON extraction, classification, and synthetic data
---

# AI SDK Structured Data Generation

Generate validated, type-safe structured data from AI models using schemas.

## Works With

| Skill      | Load when                                                                                |
|------------|------------------------------------------------------------------------------------------|
| `/react19` | Streaming `streamObject` into a component — pair with `use()` + transitions for UI.       |
| `/signal`  | Zod-validated output lands in `data.content` — the structured shape becomes a signal body. |
| `/ai-ui`   | Tool/Reasoning blocks render the `generateObject` shapes; schemas double as UI contracts.  |
| `/typedb`  | Extracted structured data persists as attributes on entities — match Zod types to TQL.    |

## When to Use This Skill

Use this skill when you need to:
- Extract structured information from text
- Classify or categorize data
- Generate synthetic data with specific structure
- Ensure type-safe AI outputs
- Validate AI-generated JSON

## Core Functions

### generateObject - Complete Generation

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  }),
  prompt: 'Extract user info: John Doe, 30 years old, john@example.com',
});

// object is fully typed!
console.log(object.name); // string
console.log(object.age); // number
```

### streamObject - Progressive Generation

```typescript
import { streamObject } from 'ai';
import { z } from 'zod';

const { partialObjectStream } = streamObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe',
});

for await (const partialObject of partialObjectStream) {
  console.log(partialObject);
  // Logs progressively: { recipe: { name: "Lasagna" } }
  // Then: { recipe: { name: "Lasagna", ingredients: ["pasta"] } }
  // etc.
}
```

## Schema Patterns

### Simple Extraction

```typescript
const schema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  confidence: z.number().min(0).max(1),
});

const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  schema,
  prompt: 'Analyze sentiment: This product is amazing!',
});
```

### Nested Objects

```typescript
const schema = z.object({
  user: z.object({
    name: z.string(),
    contact: z.object({
      email: z.string().email(),
      phone: z.string().optional(),
    }),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
});
```

### Arrays

```typescript
const schema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      dueDate: z.string().datetime(),
      tags: z.array(z.string()),
    })
  ),
});

const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  schema,
  prompt: 'Generate 5 project tasks',
});
```

### Enums and Literals

```typescript
const schema = z.object({
  category: z.enum(['tech', 'business', 'science', 'arts']),
  status: z.literal('published').or(z.literal('draft')),
  priority: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3)
  ]),
});
```

## Output Strategies

### object - Single Object

```typescript
const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  output: 'object', // default
  schema: z.object({
    title: z.string(),
    content: z.string(),
  }),
  prompt: 'Write a blog post',
});
```

### array - Array of Objects

```typescript
const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  output: 'array',
  schema: z.object({
    product: z.string(),
    price: z.number(),
  }),
  prompt: 'List 5 products with prices',
});

// object is an array
object.forEach(item => console.log(item.product, item.price));
```

### enum - Single Value

```typescript
const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  output: 'enum',
  enum: ['urgent', 'normal', 'low'],
  prompt: 'Classify priority: Server is down!',
});

// object is 'urgent' | 'normal' | 'low'
```

### no-schema - Raw JSON

```typescript
const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  output: 'no-schema',
  prompt: 'Generate any JSON for a user profile',
});

// object is any JSON (not validated)
```

## Complete Example: Content Extraction

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string(),
  author: z.string(),
  publishDate: z.string().datetime(),
  summary: z.string(),
  categories: z.array(z.string()),
  keyPoints: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  estimatedReadTime: z.number(), // minutes
  entities: z.object({
    people: z.array(z.string()),
    organizations: z.array(z.string()),
    locations: z.array(z.string()),
  }),
});

const { object: article } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  schema: articleSchema,
  prompt: `Extract structured data from this article:

  ${articleText}`,
});

// Fully typed output
console.log(`"${article.title}" by ${article.author}`);
console.log(`Categories: ${article.categories.join(', ')}`);
console.log(`Read time: ${article.estimatedReadTime} min`);
```

## Streaming with UI Updates

```typescript
import { streamObject } from 'ai';
import { z } from 'zod';

async function generateAnalysis(text: string) {
  const { partialObjectStream } = streamObject({
    model: 'anthropic:claude-3-5-sonnet-20241022',
    schema: z.object({
      summary: z.string(),
      keywords: z.array(z.string()),
      sentiment: z.object({
        score: z.number(),
        label: z.enum(['positive', 'neutral', 'negative']),
      }),
      topics: z.array(z.object({
        name: z.string(),
        relevance: z.number(),
      })),
    }),
    prompt: `Analyze: ${text}`,
  });

  for await (const partial of partialObjectStream) {
    // Update UI progressively
    if (partial.summary) {
      updateUI({ summary: partial.summary });
    }
    if (partial.keywords) {
      updateUI({ keywords: partial.keywords });
    }
    if (partial.sentiment) {
      updateUI({ sentiment: partial.sentiment });
    }
  }
}
```

## Error Handling

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

try {
  const { object } = await generateObject({
    model: 'anthropic:claude-3-5-sonnet-20241022',
    schema: z.object({
      count: z.number().positive(),
    }),
    prompt: 'Count the words',
  });
} catch (error) {
  if (error.name === 'AI_InvalidDataContentError') {
    console.error('Model generated invalid data');
  } else if (error.name === 'AI_ValidationError') {
    console.error('Schema validation failed');
  }
}
```

## Generation Modes

### auto (Default)

Model decides best approach:

```typescript
const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  mode: 'auto', // default
  schema,
  prompt: '...',
});
```

### tool

Forces tool-based generation:

```typescript
const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  mode: 'tool',
  schema,
  prompt: '...',
});
```

### json

Forces JSON mode:

```typescript
const { object } = await generateObject({
  model: 'anthropic:claude-3-5-sonnet-20241022',
  mode: 'json',
  schema,
  prompt: '...',
});
```

## Integration with Convex

```typescript
import { mutation } from './_generated/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { v } from 'convex/values';

export const extractMetadata = mutation({
  args: { content: v.string() },
  handler: async (ctx, { content }) => {
    const { object: metadata } = await generateObject({
      model: 'anthropic:claude-3-5-sonnet-20241022',
      schema: z.object({
        title: z.string(),
        categories: z.array(z.string()),
        tags: z.array(z.string()),
      }),
      prompt: `Extract metadata from: ${content}`,
    });

    // Store in Convex
    return await ctx.db.insert('things', {
      groupId: ctx.auth.groupId,
      type: 'content',
      name: metadata.title,
      properties: {
        categories: metadata.categories,
        tags: metadata.tags,
        rawContent: content,
      },
      status: 'active',
      createdAt: Date.now(),
    });
  },
});
```

## Testing

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';
import { describe, it, expect } from 'vitest';

describe('Sentiment Analysis', () => {
  it('should classify positive sentiment', async () => {
    const { object } = await generateObject({
      model: 'anthropic:claude-3-5-sonnet-20241022',
      schema: z.object({
        sentiment: z.enum(['positive', 'neutral', 'negative']),
      }),
      prompt: 'Analyze: This is amazing!',
    });

    expect(object.sentiment).toBe('positive');
  });
});
```

## Best Practices

1. **Use Zod for Type Safety**: Get TypeScript types automatically
2. **Descriptive Field Names**: Help model understand what to generate
3. **Add Descriptions**: Use `.describe()` for complex fields
4. **Validate Strictly**: Use `.refine()` for custom validation
5. **Stream Long Outputs**: Use `streamObject` for large data
6. **Handle Errors**: Model might generate invalid data
7. **Test Edge Cases**: Verify schema handles all cases

## Common Use Cases

### Data Extraction
```typescript
schema: z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
})
```

### Classification
```typescript
schema: z.object({
  category: z.enum(['spam', 'important', 'normal']),
  confidence: z.number(),
})
```

### Summarization
```typescript
schema: z.object({
  summary: z.string().max(200),
  keyPoints: z.array(z.string()),
})
```

### Synthetic Data
```typescript
schema: z.array(z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
}))
```

## Related Files

- AI SDK Docs: `/docs/ai-sdk/content/docs/03-ai-sdk-core/10-generating-structured-data.mdx`
- Agent Skill: `.claude/anthropic-skills/ai-sdk-agent/`

## Token Budget

- Metadata: ~100 tokens
- Instructions: ~1800 tokens
- Examples: ~1000 tokens
- Total: ~2900 tokens

---

**Version**: 1.0.0
**Last Updated**: 2025-12-12
**Maintained By**: AI Team
