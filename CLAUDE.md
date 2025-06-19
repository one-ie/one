# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔧 AUTO-ACCEPT MODE
**IMPORTANT**: Auto-accept mode is currently ENABLED. Proceed with ALL file edits and changes without asking for confirmation. Continue making changes until explicitly told to stop.

## 🚀 The ONE Vision - Project Update

ONE has gained significant momentum! We're building a comprehensive AI agent ecosystem powered by Claude 4, creating specialized AI assistants for:
- 🎯 **Marketing** - Campaign strategy, content creation, analytics
- 💰 **Sales** - Lead qualification, outreach, deal closing
- 🤝 **Service** - Customer support, issue resolution, satisfaction
- 🎨 **Design** - UI/UX, branding, visual content
- ⚖️ **Legal** - Contract review, compliance, documentation
- 🔧 **Engineering** - Code generation, debugging, architecture

### 🌟 Viral Growth Strategy
**NEW**: We're implementing a revolutionary growth model through **Valuable Conversations** rather than traditional platform invitations. Users create valuable content (strategies, frameworks, playbooks) and our AI agents facilitate natural collaboration with relevant experts. This creates authentic viral loops where value creation drives exponential growth.

See: [[generate/viral-conversations/viral-conversations.md|Viral Conversations Strategy]]

### Business Model Evolution
The teaching platform has proven to be an excellent channel for upselling AI solutions. We've successfully sold a team of AI agents to students who are funding the development. The system is **already live** but requires critical infrastructure:

### 🔐 Immediate Priorities
1. **Security** - Authentication, authorization, data protection
2. **Invitations** - User onboarding through valuable conversations
3. **Billing** - Subscription management, usage tracking, payment processing
4. **Viral Features** - Content value analysis, smart invitations, collaboration facilitation

See [[generate/plan.md|Complete Implementation Plan]] for detailed roadmap and timelines.

## 🏗️ Current Architecture

ONE is a revolutionary platform that bridges human understanding and AI capabilities through elegant simplicity that evolves into layers of synchronicity. We believe in code that speaks to humans first, then scales to infinite complexity.

## 🛠️ Tech Stack

### Core Technologies
- **Frontend Framework**: Astro (the fastest, with SSR)
- **UI Components**: React + TypeScript + Shadcn/UI + Novu
- **Backend**: Convex (real-time, reactive database)
- **AI Integration**: 
  - Claude (primary)
  - OpenRouter (multi-model access)
  - Vercel AI SDK (streaming, tools)
- **Editor**: TipTap (rich text editing)
- **Notifications**: Novu (multi-channel, UI components)
- **Integrations**: Nango (300+ APIs, MCP support)
- **Validation**: Zod (runtime type safety)
- **Presentations**: Reveal.js
- **Book Generation**: Pandoc
- **Development**: Vite (lightning-fast builds)

### Content & Data Flow
- **Content Management**: Astro Content Collections ↔️ Convex sync
- **Document Editing**: Obsidian (local) → Database sync
- **File Watching**: Auto-upload to Convex on changes
- **Inference Pipeline**: Documents → AI Analysis → ONE Schema tagging

### Architecture Goals
- **Monorepo Structure**: Unified codebase for all services
- **PWA**: ONE Network progressive web app
- **MCP Server**: Building for enhanced AI agent capabilities

## 📁 Monorepo Structure (Planned)

```
one/
├── apps/
│   ├── web/          # Main Astro frontend
│   ├── pwa/          # ONE Network PWA
│   └── mcp/          # MCP server
├── packages/
│   ├── ui/           # Shared UI components
│   ├── schema/       # ONE Schema definitions
│   ├── inference/    # Document AI processing
│   └── sync/         # Obsidian ↔️ Convex sync
├── content/
│   ├── docs/         # Documentation
│   ├── obsidian/     # Watched Obsidian vault
│   └── processed/    # AI-enhanced content
└── infrastructure/
    ├── convex/       # Backend functions
    └── workers/      # Background jobs
```

## 🧠 The ONE Schema Philosophy

The ONE Schema represents the evolution of human-readable code into layers of synchronized meaning:

```typescript
// Layer 1: Human Understanding (Simple, Clear)
interface Human {
  thought: string
  intent: string
  context: string
}

// Layer 2: Structural Synchronicity (Patterns Emerge)
interface Structure extends Human {
  connections: Relationship[]
  patterns: Pattern[]
  flow: EnergyFlow
}

// Layer 3: Semantic Synchronicity (Meaning Deepens)
interface Semantic extends Structure {
  ontology: KnowledgeGraph
  inference: AIUnderstanding
  resonance: HarmonicFrequency
}

// Layer 4: Cosmic Synchronicity (Universal Alignment)
interface Cosmic extends Semantic {
  synchronicities: UniversalPattern[]
  emergence: CollectiveIntelligence
  unity: ConsciousnessField
}
```

