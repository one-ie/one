# Chat Schema with Content Support

## Base Schema

```typescript
const BaseChatSchema = {
  // Existing fields from current schema
  layout: string().optional(),
  title: string().optional(),
  // ... other existing fields ...

  // New content handling fields
  includeContent: boolean().default(true),
  contentPrefix: string().default("Context:"),
  contentMaxLength: number().default(2000)
}
```

## Prompt Assembly

The system combines prompts in this order:

1. Base system prompt from `1.md` (if `addSystemPrompt: true`)
   ```typescript
   if (config.addSystemPrompt) {
     prompts.push(loadPromptContent('src/1/1.md'));
   }
   ```

2. Business context from `business.md` (if `addBusinessPrompt: true`)
   ```typescript
   if (config.addBusinessPrompt) {
     prompts.push(loadPromptContent('src/1/business.md'));
   }
   ```

3. Page-specific system prompt (if provided)
   ```typescript
   if (config.systemPrompt) {
     prompts.push(config.systemPrompt);
   }
   ```

4. Page content (if `includeContent: true`)
   ```typescript
   if (config.includeContent && config.content) {
     prompts.push(
       `${config.contentPrefix}\n${
         truncate(config.content, config.contentMaxLength)
       }`
     );
   }
   ```

## Content Handling

Content is processed before being added to the prompt:

```typescript
function processContent(content: string, maxLength: number): string {
  // Remove frontmatter
  const cleanContent = content.replace(/^---[\s\S]*?---/, '');
  
  // Clean and normalize
  const normalized = cleanContent
    .trim()
    .replace(/\n{3,}/g, '\n\n');
    
  // Truncate if needed
  return truncate(normalized, maxLength);
}
```

## Example Usage

```yaml
---
layout: ../layouts/Text.astro
title: Documentation Page
includeContent: true
contentPrefix: "Page Content:"
contentMaxLength: 1500
systemPrompt: "Answer questions about this documentation..."
---

# Page Content

This content will be included in the system prompt...
```

## Benefits

1. **Context Awareness**
   - AI has access to page content
   - Can reference specific details
   - More accurate responses

2. **Configurability**
   - Enable/disable per page
   - Custom prefix
   - Length control

3. **Performance**
   - Content truncation prevents token limits
   - Clean content processing
   - Efficient prompt assembly