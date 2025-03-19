---
title: Getting Started with ONE
description: Learn how to set up and start building with the ONE framework
date: 2024-02-02
section: Introduction
order: 1
---

# Getting Started with ONE

ONE is a toolkit for building AI-powered applications, combining Astro's performance, React's interactivity, and advanced AI capabilities. This guide will help you get up and running quickly.

## Quick Start

### 1. Get the Project

Choose your preferred method to get started:

```bash
# Option 1: Clone the repository
git clone https://github.com/one-ie/one.git

# Option 2: Download the ZIP file
# Visit: https://github.com/one-ie/one/archive/refs/heads/main.zip

# Option 3: Open in GitHub Codespaces
# Visit: https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=one-ie/one
```

### 2. Install Dependencies

ONE uses pnpm for package management:

```bash
# Navigate to project directory
cd one

# Install dependencies
pnpm install
```

### 3. Configure Environment

Create a `.env` file in your project root:

```env
# Required: OpenAI API key for AI features
OPENAI_API_KEY=your_api_key_here

# Optional: Override default AI settings
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
```

### 4. Start Development

```bash
pnpm dev
```

Visit `http://localhost:4321` to see your application.

## Project Structure

```
one/
├── src/
│   ├── components/          # UI Components
│   │   ├── ui/             # Shadcn/UI components
│   │   ├── chat/           # Chat components
│   │   └── magicui/        # Enhanced UI components
│   │
│   ├── content/            # Content Collections
│   │   ├── blog/          # Blog posts
│   │   ├── docs/          # Documentation
│   │   └── prompts/       # AI prompts
│   │
│   ├── layouts/            # Page layouts
│   ├── lib/               # Utility functions
│   ├── pages/             # Routes and pages
│   ├── schema/            # Data schemas
│   └── styles/            # Global styles
│
└── public/                # Static assets
```

## Adding AI Chat to a Page

### Basic Integration

Create a new page with AI chat capabilities:

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';

const chatConfig = ChatConfigSchema.parse({
  // AI Configuration
  provider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,

  // System Instructions
  systemPrompt: [{
    type: "text",
    text: "You are a helpful AI assistant specialized in this topic."
  }],

  // User Interface
  welcome: {
    message: "👋 How can I help you today?",
    avatar: "/icon.svg",
    suggestions: [
      {
        label: "🚀 Quick Start",
        prompt: "Show me how to get started"
      }
    ]
  }
});
---

<Layout 
  title="Your Page"
  chatConfig={chatConfig}
  rightPanelMode="quarter"
>
  <main>
    <h1>Your Content</h1>
    <!-- Page content here -->
  </main>
</Layout>
```

### Chat Panel Modes

Choose from multiple display modes:

- `quarter`: 25% width side panel (default)
- `half`: 50% width side panel
- `full`: Full screen chat interface
- `floating`: Detached floating window
- `icon`: Minimized chat button
- `hidden`: No chat interface

```astro
<Layout
  rightPanelMode="quarter" // or "half", "full", "floating", "icon"
>
  <!-- Content -->
</Layout>
```

## Advanced Features

### 1. Context-Aware AI

Make your AI assistant knowledgeable about page content:

```typescript
const chatConfig = ChatConfigSchema.parse({
  systemPrompt: [{
    type: "text",
    text: `You are an expert on this topic. The content below provides context for your responses:

    ${pageContent}`
  }],
  addSystemPrompt: true,
  addBusinessPrompt: true
});
```

### 2. Interactive Features

Enable advanced chat capabilities:

```typescript
const chatConfig = {
  // Streaming responses
  runtime: "edge",
  
  // Message features
  features: {
    textToSpeech: true,    // Voice synthesis
    codeHighlight: true,   // Code syntax highlighting
    markdown: true,        // Rich text formatting
    suggestions: true      // Quick action buttons
  }
};
```

### 3. Custom Styling

Customize appearance using Tailwind CSS and Shadcn UI:

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Theme customization */
:root {
  --primary: 210 100% 50%;
  --secondary: 220 100% 60%;
}
```

## Troubleshooting

### Common Issues

1. **API Configuration**
   - Verify OPENAI_API_KEY in .env
   - Check API endpoint configuration
   - Monitor rate limits and quotas

2. **Build Problems**
   - Run `pnpm clean && pnpm install`
   - Update Node.js to v18+
   - Clear browser cache

3. **Chat Issues**
   - Check browser console for errors
   - Verify network connectivity
   - Monitor streaming response status

## Getting Help

Need assistance? Try these resources:

- [GitHub Issues](https://github.com/one-ie/one/issues)
- Email: support@one.ie

For additional guidance, check our [FAQ](/docs/faq) and [Troubleshooting Guide](/docs/troubleshooting/common-issues).