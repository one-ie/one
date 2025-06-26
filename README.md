# 🚀 ONE Web - Astro AI Chat & Book Generation Platform

> A modern Astro application with AI-powered chat interface and professional book generation capabilities.

ONE Web is a cutting-edge Astro application that combines AI chat capabilities with professional EPUB book generation. Built with modern web technologies, it provides a seamless experience for creating interactive AI-powered content and generating professional publications.

## 🌟 What Makes ONE Web Special

### 🤖 **AI-Powered Chat Interface**
- Multiple AI provider support (OpenAI, Claude, OpenRouter)
- Configurable chat panels with flexible layouts
- Real-time streaming responses
- Context-aware conversations

### 📚 **Professional Book Generation**
- Markdown-to-EPUB conversion using Pandoc
- Comprehensive metadata management
- Custom styling and layouts
- Automated table of contents

### ⚡ **Modern Tech Stack**
- **Astro**: Lightning-fast static site generation with SSR
- **React + TypeScript**: Interactive components with type safety
- **Shadcn/UI**: Beautiful, accessible UI components
- **Tailwind CSS**: Utility-first styling
- **AI SDK**: Multi-provider AI integration
- **Pandoc**: Professional document generation

## ⚡ Quick Start

### Prerequisites

- Node.js 20 or higher
- pnpm package manager (`npm install -g pnpm`)
- Pandoc (for book generation): `brew install pandoc` (macOS) or `sudo apt-get install pandoc` (Ubuntu)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/one-ie/one.git
   cd one/web
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys to `.env`:
   ```env
   # AI Services
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_claude_key
   OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:4321` to see your application.

## 🗂️ Project Structure

```
src/
├── components/           # UI Components
│   ├── ui/              # Shadcn/UI components
│   ├── chat/            # AI chat components
│   └── course/          # Course-related components
├── content/             # Content Collections
│   ├── book/            # Book content and metadata
│   ├── docs/            # Documentation pages
│   └── lessons/         # Lesson content
├── layouts/             # Page layouts
├── pages/               # Routes and API endpoints
│   └── api/             # AI chat API endpoints
├── lib/                 # Utility functions
├── styles/              # Global styles
└── types/               # TypeScript definitions
```

## 🤖 AI Chat Features

### Adding AI Chat to Pages

Add an AI chat interface to any Astro page:

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';

const chatConfig = ChatConfigSchema.parse({
  provider: "openai",
  model: "gpt-4o-mini",
  systemPrompt: [{
    type: "text",
    text: "You are a helpful assistant specialized in this topic."
  }],
  welcome: {
    message: "👋 How can I help you today?",
    avatar: "/icon.svg",
    suggestions: [
      {
        label: "Get Started",
        prompt: "How do I get started?"
      }
    ]
  }
});
---

<Layout 
  title="AI Chat Page"
  chatConfig={chatConfig}
  rightPanelMode="quarter"
>
  <main>
    <h1>Your Content Here</h1>
    <!-- The chat will appear in the right panel -->
  </main>
</Layout>
```

### Chat Panel Modes

- `quarter`: 25% width side panel
- `half`: 50% width side panel  
- `full`: Full screen chat
- `floating`: Floating chat window
- `icon`: Minimized chat button

### Supported AI Providers

- **OpenAI**: GPT-4, GPT-3.5, and other models
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **OpenRouter**: Access to 100+ models from multiple providers

## 📚 Book Generation

### Book Structure

```
src/content/book/
├── metadata.yaml         # Book metadata
├── chapters/            # Markdown chapters
│   ├── 01-introduction.md
│   ├── 02-getting-started.md
│   └── ...
├── assets/              # Images and resources
│   └── cover.png
└── epub-style.css       # Custom EPUB styling
```

### Book Metadata

Define comprehensive book metadata in `metadata.yaml`:

```yaml
---
title: 'Your Book Title'
description: 'Comprehensive guide to...'
author: "Your Name"
publisher: 'Your Publisher'
date: '2024-06-26'
status: 'published'

