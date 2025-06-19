# 🚀 ONE - Build Your AI-Powered Brand

> Create valuable conversations that grow exponentially. Build AI brands that thrive on authentic relationships.

ONE is a revolutionary platform that transforms how people build and grow AI-powered businesses. Instead of traditional "join our platform" approaches, ONE enables you to **create valuable content** and **build genuine relationships** that drive exponential growth.

## 🌟 What Makes ONE Different

### 🎯 **Viral Conversations, Not Platform Invitations**
Create valuable content (strategies, frameworks, playbooks) and our AI agents help you share it with the right people. Each conversation creates more value, driving authentic viral growth.

### 🤖 **Your Personal AI Team**
Six specialized AI agents work together to amplify your expertise:
- **Marketing Agent** - Content creation, campaign strategy, brand building
- **Sales Agent** - Lead qualification, outreach automation, deal closing
- **Service Agent** - Customer support, satisfaction tracking, issue resolution
- **Design Agent** - UI/UX creation, visual branding, content design
- **Legal Agent** - Contract review, compliance checking, documentation
- **Engineering Agent** - Technical implementation, automation, integrations

### 💼 **Multiple Business Models**
- **Expert Networks** - Build high-value mastermind communities
- **Educational Empires** - Create and sell courses with AI delivery
- **Service Marketplaces** - Offer AI-powered services at scale

### 🚀 **Built on Modern Tech**
- ⚡ **Blazing Fast**: Astro + React for optimal performance
- 🎨 **Beautiful UI**: Shadcn/UI + Novu notification components
- 🤝 **300+ Integrations**: Nango for seamless API connections
- 📊 **Real-time Data**: Convex for reactive backends
- 🔐 **Enterprise Ready**: Full TypeScript, testing, security