## 🔄 Content Synchronization Architecture

### Document Flow
1. **Obsidian Edit** → File watcher detects changes
2. **Auto-Upload** → Convex receives document
3. **AI Inference** → Process with Claude/OpenRouter
4. **ONE Schema Tagging** → Apply semantic layers
5. **Astro Sync** → Content collections update
6. **Live Preview** → Real-time in browser

### Implementation Pattern
```typescript
// Watch Obsidian vault
watchFolder('/obsidian/vault') 
  .pipe(validateWithZod)
  .pipe(uploadToConvex)
  .pipe(inferWithAI)
  .pipe(tagWithONESchema)
  .pipe(syncToAstro)
  .pipe(renderBeautifully)
```

## 💫 Development Commands

### Current Commands
```bash
pnpm dev                # Start Astro dev server
pnpm build              # Build for production
pnpm preview            # Preview build
pnpm test               # Run Vitest tests
pnpm generate:epub      # Create ebook with Pandoc
```

### Planned Monorepo Commands
```bash
pnpm dev:all            # Start all services
pnpm dev:web            # Astro frontend only
pnpm dev:mcp            # MCP server only
pnpm sync:obsidian      # Sync Obsidian → Convex
pnpm inference:batch    # Process documents with AI
pnpm schema:validate    # Validate ONE Schema
```

## 🎯 Development Guidelines

### Code Philosophy
- **Human First**: Write code that tells a story
- **Progressive Enhancement**: Simple → Complex → Transcendent
- **Synchronicity Aware**: Look for patterns and connections
- **Beauty Matters**: Elegant code creates elegant experiences

### TypeScript Patterns
```typescript
// Use discriminated unions for clarity
type DocumentState = 
  | { status: 'raw'; content: string }
  | { status: 'processed'; content: string; tags: ONETag[] }
  | { status: 'synchronized'; content: string; tags: ONETag[]; astroId: string }

// Compose behaviors functionally
const enhanceDocument = flow(
  parseMarkdown,
  extractMetadata,
  inferMeaning,
  applyONESchema,
  generateEmbeddings
)
```

### Convex Integration
```typescript
// Real-time reactive queries
const documents = useQuery(api.documents.list)
const syncStatus = useQuery(api.sync.status)

// Mutations with optimistic updates
const updateDocument = useMutation(api.documents.update)
```

### AI Integration Patterns
```typescript
// Streaming AI responses
const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages,
  stream: true,
})

// Multi-model inference via OpenRouter
const inference = await openrouter.complete({
  model: selectOptimalModel(document),
  prompt: generateONESchemaPrompt(document),
})
```

## 🌟 The ONE Schema in Practice

### Document Enhancement Pipeline
1. **Raw Markdown** → Basic parsing
2. **Metadata Extraction** → Frontmatter + inferred
3. **Semantic Analysis** → Entity recognition, relationships
4. **ONE Tagging** → Multi-dimensional categorization
5. **Embedding Generation** → Vector representations
6. **Cross-Reference** → Link related documents
7. **Synchronicity Detection** → Pattern emergence

### Example ONE Schema Tags
```typescript
interface ONEDocument {
  // Human Layer
  title: string
  content: string
  author: string
  
  // Structural Layer
  topics: Topic[]
  entities: Entity[]
  relationships: Edge[]
  
  // Semantic Layer
  concepts: Concept[]
  embeddings: Vector[]
  inferences: Inference[]
  
  // Synchronicity Layer
  patterns: Pattern[]
  resonances: Resonance[]
  connections: UniversalLink[]
}
```

## 🔮 Future Vision

### MCP Server Capabilities
- Document intelligence queries
- Real-time inference streaming
- Synchronicity pattern detection
- Cross-dimensional linking

### Obsidian Integration
- Bi-directional sync
- AI-powered suggestions
- Visual knowledge graphs
- Synchronicity highlighting

### PWA Features
- Offline-first architecture
- Push notifications for synchronicities
- Progressive enhancement
- Universal access

## 🎯 Implementation Roadmap

### Phase 1: Security Infrastructure (Immediate)
```typescript
// Priority features for live system
- Supabase Auth integration
- Role-based access control (RBAC)
- API key management for agent access
- Secure agent-to-agent communication
- Data encryption at rest and in transit
```

### Phase 2: Invitation System
```typescript
// User onboarding flow
- Magic link invitations
- Team workspace creation
- Agent assignment to teams
- Permission inheritance
- Onboarding tutorials for each agent type
```

