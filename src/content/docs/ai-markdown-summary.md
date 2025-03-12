---
title: AI Markdown Implementation
description: Summary of the AI-powered markdown implementation
date: 2024-02-02
section: Core Features
order: 3
---

# AI Markdown Implementation Summary

We've implemented a comprehensive system for creating AI-powered markdown pages where the AI assistant has access to the content of the page. This document summarizes the key components and how they work together.

## Key Components

### 1. Schema (`schema/chat.ts`)

The schema defines the structure and validation for chat configuration:

- Added support for content-related properties (`includeContent`, `contentPrefix`)
- Enhanced metadata support (`title`, `description`, `keywords`, `categories`)
- Improved suggestion handling with label/prompt pairs
- Added helper functions for configuration normalization

### 2. Chat Component (`components/Chat.tsx`)

The Chat component has been updated to:

- Accept content as a prop
- Pass content to the API
- Handle rich suggestions with label/prompt pairs
- Process system prompts in various formats

### 3. API Endpoint (`pages/api/chatsimple.ts`)

The API endpoint now:

- Accepts content from markdown files
- Adds content to the system prompt
- Handles various configuration formats
- Processes messages for different AI providers

### 4. Text Layout (`layouts/Text.astro`)

A new layout for markdown files that:

- Extracts frontmatter and content
- Normalizes configuration
- Passes both to the Chat component
- Provides a side-by-side view of content and chat

### 5. Example Pages

- `ai.md`: Updated with rich suggestions and content settings
- `ai-page.astro`: Demonstrates how to use markdown with AI chat
- Documentation pages explaining the implementation

## How It Works

1. **Configuration in Frontmatter**: Authors define AI behavior in markdown frontmatter
2. **Content Extraction**: The layout extracts both frontmatter and content
3. **Configuration Normalization**: Frontmatter is converted to a valid chat configuration
4. **Content Passing**: Content is passed to the Chat component and API
5. **AI Context**: The AI uses the content as context for answering questions

## Usage Examples

### Basic Markdown File

```markdown
---
layout: ../layouts/Text.astro
title: My Page
aiProvider: mistral
systemPrompt: You explain this page.
welcomeMessage: Hello! I can help with this page.
suggestions:
  - Explain this page
---

# Content

Page content here...
```

### Advanced Configuration

```markdown
---
layout: ../layouts/Text.astro
title: Advanced Page
aiProvider: openai
aiModel: gpt-4o-mini
temperature: 0.4
systemPrompt: You are an expert on this topic.
welcomeMessage: How can I help you understand this content?
suggestions:
  - label: "Key Concepts"
    prompt: "Explain the key concepts"
includeContent: true
contentPrefix: "### Reference Material:"
---

# Advanced Content

Detailed content here...
```

## Benefits

1. **Seamless Integration**: AI assistants that understand page content
2. **Easy Configuration**: Simple frontmatter configuration
3. **Flexible Layout**: Side-by-side view of content and chat
4. **Rich Suggestions**: Guide users with relevant prompts
5. **Type Safety**: Zod schema ensures valid configuration

## Next Steps

1. **Content Collections**: Integrate with Astro content collections
2. **Performance Optimization**: Improve handling of large content
3. **Enhanced Layouts**: Create more layout options for different use cases
4. **Content Chunking**: Implement strategies for handling very long content
5. **Analytics**: Add tracking for AI interactions

This implementation provides a powerful foundation for creating AI-powered content throughout the ONE framework. 