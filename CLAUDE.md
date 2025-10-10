# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ONE is a modern Astro-based AI-powered web application framework that combines static site generation with dynamic AI capabilities. The project features AI chat interfaces, comprehensive content management, and advanced UI components using Astro, React, and TypeScript.

## Key Development Commands

### Package Management
- **Always use pnpm**: `pnpm` is the required package manager for this project
- Install dependencies: `pnpm install`
- Add packages: `pnpm add <package-name>`

### Development Workflow
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm astro check

# Run tests
pnpm test
pnpm test:ui
pnpm test:run
pnpm coverage

# Book generation
pnpm generate:epub
pnpm generate:pdf

# Update book metadata
pnpm update:book-metadata
```

### Key Scripts
- `dev`: Starts Astro development server with hot reload
- `build`: Runs type checking and builds for production
- `astro check`: TypeScript and Astro validation
- `test`: Interactive test runner using Vitest
- `generate:epub`: Creates EPUB from book content using Pandoc

## Architecture Overview

### Core Technologies
- **Astro 5.10+**: Static site generator with SSR support
- **React 18**: Interactive components and islands
- **TypeScript**: Full type safety throughout
- **Tailwind CSS 4.1**: Utility-first styling
- **Zod**: Runtime validation and type inference
- **Shadcn/UI**: Component library with Radix UI primitives
- **Vercel AI SDK**: AI integration and streaming

### Project Structure
```
src/
├── components/           # UI Components
│   ├── ui/              # Shadcn/UI components
│   ├── chat/            # AI chat components
│   └── magicui/         # Enhanced UI components
├── content/             # Content Collections (managed by Astro)
│   ├── blog/            # Blog posts
│   ├── docs/            # Documentation
│   ├── book/            # Book chapters
│   └── lessons/         # Course content
├── layouts/             # Page layouts
├── lib/                 # Utility functions
├── pages/               # Routes and API endpoints
│   └── api/             # API endpoints for AI chat
├── schema/              # Zod schemas
├── stores/              # State management
└── styles/              # Global styles
```

### Key Architectural Patterns

#### 1. Zod as Single Source of Truth
- All data validation and TypeScript types derive from Zod schemas
- Schema definitions in `src/schema/` and `src/content/config.ts`
- Runtime validation with automatic type inference

#### 2. Astro + React Islands
- Static content in `.astro` files
- Interactive components in `.tsx` files with `client:*` directives
- Use `client:load` for immediately interactive components
- Use `client:idle` for deferred loading
- Use `client:visible` for components that appear on scroll

#### 3. AI Chat Integration
- Chat configuration via frontmatter in pages/layouts
- API endpoints in `src/pages/api/` for AI providers
- Real-time streaming responses using Vercel AI SDK
- Context-aware AI assistants per page

#### 4. Content Collections
- Comprehensive content management with Astro Content Collections
- Type-safe content with Zod schemas
- Support for blog, docs, courses, lessons, events, etc.
- Automatic TypeScript type generation

## Development Guidelines

### Component Development
- Use uppercase for component names (e.g., `components/Chat`)
- Prefer `.astro` files for static content
- Use `.tsx` for interactive React components
- Follow Astro's island architecture patterns

### Styling Approach
- Use `class` for Astro components, `className` for React components
- Leverage Tailwind CSS utility classes
- Use Shadcn/UI components for consistent design
- CSS custom properties for theme variables

### AI Chat Implementation
```typescript
// Example chat configuration
const chatConfig = ChatConfigSchema.parse({
  provider: "openai",
  model: "gpt-4o-mini",
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
        prompt: "How do I get started?"
      }
    ]
  }
});
```

### API Development
- AI chat endpoints in `src/pages/api/`
- Edge runtime configuration for performance
- Streaming responses using Vercel AI SDK
- Error handling with proper HTTP status codes

## Content Management

### Content Collections
- Defined in `src/content/config.ts`
- Comprehensive schemas for all content types
- Type-safe content queries using Astro's `getCollection()`

### Content Types
- **Blog**: Articles and posts
- **Docs**: Documentation pages
- **Book**: EPUB chapter content
- **Lessons**: Course curriculum
- **Events**: Webinars and meetings
- **Prompts**: AI prompt templates

### Book Generation
- Markdown chapters in `src/content/book/`
- Metadata in YAML frontmatter
- Generate EPUB: `pnpm generate:epub`
- Pandoc required for book generation

## Testing Strategy

### Test Framework
- **Vitest**: Unit and integration testing
- **@testing-library/react**: Component testing
- **Happy DOM**: Lightweight DOM simulation

### Test Commands
```bash
pnpm test        # Interactive test runner
pnpm test:run    # Run all tests once
pnpm test:ui     # Test UI dashboard
pnpm coverage    # Generate coverage report
```

## Build and Deployment

### Build Process
- `pnpm build` runs type checking and builds
- Output to `dist/` directory
- Server-side rendering with Node.js adapter
- Edge runtime optimization for API routes

### Environment Variables
```env
# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
OPENROUTER_API_KEY=your_openrouter_key