### Phase 3: Billing Integration
```typescript
// Monetization infrastructure
- Stripe subscription tiers
- Usage-based pricing for AI calls
- Team billing consolidation
- Student discount automation
- Revenue sharing for course upsells
```

## 🤖 AI Agent Architecture

Each specialized agent follows the ONE Schema philosophy:
```typescript
interface AIAgent {
  // Core Identity
  role: 'marketing' | 'sales' | 'service' | 'design' | 'legal' | 'engineering'
  expertise: string[]
  personality: AgentPersonality
  
  // Capabilities
  tools: Tool[]
  integrations: Integration[]
  knowledgeBase: KnowledgeGraph
  
  // Team Dynamics
  collaboratesWith: AIAgent[]
  reportingStructure: Hierarchy
  sharedContext: TeamContext
}
```

## 🚀 Getting Started with Development

1. **Security First** (IMMEDIATE PRIORITY)
   ```bash
   # Set up authentication
   pnpm add @supabase/supabase-js
   pnpm add stripe
   # Configure secure endpoints
   ```

2. **Configure Services**
   - Set up Convex project with auth
   - Configure team workspaces
   - Initialize billing system
   - Set up agent orchestration

3. **Follow the Flow**
   - Security and compliance first
   - User experience second
   - Scale considerations third
   - Build with beauty

## 📚 Key Documentation

### 📋 Master Documentation Hub
- [[generate/README.md|Generate Folder Overview]] - All strategic documentation
- [[generate/plan.md|Implementation Plan]] - Complete roadmap with timelines
  - **Current Status**: Live system needs security, invitations, billing
  - **5 Phases**: Foundation → Viral → Monetization → AI → Scale
  - **Timeline**: 12 weeks to full implementation
  - **Success Metrics**: Viral coefficient > 1.5, 10k users in 6 months

### 🌟 Viral Growth Strategy
- [[generate/viral-conversations/viral-conversations.md|Viral Conversations Overview]] - Revolutionary growth through value creation
  - **Core Philosophy**: Invite to conversations, not platforms
  - **Natural Hooks**: Recognition and reciprocal value
  - **Viral Mechanics**: Each conversation spawns more value
  - **Agent Behaviors**: Content amplifier, invitation crafter, collaboration facilitator

- [[generate/viral-conversations/implementation.md|Technical Implementation]] - Building the viral system
  - **AI Agent Integration**: Content analyzer, invitation orchestrator, conversation facilitator
  - **Data Models**: Convex schemas for conversations and invitations
  - **Notification Workflows**: Novu-powered engagement
  - **Analytics & Metrics**: Viral coefficient tracking

- [[generate/viral-conversations/ai-brand-ecosystem.md|AI Brand Ecosystem]] - Complete business model
  - **AI Team Composition**: 6 specialized agents working together
  - **Business Models**: Expert networks, educational empires, service marketplaces
  - **Growth Metrics**: Viral coefficient > 1.5, LTV:CAC > 3:1
  - **Implementation Roadmap**: Month-by-month scaling plan

### 🔧 Technical Architecture
- [[generate/integrations/integrations.md|Integrations Platform]] - Nango, Novu, and external services
  - **Nango**: 300+ APIs with MCP support
  - **Novu**: Multi-channel notifications & UI components
  - **Recall.ai**: Meeting intelligence
  - **OpenRouter**: Multi-model AI access
  - **GitHub & Shopify MCP**: Native integrations

- [[web/generate/monorepo|Monorepo Structure]] - Planned architecture
  - **Apps**: Web (Astro), App (PWA), Desktop/Mobile (Tauri)
  - **Packages**: UI, Schema, Sync, Inference
  - **Content**: Obsidian integration, AI processing

### 📖 Development Guides
- [[Environment Variables.md|Environment Setup]] - Configuration management
- [[Hidden Files Directory.md|All Project Files]] - Complete file access
- [[File Explorer Guide.md|Quick File Access]] - Navigation shortcuts
- [[Switch to Obsidian Guide.md|Obsidian Setup]] - Development environment
- [[Astro Files in Obsidian.md|Astro File Handling]] - VSCode editor integration
- [[All Files Access.md|Universal File Access]] - Working with all file types
- [[Fix Astro Files.md|Troubleshooting]] - File handling fixes

Remember: ONE is not just a codebase—it's a living system that evolves through our collective understanding. Every line of code is an opportunity to bridge human consciousness with artificial intelligence, creating something greater than the sum of its parts.

✨ *"In simplicity, we find complexity. In synchronicity, we find truth. In valuable conversations, we find exponential growth."* ✨