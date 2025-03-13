---
layout: ../layouts/Text.astro
title: Content Demo
description: Demonstrating content-aware chat
aiProvider: mistral
aiModel: mistral-large-latest
includeContent: true
contentPrefix: "Here is the relevant documentation:"
addSystemPrompt: true
addBusinessPrompt: true
systemPrompt: "You are an expert at explaining documentation. When asked questions, refer to the provided documentation to give accurate answers. If information isn't in the docs, say so clearly."
suggestions:
  - "What does this page explain?"
  - "How does the content system work?"
  - "What are the configuration options?"
---

# Content-Aware Chat Demo

This is a demonstration of how the chat system can include page content in its context.

## How It Works

1. The page content (this text) gets included in the system prompt
2. The AI can reference this content when answering questions
3. This provides context-aware responses
4. The chat becomes specific to this page's content

## Configuration

You can control content inclusion using frontmatter:

```yaml
includeContent: true/false    # Enable/disable content
contentPrefix: "string"       # Custom prefix
contentMaxLength: number      # Limit content length
```

This makes the chat system more powerful by allowing it to understand and reference the specific content of each page.