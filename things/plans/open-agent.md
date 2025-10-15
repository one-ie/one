# Open-Agent Assessment & Integration Plan

**Repository**: https://github.com/AFK-surf/open-agent
**Purpose**: Assess open-agent codebase and integrate best practices into ONE

## Overview

Open-Agent is an open-source agentic AI platform that enables collaborative, multi-model AI agents to perform complex tasks across computers, browsers, and phones. Licensed under Apache 2.0.

### Key Characteristics

- **Multi-model integration**: OpenAI, Claude, Gemini, and open-source models
- **Technology Stack**: TypeScript (98.9%), Rust (0.4%)
- **Deployment**: Docker-based with JSON configuration
- **Architecture**: Multi-agent collaboration with modular design

## ONE Architecture Integration Context

### ONE's Three-Layer Architecture

ONE uses a **beautiful three-layer separation** with Effect.ts as the glue:

```
Layer 1: Frontend (Astro + React)
    ↓ Convex hooks, Hono API client
Layer 2: Effect.ts Glue Layer (100% business logic)
    ↓ Services, Providers, Dependency Injection
Layer 3: Backend (Hono API + Convex Database)
```

**Key Principles:**
- **100% Effect.ts coverage** - All business logic uses Effect.ts (no raw async/await)
- **Functional programming** - Pure functions, typed errors, composition, immutability
- **6-dimension ontology (organizations, people, things, connections, events, knowledge)** - entities, connections, events, tags (plain Convex schema)
- **Service-based architecture** - Effect.ts services with automatic dependency injection
- **Multi-provider pattern** - Separate Effect.ts providers per external service

### Mapping Open-Agent to ONE Architecture

**Open-Agent Pattern** → **ONE Implementation**

1. **Multi-model integration** → Effect.ts providers (like multi-chain blockchain)
2. **Agent collaboration** → Effect.ts services orchestrating multiple AI providers
3. **Context engineering** → Service metadata in 6-dimension ontology (organizations, people, things, connections, events, knowledge)
4. **Plugin architecture** → Effect.ts layers for modular services
5. **Task decomposition** → Pure functional composition with Effect.gen

## Assessment Areas

### 1. Architecture & Design Patterns

- [ ] Multi-agent collaboration framework → **Map to Effect.ts orchestration services**
- [ ] Spec & context engineering approach → **Store in 6-dimension ontology (organizations, people, things, connections, events, knowledge) (metadata)**
- [ ] Model integration patterns → **Effect.ts providers per AI model (OpenAI, Claude, Gemini)**
- [ ] Modular component structure → **Effect.ts layers and dependency injection**
- [ ] Inter-agent communication protocols → **Effect.ts service composition**

### 2. Code Organization

- [ ] TypeScript project structure → **Compare with ONE's convex/ structure**
- [ ] Configuration management → **JSON config stored in entities table**
- [ ] Plugin/extension architecture → **Effect.ts layers for plugins**
- [ ] Error handling patterns → **Typed errors with `_tag` pattern (Effect.ts)**
- [ ] Type system usage → **Effect.ts type signatures (errors explicit)**

### 3. Best Practices to Adopt

- [ ] Pre-commit code checks → **Integrate with ONE's development workflow**
- [ ] Docker-based deployment strategy → **Add to ONE deployment options**
- [ ] Configuration-driven design → **Store in Convex entities table**
- [ ] Multi-model abstraction layer → **Effect.ts providers (like SuiProvider, BaseProvider)**
- [ ] Community contribution workflow → **Extend ONE's open-source approach**

### 4. Integration Opportunities for ONE

#### High Priority

- **Multi-model support**: Abstract model interfaces for swappable AI backends
- **Collaboration patterns**: Agent-to-agent communication and task delegation
- **Configuration system**: JSON-based configuration for flexibility
- **Deployment**: Docker containerization for easy distribution

#### Medium Priority

- **Pre-commit hooks**: Code quality automation
- **Context engineering**: Structured decision-making framework
- **Extension system**: Plugin architecture for community contributions

#### Low Priority

- **Community infrastructure**: Discord/documentation patterns
- **Browser/phone integration**: Cross-platform capabilities

## Proposed ONE Multi-Model Architecture

### Pattern: Multi-Model Providers (Mirrors Multi-Chain Pattern)

Just as ONE has separate blockchain providers (SuiProvider, BaseProvider, SolanaProvider), we can implement separate AI model providers:

