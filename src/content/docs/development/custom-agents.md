---
title: Creating Custom AI Agents
description: Learn to build specialized AI agents with custom capabilities
date: 2024-02-02
section: Tutorials
order: 1
---

# Creating Custom AI Agents

Learn how to create specialized AI agents with custom capabilities, system prompts, and advanced features. This tutorial will show you how to build agents for specific use cases.

## Use Cases

We'll create three different types of agents:
1. Documentation Assistant
2. Product Support Agent
3. Content Generation Agent

## Documentation Assistant

### Step 1: Basic Setup

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';

// Get documentation content
const docs = await Astro.glob('../content/docs/**/*.md');
const docsContent = docs.map(doc => ({
  title: doc.frontmatter.title,
  content: doc.rawContent(),
  url: doc.url
}));

const chatConfig = ChatConfigSchema.parse({
  systemPrompt: [{
    type: "text",
    text: `You are a documentation expert for our platform.
    Your knowledge base includes:
    ${docsContent.map(doc => `
      # ${doc.title}
      ${doc.content}
    `).join('\n')}
    
    Guidelines:
    1. Reference specific documentation pages when answering
    2. Provide code examples when relevant
    3. Suggest related documentation
    4. Guide users through complex topics step by step`
  }],
  welcome: {
    message: "👋 I can help you find and understand our documentation. What would you like to know?",
    avatar: "/docs-icon.svg",
    suggestions: [
      {
        label: "Getting Started",
        prompt: "What's the best way to get started?"
      },
      {
        label: "Find Topic",
        prompt: "Can you help me find documentation about..."
      }
    ]
  }
});
---

<Layout
  title="Documentation Assistant"
  chatConfig={chatConfig}
  rightPanelMode="quarter"
>
  <main class="prose max-w-4xl mx-auto p-8">
    <h1>Documentation Assistant</h1>
    <p>Ask me anything about our documentation!</p>
  </main>
</Layout>
```

## Product Support Agent

### Step 1: Define Knowledge Base

```typescript
// src/data/product-knowledge.ts
export const productKnowledge = {
  features: [
    {
      name: "Feature A",
      description: "Detailed description...",
      usage: "How to use...",
      troubleshooting: ["Issue 1...", "Issue 2..."]
    }
  ],
  faq: [
    {
      q: "Common question?",
      a: "Detailed answer..."
    }
  ],
  procedures: [
    {
      title: "How to...",
      steps: ["Step 1...", "Step 2..."]
    }
  ]
};
```

### Step 2: Create Support Agent

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';
import { productKnowledge } from '../data/product-knowledge';

const chatConfig = ChatConfigSchema.parse({
  systemPrompt: [{
    type: "text",
    text: `You are a product support specialist.
    
    Product Knowledge:
    ${JSON.stringify(productKnowledge, null, 2)}
    
    Your responsibilities:
    1. Help users with product features
    2. Troubleshoot common issues
    3. Guide users through procedures
    4. Provide accurate product information
    
    Guidelines:
    - Always verify understanding before providing solutions
    - Break down complex procedures into steps
    - Offer alternative solutions when available
    - Escalate complex issues appropriately`
  }],
  welcome: {
    message: "Hello! I'm here to help with any product questions or issues.",
    avatar: "/support-icon.svg",
    suggestions: [
      {
        label: "Features",
        prompt: "What features are available?"
      },
      {
        label: "Help",
        prompt: "I need help with..."
      }
    ]
  }
});
---

<Layout
  title="Product Support"
  chatConfig={chatConfig}
  rightPanelMode="floating"
>
  <!-- Your product interface here -->
</Layout>
```

## Content Generation Agent

### Step 1: Define Content Types

```typescript
// src/types/content.ts
export interface ContentTemplate {
  type: 'blog' | 'social' | 'email';
  structure: string[];
  tone: 'professional' | 'casual' | 'technical';
  length: 'short' | 'medium' | 'long';
}

export const contentTemplates: Record<string, ContentTemplate> = {
  blogPost: {
    type: 'blog',
    structure: ['Title', 'Introduction', 'Key Points', 'Conclusion'],
    tone: 'professional',
    length: 'long'
  },
  tweetThread: {
    type: 'social',
    structure: ['Hook', 'Key Points', 'Call to Action'],
    tone: 'casual',
    length: 'short'
  }
};
```

### Step 2: Create Content Agent

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';
import { contentTemplates } from '../types/content';

const chatConfig = ChatConfigSchema.parse({
  systemPrompt: [{
    type: "text",
    text: `You are a content generation expert.
    
    Available Templates:
    ${JSON.stringify(contentTemplates, null, 2)}
    
    Your capabilities:
    1. Generate content following templates
    2. Adapt tone and style as needed
    3. Optimize for different platforms
    4. Maintain brand voice
    
    Guidelines:
    - Follow SEO best practices
    - Maintain consistent tone
    - Include relevant keywords
    - Adapt length appropriately`
  }],
  welcome: {
    message: "Ready to help you create engaging content! What would you like to create?",
    avatar: "/content-icon.svg",
    suggestions: [
      {
        label: "Blog Post",
        prompt: "Help me write a blog post about..."
      },
      {
        label: "Tweet Thread",
        prompt: "Create a tweet thread about..."
      }
    ]
  },
  features: {
    markdown: true,
    codeHighlight: true
  }
});
---

<Layout
  title="Content Generator"
  chatConfig={chatConfig}
  rightPanelMode="half"
>
  <!-- Content generation interface -->
</Layout>
```

## Best Practices

1. **System Prompt Design**
   - Be specific about the agent's role
   - Include relevant knowledge
   - Define clear boundaries
   - Specify output formats

2. **Knowledge Organization**
   - Structure data clearly
   - Update content regularly
   - Include examples
   - Maintain consistency

3. **User Experience**
   - Provide relevant suggestions
   - Include helpful examples
   - Offer clear instructions
   - Handle errors gracefully

## Advanced Features

### 1. Context Awareness

```typescript
// Add page context to your agent
const pageContext = {
  currentPage: Astro.url.pathname,
  userPreferences: getUserPreferences(),
  recentInteractions: getRecentHistory()
};

const contextAwareConfig = {
  ...chatConfig,
  contextData: JSON.stringify(pageContext)
};
```

### 2. Multi-step Tasks

```typescript
// Define task workflows
const workflows = {
  contentCreation: [
    { step: 'gather_requirements', prompt: 'What type of content do you need?' },
    { step: 'generate_outline', prompt: 'Here\'s the proposed outline:' },
    { step: 'create_content', prompt: 'Generating content based on outline...' },
    { step: 'review', prompt: 'Please review the generated content:' }
  ]
};
```

