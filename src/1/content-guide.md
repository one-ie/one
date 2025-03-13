# Content-Aware Chat System Guide

## Overview

The content-aware chat system allows the AI to understand and reference page-specific content while maintaining its general knowledge capabilities. This creates a more contextual and accurate chat experience.

## Implementation Approaches

### 1. Basic Content Inclusion

```yaml
---
layout: ../layouts/Text.astro
title: Simple Page
includeContent: true
systemPrompt: "Reference the content when answering questions."
---

Your page content here...
```

### 2. Documentation Assistant

```yaml
---
layout: ../layouts/Text.astro
title: API Documentation
includeContent: true
contentPrefix: "### API Documentation:"
systemPrompt: "You are a technical documentation expert. Explain concepts from the documentation clearly and accurately."
suggestions:
  - "What are the key endpoints?"
  - "How do I authenticate?"
  - "Show me example usage"
---

API documentation content...
```

### 3. Learning Assistant

```yaml
---
layout: ../layouts/Text.astro
title: Tutorial
includeContent: true
contentPrefix: "### Tutorial Content:"
systemPrompt: "You are a patient teacher. Help users understand concepts from the tutorial. Provide examples and explanations based on the tutorial content."
suggestions:
  - "Explain this concept"
  - "Show me an example"
  - "What's next?"
---

Tutorial content...
```

## Content Processing

The system automatically:
1. Strips frontmatter
2. Cleans formatting
3. Truncates if needed
4. Adds to system prompt

## Best Practices

### Content Structure
- Use clear headings
- Keep sections focused
- Include important details
- Use consistent formatting

### Configuration
- Set appropriate content length limits
- Customize prefix for content type
- Craft specific system prompts
- Add relevant suggestions

### System Prompt Design
- Tell AI to reference content
- Define its role clearly
- Specify how to handle missing info
- Include citation instructions

## Common Patterns

1. **Documentation Helper**
   ```yaml
   systemPrompt: "Explain documentation concepts. Always cite sections."
   ```

2. **Tutorial Guide**
   ```yaml
   systemPrompt: "Walk through concepts step by step using tutorial content."
   ```

3. **Content Summarizer**
   ```yaml
   systemPrompt: "Summarize and explain key points from the content."
   ```

## Advanced Usage

### Combining Knowledge Sources

```yaml
addSystemPrompt: true      # Include core knowledge
addBusinessPrompt: true    # Include business context
includeContent: true       # Include page content
```

### Content Processing Control

```yaml
contentMaxLength: 2000     # Limit content length
contentPrefix: "custom:"   # Custom prefix
```

### Response Styling

```yaml
systemPrompt: |
  When answering:
  1. Quote relevant sections
  2. Provide examples
  3. Link related concepts
```

## Benefits

1. **Accuracy**
   - Responses based on actual content
   - Verifiable references
   - Clear source attribution

2. **Flexibility**
   - Works with any content type
   - Customizable per page
   - Adaptable to different uses

3. **User Experience**
   - Contextual responses
   - Relevant suggestions
   - Immediate access to content

4. **Maintenance**
   - Content updates automatically reflected
   - No manual syncing needed
   - Easy to modify behavior