```typescript
// convex/services/providers/OpenAIProvider.ts
export class OpenAIProvider extends Effect.Service<OpenAIProvider>()("OpenAIProvider", {
  effect: Effect.gen(function* () {
    const config = yield* ConfigService;

    return {
      complete: (prompt: string, options?: CompletionOptions) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => openai.chat.completions.create({
              model: options?.model || "gpt-4",
              messages: [{ role: "user", content: prompt }],
              temperature: options?.temperature || 0.7,
            }),
            catch: (error) => new OpenAIError({ cause: error }),
          });
          return response.choices[0].message.content;
        }).pipe(
          Effect.retry({ times: 3 }),
          Effect.timeout("30 seconds")
        ),

      embeddings: (text: string) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => openai.embeddings.create({
              model: "text-embedding-3-small",
              input: text,
            }),
            catch: (error) => new OpenAIError({ cause: error }),
          });
          return response.data[0].embedding;
        }),
    };
  }),
}) {}

// convex/services/providers/ClaudeProvider.ts
export class ClaudeProvider extends Effect.Service<ClaudeProvider>()("ClaudeProvider", {
  effect: Effect.gen(function* () {
    const config = yield* ConfigService;

    return {
      complete: (prompt: string, options?: CompletionOptions) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => anthropic.messages.create({
              model: options?.model || "claude-sonnet-4",
              messages: [{ role: "user", content: prompt }],
              max_tokens: options?.maxTokens || 1024,
            }),
            catch: (error) => new ClaudeError({ cause: error }),
          });
          return response.content[0].text;
        }).pipe(
          Effect.retry({ times: 3 }),
          Effect.timeout("30 seconds")
        ),
    };
  }),
}) {}

// convex/services/providers/GeminiProvider.ts
export class GeminiProvider extends Effect.Service<GeminiProvider>()("GeminiProvider", {
  effect: Effect.gen(function* () {
    return {
      complete: (prompt: string, options?: CompletionOptions) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => gemini.generateContent({
              model: options?.model || "gemini-pro",
              prompt: prompt,
            }),
            catch: (error) => new GeminiError({ cause: error }),
          });
          return response.text;
        }).pipe(
          Effect.retry({ times: 3 }),
          Effect.timeout("30 seconds")
        ),
    };
  }),
}) {}
```

### Agent Orchestration Service

```typescript
// convex/services/agents/AgentOrchestrator.ts
export class AgentOrchestrator extends Effect.Service<AgentOrchestrator>()(
  "AgentOrchestrator",
  {
    effect: Effect.gen(function* () {
      const openai = yield* OpenAIProvider;
      const claude = yield* ClaudeProvider;
      const gemini = yield* GeminiProvider;
      const db = yield* ConvexDatabase;

      return {
        // Route to appropriate model based on task type or user preference
        executeTask: (task: AgentTask) =>
          Effect.gen(function* () {
            const agent = yield* db.get(task.agentId);

            // Route based on agent metadata
            const result = yield* match(agent.metadata.preferredModel)
              .with("openai", () => openai.complete(task.prompt, task.options))
              .with("claude", () => claude.complete(task.prompt, task.options))
              .with("gemini", () => gemini.complete(task.prompt, task.options))
              .otherwise(() => Effect.fail(new UnsupportedModelError()));

            // Record event in 6-dimension ontology (organizations, people, things, connections, events, knowledge)
            yield* db.insert("events", {
              entityId: task.agentId,
              eventType: "agent_task_completed",
              timestamp: Date.now(),
              metadata: {
                model: agent.metadata.preferredModel,
                prompt: task.prompt,
                result: result.substring(0, 100), // truncated
              },
            });

            return result;
          }).pipe(
            Effect.catchTags({
              OpenAIError: (e) => openai.complete(task.prompt, { model: "gpt-3.5-turbo" }), // fallback
              ClaudeError: (e) => gemini.complete(task.prompt), // fallback
              GeminiError: (e) => openai.complete(task.prompt), // fallback
            })
          ),

        // Multi-agent collaboration (parallel execution)
        collaborateOnTask: (task: CollaborativeTask) =>
          Effect.gen(function* () {
            // Execute subtasks in parallel across different models
            const results = yield* Effect.all(
              [
                openai.complete(task.subtasks[0].prompt),
                claude.complete(task.subtasks[1].prompt),
                gemini.complete(task.subtasks[2].prompt),
              ],
              { concurrency: 3 }
            );

            // Synthesize results
            const synthesis = yield* claude.complete(
              `Synthesize these perspectives: ${results.join("\n\n")}`
            );

            return synthesis;
          }),

        // Agent-to-agent communication via context engineering
        delegateTask: (fromAgent: Id<"entities">, toAgent: Id<"entities">, task: string) =>
          Effect.gen(function* () {
            // Get both agents
            const source = yield* db.get(fromAgent);
            const target = yield* db.get(toAgent);

            // Create connection (delegation relationship)
            yield* db.insert("connections", {
              fromEntityId: fromAgent,
              toEntityId: toAgent,
              relationshipType: "delegates_to",
              metadata: { task, timestamp: Date.now() },
            });

            // Execute on target agent's preferred model
            const provider = match(target.metadata.preferredModel)
              .with("openai", () => openai)
              .with("claude", () => claude)
              .with("gemini", () => gemini)
              .exhaustive();

            const result = yield* provider.complete(task);

            // Record delegation event
            yield* db.insert("events", {
              entityId: toAgent,
              eventType: "agent_task_delegated",
              actorType: "agent",
              actorId: fromAgent,
              timestamp: Date.now(),
              metadata: { task, result: result.substring(0, 100) },
            });

            return result;
          }),
      };
    }),
    dependencies: [
      OpenAIProvider.Default,
      ClaudeProvider.Default,
      GeminiProvider.Default,
      ConvexDatabase.Default,
    ],
  }
) {}
```

