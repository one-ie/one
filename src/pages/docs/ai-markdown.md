---
layout: ../../layouts/Text.astro
title: "AI-Powered Markdown Pages"
description: "Create interactive documentation with AI assistance"
aiProvider: "openai"
aiModel: "gpt-4o-mini"
temperature: 0.7
maxTokens: 4000
systemPrompt: "You are a helpful documentation assistant for the ONE framework. Your role is to help users understand how to create AI-powered markdown pages. You provide clear, accurate information about the configuration options, best practices, and implementation details."
welcomeMessage: "👋 Hello! I can help you understand how to create AI-powered markdown pages with ONE. What would you like to know?"
avatar: "/icon.svg"
suggestions:
  - label: "🔧 Configuration Options"
    prompt: "What configuration options are available for AI-powered markdown pages?"
  - label: "📝 Example Setup"
    prompt: "Can you show me a complete example of an AI-powered markdown page?"
  - label: "🚀 Best Practices"
    prompt: "What are the best practices for creating effective AI-powered documentation?"
  - label: "🔍 Troubleshooting"
    prompt: "What are common issues when setting up AI-powered markdown pages and how do I fix them?"
contentPrefix: "### Documentation Content:"
---

# AI-Powered Markdown Pages

ONE framework allows you to create interactive documentation with built-in AI assistance. This powerful feature enables your markdown pages to have contextual AI that can answer questions about the content.

## How It Works

When you create a markdown page with the `Text.astro` layout and proper configuration, the ONE framework:

1. Extracts the content from your markdown file
2. Sends this content to the AI as context
3. Configures the AI with your specified parameters
4. Renders a side-by-side view of your content and an AI chat interface

This creates a powerful interactive experience where users can read your documentation and ask questions about it, with the AI having full knowledge of the page content.

## Getting Started

### 1. Create a Markdown File

Create a new `.md` file in your `pages` directory:

```md
---
layout: ../../layouts/Text.astro
title: "Your Page Title"
description: "Your page description"
aiProvider: "openai"
aiModel: "gpt-4o-mini"
systemPrompt: "Define your AI assistant's role here"
welcomeMessage: "Your welcome message"
avatar: "/path/to/icon.svg"
---

# Your Content Here

This is the content that will be sent to the AI as context.
```

### 2. Configure the AI

In the frontmatter section of your markdown file, you can configure the AI with these parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `aiProvider` | AI provider to use (openai, mistral, anthropic) | mistral |
| `aiModel` | Specific model to use | mistral-medium |
| `temperature` | Controls randomness (0-1) | 0.7 |
| `maxTokens` | Maximum response length | 2000 |
| `systemPrompt` | Instructions for the AI | "You are a helpful assistant..." |
| `welcomeMessage` | Initial message from the AI | "How can I help you?" |
| `avatar` | URL for the AI's avatar | "/icon.svg" |
| `suggestions` | Quick suggestion buttons | [] |
| `includeContent` | Whether to include page content as context | true |
| `contentPrefix` | Text that precedes the content in the prompt | "### Reference Content:" |

### 3. Write Your Content

The main content of your markdown file will be:
- Rendered as the main content of the page
- Sent to the AI as context for answering questions

Use standard markdown syntax for your content:

```md
# Main Heading

## Subheading

- List item 1
- List item 2

1. Numbered item 1
2. Numbered item 2

> Blockquote

[Link text](https://example.com)

![Alt text](image-url.jpg)

```code
function example() {
  return "Hello World";
}
```
```

## Advanced Configuration

### System Prompt

The system prompt defines your AI assistant's role and behavior. You can provide it as a string:

```yaml
systemPrompt: "You are an expert in web development focused on helping users understand the ONE framework."
```

### Suggestions

Suggestions appear as clickable buttons in the welcome message. Configure them as an array:

```yaml
suggestions:
  - label: "🔧 Configuration"
    prompt: "What configuration options are available?"
  - label: "📝 Examples"
    prompt: "Can you show me some examples?"
```

### Content Control

You can control how the page content is sent to the AI:

```yaml
includeContent: true  # Set to false to exclude content
contentPrefix: "### Documentation Content:"  # Custom prefix before content
```

## Best Practices