# Optional: Custom API endpoints
OPENAI_BASE_URL=https://api.openai.com/v1
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### Deployment Targets
- **Vercel**: Recommended platform
- **Netlify**: Alternative deployment
- **Cloudflare Pages**: Edge deployment
- **Any Node.js server**: Standalone mode

## The ONE Platform 6-Dimension Ontology

### Core Architecture Principle
**CRITICAL:** The ONE Platform is built on a **6-dimension ontology** that models reality completely. This is the foundation for all features, data, and AI agents.

### The 6 Dimensions

```
Organizations → People → Things → Connections → Events → Knowledge
```

1. **Organizations** - Multi-tenant isolation boundary
   - Every org owns its own graph of things, connections, events, knowledge
   - Perfect data isolation for SaaS platforms
   - Billing, quotas, and permissions per organization

2. **People** - Authorization & governance
   - Four roles: `platform_owner`, `org_owner`, `org_user`, `customer`
   - Every action has an actor (who did it)
   - Complete audit trails

3. **Things** - Domain entities (66 types)
   - What exists: users, agents, content, products, tokens, courses
   - All things belong to an organization
   - Type-specific properties in metadata

4. **Connections** - Relationships (25 types)
   - How things relate: owns, follows, subscribes_to, purchased
   - All connections scoped to organizations
   - Relationship metadata for context

5. **Events** - Actions & history (67 types)
   - What happened: who did what when
   - Required fields: `actorId`, `eventType`, `timestamp`, `organizationId`
   - Complete audit trail for compliance

6. **Knowledge** - Intelligence layer
   - Labels, chunks, vectors, embeddings
   - Powers RAG (Retrieval-Augmented Generation)
   - Semantic search across all content

### Development Rules for 6-Dimension Architecture

**When Creating Features:**
1. Map to ontology FIRST - which dimensions are affected?
2. Every database query MUST filter by `organizationId` (multi-tenant safety)
3. Every event insertion MUST include `actorId` (who did it)
4. Use metadata for type-specific data (not new tables)

**Example Pattern:**
```typescript
// ✅ CORRECT: Multi-tenant safe query
const posts = await ctx.db
  .query("things")
  .withIndex("by_org_type", (q) =>
    q.eq("organizationId", orgId)
     .eq("thingType", "blog_post"))
  .collect();

// ✅ CORRECT: Event with actor
await ctx.db.insert("events", {
  eventType: "content_created",
  actorId: userId,        // WHO did this
  thingId: postId,
  organizationId: orgId,  // WHICH org
  timestamp: Date.now(),
  metadata: { ... }
});

// ❌ WRONG: Missing org scope
const posts = await ctx.db
  .query("things")
  .withIndex("by_type", (q) => q.eq("thingType", "blog_post"))
  .collect();

// ❌ WRONG: Missing actorId
await ctx.db.insert("events", {
  eventType: "content_created",
  thingId: postId,
  timestamp: Date.now()
});
```

### Documentation
- Complete specification: `/one/connections/ontology.md`
- Architecture guide: `/one/things/architecture.md`
- Migration guide: `/one/connections/MIGRATION-GUIDE.md`
- Examples: `/one/examples/children/lemonade-stand.md` (kids), `/one/examples/enterprise/crm-saas.md` (SaaS)

### Why This Matters
- **Scales from children to enterprise:** Same architecture for lemonade stands and Fortune 500
- **Multi-tenant by design:** Perfect data isolation, no cross-org leaks
- **AI-friendly:** Clear, consistent patterns AI can reason about
- **Future-proof:** Never needs schema changes, infinitely extensible

## Important Notes

### Cursor Rules Integration
- Agent ONE identity: AI Engineer for ONE https://one.ie
- Focus on 1000x speed and accuracy
- Specialized in AI agents, websites, and apps
- Uses modern stack: Astro, React, TypeScript, Shadcn/UI, Tailwind
- **ALWAYS map features to 6-dimension ontology first**

### Performance Optimization
- Minimize client-side JavaScript
- Use Astro's partial hydration
- Leverage static generation where possible
- Implement proper caching strategies

### Security Considerations
- API keys in environment variables only
- Validate all inputs with Zod schemas
- Use CSP headers for security
- Sanitize user-generated content

## Troubleshooting

### Common Issues
1. **Hydration Errors**: Ensure `client:*` directives are used correctly
2. **Type Errors**: Run `pnpm astro check` for validation
3. **Build Failures**: Check Node.js version (requires 20+)
4. **API Issues**: Verify environment variables are set

### Package Manager
- **Always use pnpm**: Project is configured specifically for pnpm
- Ignore built dependencies: esbuild, sharp (see package.json)
- Node.js version: 20.0.0 or higher required

### AI Chat Debugging
- Check console for API errors
- Verify API keys in environment
- Monitor network requests in DevTools
- Test with different AI models/providers

This codebase emphasizes modern web development practices with AI integration, comprehensive content management, and excellent developer experience through TypeScript, Astro, and modern tooling.