### 4-Table Ontology Mapping for Agents

**Entities Table:**
```typescript
{
  _id: "agent_123",
  entityType: "ai_agent",
  name: "Code Review Agent",
  metadata: {
    preferredModel: "claude",  // "openai" | "claude" | "gemini"
    capabilities: ["code_review", "documentation", "testing"],
    systemPrompt: "You are an expert code reviewer...",
    temperature: 0.7,
    maxTokens: 2048,
  }
}
```

**Connections Table:**
```typescript
// Agent collaboration
{
  fromEntityId: "agent_123",
  toEntityId: "agent_456",
  relationshipType: "collaborates_with",
  metadata: { taskTypes: ["code_review", "refactoring"] }
}

// Agent delegation
{
  fromEntityId: "agent_123",
  toEntityId: "agent_789",
  relationshipType: "delegates_to",
  metadata: { task: "Write unit tests", timestamp: 1234567890 }
}
```

**Events Table:**
```typescript
{
  entityId: "agent_123",
  eventType: "agent_task_completed",
  timestamp: 1234567890,
  metadata: {
    model: "claude",
    prompt: "Review this code...",
    tokensUsed: 1500,
    latencyMs: 2300,
  }
}

{
  entityId: "agent_123",
  eventType: "agent_model_switched",
  timestamp: 1234567890,
  metadata: {
    fromModel: "openai",
    toModel: "claude",
    reason: "Rate limit exceeded"
  }
}
```

**New Entity Types for Agents:**
- `ai_agent` - Individual AI agent with model preferences
- `agent_workflow` - Multi-step agent workflow definition
- `agent_context` - Shared context for agent collaboration

**New Connection Types:**
- `collaborates_with` - Agent-to-agent collaboration
- `delegates_to` - Task delegation relationship
- `uses_model` - Agent-to-model preference

**New Event Types:**
- `agent_task_started` - Task execution began
- `agent_task_completed` - Task execution finished
- `agent_task_failed` - Task execution failed
- `agent_model_switched` - Model fallback/switch occurred
- `agent_context_updated` - Shared context modified

### Benefits of This Approach

**Consistency with ONE's Architecture:**
1. Same pattern as multi-chain blockchain (separate providers per model)
2. All business logic in Effect.ts services (no raw async/await)
3. Typed errors throughout (OpenAIError, ClaudeError, GeminiError)
4. Automatic retry, timeout, fallback via Effect.ts
5. Easy to test (mock providers via Effect layers)

**AI-Friendly:**
1. Pure functional composition (predictable)
2. Explicit dependencies (visible in type signatures)
3. Typed errors (exhaustive error handling)
4. Immutable state (no side effects)
5. Composable services (combine agents easily)

**Scalability:**
1. Add new models without changing existing code
2. Agent collaboration via service composition
3. Context engineering via 6-dimension ontology (organizations, people, things, connections, events, knowledge)
4. Performance tracking via events table
5. Multi-tenant agent configurations

## Code Deep Dive Tasks

### Phase 1: Discovery

1. Clone repository and examine core architecture clone into /import/open-agent
2. Identify key abstractions and interfaces
3. Map out agent lifecycle and communication flow
4. Analyze model integration patterns