### 1. Clear AI Role Definition

Define a specific role for your AI in the system prompt:

```yaml
systemPrompt: "You are a documentation expert for the ONE framework, specializing in explaining how to use the chat system. You provide clear, concise explanations with practical examples."
```

### 2. Structured Content

Organize your content with clear headings and sections to help the AI understand the structure:

```md
## Key Concept

Explanation of the concept.

### Subcomponent

Details about the subcomponent.
```

### 3. Relevant Suggestions

Create suggestion buttons that anticipate common questions:

```yaml
suggestions:
  - label: "🚀 Getting Started"
    prompt: "How do I get started with this feature?"
  - label: "🔧 Configuration"
    prompt: "What configuration options are available?"
  - label: "📝 Examples"
    prompt: "Can you show me some examples?"
  - label: "❓ Troubleshooting"
    prompt: "What are common issues and how do I fix them?"
```

### 4. Comprehensive Content

Include all relevant information in your markdown content:

- Conceptual explanations
- Step-by-step instructions
- Code examples
- Configuration options
- Common issues and solutions

## Complete Example

Here's a complete example of an AI-powered markdown page:

```md
---
layout: ../../layouts/Text.astro
title: "Authentication System"
description: "Learn how to implement authentication in ONE"
aiProvider: "openai"
aiModel: "gpt-4o-mini"
temperature: 0.7
maxTokens: 4000
systemPrompt: "You are an authentication expert for the ONE framework. Your role is to help users understand how to implement and configure authentication in their applications. You provide clear, accurate information about authentication methods, configuration options, and best practices."
welcomeMessage: "👋 Hello! I can help you understand how to implement authentication in your ONE application. What would you like to know?"
avatar: "/icon.svg"
suggestions:
  - label: "🔐 Auth Methods"
    prompt: "What authentication methods are supported in ONE?"
  - label: "🔧 Configuration"
    prompt: "How do I configure authentication in my app?"
  - label: "📝 Example Setup"
    prompt: "Can you show me a complete example of setting up authentication?"
  - label: "🔍 Troubleshooting"
    prompt: "What are common authentication issues and how do I fix them?"
contentPrefix: "### Authentication Documentation:"
---

# Authentication System

The ONE framework provides a flexible authentication system that supports multiple providers and strategies.

## Supported Methods

- Email/Password
- OAuth (Google, GitHub, etc.)
- Magic Links
- Two-Factor Authentication

## Basic Setup

To set up authentication, first install the required packages:

```bash
pnpm add @auth/core @auth/astro
```

Then configure your authentication providers in `src/lib/auth.ts`:

```typescript
import { defineConfig } from '@auth/core';
import GitHub from '@auth/core/providers/github';

export const authConfig = defineConfig({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
});
```

## Advanced Configuration

For more advanced use cases, you can customize the session handling, callbacks, and more:

```typescript
export const authConfig = defineConfig({
  // Provider configuration
  providers: [...],
  
  // Custom pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  // Callbacks
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```
```

## Troubleshooting

### Common Issues

#### AI Not Answering About Content

If the AI doesn't seem to know about your content:

1. Check that `includeContent` is set to `true` in your frontmatter
2. Verify that your content is properly formatted markdown
3. Make sure your system prompt doesn't restrict the AI from discussing the content

#### Layout Issues

If the layout doesn't look right:

1. Make sure you're using `layout: ../../layouts/Text.astro` (adjust path as needed)
2. Check that your markdown is properly formatted
3. Verify that the Text.astro layout exists in your project

#### AI Configuration Issues

If the AI isn't behaving as expected:

1. Check your `systemPrompt` for conflicting instructions
2. Verify that you're using a supported `aiProvider` and `aiModel`
3. Adjust the `temperature` setting (lower for more consistent responses)

## Next Steps

Now that you understand how to create AI-powered markdown pages, you can:

1. Convert your existing documentation to use this feature
2. Create interactive tutorials with AI assistance
3. Build knowledge bases with contextual AI support
4. Develop guided learning experiences for complex topics

For more information, check out these resources:

- [Chat System Documentation](/docs/chat-system)
- [Markdown Guide](/docs/markdown)
- [AI Configuration](/docs/ai-config) 