![ONE Screenshot](https://one.ie/screenshots/screenshot.png)

## ⚡ Quick Start

This guide will help you set up and start building AI-powered applications with ONE. ONE combines Astro, React, and modern AI capabilities to create intelligent web applications.

## 📈 How It Works

### 1. **Create Something Valuable**
Document your expertise - a growth strategy, technical framework, or business playbook that showcases your unique knowledge.

### 2. **AI Analyzes & Amplifies**
Our AI agents analyze your content for value, identify ideal collaborators, and craft personalized invitations that focus on mutual benefit.

### 3. **Start Valuable Conversations**
Share with 3-5 carefully selected people who would genuinely benefit. Each person gets value and naturally wants to share their own expertise.

### 4. **Exponential Growth**
Each conversation spawns more valuable connections. Your network grows authentically through real value exchange, not empty invitations.

### 5. **Monetize Your Expertise**
As your community grows, monetize through courses, consulting, masterminds, or AI-powered services - all managed by your AI team.

## Prerequisites

Before you begin, ensure you have:
- Node.js 20 or higher installed
- pnpm package manager (`npm install -g pnpm`)
- API keys for AI services (Claude, OpenAI via `.env`)
- Basic knowledge of TypeScript and React

## Quick Start

### 1. Get the Project 🚀

Choose your preferred way to get started with ONE:

<details>
<summary>📦 Option 1: Clone the Repository</summary>

```bash
git clone https://github.com/one-ie/one.git
cd one
```
</details>

<details>
<summary>💾 Option 2: Download ZIP</summary>

1. Download the ZIP file:
   [Download ONE](https://github.com/one-ie/one/archive/refs/heads/main.zip)
2. Extract the contents
3. Navigate to the project directory
</details>

<details>
<summary>🔄 Option 3: Fork the Repository</summary>

1. Visit the [Fork page](https://github.com/one-ie/one/fork)
2. Create your fork
3. Clone your forked repository
</details>

#### ☁️ Quick Start with GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=one-ie/one)

Click the button above to instantly start developing in a cloud environment.

### 2. Install Dependencies

```bash
# Navigate to project directory
cd one

# Install dependencies
pnpm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```env
# AI Services (Required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
OPENROUTER_API_KEY=your_openrouter_key

# Integrations
NANGO_SECRET_KEY=your_nango_secret
NANGO_PUBLIC_KEY=your_nango_public
NOVU_API_KEY=your_novu_key

# Database
CONVEX_DEPLOYMENT=your_convex_deployment
VITE_CONVEX_URL=your_convex_url
```

See [Environment Variables Guide](./Environment%20Variables.md) for complete setup.

### 4. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:4321` to see your application running.

## Project Structure

```
one/
├── src/
│   ├── components/     # UI components
│   ├── layouts/       # Page layouts
│   ├── pages/         # Routes and pages
│   ├── content/       # Markdown content
│   └── styles/        # Global styles
└── public/           # Static assets
```

## Adding AI Chat to a Page

1. Create a new page (e.g., `src/pages/chat.astro`):

```astro
---
import Layout from "../layouts/Layout.astro";
import { ChatConfigSchema } from '../schema/chat';

const chatConfig = ChatConfigSchema.parse({
  systemPrompt: [{
    type: "text",
    text: "You are a helpful assistant."
  }],
  welcome: {
    message: "👋 How can I help you today?",
    avatar: "/icon.svg",
    suggestions: [
      {
        label: "Get Started",
        prompt: "How do I get started with ONE?"
      }
    ]
  }
});
---

<Layout 
  title="Chat Page"
  chatConfig={chatConfig}
  rightPanelMode="quarter"
>
  <main>
    <h1>Welcome to the Chat</h1>
    <!-- Your page content here -->
  </main>
</Layout>
```

## Customizing the Chat Interface

### Chat Configuration Options

```typescript
const chatConfig = {
  provider: "openai",          // AI provider
  model: "gpt-4o-mini",       // Model to use
  apiEndpoint: "https://api.openai.com/v1",
  temperature: 0.7,           // Response creativity (0-1)
  maxTokens: 2000,           // Maximum response length
  systemPrompt: "...",       // AI behavior definition
  welcome: {
    message: "...",          // Welcome message
    avatar: "/path/to/icon.svg",
    suggestions: [...]       // Quick start prompts
  }
};
```

### Panel Modes

The chat interface can be displayed in different modes:
- `quarter`: 25% width side panel
- `half`: 50% width side panel
- `full`: Full screen chat
- `floating`: Floating chat window
- `icon`: Minimized chat button

## Adding Page-Specific Knowledge

Make your AI assistant knowledgeable about specific pages:

```astro
---
const pageContent = "Your page content here";

const chatConfig = ChatConfigSchema.parse({
  systemPrompt: [{
    type: "text",
    text: `You are an expert on ${pageContent}. Help users understand this content.`
  }],
  // ... other config options
});
---
```

## Basic Customization

### 1. Styling

Customize the appearance using Tailwind CSS classes:

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your custom styles here */
```

### 2. Layout

Adjust the layout using the Layout component props:

```astro
<Layout
  title="Your Page"
  description="Page description"
  header={true}        // Show/hide header
  footer={true}        // Show/hide footer
  rightPanelMode="quarter"
>
  <!-- Your content -->
</Layout>
```

### 3. Chat Features

Enable or disable specific chat features:

```typescript
const chatConfig = ChatConfigSchema.parse({
  // ... other options
  features: {
    textToSpeech: true,    // Enable voice synthesis
    codeHighlight: true,   // Enable code syntax highlighting
    markdown: true,        // Enable markdown rendering
    suggestions: true      // Enable quick suggestions
  }
});
```

## 🎨 Pre-installed Components

All Shadcn/UI components are pre-configured for Astro:

```astro
---
// Example usage in .astro file
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
---

<Button>Click me!</Button>
```

### Available Components
- ✅ Accordion
- ✅ Alert Dialog
- ✅ Avatar
- ✅ Badge
- ✅ Button
- ✅ Card
- ✅ Dialog
- ... and more!

## 🛠️ Project Structure

```text
src/
├── components/                # UI Components
│   ├── ui/                   # Shadcn/UI components
│   ├── chat/                 # Chat-related components
│   └── magicui/              # Enhanced UI components
│
├── content/                  # Content Collections
│   ├── blog/                 # Blog posts
│   ├── docs/                 # Documentation
│   └── prompts/              # AI prompts
│
├── hooks/                    # React hooks
│   ├── use-mobile.tsx
│   ├── use-theme.ts
│   └── use-toast.ts
│
├── layouts/                  # Page layouts
│   ├── Blog.astro
│   ├── Docs.astro
│   ├── Layout.astro
│   └── LeftRight.astro
│
├── lib/                      # Utility functions
│   ├── utils.ts
│   └── icons.ts
│
├── pages/                    # Routes and pages
│   ├── api/                  # API endpoints
│   ├── blog/                 # Blog routes
│   ├── docs/                 # Documentation routes
│   └── index.astro          # Homepage
│
├── schema/                   # Data schemas
│   └── chat.ts              # Chat-related schemas
│
├── stores/                   # State management
│   └── layout.ts            # Layout state
│
├── styles/                   # Global styles
│   └── global.css           # Global CSS
│
└── types/                    # TypeScript types
    └── env.d.ts             # Environment types
```

## 🚀 Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Using React Components in Astro**
   ```astro
   ---
   // Always add client:load for interactive components
   import { Dialog } from "@/components/ui/dialog"
   ---
   
   <Dialog client:load>
     <!-- Dialog content -->
   </Dialog>
   ```

3. **Build for Production**
   ```bash
   npm run build
   npm run preview # Test the production build
   ```

## 🔍 Troubleshooting

### Common Issues Solved

✅ **Component Hydration**: All interactive components use `client:load`
✅ **Build Warnings**: Suppressed in configuration
✅ **Path Aliases**: Pre-configured for easy imports
✅ **React Integration**: Properly set up for Shadcn

## 💡 Pro Tips

1. **Component Usage in Astro**
   ```astro
   ---
   // Always import in the frontmatter
   import { Button } from "@/components/ui/button"
   ---
   
   <!-- Use in template -->
   <Button client:load>Click me!</Button>
   ```

2. **Styling with Tailwind**
   ```astro
   <div class="dark:bg-slate-800">
     <Button class="m-4">Styled Button</Button>
   </div>
   ```

3. **Layout Usage**
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   ---
   
   <Layout title="Home">
     <!-- Your content -->
   </Layout>
   ```

## 📚 Quick Links

- [Astro Documentation](https://docs.astro.build)
- [Shadcn/UI Components](https://ui.shadcn.com/docs/components/accordion)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 📚 Key Documentation

### Growth & Strategy
- [Viral Conversations Strategy](./generate/viral-conversations/viral-conversations.md) - How to create exponential growth
- [AI Brand Ecosystem](./generate/viral-conversations/ai-brand-ecosystem.md) - Building your AI-powered brand
- [Technical Implementation](./generate/viral-conversations/implementation.md) - How the viral system works

### Technical Guides
- [Integrations Guide](./generate/integrations/integrations.md) - Nango, Novu, and 300+ APIs
- [CLAUDE.md](./CLAUDE.md) - Complete development guide
- [Environment Setup](./Environment%20Variables.md) - Configuration management

## 🎯 Success Stories

### Sarah's B2B SaaS Growth
Started with a "10x Growth Framework" → Invited 3 founders → Created a mastermind → Now runs a $10k/month expert community with 50+ members.

### Mike's Automation Agency
Shared his "Client Automation Playbook" → Connected with 5 agencies → Built joint ventures → Scaled to $100k/month in 6 months.

### Lisa's Course Empire
Created "Design Systems Course" → AI agents handled delivery → Students became evangelists → $250k in first year with 90% automation.

## 🤝 Need Help?

- Check our [Documentation](./src/content/docs)
- Review [Example Code](./src/pages/api)
- File an [Issue on GitHub](https://github.com/one-ie/one/issues)
- Join our community of AI brand builders

## AI Book Generation with Pandoc

ONE includes powerful book generation capabilities that combine Astro's content collections with Pandoc to create beautifully formatted ebooks. This system allows you to:
- Manage book content through Astro's content collections
- Generate professional EPUB files with proper metadata
- Maintain consistent styling across formats
- Automate the book generation process

### Book Content Structure

```
src/content/book/
├── metadata.yaml      # Book metadata and configuration
├── chapters/          # Book chapters in markdown
├── assets/           # Images and resources
├── epub-style.css    # EPUB-specific styling
└── config.ts         # Book schema configuration
```

### Book Schema Configuration

The book schema is defined in `src/content/config.ts` and includes comprehensive metadata support:

```typescript
// src/content/config.ts
const BookSchema = z.object({
  // Basic Information
  title: z.string(),
  description: z.string(),
  date: z.date().or(z.string()),
  status: z.enum(['draft', 'review', 'published']).default('draft'),
  
  // Author and Publishing
  author: z.string().default("Anthony O'Connell"),
  publisher: z.string().default('ONE Publishing'),
  rights: z.string(),
  creator: z.string(),
  contributor: z.string(),
  
  // Identification
  identifier: z.object({
    scheme: z.string().default('ISBN-13'),
    text: z.string()
  }),
  
  // Classification
  subject: z.string(),
  language: z.string().default('en-US'),
  
  // Visual Elements
  image: z.string().optional(),
  coverImage: z.string().optional(),
  css: z.string().optional(),
  
  // Organization
  chapter: z.number().optional(),
  order: z.number().optional(),
  
  // Schema.org Metadata
  '@type': z.literal('Book').optional(),
  '@context': z.literal('https://schema.org').optional(),
  bookFormat: z.enum(['EBook', 'Paperback', 'Hardcover']).optional(),
  inLanguage: z.string().optional(),
  datePublished: z.string().optional()
});
```

### Metadata Configuration

The `metadata.yaml` file defines the book's metadata and follows the BookSchema:

```yaml
# src/content/book/metadata.yaml
---
# Basic Book Information
title: 'Your Book Title'
description: 'Book description'
date: '2024-05-22'
status: 'published'  # draft, review, or published

# Author and Publishing Information
author: "Author Name"
publisher: 'Publisher Name'
rights: "© 2024 Author Name. All rights reserved."
creator: "Author Name"
contributor: 'Contributor Name'

# Book Identification
identifier:
  scheme: 'ISBN-13'
  text: '978-1-916-12345-6'

# Content Classification
subject: 'Subject Categories'
language: 'en-US'

# Visual Elements
image: 'assets/cover.png'
coverImage: 'assets/cover.png'
css: 'epub-style.css'

# Organization
chapter: 0
order: 0

# Schema.org Metadata
'@type': 'Book'
'@context': 'https://schema.org'
bookFormat: 'EBook'
inLanguage: 'en-US'
datePublished: '2024-05-22'
---
```

### EPUB Generation

1. **Install Pandoc**
   ```bash
   # macOS
   brew install pandoc
   
   # Ubuntu/Debian
   sudo apt-get install pandoc
   ```

2. **Generate EPUB**
   ```bash
   # Using the generate-epub.sh script
   npm run generate:epub
   
   # Manual generation
   pandoc \
     --resource-path=assets \
     --toc \
     --toc-depth=2 \
     --split-level=1 \
     --css=epub-style.css \
     --epub-cover-image=assets/cover.png \
     -o TheElevatePlaybook.epub \
     metadata.yaml \
     chapters/*.md
   ```

### EPUB Styling

```css
/* src/content/book/epub-style.css */
body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
    line-height: 1.5;
    color: #333;
    margin: 0;
    padding: 1em;
}

h1, h2, h3, h4, h5, h6 {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
    color: #000;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.2;
}

/* Add more custom styles as needed */
```

### Features

- ✅ Content management through Astro collections
- ✅ Automatic table of contents generation
- ✅ Custom styling with CSS
- ✅ Cover image support
- ✅ Proper metadata handling
- ✅ Chapter organization
- ✅ Resource management
- ✅ Multiple output formats

### Best Practices

1. **Content Organization**
   - Use clear chapter naming conventions
   - Maintain consistent formatting
   - Keep images in the assets directory
   - Use relative paths for resources

2. **Metadata Management**
   - Define comprehensive book metadata
   - Include all required fields
   - Use proper identifiers (ISBN, etc.)
   - Maintain copyright information

3. **Styling**
   - Use system fonts for best compatibility
   - Define consistent typography
   - Ensure proper spacing
   - Test on multiple devices

4. **Build Process**
   - Automate EPUB generation
   - Implement version control
   - Add build scripts to package.json
   - Include validation steps

For more details and advanced features, check out the [book generation documentation](/docs/book-generation).

## 🚀 Join the Revolution

Stop building platforms that beg for users. Start creating valuable conversations that grow exponentially.

**ONE** - Where AI meets authentic human connection to create thriving businesses.

---

Built with 🚀 by [ONE](https://one.ie) | Powered by Claude 4, Astro, Shadcn/UI, Convex, Nango & Novu
