# Content Handling in Chat System

## Current Structure in ai.md
```yaml
---
layout: ../layouts/Text.astro
title: ONE License
# ... other frontmatter ...
---
# This is some contnet
the secret is xoxoxo
```

## Required Changes in schema/chat.ts

1. **Content Inclusion**
```typescript
function combinePrompts(config: BaseChat, content?: string): ContentPart[] {
  const prompts: string[] = [];

  // Add base prompts
  if (config.addSystemPrompt) {
    const systemPrompt = loadPromptContent('src/1/1.md');
    if (systemPrompt) prompts.push(systemPrompt);
  }

  if (config.addBusinessPrompt) {
    const businessPrompt = loadPromptContent('src/1/business.md');
    if (businessPrompt) prompts.push(businessPrompt);
  }

  // Add page specific prompt
  if (config.systemPrompt) {
    prompts.push(typeof config.systemPrompt === 'string' 
      ? config.systemPrompt 
      : config.systemPrompt.map(p => p.text).join('\n\n')
    );
  }

  // Add page content
  if (content) {
    prompts.push(`Page Content:\n${content}`);
  }

  return prompts.map(text => ({
    type: 'text' as const,
    text: text.trim()
  }));
}