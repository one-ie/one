---
title: Your First AI Agent
description: Create and deploy your first intelligent AI agent with ONE
date: 2024-02-02
section: Introduction
order: 2
---

# Creating Your First AI Agent

Build a powerful, context-aware AI agent in minutes. This guide walks you through creating a custom assistant that can understand your content, help users, and integrate seamlessly with your application.

## Prerequisites

- Completed the [installation guide](/docs/getting-started/installation)
- Basic understanding of Astro and React
- OpenAI API key (or other supported provider)
- Node.js 18+

## Quick Start

Create a new file `src/pages/my-agent.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';

const chatConfig = ChatConfigSchema.parse({
  // Core AI Settings
  provider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,
  
  // Agent Definition
  systemPrompt: [{
    type: "text",
    text: "You are an AI assistant specialized in helping users with this application."
  }],
  
  // User Interface
  welcome: {
    message: "👋 Hello! I'm here to help you get the most out of our application.",
    avatar: "/icon.svg",
    suggestions: [
      {
        label: "🚀 Quick Start",
        prompt: "Show me how to get started"
      },
      {
        label: "💡 Features",
        prompt: "What can this application do?"
      }
    ]
  },
  
  // Advanced Features
  runtime: "edge",
  streaming: true,
  includeContent: true
});
---

<Layout
  title="AI Assistant"
  chatConfig={chatConfig}
  rightPanelMode="quarter"
>
  <main class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">
      Welcome to My Application
    </h1>
    <p class="text-lg text-muted-foreground">
      Our AI assistant is ready to help you. Try asking about features, 
      getting started, or any questions you have.
    </p>
  </main>
</Layout>
```

## Advanced Configuration

### 1. Agent Personality

Define a detailed personality and capabilities:

```typescript
const agentConfig = {
  systemPrompt: [
    // Core Role
    {
      type: "text",
      text: `You are an expert AI assistant specialized in [domain].
      Your personality traits:
      - Professional yet friendly
      - Clear and concise
      - Patient and helpful
      - Detail-oriented`
    },
    
    // Knowledge Areas
    {
      type: "text",
      text: `Your expertise covers:
      1. [Primary Area]
      2. [Secondary Area]
      3. [Additional Skills]`
    },
    
    // Interaction Guidelines
    {
      type: "text",
      text: `When helping users:
      - Ask clarifying questions when needed
      - Provide step-by-step guidance
      - Include relevant code examples
      - Reference documentation when appropriate`
    }
  ]
};
```

### 2. Context Integration

Make your agent aware of application content:

```typescript
const agentConfig = {
  // Enable content processing
  includeContent: true,
  addSystemPrompt: true,
  addBusinessPrompt: true,
  
  // Content sources
  contentSources: [
    {
      type: "markdown",
      path: "src/content/docs/"
    },
    {
      type: "data",
      content: applicationFeatures
    }
  ],
  
  // Content processing
  contentProcessing: {
    extractHeaders: true,
    includeCode: true,
    maxDepth: 3
  }
};
```

### 3. Streaming and Performance

Optimize response delivery:

```typescript
const agentConfig = {
  // Edge Runtime
  runtime: "edge",
  
  // Streaming Configuration
  streaming: {
    enabled: true,
    chunkSize: 100,
    maxDuration: 30
  },
  
  // Performance Settings
  cache: {
    enabled: true,
    duration: 3600,
    revalidate: true
  },
  
  // Error Handling
  error: {
    retry: true,
    maxAttempts: 3,
    fallbackMessage: "I apologize, but I'm having trouble. Please try again."
  }
};
```

## Real-World Examples

### 1. Documentation Assistant

```typescript
const docsAgent = {
  systemPrompt: [{
    type: "text",
    text: `You are a documentation expert who helps users understand our software.
    
    Key Responsibilities:
    1. Explain concepts clearly
    2. Provide code examples
    3. Guide through implementations
    4. Suggest best practices
    
    When providing code:
    - Use TypeScript
    - Include comments
    - Follow our style guide
    - Show practical examples`
  }],
  
  welcome: {
    message: "👋 I'm here to help you with our documentation. What would you like to know?",
    suggestions: [
      {
        label: "📚 Quick Start",
        prompt: "Show me how to get started with the basics"
      },
      {
        label: "🔍 Find Topics",
        prompt: "Help me find specific documentation topics"
      }
    ]
  }
};
```

### 2. Support Agent

```typescript
const supportAgent = {
  systemPrompt: [{
    type: "text",
    text: `You are a technical support specialist who helps users resolve issues.
    
    Support Process:
    1. Understand the problem
    2. Gather relevant information
    3. Provide step-by-step solutions
    4. Verify resolution
    
    Guidelines:
    - Be patient and empathetic
    - Ask clarifying questions
    - Provide clear instructions
    - Escalate when necessary`
  }],
  
  welcome: {
    message: "👋 I'm your support assistant. How can I help you today?",
    suggestions: [
      {
        label: "🔧 Troubleshoot",
        prompt: "I need help solving a problem"
      },
      {
        label: "📋 Common Issues",
        prompt: "Show me common issues and solutions"
      }
    ]
  }
};
```

## Best Practices

### 1. Agent Design

- **Clear Purpose**: Define specific roles and responsibilities
- **Personality**: Create a consistent, appropriate tone
- **Knowledge Scope**: Set clear boundaries of expertise
- **Interaction Style**: Design natural, helpful dialogues

### 2. Content Integration

- **Relevant Context**: Include only necessary information
- **Structured Data**: Organize content logically
- **Updated Knowledge**: Keep information current
- **Examples**: Provide practical use cases

### 3. User Experience

- **Welcome Message**: Set clear expectations
- **Helpful Suggestions**: Guide users effectively
- **Response Format**: Maintain consistency
- **Error Handling**: Graceful fallbacks

### 4. Performance

- **Edge Runtime**: Use for faster responses
- **Streaming**: Enable for better UX
- **Caching**: Implement when appropriate
- **Monitoring**: Track usage and errors

## Troubleshooting

### Common Issues

1. **Response Quality**
   ```typescript
   // Improve response quality
   const config = {
     temperature: 0.7,    // Adjust for creativity vs precision
     maxTokens: 2000,     // Ensure sufficient length
     topP: 0.9           // Control response diversity
   };
   ```

2. **Performance Issues**
   ```typescript
   // Optimize performance
   const config = {
     runtime: "edge",     // Use edge runtime
     streaming: true,     // Enable streaming
     cache: {            // Configure caching
       enabled: true,
       duration: 3600
     }
   };
   ```

3. **Context Problems**
   ```typescript
   // Fix context issues
   const config = {
     includeContent: true,
     contentProcessing: {
       maxLength: 4000,    // Limit context size
       priority: "recent", // Prioritize recent content
       filter: "relevant"  // Filter by relevance
     }
   };
   ```