### Phase 2: Pattern Extraction

1. Document reusable design patterns
2. Extract configuration schemas
3. Identify testable components
4. Review error handling strategies

### Phase 3: Integration Planning

1. Map open-agent patterns to ONE architecture
2. Identify conflicts or redundancies
3. Design integration approach
4. Create migration/enhancement roadmap

## Key Questions to Answer

### Open-Agent Implementation Details

1. How does open-agent handle multi-model switching and fallbacks?
   - **ONE approach**: Effect.ts `catchTags` for typed error handling, automatic fallback to alternative models
2. What is the agent communication protocol?
   - **ONE approach**: Effect.ts service composition, connections table for delegation tracking
3. How are tasks decomposed and distributed?
   - **ONE approach**: Pure functional composition with Effect.gen, parallel execution with Effect.all
4. What context management strategies are used?
   - **ONE approach**: Store in 6-dimension ontology (organizations, people, things, connections, events, knowledge) metadata, immutable state
5. How is state maintained across agent interactions?
   - **ONE approach**: Events table for audit trail, connections table for relationships
6. What security measures are implemented?
   - **ONE approach**: Better Auth integration, Convex validation, typed inputs
7. How is the Docker deployment configured?
   - **ONE approach**: Add to deployment options, keep Cloudflare Pages/Workers primary
8. What testing strategies are employed?
   - **ONE approach**: Mock Effect layers, unit tests for services, integration tests for Hono routes

### Functional Programming Evaluation Criteria

When reviewing open-agent code, assess against ONE's principles:

**✅ Good Patterns (Adopt):**
- Pure functions (same input → same output)
- Immutable data structures
- Explicit type signatures
- Composable abstractions
- Clear error handling

**❌ Anti-Patterns (Refactor to Effect.ts):**
- Raw async/await in business logic → Effect.ts services
- try/catch error handling → Typed errors with `_tag`
- Global state mutation → Immutable state in ontology
- Imperative loops → Functional composition (map, filter, reduce)
- Hidden dependencies → Explicit Effect.ts dependencies

**📊 Comparison Matrix:**

| Aspect | Open-Agent (Expected) | ONE Architecture | Integration Strategy |
|--------|----------------------|------------------|----------------------|
| Async handling | async/await | Effect.ts | Wrap in Effect.tryPromise |
| Error handling | try/catch | Typed errors | Define error classes with `_tag` |
| State management | Variables/objects | 6-dimension ontology (organizations, people, things, connections, events, knowledge) | Map to entities/connections/events |
| Model switching | if/switch | Effect.catchTags | Use typed error fallbacks |
| Task composition | Promises | Effect.gen | Convert to Effect pipelines |
| Dependencies | Imports | Effect DI | Define as Effect services |
| Testing | Mocks/stubs | Effect layers | Create test layers |
| Configuration | JSON files | Entities table | Store in database |

## Enhancement Roadmap for ONE

### Phase 1: Foundation (1-2 weeks)

**Goal**: Implement core multi-model infrastructure following ONE's patterns

1. **Multi-Model Providers** (Effect.ts services)
   - [ ] Create `OpenAIProvider.ts` (Effect.ts service)
   - [ ] Create `ClaudeProvider.ts` (Effect.ts service)
   - [ ] Create `GeminiProvider.ts` (Effect.ts service)
   - [ ] Define typed errors (OpenAIError, ClaudeError, GeminiError)
   - [ ] Add retry/timeout/fallback logic per provider
   - [ ] Write unit tests with mocked Effect layers

2. **4-Table Ontology Extensions**
   - [ ] Add `ai_agent` entity type to schema
   - [ ] Add `agent_workflow` entity type
   - [ ] Add `collaborates_with`, `delegates_to` connection types
   - [ ] Add `agent_task_*` event types
   - [ ] Update docs/Ontology.md with agent types

3. **Development Workflow Improvements**
   - [ ] Analyze open-agent's pre-commit hooks
   - [ ] Integrate useful checks into ONE's workflow
   - [ ] Add Docker deployment configuration (optional alternative to Cloudflare)

**Files to Create:**
```
convex/services/providers/OpenAIProvider.ts
convex/services/providers/ClaudeProvider.ts
convex/services/providers/GeminiProvider.ts
convex/services/providers/errors.ts
convex/services/agents/AgentOrchestrator.ts
tests/unit/services/providers/openai.test.ts
tests/unit/services/providers/claude.test.ts
tests/unit/services/agents/orchestrator.test.ts
```

