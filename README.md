# ONE - Bring Your Ideas to Life

## English → Code → Reality

**ONE transforms ideas into living, AI-powered businesses through plain English commands.**

Built with love by humans and AI working together, ONE was made for founders, engineers, creators and educators.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://stack.one.ie)
[![License](https://img.shields.io/badge/License-ONE-green)](https://one.ie/free-license)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare-orange)](https://pages.cloudflare.com/)

---

## ✨ How It Works

### Write in English

Simple commands anyone can understand. "CREATE sales agent", "CALL OpenAI", "RECORD interaction".

### System Validates

Validates against ontology: entity types, connections, services. Instant feedback on errors.

### Code Generated

Production TypeScript with Effect.ts, Convex, React, tests. Type-safe and ready to deploy.

### Deploy to Edge

Cloudflare's global network. Unlimited requests, zero config. Live in 60 seconds.

---

## 🧬 The ONE Ontology

Every interaction flows through five layers. Each layer enriches AI understanding, making your agents smarter with every action.

### 1. **People** - Intent, Governance, Authorization

Set intent, govern outcomes, authorize every action. Humans remain in command while agents execute.

**AI Customization:** Your preferences, writing style, brand voice, and approval rules teach agents how to work exactly the way you want.

### 2. **Things** - Every Entity

Every entity — agents, products, audiences, tokens, courses. 66 types out of the box.

**AI Customization:** Rich properties store context about each entity—sales agent knows lead history, content agent knows top topics.

### 3. **Connections** - Relationships

Express relationships — ownership, memberships, revenue flows. Powers collaboration and value exchange.

**AI Customization:** Relationship metadata reveals engagement levels, loyalty patterns, collaboration history.

### 4. **Events** - Chronicle Actions

Chronicle every action — launches, interactions, transactions, insights. Full audit trail built-in.

**AI Customization:** Event streams reveal behavior patterns—what content performs best, which features drive engagement.

### 5. **Knowledge** - Semantics & Search

Store semantics — labels, chunks, embeddings. Makes agents intelligent and enables rich context.

**AI Customization:** Vector embeddings power semantic search, document understanding, intelligent recommendations.

---

## 🤖 Build AI Agents in Plain English

Define AI agents that work like teammates—specialized, coordinated, and always learning. No AI expertise required.

### Agent Engineer

```
WHEN
  GET
  CALL
  IF interested:
    BOOK meeting
  RECORD interaction
```

### Content Agent

```
AGENT: Content Agent

EVERY DAY at 8am:
  GET my writing style
  GET trending topics
  CALL OpenAI generate post
  SCHEDULE post
  TRACK performance
```

**Agents coordinate through the shared ontology, learning from every interaction.**

---

## 📋 Maximum Freedom, Zero Restrictions

Complete commercial freedom to use, modify, sell, and resell. No usage limits. No royalty fees.

- ✅ **Unlimited Rights** - Use, modify, distribute, sell, resell without restrictions
- ✅ **Commercial Use** - Build SaaS, products, derivative works
- ✅ **Perpetual License** - Rights granted forever
- ✅ **License Compatible** - Works with MIT, Apache, GPL, BSD, Mozilla
- ✅ **No Fees Ever** - Zero usage limits, zero royalties
- ✅ **One Requirement** - Display "Powered by ONE" in footer

[Read Full License →](https://one.ie/free-license)

---

## 🚀 Technical Stack

**Modern, production-ready foundation:**

- **Astro 5.14+** - Lightning-fast SSR with islands architecture
- **React 19** - Edge-compatible server rendering (the "impossible" setup)
- **shadcn/ui** - 50+ pre-installed, accessible components
- **Tailwind CSS v4** - Modern CSS-based configuration
- **Convex** - Real-time database with typed functions
- **Better Auth** - 6 authentication methods (email, OAuth, magic links, 2FA)
- **TypeScript 5.9+** - Strict mode, full type safety
- **Cloudflare Pages** - Global edge deployment

### 🌟 ONE Stack

✅ **Complete Auth System** - 6 methods: email/password, GitHub, Google, magic links, 2FA, password reset
✅ **AI-Powered DSL** - Plain English commands compile to production code
✅ **50+ UI Components** - Complete shadcn/ui library ready to use
✅ **Perfect Lighthouse** - 100/100 across all metrics
✅ **Maximum Freedom** - Use, modify, sell without restrictions
✅ **Production Ready** - Rate limiting, sessions, encryption built-in

## ✨ What's Inside

### 🏗️ Architecture (Headless Frontend)

```
Frontend (Astro + React) → Backend Convex → Data Layer
```

- Frontend: UI/UX only (headless)
- Connection: `https://api.one.ie`

**Frontend Layer**:

- **Astro 5.14+** - Lightning-fast SSR with islands architecture
- **React 19** - Edge-compatible server rendering
- **shadcn/ui** - 50+ pre-installed components
- **Tailwind CSS v4** - Modern CSS-based configuration
- **Content Collections** - Type-safe blog with astro:content
- **Convex Hooks** - Real-time data from backend

**Backend Layer** (separate repo: `/backend`):

- **Convex** - Real-time database with typed functions
- **Better Auth** - Authentication with 6 methods (email, OAuth, magic links, 2FA)
- **@convex-dev/resend** - Transactional emails (password reset, verification)
- **@convex-dev/rate-limiter** - Brute force protection
- **4-Table Ontology** - entities, connections, events, knowledge

### 🎯 Key Features

- **Complete Auth System** - Email/password, OAuth (GitHub/Google), password reset, email verification, magic links, 2FA
- **Rate Limiting** - Brute force protection with configurable limits
- **Email Integration** - @convex-dev/resend for transactional emails
- **Dark Mode** - Beautiful theme switching with no FOUC
- **Blog System** - Full-featured with search, tags, categories, ToC
- **SEO Optimized** - Sitemap, RSS feed, OG tags, canonical URLs
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation
- **100/100 Lighthouse** - Perfect performance scores
- **TypeScript 5.9+** - Full type safety with strict mode
- **Cloudflare Deployment** - Global edge network with full SSR support

### 🎨 Screenshots

![Astro Shadcn UI](https://astro-shadcn.one.ie/screenshots/screenshot.png)

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/one-ie/stack.git
cd stack

# 2. Install dependencies (bun recommended)
bun install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables section below)

# 4. Deploy Backend Convex (from backend directory)
cd ../backend
bunx convex deploy
cd ../frontend

# 5. Start development server
bun run dev
```

Visit `http://localhost:4321` - You're ready to go! 🎉

### Environment Variables Required

Create `.env.local` and add:

```bash
# Convex (get from https://dashboard.convex.dev)
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# Better Auth
BETTER_AUTH_SECRET=your-random-secret-key-here
BETTER_AUTH_URL=http://localhost:4321  # or your production URL

# GitHub OAuth (optional - for social login)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth (optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend (optional - for email features)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Note:** OAuth and Resend are optional. The template works with just Convex credentials for email/password authentication.

## 🌐 Live Demo

Check out the live deployment on Cloudflare Pages:

- **Main**: [https://stack.one.ie](https://stack.one.ie)

## 🎯 Key Features

### 📝 Advanced Blog System

- **Content Collections** - Type-safe blog posts with Zod validation
- **Multi-view Layouts** - List, 2-column, 3-column, and 4-column grid views
- **Real-time Search** - Instant filtering by title and description
- **Rich Metadata** - Tags, categories, author, featured posts, reading time
- **Table of Contents** - Auto-generated with IntersectionObserver tracking
- **Social Sharing** - Native Web Share API + social media buttons
- **RSS Feed** - Auto-generated at `/rss.xml`

### 🔍 SEO & Performance

- **Meta Tags** - Open Graph, Twitter Cards, canonical URLs
- **Sitemap** - Auto-generated with `@astrojs/sitemap`
- **Image Optimization** - Astro's built-in Image component with lazy loading
- **Minimal JavaScript** - Only interactive components hydrate
- **Perfect Scores** - 100/100 Lighthouse across all metrics

### ♿ Accessibility Features

- **Skip to Content** - Keyboard-accessible skip link
- **ARIA Labels** - Proper semantic markup throughout
- **Focus Indicators** - Visible focus states on all interactive elements
- **Screen Reader Support** - Tested with VoiceOver and NVDA
- **Keyboard Navigation** - Fully navigable without a mouse

### 🛠️ Developer Experience

- **ESLint & Prettier** - Pre-configured code formatting
- **VS Code Settings** - Optimized workspace configuration
- **Path Aliases** - Clean imports with `@/` prefix
- **Type Safety** - Strict TypeScript with no implicit any
- **Hot Reload** - Fast refresh during development

## 🎨 Pre-installed Components

All Shadcn/UI components are pre-configured for Astro with 50+ components ready to use:

```astro
---
// Example usage in .astro file
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
---

<Button client:load>Click me!</Button>
```

### Available Components (50+)

**Layout & Navigation:**

- ✅ Sidebar, Navigation Menu, Breadcrumb, Tabs

**Forms & Inputs:**

- ✅ Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Calendar, Date Picker, Input OTP

**Data Display:**

- ✅ Card, Table, Badge, Avatar, Progress, Chart (Recharts), Carousel

**Feedback & Overlays:**

- ✅ Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Toast, Sonner, Alert

**Interactive:**

- ✅ Accordion, Collapsible, Dropdown Menu, Context Menu, Menubar, Hover Card, Command, Resizable Panels

**Custom Components:**

- ✅ BlogSearch - Real-time blog post filtering
- ✅ TableOfContents - Auto-generated with active tracking
- ✅ ShareButtons - Native + social media sharing
- ✅ ErrorBoundary - React error boundary with alerts
- ✅ ModeToggle - Theme switcher component

## 🛠️ Project Structure

```text
one-stack/
├── src/
│   ├── components/
│   │   ├── ui/              # 50+ shadcn/ui components
│   │   ├── auth/            # Auth components (SignIn, SignUp, 2FA, etc.)
│   │   ├── dashboard/       # Dashboard components (Sidebar, Nav, etc.)
│   │   ├── mail/            # Email UI demo components
│   │   ├── BlogSearch.tsx   # Real-time blog search
│   │   ├── TableOfContents.tsx
│   │   ├── ShareButtons.tsx
│   │   └── ModeToggle.tsx   # Theme switcher
│   ├── layouts/
│   │   ├── Layout.astro     # Base layout with SEO
│   │   └── Blog.astro       # Blog post layout with ToC
│   ├── pages/
│   │   ├── index.astro      # Homepage
│   │   ├── account/         # All auth pages organized under /account/
│   │   │   ├── index.astro  # Protected dashboard (account home)
│   │   │   ├── signin.astro # Sign in page
│   │   │   ├── signup.astro # Sign up page
│   │   │   ├── settings.astro # User settings (2FA management)
│   │   │   ├── forgot-password.astro
│   │   │   ├── reset-password.astro
│   │   │   ├── verify-email.astro
│   │   │   ├── magic-link.astro # Smart page (request & authenticate)
│   │   │   └── auth.astro   # Generic auth landing
│   │   ├── blog/
│   │   │   ├── index.astro  # Blog index with search
│   │   │   └── [...slug].astro # Dynamic blog posts
│   │   ├── rss.xml.ts       # RSS feed generator
│   │   └── 404.astro        # Custom 404 page
│   ├── content/
│   │   ├── config.ts        # Content collections schema
│   │   └── blog/            # Blog posts in markdown
│   ├── lib/
│   │   └── utils.ts         # cn() utility for Tailwind
│   ├── config/
│   │   └── site.ts          # Site configuration
│   └── styles/
│       └── global.css       # Tailwind v4 with @theme blocks
├── convex/
│   ├── schema.ts            # Database schema (users, sessions, etc.)
│   ├── auth.ts              # Auth mutations/queries (all 6 methods)
│   ├── http.ts              # HTTP endpoints
│   ├── auth.config.ts       # Better Auth configuration
│   └── convex.config.ts     # Convex components (Resend, Rate Limiter)
├── .vscode/
│   ├── settings.json        # Workspace settings
│   └── extensions.json      # Recommended extensions
├── astro.config.mjs         # Astro + Cloudflare + React 19 SSR config
├── wrangler.toml            # Cloudflare Workers configuration
├── components.json          # shadcn/ui configuration
├── .mcp.json                # 🤖 MCP servers (shadcn, Cloudflare Builds, Cloudflare Docs)
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript with path aliases
├── CLAUDE.md                # AI assistant instructions (41 docs)
└── README.md                # This file
```

### Using Components

```astro
---
// src/pages/index.astro
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
---

<Card>
  <CardHeader>
    <CardTitle>Welcome to Astro + Shadcn!</CardTitle>
  </CardHeader>
  <Button client:load>Interactive Button</Button>
</Card>
```

## 🚀 Development Workflow

### Commands

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build

# Deployment
wrangler pages deploy dist --project-name=one-stack --commit-dirty=true

# Code Quality
bun run lint             # Lint code with ESLint
bun run format           # Format with Prettier

# Type Checking
bunx astro check         # TypeScript type checking
bunx astro sync          # Sync content collection types
```

## 🌍 Deployment to Cloudflare Pages

This project successfully deploys **Astro 5 + React 19** with full server-side rendering on **Cloudflare Pages** - something previously considered impossible due to React 19's `MessageChannel` requirement in Cloudflare Workers runtime.

### The Solution

We solved the compatibility issue by configuring Vite to use `react-dom/server.edge` instead of the default `react-dom/server`:

```javascript
// astro.config.mjs
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
    ssr: {
      external: ['node:async_hooks'],
    },
  },
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
```

**Why This Works:**

- React 19's default SSR uses `MessageChannel` (unavailable in Cloudflare Workers)
- `react-dom/server.edge` is designed for edge runtimes with Web Streams
- The Vite alias redirects imports to the edge-compatible version
- Result: Full React 19 SSR on Cloudflare's global edge network ⚡

### Deployment Steps

1. **Build the project:**

   ```bash
   bun run build
   ```

2. **Deploy to Cloudflare Pages:**

   ```bash
   wrangler pages deploy dist --project-name=one-stack --commit-dirty=true
   ```

3. **Set up environment variables** in Cloudflare Pages dashboard:

   ```bash
   CONVEX_URL=https://your-deployment.convex.cloud
   CONVEX_DEPLOYMENT=your-deployment-name
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=https://your-domain.com
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM_EMAIL=your-from-email@yourdomain.com
   ```

4. **Configure Cloudflare KV** for session storage:
   - Create a KV namespace in Cloudflare dashboard
   - Bind it to your Pages project with name `SESSION`

### Configuration Files

- `astro.config.mjs` - Astro + Cloudflare adapter configuration
- `wrangler.toml` - Cloudflare Workers configuration
- `.mcp.json` - MCP servers for Cloudflare, Convex, and shadcn integrations

## 🔐 Authentication System

A complete, production-ready authentication system powered by **Convex** backend and **Better Auth** React client with enterprise-grade security features.

### 🎯 Authentication Features

#### ✅ Email/Password Authentication

- Secure password hashing with SHA-256 (upgrade to bcrypt for production)
- Session management with 30-day expiry
- HttpOnly cookies for security
- Password strength indicator
- Comprehensive error handling with user-friendly messages

#### ✅ OAuth Social Login

- **GitHub OAuth** - Sign in with GitHub
- **Google OAuth** - Sign in with Google
- Automatic account creation on first OAuth login
- Seamless session management across providers

#### ✅ Password Reset Flow

- Email-based password reset with secure tokens
- Reset links expire after 1 hour
- Email sending via Resend (@convex-dev/resend)
- Custom email templates
- All existing sessions invalidated after password reset

#### ✅ Email Verification

- Automated verification emails on sign-up
- Verification tokens expire after 24 hours
- Email sending via Resend component
- Custom verification page with auto-verification
- Track verification status in user profile

#### ✅ Rate Limiting & Security

- **Sign-in**: 5 attempts per 15 minutes (per email)
- **Sign-up**: 3 attempts per hour (per email)
- **Password reset**: 3 attempts per hour (per email)
- Powered by `@convex-dev/rate-limiter` component
- Prevents brute force attacks

### 🏗️ Architecture

**Hybrid Better Auth + Convex Setup:**

```
Frontend (Better Auth React) ←→ API Bridge (/api/auth/[...all]) ←→ Convex Mutations
                                                                      ↓
                                                           Custom Auth Logic
```

**Key Files:**

- `convex/auth.ts` - Custom auth mutations (signUp, signIn, OAuth, password reset, email verification)
- `convex/schema.ts` - Database schema (users, sessions, passwordResets, emailVerifications)
- `src/lib/auth-client.ts` - Better Auth React client configuration
- `src/pages/api/auth/[...all].ts` - API bridge connecting Better Auth UI to Convex backend
- `src/pages/api/auth/github/callback.ts` - GitHub OAuth callback handler
- `src/pages/api/auth/google/callback.ts` - Google OAuth callback handler

### 🚀 Authentication Pages

All authentication pages are organized under `/account/`:

- `/account/signin` - Sign in with email/password or OAuth
- `/account/signup` - Create account with email/password or OAuth
- `/account/forgot-password` - Request password reset email
- `/account/reset-password` - Reset password with token
- `/account/verify-email` - Email verification with auto-verify
- `/account/magic-link` - Passwordless authentication (request & authenticate)
- `/account/settings` - User settings (2FA management)
- `/account` - Protected dashboard (account home)

### 🔧 Setting Up Authentication

1. **Configure OAuth Apps:**

   **GitHub OAuth:**
   - Create OAuth App at https://github.com/settings/developers
   - Set callback URL: `https://your-domain.com/api/auth/github/callback`
   - Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.local`

   **Google OAuth:**
   - Create OAuth credentials at https://console.cloud.google.com/apis/credentials
   - Set callback URL: `https://your-domain.com/api/auth/google/callback`
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

2. **Configure Resend for Emails:**

   ```bash
   # Get API key from https://resend.com
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Set Auth Secrets:**

   ```bash
   BETTER_AUTH_SECRET=your-random-secret-key-here
   BETTER_AUTH_URL=https://your-domain.com  # or http://localhost:4321 for dev
   ```

4. **Deploy Convex Schema:**
   ```bash
   bunx convex deploy
   ```

### 💡 Usage Examples

**Check if user is authenticated:**

```typescript
// In Astro component
const token = Astro.cookies.get('auth_token')?.value;
const user = token
  ? await convex.query(api.auth.getCurrentUser, { token })
  : null;

if (!user) {
  return Astro.redirect('/signin');
}
```

**Sign out:**

```typescript
import { authClient } from '@/lib/auth-client';

await authClient.signOut();
window.location.href = '/';
```

**Enable email verification on sign-up:**

```typescript
// Update SimpleSignUpForm.tsx
const result = await authClient.signUp.email({
  email,
  password,
  name,
  sendVerificationEmail: true,
  baseUrl: window.location.origin,
});
```

### 🔒 Security Best Practices

✅ **Implemented:**

- HttpOnly cookies prevent XSS attacks
- Rate limiting prevents brute force
- Secure password hashing
- Email verification prevents spam accounts
- OAuth state validation
- Token expiry (sessions: 30 days, reset: 1 hour, verification: 24 hours)

⚠️ **Production Recommendations:**

- Upgrade from SHA-256 to bcrypt for password hashing
- Enable HTTPS in production (automatic with Cloudflare Pages)
- Implement 2FA (TOTP) for sensitive accounts
- Add CAPTCHA for sign-up forms
- Monitor authentication logs
- Implement account lockout after repeated failures

#### ✅ Magic Links (Passwordless Authentication)

- One-click sign-in via email link
- 15-minute expiry for security
- One-time use only
- Rate limited (3 per hour)
- No password required

#### ✅ Two-Factor Authentication (TOTP)

- Google Authenticator, Authy, 1Password compatible
- QR code setup for easy configuration
- 10 backup codes for account recovery
- Client-side TOTP verification
- Password required to disable
- 30-second time window

### 📋 Remaining Auth Features

The following features are documented in `plans/NEXT-FEATURES.md`:

- **Passkeys (WebAuthn)** - Modern biometric authentication (Touch ID, Face ID)

### Adding Blog Posts

Create a new markdown file in `src/content/blog/`:

```markdown
---
title: 'Your Post Title'
description: 'A brief description'
date: 2025-01-15
author: 'Your Name'
tags: ['astro', 'react', 'tailwind']
category: 'tutorial'
featured: true
image: '/path/to/image.jpg'
---

Your content here with full markdown support!

## Headings auto-generate Table of Contents

Content is automatically indexed for search.
```

### Using React Components in Astro

```astro
---
// Always add client:load for interactive components
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
---

<!-- Interactive component needs client:load -->
<Dialog client:load>
  <Button client:load>Click me!</Button>
</Dialog>

<!-- Static components don't need hydration -->
<Card>
  <CardHeader>
    <CardTitle>Static Card</CardTitle>
  </CardHeader>
</Card>
```

### Customizing Theme

Edit `src/styles/global.css` to customize colors:

```css
@theme {
  --color-primary: 0 0% 9%;
  --color-background: 0 0% 100%;
  /* Add your custom colors */
}

/* Dark mode overrides */
.dark {
  --color-background: 0 0% 3.9%;
  --color-foreground: 0 0% 98%;
}
```

## 🤖 MCP Integration (Model Context Protocol)

ONE Stack includes pre-configured **MCP servers** for enhanced development with AI assistants like Claude Code.

### What are MCPs?

Model Context Protocol (MCP) enables AI assistants to interact with external tools and services through a standardized interface. This template includes three powerful MCP integrations:

### 📦 Configured MCP Servers

#### 1. **shadcn MCP** - Component Management

```bash
npx shadcn@latest mcp
```

**Features:**

- 🔍 Search and discover shadcn/ui components
- 📥 Add new components to your project
- 📖 View component documentation and examples
- 🎨 Get usage patterns and best practices

**Usage with Claude Code:**

```typescript
// Ask Claude to add a component
'Add the data-table component from shadcn';

// Claude will use the MCP to:
// 1. Search for the component
// 2. View its dependencies
// 3. Install it with proper configuration
// 4. Show you usage examples
```

#### 2. **Cloudflare Builds MCP** - Deployment Management

```bash
npx mcp-remote https://builds.mcp.cloudflare.com/sse
```

**Features:**

- 🚀 Monitor deployment status
- 📊 View build logs and analytics
- 🔄 Trigger new deployments
- ⚙️ Manage environment variables

**Usage:**

```typescript
// Ask Claude about deployments
'Show me the latest deployment status';
'Deploy to production';
'Check build logs for errors';
```

#### 3. **Cloudflare Docs MCP** - Documentation Access

```bash
npx mcp-remote https://docs.mcp.cloudflare.com/sse
```

**Features:**

- 📚 Search Cloudflare documentation
- 💡 Get code examples for Workers, Pages, KV
- 🔧 Access API references
- 📖 Learn best practices

**Usage:**

```typescript
// Ask Claude for Cloudflare help
'How do I set up KV storage for sessions?';
'Show me Workers API documentation';
"What's the best way to handle environment variables?";
```

### 🎯 Using MCPs with Claude Code

The `.mcp.json` file is automatically detected by Claude Code and other MCP-compatible AI assistants.

**Example Workflows:**

1. **Add a new component:**

   ```
   User: "Add the calendar component and create a date picker form"
   Claude: [Uses shadcn MCP to add component, then generates the form]
   ```

2. **Deploy updates:**

   ```
   User: "Deploy the latest changes to Cloudflare"
   Claude: [Uses Cloudflare MCP to trigger deployment and monitor progress]
   ```

3. **Debug with docs:**
   ```
   User: "Why is my Cloudflare KV storage not working?"
   Claude: [Uses Cloudflare Docs MCP to find relevant documentation and troubleshoot]
   ```

### 📁 Configuration File

The `.mcp.json` file in the project root:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "cloudflare-builds": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://builds.mcp.cloudflare.com/sse"]
    },
    "cloudflare-docs": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://docs.mcp.cloudflare.com/sse"]
    }
  }
}
```

### 🔧 Adding More MCPs

You can add additional MCP servers to enhance your workflow:

```json
{
  "mcpServers": {
    "your-custom-mcp": {
      "command": "npx",
      "args": ["your-mcp-package"]
    }
  }
}
```

**Popular MCPs for web development:**

- **GitHub MCP** - Repository management and PR creation
- **Figma MCP** - Design file access and component extraction
- **Postgres MCP** - Database queries and schema management
- **Stripe MCP** - Payment integration and testing

### 💡 Benefits of MCP Integration

1. **Faster Development** - AI can install and configure components automatically
2. **Better Context** - Access to real-time docs and examples
3. **Deployment Automation** - Deploy directly from conversation with AI
4. **Troubleshooting** - AI has access to latest documentation and error patterns
5. **Learning** - AI can teach you best practices from official docs

### 🚀 Getting Started with MCPs

MCPs work automatically when using Claude Code. No additional setup required!

Just ask your AI assistant to:

- "Add a new shadcn component"
- "Check deployment status"
- "Look up Cloudflare documentation for..."

The MCP system handles the rest, providing your AI assistant with the tools it needs to help you build faster.

## 🔍 Troubleshooting

### Common Issues & Solutions

**Type Errors After Adding Content**

```bash
npx astro sync  # Regenerate content collection types
```

**Component Not Interactive**

```astro
<!-- Add client:load directive -->
<Button client:load>Click me</Button>
```

**Styling Issues**

```astro
<!-- Use className (not class) in React components -->
<Button className="custom-class">Button</Button>

<!-- Use class in Astro files -->
<div class="custom-class">Content</div>
```

**Build Failures**

```bash
npx astro check  # Check for TypeScript errors
pnpm lint        # Check for linting errors
```

## 💡 Pro Tips

1. **Component Usage in Astro**

   ```astro
   ---
   // Always import in the frontmatter
   import { Button } from '@/components/ui/button';
   ---

   <!-- Use in template -->
   <Button client:load>Click me!</Button>
   ```

2. **Styling with Tailwind v4**

   ```astro
   <!-- Use semantic color names that work in both light and dark modes -->
   <div class="bg-background text-foreground border border-border">
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

## 📊 Performance & Screenshots

### ⚡ Lighthouse Scores

![Desktop Performance](https://astro-shadcn.one.ie/screenshots/lighthouse-desktop.png)

Perfect scores across all metrics:

- 🚀 Performance: 100
- ♿ Accessibility: 100
- 🔧 Best Practices: 100
- 🔍 SEO: 100

### What Makes It Fast?

- **Islands Architecture** - Only interactive components hydrate
- **Image Optimization** - Automatic WebP conversion and lazy loading
- **Minimal JavaScript** - ~30KB gzipped for the entire site
- **CSS-First** - Tailwind v4 with zero runtime overhead
- **Static Generation** - Pre-rendered pages for instant loads
- **Smart Bundling** - Code splitting and tree shaking enabled

## 📚 Documentation & Resources

### Official Docs

- [Astro Documentation](https://docs.astro.build)
- [Shadcn/UI Components](https://ui.shadcn.com/docs/components/accordion)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [React 19 Release](https://react.dev/blog/2025/01/29/react-19)

### Project Docs

- `CLAUDE.md` - AI assistant instructions and architecture guide
- `improve.md` - Detailed improvement roadmap and best practices

## 🤝 Contributing & Support

### Get Help

- 💬 [Discord Community](https://astro.build/chat) - Join Astro's Discord
- 📚 [Documentation](https://docs.astro.build) - Official Astro docs
- 🐛 [Report Issues](https://github.com/one-ie/stack/issues) - File bugs or feature requests
- 📧 [Contact](https://one.ie) - Reach out to the ONE team

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Star on GitHub ⭐

If you find ONE Stack useful, please star it on [GitHub](https://github.com/one-ie/stack)!

## 🎯 What Makes ONE Stack Different?

### 1. 🔐 Most Complete Authentication System

**6 production-ready authentication methods:**

- ✅ Email/Password with password strength indicator
- ✅ OAuth (GitHub & Google)
- ✅ Password Reset with email templates
- ✅ Email Verification (24-hour tokens)
- ✅ Magic Links (passwordless)
- ✅ Two-Factor Auth (TOTP with backup codes)
- ✅ Rate Limiting (brute force protection)
- ✅ Session Management (30-day expiry)

**Other Astro templates:** Usually only email/password or no auth at all.

### 2. 🚀 React 19 SSR on Cloudflare Pages

**The "impossible" achievement** - Full React 19 server-side rendering on Cloudflare Workers edge runtime using `react-dom/server.edge`. This template proves it's possible and production-ready.

**Other templates:** Still using React 18 or client-side only.

### 3. 📊 Real-time Backend with Convex

**Zero-config real-time database** with typed functions, subscriptions, and automatic API generation. No need to write backend routes or manage infrastructure.

**Other templates:** Static-only or require separate backend setup.

### 4. 🎨 50+ Pre-installed Components

**Complete shadcn/ui library** ready to use with examples, demos, and working authentication pages. All components support dark mode and are fully accessible.

**Other templates:** Empty or only 5-10 basic components.

### 5. ⚡ Perfect Lighthouse Scores

**100/100 across all metrics** out of the box - Performance, Accessibility, Best Practices, SEO. Optimized for speed with islands architecture and minimal JavaScript.

**Other templates:** Often sacrifice performance for features.

### 6. 📧 Email System Built-in

**@convex-dev/resend** component integrated for password reset, email verification, and magic links. Beautiful HTML email templates included.

**Other templates:** No email system or requires manual setup.

### 7. 📝 Advanced Blog System

**Multi-view layouts** (list, 2/3/4 column grids), real-time search, auto-generated ToC with active tracking, social sharing, RSS feed, categories, tags, featured posts.

**Other templates:** Basic blog or no content collections.

### 8. 🤖 MCP Integration (AI-First Development)

**3 pre-configured MCP servers** for Claude Code and other AI assistants:

- shadcn MCP for component management
- Cloudflare Builds MCP for deployment automation
- Cloudflare Docs MCP for instant documentation access

**Other templates:** No MCP support - manual component installation and deployment.

### 9. 🛠️ Developer Experience

**TypeScript strict mode**, ESLint, Prettier, path aliases, VS Code settings, 41 comprehensive documentation files, AI assistant instructions (CLAUDE.md).

**Other templates:** Minimal documentation and tooling.

## 📦 What's New

### Latest Updates (v1.0.0)

- 🎉 **Cloudflare SSR** - React 19 SSR on Cloudflare Pages (previously impossible!)
- ✅ **Convex Integration** - Real-time backend with authentication
- ✅ **Complete Auth System** - 6 authentication methods implemented
- ✅ **Better Auth** - GitHub & Google OAuth with session management
- ✅ **Email Verification** - Automated email verification with 24-hour tokens
- ✅ **Rate Limiting** - Brute force protection (5 login attempts per 15 min)
- ✅ **Magic Links** - Passwordless authentication via email
- ✅ **Two-Factor Auth** - TOTP with Google Authenticator, Authy, 1Password
- ✅ **Email Component** - @convex-dev/resend for password reset and transactional emails
- ✅ **Edge Rendering** - Global CDN with sub-100ms response times
- ✅ **Blog Search** - Real-time filtering by title/description
- ✅ **Table of Contents** - Auto-generated with active tracking
- ✅ **Social Sharing** - Native Web Share API + social buttons
- ✅ **Enhanced Schema** - Tags, categories, author, reading time
- ✅ **SEO Optimized** - Sitemap, RSS, OG tags, canonical URLs
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **Developer Tools** - ESLint, Prettier, VS Code settings
- ✅ **Error Handling** - 404 page + React error boundaries

## 🎯 Use Cases

Perfect for:

- 💼 **SaaS Applications** - Full authentication and user management out of the box
- 📝 **Technical Blogs** - Advanced content system with search and SEO
- 🎨 **Portfolios** - Beautiful UI components and dark mode
- 🚀 **Landing Pages** - Perfect Lighthouse scores and fast loading
- 📊 **Dashboards** - Pre-built dashboard components and layouts
- 🛍️ **E-commerce** - Product catalogs with real-time updates
- 📱 **Progressive Web Apps** - Installable, fast, and offline-capable
- 🎓 **Educational Platforms** - Content management and user accounts

---

## 📄 License

**MIT License** - Feel free to use this template for personal or commercial projects.

## 🙏 Acknowledgments

Built with these amazing technologies:

- 🚀 [Astro](https://astro.build) - The web framework for content-driven websites
- ⚛️ [React 19](https://react.dev) - The library for web and native user interfaces
- 🎨 [shadcn/ui](https://ui.shadcn.com) - Beautifully designed components
- ⚡ [Tailwind CSS v4](https://tailwindcss.com) - A utility-first CSS framework
- 📊 [Convex](https://convex.dev) - The reactive backend-as-a-service
- 🔐 [Better Auth](https://better-auth.com) - Authentication for TypeScript
- ☁️ [Cloudflare Pages](https://pages.cloudflare.com) - Fast, secure, and free hosting

---

<div align="center">

**Built with ❤️ by [ONE](https://one.ie)**

[⭐ Star on GitHub](https://github.com/one-ie/stack) • [🚀 Live Demo](https://stack.one.ie) • [📚 Documentation](./plans/landing.md)

</div>