identifier:
  scheme: 'ISBN-13'
  text: '978-1-234-56789-0'

subject: 'Technology, Programming'
language: 'en-US'
coverImage: 'assets/cover.png'
css: 'epub-style.css'

'@type': 'Book'
'@context': 'https://schema.org'
bookFormat: 'EBook'
---
```

### Generate EPUB

```bash
# Generate EPUB book
pnpm run generate:epub

# Generate PDF (requires additional setup)
pnpm run generate:pdf
```

### Custom Styling

Style your EPUB with CSS:

```css
/* src/content/book/epub-style.css */
body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 1.5em;
}

h1, h2, h3 {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
    color: #000;
    margin-top: 2em;
    margin-bottom: 0.5em;
}
```

## 🎨 UI Components

All Shadcn/UI components are pre-configured:

```astro
---
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
---

<Card>
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    <Button client:load>Interactive Button</Button>
  </CardContent>
</Card>
```

### Available Components

- ✅ Accordion
- ✅ Alert Dialog  
- ✅ Avatar
- ✅ Badge
- ✅ Button
- ✅ Card
- ✅ Dialog
- ✅ Form components
- ✅ Navigation
- ✅ Layout components
- ... and more!

## 🚀 Development

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm astro check

# Generate EPUB book
pnpm generate:epub

# Run tests
pnpm test
```

### Environment Variables

```env
# AI Services (Required for chat features)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
OPENROUTER_API_KEY=your_openrouter_key

# Optional: Custom API endpoints
OPENAI_BASE_URL=https://api.openai.com/v1
ANTHROPIC_BASE_URL=https://api.anthropic.com

# Development
NODE_ENV=development
```

## 🛠️ API Endpoints

### Chat API

The application includes API endpoints for AI chat:

- `/api/openai` - OpenAI chat endpoint
- `/api/anthropic` - Claude chat endpoint  
- `/api/openrouter` - OpenRouter multi-model endpoint

### Usage

```javascript
// Client-side chat integration
const response = await fetch('/api/openai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    model: 'gpt-4o-mini',
    stream: true
  })
});
```

## 🔧 Configuration

### Astro Configuration

The project uses Astro with Node.js adapter for server-side rendering:

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [react(), mdx()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});
```

### TypeScript Support

Full TypeScript support with strict configuration:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📋 Content Management

### Content Collections

Astro Content Collections for type-safe content:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const book = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.date(),
    chapter: z.number().optional(),
    // ... more fields
  })
});

export const collections = { book };
```

### Markdown Features

- GitHub Flavored Markdown
- Syntax highlighting with Shiki
- Math expressions with KaTeX
- MDX component support

## 🚀 Deployment

### Cloudflare Pages

Optimized for Cloudflare Pages deployment:

1. **Connect your repository** to Cloudflare Pages
2. **Build settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `20`

3. **Environment variables**: Add your API keys in Cloudflare Pages settings

### Other Platforms

The app also supports:
- Vercel
- Netlify  
- Any Node.js hosting platform

## 🔍 Troubleshooting

### Common Issues

1. **TypeScript errors**: Run `pnpm astro check` to identify issues
2. **Component hydration**: Ensure interactive components use `client:load`
3. **Build failures**: Check Node.js version (requires 20+)
4. **API issues**: Verify environment variables are set correctly

### Performance Tips

- Use `client:load` only for interactive components
- Optimize images with Astro's built-in image optimization
- Leverage Astro's partial hydration for better performance

## 📚 Documentation

- [Astro Documentation](https://docs.astro.build)
- [Shadcn/UI Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [Pandoc Manual](https://pandoc.org/MANUAL.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**ONE Web** - Modern Astro application with AI chat and professional book generation capabilities.

Built with ⚡ Astro, 🤖 AI SDK, 📚 Pandoc, and 🎨 Shadcn/UI