### Phase 2: Agent Orchestration (3-4 weeks)

**Goal**: Build collaborative multi-agent system with Effect.ts

1. **AgentOrchestrator Service**
   - [ ] Implement `executeTask` (route to correct model)
   - [ ] Implement `collaborateOnTask` (parallel execution)
   - [ ] Implement `delegateTask` (agent-to-agent communication)
   - [ ] Add automatic fallback on model failures
   - [ ] Track performance metrics in events table

2. **Context Engineering**
   - [ ] Design context storage schema (metadata in entities)
   - [ ] Implement context sharing between agents
   - [ ] Build context versioning (track in events)
   - [ ] Add context pruning/optimization strategies

3. **Hono API Routes**
   - [ ] POST `/api/agents/create` - Create new agent
   - [ ] POST `/api/agents/:id/execute` - Execute task
   - [ ] POST `/api/agents/:id/delegate` - Delegate to another agent
   - [ ] GET `/api/agents/:id/performance` - Get metrics

**Files to Create:**
```
convex/services/agents/AgentOrchestrator.ts
convex/services/agents/ContextManager.ts
convex/mutations/agents.ts
convex/queries/agents.ts
hono/routes/agents.ts
src/components/features/agents/AgentDashboard.tsx
src/components/features/agents/AgentExecutor.tsx
```

### Phase 3: Advanced Features (2-3 months)

**Goal**: Complete multi-agent workflows, optimization, extensibility

1. **Workflow Engine**
   - [ ] Define workflow DSL (stored in `agent_workflow` entities)
   - [ ] Implement workflow executor (Effect.ts service)
   - [ ] Support conditional branching, loops, parallel steps
   - [ ] Add workflow versioning and rollback

2. **Plugin Architecture**
   - [ ] Design plugin interface (Effect.ts layers)
   - [ ] Implement plugin discovery/loading
   - [ ] Create example plugins (custom tools, data sources)
   - [ ] Document plugin development guide

3. **Performance Optimization**
   - [ ] Implement intelligent model routing (cost/speed/quality)
   - [ ] Add response caching (deduplicate similar prompts)
   - [ ] Build rate limiting per model
   - [ ] Create observability dashboard (traces, logs, metrics)

4. **Cross-Platform Integration** (from open-agent)
   - [ ] Browser automation capabilities
   - [ ] Mobile integration patterns
   - [ ] Desktop application support

**Files to Create:**
```
convex/services/agents/WorkflowEngine.ts
convex/services/agents/PluginManager.ts
convex/services/agents/CacheManager.ts
convex/services/agents/PerformanceOptimizer.ts
docs/Agents.md (comprehensive agent documentation)
docs/Plugins.md (plugin development guide)
```

### Success Metrics

**Technical Metrics:**
- [ ] 100% Effect.ts coverage in agent services (no raw async/await)
- [ ] All errors typed with `_tag` pattern
- [ ] >80% unit test coverage for agent services
- [ ] <100ms overhead for agent orchestration (excluding model latency)
- [ ] Support 3+ AI models with automatic fallback

**Feature Metrics:**
- [ ] Multi-model task execution working
- [ ] Agent collaboration (parallel + delegation) working
- [ ] Context sharing between agents
- [ ] Workflow engine executing multi-step tasks
- [ ] Plugin system allowing community extensions

**Integration Metrics:**
- [ ] All agent types mapped to 6-dimension ontology (organizations, people, things, connections, events, knowledge)
- [ ] All agent operations tracked in events table
- [ ] Agent configuration stored in entities table
- [ ] Agent collaboration tracked in connections table
- [ ] Real-time agent status updates via Convex subscriptions

## Resources & References

**Open-Agent:**
- Repository: https://github.com/AFK-surf/open-agent
- License: Apache 2.0
- Tech Stack: TypeScript (98.9%), Rust (0.4%), Docker
- Community: Discord (check repository for link)

**ONE Architecture Docs:**
- `docs/Architecture.md` - Three-layer architecture, Effect.ts patterns
- `docs/Ontology.md` - 6-dimension ontology (organizations, people, things, connections, events, knowledge) (entities, connections, events, tags)
- `docs/Hono.md` - Effect.ts services, Hono API routes
- `docs/Frontend.md` - Astro + React patterns
- `docs/Service Providers.md` - External service integration patterns

**Effect.ts Resources:**
- Official Docs: https://effect.website
- Effect.ts patterns in ONE: See `convex/services/` for examples
- Multi-chain example: `convex/services/providers/SuiProvider.ts` (template for AI providers)

