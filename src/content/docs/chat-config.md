---
title: Chat Configuration
description: Comprehensive guide to configuring the ONE chat system
date: 2024-02-02
section: Core Features
order: 2
---

# Chat Configuration Guide

ONE's chat system provides a flexible configuration system that allows you to customize the behavior, appearance, and capabilities of your AI assistants. This guide explains all available configuration options and how to use them effectively.

## Configuration Schema

The chat configuration is defined using Zod for type safety and validation. The schema is located in `src/schema/chat.ts` and provides a comprehensive set of options for customizing your chat experience.

## Basic Configuration

Here's a simple example of a chat configuration:

```typescript
const chatConfig = {
  provider: "mistral",
  model: "mistral-large-latest",
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: "You are a helpful assistant.",
  welcome: {
    message: "👋 How can I help you today?",
    avatar: "/icon.svg",
    suggestions: [
      "What can you help me with?",
      "Tell me about ONE framework"
    ]
  }
};
```

## Configuration Options

### AI Provider Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `provider` | string | `"mistral"` | AI provider to use (mistral, openai, anthropic) |
| `model` | string | `"mistral-large-latest"` | Specific model to use |
| `apiKey` | string | - | Optional API key (defaults to environment variable) |
| `apiEndpoint` | string | Provider default | Custom API endpoint URL |
| `runtime` | string | `"edge"` | Runtime environment (edge, node) |
| `temperature` | number | `0.7` | Response randomness (0-1) |
| `maxTokens` | number | `2000` | Maximum response length |

### System Prompt

The system prompt defines your AI assistant's personality, knowledge, and behavior. It can be specified in several formats:

#### String Format
```typescript
systemPrompt: "You are a helpful assistant specialized in web development."
```

#### Array Format
```typescript
systemPrompt: [
  {
    type: "text",
    text: "You are a helpful assistant specialized in web development."
  },
  {
    type: "text",
    text: "You provide clear, concise code examples when appropriate."
  }
]
```

### Welcome Configuration

The welcome configuration controls the initial appearance and behavior of the chat interface:

```typescript
welcome: {
  message: "👋 Hello! I'm your AI assistant.",
  avatar: "/path/to/avatar.png",
  suggestions: [
    "What can you help me with?",
    "Tell me about your features",
    {
      label: "Show me an example",
      prompt: "Can you show me an example of how to use this framework?"
    }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `message` | string | Initial message from the assistant |
| `avatar` | string | URL to the assistant's avatar image |
| `suggestions` | array | Quick suggestion buttons (strings or objects with label/prompt) |

### Initial Messages

You can pre-populate the chat with initial messages:

```typescript
initialMessages: [
  {
    id: "welcome",
    role: "assistant",
    content: "Welcome to the chat!"
  },
  {
    id: "user-1",
    role: "user",
    content: "Can you help me with something?"
  }
]
```

## Alternative Property Names

For compatibility with frontmatter in Markdown files, the following alternative property names are supported:

| Standard Name | Alternative Name |
|---------------|------------------|
| `provider` | `aiProvider` |
| `model` | `aiModel` |
| `welcome.message` | `welcomeMessage` |
| `welcome.avatar` | `avatar` |
| `welcome.suggestions` | `suggestions` |

## Helper Functions

### createDefaultConfig

Creates a default configuration with optional overrides:

```typescript
import { createDefaultConfig } from "@/schema/chat";

const config = createDefaultConfig({
  provider: "openai",
  temperature: 0.8
});
```

### normalizeConfig

Normalizes configuration by mapping alternative property names to standard ones:

```typescript
import { normalizeConfig } from "@/schema/chat";

// From frontmatter
const config = normalizeConfig({
  aiProvider: "openai",
  aiModel: "gpt-4o-mini",
  welcomeMessage: "Hello!",
  avatar: "/icon.svg"
});
```

## Usage in Astro Pages

### In Frontmatter

```astro
---
layout: ../layouts/Layout.astro
title: "My Page"
description: "Page with chat"
chatConfig:
  provider: mistral
  model: mistral-large-latest
  temperature: 0.7
  systemPrompt: "You are a helpful assistant."
  welcome:
    message: "👋 How can I help you?"
    avatar: "/icon.svg"
    suggestions:
      - "What can you do?"
      - "Tell me more"
---

<h1>My Page with Chat</h1>
<p>Content goes here...</p>
```

### In Markdown Files

```markdown
---
title: My Document
aiProvider: mistral
aiModel: mistral-large-latest
temperature: 0.7
systemPrompt: You are a helpful assistant.
welcomeMessage: 👋 How can I help you?
avatar: /icon.svg
suggestions:
  - What can you do?
  - Tell me more
---

# My Document

Content goes here...
```

### In Components

```astro
---
import Layout from "../layouts/Layout.astro";
import { Chat } from "@/components/Chat";
import { normalizeConfig } from "@/schema/chat";

const chatConfig = normalizeConfig({
  provider: "mistral",
  model: "mistral-large-latest",
  systemPrompt: "You are a helpful assistant.",
  welcome: {
    message: "👋 How can I help you?",
    avatar: "/icon.svg",
    suggestions: [
      "What can you do?",
      "Tell me more"
    ]
  }
});
---

<Layout title="Chat Example">
  <div class="h-[600px]">
    <Chat client:load chatConfig={chatConfig} />
  </div>
</Layout>
```

## Advanced Configuration

### Custom API Endpoints

```typescript
const chatConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
  apiEndpoint: "https://your-custom-endpoint.com/v1",
  // Other options...
};
```

### Multiple System Prompts

```typescript
const chatConfig = {
  // Other options...
  systemPrompt: [
    {
      type: "text",
      text: "You are a helpful assistant specialized in web development."
    },
    {
      type: "text",
      text: "You provide clear, concise code examples when appropriate."
    },
    {
      type: "text",
      text: "You follow best practices and modern standards."
    }
  ]
};
```

### Rich Suggestions

```typescript
const chatConfig = {
  // Other options...
  welcome: {
    message: "👋 How can I help you today?",
    avatar: "/icon.svg",
    suggestions: [
      {
        label: "💻 Web Development",
        prompt: "Can you help me with web development using React and TypeScript?"
      },
      {
        label: "🚀 Performance Tips",
        prompt: "What are some tips for improving website performance?"
      },
      {
        label: "🔒 Security Best Practices",
        prompt: "What are the best security practices for web applications?"
      }
    ]
  }
};
```

## Best Practices

1. **Be Specific in System Prompts**: Clearly define your assistant's role, expertise, and limitations.

2. **Use Appropriate Temperature**: Lower values (0.1-0.4) for factual responses, higher values (0.7-0.9) for creative content.

3. **Provide Helpful Suggestions**: Offer 3-5 relevant suggestions to guide users.

4. **Set Reasonable Token Limits**: Balance between comprehensive responses and performance.

5. **Choose the Right Model**: Select models based on your specific needs (capabilities vs. cost).

6. **Test Different Configurations**: Experiment to find the optimal settings for your use case.

7. **Use Normalized Configuration**: Always use `normalizeConfig()` when working with frontmatter data.

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure the appropriate environment variable is set for your chosen provider.

2. **Model Not Available**: Verify that the model name is correct and available for your provider.

3. **Configuration Not Applied**: Make sure you're using `normalizeConfig()` for frontmatter data.

4. **Suggestions Not Showing**: Check that your welcome message is properly configured.

5. **System Prompt Ignored**: Ensure your system prompt is properly formatted.

For more help, check the [API Documentation](/docs/api) or [contact support](/contact). 