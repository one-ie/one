---
title: Markdown with AI
description: How to create AI-powered markdown pages
date: 2024-02-02
section: Tutorials
order: 4
---

# Creating AI-Powered Markdown Pages

ONE framework makes it easy to create AI-powered markdown pages where the AI assistant has access to the content of the page. This guide explains how to set up markdown files with AI chat capabilities.

## Basic Setup

To create an AI-powered markdown page, you need to:

1. Create a markdown file with frontmatter configuration
2. Use the `Text.astro` layout
3. Write your content in markdown format

Here's a simple example:

```markdown
---
layout: ../layouts/Text.astro
title: My AI-Powered Page
description: A page with AI chat capabilities
aiProvider: mistral
aiModel: mistral-large-latest
systemPrompt: You are a helpful assistant that explains the content of this page.
welcomeMessage: 👋 Hello! I can help explain the content on this page.
avatar: /icon.svg
suggestions:
  - Explain this page
  - What are the key points?
  - How can I implement this?
---

# My Content

This is the content of my page. The AI assistant will have access to this content
and can answer questions about it.

## Key Points

- Point 1
- Point 2
- Point 3
```

## How It Works

When you create a markdown page with the `Text.astro` layout:

1. The frontmatter is extracted and normalized into a valid chat configuration
2. The content of the markdown file is extracted
3. Both are passed to the Chat component
4. The content is sent to the LLM as context, allowing the AI to reference the information

This creates a seamless experience where the AI can answer questions about the content of the page.

## Configuration Options

### Core AI Settings

| Property | Description | Example |
|----------|-------------|---------|
| `aiProvider` | AI provider to use | `mistral`, `openai`, `anthropic` |
| `aiModel` | Specific model to use | `mistral-large-latest`, `gpt-4o-mini` |
| `temperature` | Response randomness (0-1) | `0.7` |
| `maxTokens` | Maximum response length | `2000` |

### System Prompt

The system prompt defines your AI assistant's personality and behavior:

```yaml
systemPrompt: You are a helpful assistant that explains the content of this page.
```

### Welcome Message and Suggestions

Configure the initial appearance and behavior:

```yaml
welcomeMessage: 👋 Hello! I can help explain the content on this page.
avatar: /icon.svg
suggestions:
  - Explain this page
  - What are the key points?
  - How can I implement this?
```

### Content Settings

Control how the content is used:

```yaml
includeContent: true  # Whether to include the content in the prompt
contentPrefix: "### Reference Content:"  # Prefix for the content in the prompt
```

## Advanced Usage

### Rich Suggestions

You can use rich suggestions with different labels and prompts:

```yaml
suggestions:
  - label: "📚 Explain Concepts"
    prompt: "Can you explain the key concepts on this page?"
  - label: "🔍 Implementation Details"
    prompt: "How do I implement this in my project?"
  - label: "🚀 Best Practices"
    prompt: "What are the best practices for this approach?"
```

### Metadata

Add metadata for SEO and organization:

```yaml
title: My AI-Powered Page
description: A page with AI chat capabilities
keywords:
  - ai
  - markdown
  - tutorial
categories:
  - Tutorials
  - Getting Started
```

## Implementation Examples

### Documentation Page

```markdown
---
layout: ../layouts/Text.astro
title: API Documentation
description: Comprehensive API documentation
aiProvider: mistral
aiModel: mistral-large-latest
systemPrompt: You are a technical documentation assistant. You help users understand the API described on this page.
welcomeMessage: 👋 Need help with our API? I can explain endpoints, parameters, and provide examples.
suggestions:
  - How do I authenticate?
  - Explain the endpoints
  - Show me an example request
---

# API Documentation

## Authentication

To authenticate with the API, you need to...
```

### Tutorial Page

```markdown
---
layout: ../layouts/Text.astro
title: Getting Started Tutorial
description: Learn how to get started with our framework
aiProvider: openai
aiModel: gpt-4o-mini
temperature: 0.4
systemPrompt: You are a helpful tutorial guide. You help users understand the tutorial on this page and answer their questions about implementation details.
welcomeMessage: 👋 I'm here to help you with this tutorial. What would you like to know?
suggestions:
  - label: "🚀 Prerequisites"
    prompt: "What are the prerequisites for this tutorial?"
  - label: "⚙️ Installation"
    prompt: "Can you explain the installation process?"
  - label: "📝 Step-by-Step"
    prompt: "Walk me through the steps in this tutorial"
---

# Getting Started

This tutorial will guide you through setting up our framework...
```

## Best Practices

1. **Be Specific in System Prompts**: Clearly define your assistant's role and how it should interact with the content.

2. **Provide Helpful Suggestions**: Offer 3-5 relevant suggestions to guide users in interacting with the content.

3. **Structure Content Clearly**: Use clear headings, lists, and code blocks to make it easier for the AI to reference specific parts.

4. **Include Examples**: Provide examples in your content that the AI can reference when answering questions.

5. **Test Different Configurations**: Experiment with different temperature settings and models to find the optimal balance for your content.

6. **Consider Content Length**: Very long content may be truncated. Focus on the most important information.

7. **Update Regularly**: Keep your content up-to-date to ensure the AI provides accurate information.

## Troubleshooting

### Common Issues

1. **AI Doesn't Reference Content**: Ensure `includeContent` is set to `true` and check that your content is not too long.

2. **Incorrect Responses**: Try lowering the temperature for more factual responses.

3. **Suggestions Not Working**: Make sure your suggestions are properly formatted in the frontmatter.

4. **Layout Issues**: Verify that you're using the correct layout path in your frontmatter.

5. **Content Not Rendering**: Check for syntax errors in your markdown.

