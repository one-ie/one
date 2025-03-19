---
title: Chat System
description: Comprehensive guide to ONE's AI-powered chat system
date: 2024-02-02
section: Core Features
order: 1
---

# Chat System Architecture

ONE's chat system combines Astro's performance, React's interactivity, and advanced AI capabilities to deliver a powerful, flexible chat interface. This guide covers the complete architecture and implementation details.

## Core Components

### 1. Chat Component

The main chat interface (`src/components/Chat.tsx`):

```typescript
interface ChatProps {
  chatConfig?: ChatConfig;
  content?: string;
  className?: string;
}

export function Chat({ chatConfig, content, className }: ChatProps) {
  // Component implementation
  const { messages, input, handleSubmit } = useChat({
    api: chatConfig?.api || "/api/chat",
    body: {
      config: chatConfig,
      content: content
    }
  });
  
  // Render chat interface
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
}
```

### 2. Layout System

Flexible display modes for different use cases:

```typescript
type PanelMode = "quarter" | "half" | "full" | "floating" | "icon" | "hidden";

interface LayoutProps {
  title: string;
  description?: string;
  rightPanelMode?: PanelMode;
  chatConfig?: ChatConfig;
  content?: string;
}
```

#### Panel Modes
- **quarter**: 25% width side panel (default)
- **half**: 50% width side panel
- **full**: Full screen interface
- **floating**: Detached window
- **icon**: Minimized button
- **hidden**: No chat interface

### 3. State Management

Advanced state handling using the AI SDK:

```typescript
const {
  // Core State
  messages,
  input,
  status,
  
  // Actions
  handleInputChange,
  handleSubmit,
  stop,
  setInput,
  
  // Metadata
  error,
  isLoading
} = useChat({
  api: "/api/chat",
  body: {
    config: chatConfig,
    content: pageContent
  },
  onResponse: (response) => {
    // Handle streaming responses
  },
  onFinish: (message) => {
    // Process completed messages
  }
});
```

## Advanced Features

### 1. Streaming Architecture

Optimized response streaming:

```typescript
interface StreamConfig {
  // Core Settings
  enabled: boolean;
  runtime: "edge" | "node";
  
  // Performance
  chunkSize: number;
  maxDuration: number;
  
  // Error Handling
  retryOnError: boolean;
  maxRetries: number;
  
  // Caching
  cache: {
    enabled: boolean;
    duration: number;
    revalidate: boolean;
  }
}

const streamConfig: StreamConfig = {
  enabled: true,
  runtime: "edge",
  chunkSize: 100,
  maxDuration: 30,
  retryOnError: true,
  maxRetries: 3,
  cache: {
    enabled: true,
    duration: 3600,
    revalidate: true
  }
};
```

### 2. Message Processing

Rich message handling capabilities:

```typescript
interface MessageHandler {
  // Content Processing
  markdown: boolean;
  codeHighlight: boolean;
  mathRendering: boolean;
  
  // Interactive Features
  editing: boolean;
  resubmission: boolean;
  voting: boolean;
  
  // Media Support
  images: boolean;
  audio: boolean;
  video: boolean;
}

const messageConfig: MessageHandler = {
  markdown: true,
  codeHighlight: true,
  mathRendering: true,
  editing: true,
  resubmission: true,
  voting: true,
  images: true,
  audio: true,
  video: true
};
```

### 3. Context Management

Intelligent context handling:

```typescript
interface ContextManager {
  // Content Processing
  includeContent: boolean;
  maxContextLength: number;
  
  // Memory Management
  shortTermMemory: number;
  longTermMemory: boolean;
  
  // Context Sources
  sources: {
    markdown: boolean;
    pageContent: boolean;
    userHistory: boolean;
    externalData: boolean;
  }
}

const contextConfig: ContextManager = {
  includeContent: true,
  maxContextLength: 4000,
  shortTermMemory: 10,
  longTermMemory: true,
  sources: {
    markdown: true,
    pageContent: true,
    userHistory: true,
    externalData: true
  }
};
```

## Implementation Examples

### 1. Basic Chat Page

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
  <main>Your content here</main>
</Layout>
```

### 2. Advanced Implementation

```typescript
const advancedChat = {
  // Core Configuration
  provider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,
  
  // Runtime Settings
  runtime: "edge",
  streaming: {
    enabled: true,
    chunkSize: 100
  },
  
  // Context Management
  context: {
    includeContent: true,
    maxLength: 4000,
    sources: ["markdown", "page"]
  },
  
  // UI Features
  features: {
    markdown: true,
    codeHighlight: true,
    mathRendering: true,
    suggestions: true
  },
  
  // Error Handling
  error: {
    retry: true,
    maxAttempts: 3,
    fallback: "Sorry, I'm having trouble..."
  }
};
```

## Performance Optimization

### 1. Edge Runtime

```typescript
// Enable edge runtime
const config = {
  runtime: "edge",
  streaming: true,
  regions: ["all"]
};
```

### 2. Caching Strategy

```typescript
// Implement caching
const cacheConfig = {
  cache: {
    enabled: true,
    duration: 3600,
    revalidate: true,
    strategy: "stale-while-revalidate"
  }
};
```

### 3. Context Optimization

```typescript
// Optimize context handling
const contextConfig = {
  maxLength: 4000,
  priority: "recent",
  compression: true,
  cleanup: true
};
```

## Troubleshooting

### Common Issues

1. **Streaming Issues**
   ```typescript
   // Check streaming status
   const { status } = useChat({
     onError: (error) => {
       console.error("Streaming error:", error);
     }
   });
   ```

2. **Context Problems**
   ```typescript
   // Monitor context size
   const contextSize = await measureContextSize(content);
   if (contextSize > maxSize) {
     content = await optimizeContext(content);
   }
   ```

3. **Performance Issues**
   ```typescript
   // Enable performance monitoring
   const config = {
     monitoring: {
       enabled: true,
       metrics: ["latency", "tokens", "cache"],
       logging: true
     }
   };
   ```
