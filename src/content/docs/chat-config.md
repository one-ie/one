---
title: Chat Configuration
description: Comprehensive guide to configuring the ONE chat system
date: 2024-02-02
section: Core Features
order: 2
---

# Chat Configuration Guide

ONE's chat system provides a flexible configuration system for creating powerful AI interactions. This guide covers all configuration options, from basic setup to advanced features.

## Quick Start

Basic chat configuration example:

```typescript
const chatConfig = ChatConfigSchema.parse({
  // Core AI Settings
  provider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,

  // AI Behavior
  systemPrompt: [{
    type: "text",
    text: "You are a helpful assistant."
  }],

  // User Interface
  welcome: {
    message: "👋 How can I help you today?",
    avatar: "/icon.svg",
    suggestions: [
      {
        label: "🚀 Quick Start",
        prompt: "Help me get started"
      }
    ]
  }
});
```

## Configuration Schema

The chat system uses Zod for type-safe configuration:

```typescript
const ChatConfigSchema = z.object({
  // Provider Settings
  provider: z.string().default("openai"),
  model: z.string(),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(2000),
  
  // Runtime Options
  runtime: z.enum(["edge", "node"]).default("edge"),
  includeContent: z.boolean().default(true),
  
  // Prompts and Context
  systemPrompt: z.union([
    z.string(),
    z.array(z.object({
      type: z.literal("text"),
      text: z.string()
    }))
  ]),
  
  // UI Configuration
  welcome: z.object({
    message: z.string(),
    avatar: z.string().optional(),
    suggestions: z.array(
      z.union([
        z.string(),
        z.object({
          label: z.string(),
          prompt: z.string()
        })
      ])
    ).optional()
  }).optional()
});
```

## Core Configuration Options

### Provider Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `provider` | string | `"openai"` | AI provider (openai, mistral, anthropic) |
| `model` | string | - | Model identifier |
| `temperature` | number | `0.7` | Response creativity (0-1) |
| `maxTokens` | number | `2000` | Maximum response length |
| `apiEndpoint` | string | Provider default | Custom API endpoint |
| `runtime` | "edge" \| "node" | `"edge"` | Runtime environment |

### System Prompts

Multiple formats supported:

```typescript
// Simple string
systemPrompt: "You are a helpful assistant."

// Detailed array format
systemPrompt: [
  {
    type: "text",
    text: "You are an AI assistant specialized in web development."
  },
  {
    type: "text",
    text: "You excel at explaining complex concepts simply."
  }
]
```

### Welcome Configuration

Customize the initial chat experience:

```typescript
welcome: {
  message: "👋 Hello! I'm your AI assistant.",
  avatar: "/path/to/avatar.png",
  suggestions: [
    // Simple string suggestions
    "What can you help me with?",
    
    // Rich suggestions with labels
    {
      label: "💡 Features",
      prompt: "What are your main features?"
    },
    {
      label: "🚀 Quick Start",
      prompt: "Show me how to get started"
    }
  ]
}
```

## Advanced Features

### Edge Runtime Optimization

Enable edge runtime for faster responses:

```typescript
const chatConfig = {
  runtime: "edge",
  streaming: true,
  maxDuration: 60, // seconds
  regions: ["all"],
  // Other options...
};
```

### Context-Aware Responses

Provide page content for contextual awareness:

```typescript
const chatConfig = {
  // Other options...
  addSystemPrompt: true,
  addBusinessPrompt: true,
  includeContent: true,
  contextData: pageContent,
};
```

### Message Streaming

Configure streaming behavior:

```typescript
const chatConfig = {
  streaming: {
    enabled: true,
    chunkSize: 100,
    maxDuration: 30,
    retryOnError: true
  },
  // Other options...
};
```

## Integration Examples

### In Astro Pages

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';

const chatConfig = ChatConfigSchema.parse({
  provider: "openai",
  model: "gpt-4o-mini",
  systemPrompt: [{
    type: "text",
    text: "You are a helpful assistant."
  }],
  welcome: {
    message: "👋 How can I help you?",
    suggestions: [
      {
        label: "🚀 Quick Start",
        prompt: "Help me get started"
      }
    ]
  }
});
---

<Layout 
  title="Chat Example"
  chatConfig={chatConfig}
  rightPanelMode="quarter"
>
  <main>
    <h1>Welcome to the Chat</h1>
  </main>
</Layout>
```

### In Markdown Files

```markdown
---
title: Documentation
layout: ../layouts/Layout.astro
chatConfig:
  provider: openai
  model: gpt-4o-mini
  temperature: 0.7
  systemPrompt:
    - type: text
      text: You are a documentation expert.
  welcome:
    message: 👋 Need help with the docs?
    suggestions:
      - label: 📖 Overview
        prompt: Give me an overview
---

# Documentation

Your content here...
```

## Best Practices

1. **System Prompt Design**
   - Be specific about assistant's role
   - Define clear boundaries
   - Include relevant context
   - Use multiple prompts for complex behavior

2. **Temperature Selection**
   - `0.1-0.4`: Factual, consistent responses
   - `0.5-0.7`: Balanced creativity
   - `0.8-1.0`: More creative, varied responses

3. **Performance Optimization**
   - Use edge runtime for faster responses
   - Enable streaming for better UX
   - Set appropriate token limits
   - Optimize context length

4. **User Experience**
   - Provide helpful welcome message
   - Include relevant suggestions
   - Use clear, descriptive labels
   - Add appropriate icons/emojis

## Troubleshooting

### Common Issues

1. **Configuration Validation**
   ```typescript
   // Always use schema validation
   const config = ChatConfigSchema.parse(userConfig);
   ```

2. **API Connection**
   - Verify API keys in environment
   - Check endpoint configuration
   - Monitor rate limits
   - Handle network errors

3. **Streaming Issues**
   - Verify edge runtime support
   - Check browser compatibility
   - Monitor connection stability
   - Handle disconnections

4. **Context Problems**
   - Validate content format
   - Check token limits
   - Monitor memory usage
   - Handle large documents

### Error Handling

```typescript
try {
  const config = ChatConfigSchema.parse(userConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Configuration validation failed:", error.issues);
  }
}
```