## Quick Reference for Developers

### Implementing a New AI Model Provider

**Template** (follow existing pattern from SuiProvider/BaseProvider):
```typescript
// convex/services/providers/NewModelProvider.ts
import { Effect } from "effect";

// 1. Define typed error
export class NewModelError extends Data.TaggedError("NewModelError")<{
  cause: unknown;
}> {}

// 2. Create Effect.ts service
export class NewModelProvider extends Effect.Service<NewModelProvider>()(
  "NewModelProvider",
  {
    effect: Effect.gen(function* () {
      const config = yield* ConfigService;

      return {
        complete: (prompt: string, options?: CompletionOptions) =>
          Effect.gen(function* () {
            const response = yield* Effect.tryPromise({
              try: () => /* API call */,
              catch: (error) => new NewModelError({ cause: error }),
            });
            return response.text;
          }).pipe(
            Effect.retry({ times: 3 }),
            Effect.timeout("30 seconds")
          ),
      };
    }),
    dependencies: [ConfigService.Default],
  }
) {}
```

### Adding Agent to 4-Table Ontology

**Entity:**
```typescript
await ctx.db.insert("entities", {
  entityType: "ai_agent",
  name: "My Agent",
  metadata: {
    preferredModel: "claude",
    systemPrompt: "...",
    capabilities: ["code", "writing"],
  },
});
```

**Connection (collaboration):**
```typescript
await ctx.db.insert("connections", {
  fromEntityId: agent1Id,
  toEntityId: agent2Id,
  relationshipType: "collaborates_with",
  metadata: { taskTypes: ["code_review"] },
});
```

**Event (task completion):**
```typescript
await ctx.db.insert("events", {
  entityId: agentId,
  eventType: "agent_task_completed",
  timestamp: Date.now(),
  metadata: { model: "claude", tokensUsed: 1500 },
});
```

### Testing Agent Services

**Unit Test Template:**
```typescript
import { Effect, Layer } from "effect";

describe("AgentOrchestrator", () => {
  it("should execute task with correct model", async () => {
    // Mock providers
    const MockClaude = Layer.succeed(ClaudeProvider, {
      complete: () => Effect.succeed("response"),
    });

    const TestLayer = Layer.mergeAll(MockClaude, /* ... */);

    // Run test
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const orchestrator = yield* AgentOrchestrator;
        return yield* orchestrator.executeTask(task);
      }).pipe(Effect.provide(TestLayer))
    );

    expect(result).toBe("response");
  });
});
```

## Notes & Observations

### Key Insights from ONE Architecture Review

1. **Effect.ts is non-negotiable** - 100% coverage means ALL business logic, including agent orchestration
2. **Multi-provider pattern is proven** - Same pattern used for multi-chain blockchain works perfectly for multi-model AI
3. **6-dimension ontology (organizations, people, things, connections, events, knowledge) is flexible** - Can model complex agent relationships without schema changes
4. **Typed errors everywhere** - No try/catch, all errors explicit in type signatures
5. **Composition over configuration** - Services compose naturally, no complex config files needed

### What to Look for in Open-Agent Codebase

**✅ Patterns to Adopt:**
- Context management strategies
- Multi-agent communication protocols
- Task decomposition approaches
- Model selection heuristics
- Performance optimization techniques

**⚠️ Patterns to Adapt (refactor to Effect.ts):**
- Any raw async/await → Effect.gen
- Any try/catch → typed errors with catchTags
- Any global state → 6-dimension ontology (organizations, people, things, connections, events, knowledge)
- Any imperative loops → functional composition
- Any hidden dependencies → explicit Effect services

### Next Steps After Cloning

1. **Map their architecture to ours:**
   - Their agent system → Our AgentOrchestrator service
   - Their model switching → Our multi-provider pattern
   - Their state → Our 6-dimension ontology (organizations, people, things, connections, events, knowledge)
   - Their config → Our entities table metadata

2. **Extract patterns, not code:**
   - Don't copy their implementation verbatim
   - Understand their approach, implement in Effect.ts
   - Maintain ONE's architectural consistency
   - All business logic must be pure functional

3. **Document learnings:**
   - Update this file with observations
   - Create docs/Agents.md with implementation guide
   - Add examples to docs/Patterns.md
   - Update docs/Ontology.md with agent types

---

**Status**: Enhanced Plan Complete - Ready for Phase 1 Discovery
**Last Updated**: 2025-10-10
**Next Action**: Clone repository to `/import/open-agent` and begin Phase 1 analysis
