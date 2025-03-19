---
title: Frequently Asked Questions
description: Comprehensive FAQ for developing with ONE framework
date: 2024-02-02
section: Development
order: 5
---

# FAQ

Comprehensive answers to common questions about developing with ONE.

## Getting Started

### Q: What are the system requirements?
**A:** You need:
- Node.js 18 or higher
- pnpm package manager
- OpenAI API key (or other supported providers)
- Git for version control
- Basic knowledge of Astro and React

### Q: How do I get started quickly?
**A:** Use these commands:
```bash
# Clone repository
git clone https://github.com/one-ie/one.git

# Install dependencies
cd one
pnpm install

# Start development
pnpm dev
```

### Q: How do I configure my AI provider?
**A:** Create a `.env` file:
```env
OPENAI_API_KEY=your_key_here
OPENAI_ORG_ID=optional_org_id
ANTHROPIC_API_KEY=your_key_here
MISTRAL_API_KEY=your_key_here
```

## AI Features

### Q: Which AI providers are supported?
**A:** ONE supports multiple providers:
```typescript
const providers = {
  openai: {
    models: ['gpt-4o-mini', 'gpt-4'],
    features: ['streaming', 'functions']
  },
  anthropic: {
    models: ['claude-2', 'claude-instant'],
    features: ['streaming']
  },
  mistral: {
    models: ['mistral-large'],
    features: ['streaming']
  }
};
```

### Q: How do I optimize AI responses?
**A:** Configure these parameters:
```typescript
const chatConfig = {
  // Response Quality
  temperature: 0.7,    // 0.1-1.0: lower = more focused
  maxTokens: 2000,     // Adjust for response length
  topP: 0.9,          // Nucleus sampling
  
  // Performance
  streaming: true,     // Enable streaming
  cache: true,        // Enable caching
  
  // Context
  systemPrompt: "Be concise and clear",
  contextWindow: 4000  // Maximum context size
};
```

### Q: How do I handle streaming responses?
**A:** Use the streaming configuration:
```typescript
const config = {
  streaming: {
    enabled: true,
    chunkSize: 100,
    maxDuration: 30,
    retryOnError: true,
    onProgress: (chunk) => {
      // Handle chunks
    }
  }
};
```

## Chat Integration

### Q: How do I add chat to any page?
**A:** Use the Layout component:
```astro
---
import Layout from "../layouts/Layout.astro";

const chatConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
  systemPrompt: [{
    type: "text",
    text: "You are a helpful assistant."
  }],
  welcome: {
    message: "👋 How can I help?",
    suggestions: [
      { label: "🚀 Start", prompt: "Help me get started" }
    ]
  }
};
---

<Layout
  title="Your Page"
  chatConfig={chatConfig}
  rightPanelMode="quarter"
>
  <main>Your content here</main>
</Layout>
```

### Q: What chat panel modes are available?
**A:** Several modes for different use cases:
```typescript
type PanelMode = 
  | "quarter"   // 25% width (default)
  | "half"      // 50% width
  | "full"      // Full screen
  | "floating"  // Detached window
  | "icon"      // Minimized button
  | "hidden";   // No chat interface
```

### Q: How do I customize the chat interface?
**A:** Use the theme system:
```typescript
const chatTheme = {
  // Colors
  colors: {
    primary: "blue",
    accent: "indigo",
    background: "zinc"
  },
  
  // Layout
  layout: {
    spacing: "comfortable",
    width: "default",
    radius: "medium"
  },
  
  // Typography
  font: {
    family: "inter",
    size: "base",
    weight: "normal"
  }
};
```

## Content Management

### Q: How do I structure content collections?
**A:** Organize in `src/content`:
```
src/content/
├── docs/          # Documentation
├── blog/          # Blog posts
├── courses/       # Course content
└── prompts/       # AI prompts
```

### Q: How do I add AI to markdown content?
**A:** Use frontmatter configuration:
```markdown
---
title: Your Page
layout: ../layouts/Chat.astro
aiConfig:
  systemPrompt: "You are an expert on this topic"
  suggestions:
    - label: "Overview"
      prompt: "Give me an overview"
---

Your content here...
```
### Q: How do I implement caching?
**A:** Configure caching strategy:
```typescript
const cacheConfig = {
  enabled: true,
  duration: 3600,
  strategy: "stale-while-revalidate",
  revalidate: true
};
```
## Troubleshooting

### Q: How do I debug AI responses?
**A:** Use debug mode:
```typescript
const debugConfig = {
  debug: true,
  logging: {
    level: "verbose",
    requests: true,
    responses: true,
    timing: true
  }
};
```

### Q: How do I handle errors?
**A:** Implement error handling:
```typescript
try {
  const response = await ai.chat({
    messages: messages,
    onError: (error) => {
      if (error.type === "rate_limit") {
        // Handle rate limiting
      } else if (error.type === "context_length") {
        // Handle context overflow
      }
    }
  });
} catch (error) {
  // Fallback handling
}
```
### Q: How do I contribute?
**A:** Follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit pull request
5. Follow contribution guidelines