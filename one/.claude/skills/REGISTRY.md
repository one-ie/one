# Agent Skills Registry

**Last Updated:** 2025-10-27
**Status:** Foundation Phase
**Version:** 1.0.0

Complete registry of all available agent skills for the ONE Platform.

---

## Overview

Agent skills are modular capabilities that extend Claude's functionality during agent execution. This registry documents all available skills organized by agent.

### How Skills Work

1. **Discovery**: Skills are discovered from `.claude/skills/agent-*.md` files
2. **Metadata Loading**: Skill name and description load immediately (~50 tokens)
3. **On-Demand Loading**: Detailed instructions load when skill is triggered (~500-2000 tokens)
4. **Auto-Invocation**: Claude uses skills automatically when relevant to the task

### Skill File Format

```yaml
---
name: agent-name:skill-name
description: Brief description (max 1024 characters)
---

# Skill Title

## Purpose
What problem does this solve?

## Instructions
Step-by-step guidance.

## Examples
Concrete code examples.
```

---

## Agent Skills by Category

### Backend Agent Skills

**Agent:** `agent-backend`
**Purpose:** Implement Convex backend infrastructure for 6-dimension ontology
**Tools:** Read, Write, Edit, Bash, Grep, Glob
**Context Budget:** 3000 tokens

#### 1. `agent-backend:create-mutation`
- **Description:** Generate Convex mutations with 6-dimension validation, event logging, and org scoping
- **File:** `.claude/skills/agent-backend-create-mutation.md`
- **Use Cases:**
  - Implementing write operations
  - Creating CRUD mutations
  - Building state-change operations
  - Adding event logging
- **Key Features:**
  - Authentication validation
  - Organization quota checking
  - Event logging for audit trail
  - Dimension 3, 4, 5 operations (things, connections, events)
  - Multi-tenant isolation
- **Token Cost:** ~500 tokens (instructions) + ~2000 tokens (examples)

#### 2. `agent-backend:create-query`
- **Description:** Generate Convex queries with filtering, pagination, and org scoping
- **File:** (referenced, needs creation)
- **Use Cases:**
  - Implementing read operations
  - Building list queries
  - Filtering and pagination
  - Organization-scoped queries
- **Key Features:**
  - Index optimization
  - Organization filtering
  - Pagination support
  - Type-safe arguments
  - Efficient queries

#### 3. `agent-backend:design-schema`
- **Description:** Design Convex schema implementing the 6-dimension ontology
- **File:** (referenced, needs creation)
- **Use Cases:**
  - Creating new tables
  - Designing entity types
  - Planning indexes
  - Multi-tenant scoping
- **Key Features:**
  - 6-dimension mapping
  - Index strategy
  - Quota tracking
  - Event logging
  - Organization isolation

---

### Frontend Agent Skills

**Agent:** `agent-frontend`
**Purpose:** Build Astro 5 + React 19 UIs that render 6-dimension ontology
**Tools:** Read, Write, Edit, Bash, Grep, Glob
**Context Budget:** 3000 tokens

#### 1. `agent-frontend:create-page`
- **Description:** Generate Astro pages with SSR, React islands, Convex queries, and role-based rendering
- **File:** `.claude/skills/agent-frontend-create-page.md`
- **Use Cases:**
  - Creating new public pages
  - Building list pages
  - Implementing detail pages
  - Organization-scoped pages
  - Role-based access control
- **Key Features:**
  - Server-side rendering (SSR)
  - Strategic React islands
  - Convex data fetching at build time
  - Organization scoping
  - Role-based rendering
  - Image optimization
  - 90+ Lighthouse score optimization
- **Token Cost:** ~500 tokens (instructions) + ~2000 tokens (examples)

#### 2. `agent-frontend:create-component`
- **Description:** Generate React components with Convex hooks, shadcn/ui, and proper state management
- **File:** (referenced, needs creation)
- **Use Cases:**
  - Building interactive components
  - Creating forms with validation
  - Building real-time features
  - Entity display components
- **Key Features:**
  - Convex useQuery/useMutation hooks
  - shadcn/ui component composition
  - React Hook Form integration
  - Zod validation
  - Loading/error states
  - Accessibility compliance

#### 3. `agent-frontend:optimize-performance`
- **Description:** Optimize Lighthouse scores with code splitting, image optimization, and lazy loading
- **File:** (referenced, needs creation)
- **Use Cases:**
  - Improving Core Web Vitals
  - Reducing JavaScript bundle
  - Optimizing images
  - Implementing lazy loading
- **Key Features:**
  - Core Web Vitals targets
  - Code splitting strategies
  - Image optimization
  - CSS critical path
  - Performance budgeting

---

### Designer Agent Skills

**Agent:** `agent-designer`
**Purpose:** Create test-driven wireframes, components specs, and design tokens
**Tools:** Read, Write, Edit, Bash, Grep, Glob
**Context Budget:** 2000 tokens

#### 1. `agent-designer:create-wireframe`
- **Description:** Generate wireframes from feature specs and tests that enable acceptance criteria to pass
- **File:** `.claude/skills/agent-designer-create-wireframe.md`
- **Use Cases:**
  - Converting tests to visual designs
  - Planning feature interfaces
  - Specifying component structure
  - Creating layout specifications
  - Designing for accessibility
- **Key Features:**
  - Test-driven design approach
  - Acceptance criteria mapping
  - All states specified (default, loading, error, success)
  - Responsive breakpoints (320px, 768px, 1024px, 1440px)
  - WCAG 2.1 AA validation
  - Component hierarchy
  - No design ambiguity
- **Token Cost:** ~500 tokens (instructions) + ~1500 tokens (examples)

#### 2. `agent-designer:define-components`
- **Description:** Define React component specifications with props, state, and implementation guidance
- **File:** (referenced, needs creation)
- **Use Cases:**
  - Creating component APIs
  - Specifying props and types
  - Planning state management
  - Writing implementation guides
- **Key Features:**
  - TypeScript props interfaces
  - State management patterns
  - shadcn/ui component usage
  - Loading/error states
  - Example implementations

#### 3. `agent-designer:set-design-tokens`
- **Description:** Generate design tokens from organization brand guidelines with WCAG validation
- **File:** (referenced, needs creation)
- **Use Cases:**
  - Creating design token systems
  - Implementing brand guidelines
  - Generating Tailwind v4 themes
  - Validating color contrast
- **Key Features:**
  - Brand color extraction
  - WCAG AA contrast validation
  - Tailwind v4 @theme format
  - Dark mode support
  - Spacing/typography scales

---

### Quality Agent Skills

**Agent:** `agent-quality`
**Purpose:** Define tests, validate implementations, ensure ontology alignment
**Tools:** Read, Write, Edit, Bash, Grep, Glob
**Skills:** (to be defined)

---

### Director Agent Skills

**Agent:** `agent-director`
**Purpose:** Orchestrate workflow, coordinate agents, manage execution
**Tools:** Read, Write, Edit, Bash, Grep, Glob
**Skills:** (to be defined)

---

### Documentation Agent Skills

**Agent:** `agent-documenter`
**Purpose:** Write documentation and capture lessons learned
**Tools:** Read, Write, Edit, Bash, Grep, Glob
**Skills:** (to be defined)

---

### Operations Agent Skills

**Agent:** `agent-ops`
**Purpose:** DevOps, CI/CD, infrastructure, deployments
**Tools:** Read, Write, Edit, Bash, Grep, Glob, SlashCommand, WebFetch
**Skills:** (to be defined)

---

### Problem-Solver Agent Skills

**Agent:** `agent-problem-solver`
**Purpose:** Analyze failures, identify root causes, propose solutions
**Tools:** Read, Write, Edit, Bash, Grep, Glob
**Skills:** (to be defined)

---

### Other Agent Skills

Additional agents with skills to be defined:
- `agent-builder` - Feature implementation coordination
- `agent-clean` - Code quality and refactoring
- `agent-clone` - Data migration and AI clones
- `agent-integrator` - Protocol integrations
- `agent-lawyer` - Legal and compliance
- `agent-onboard` - Website generation
- `agent-sales` - Lead qualification and demos

---

## Skill Discovery and Loading

### Progressive Token Loading

```
Skill Metadata (Always Loaded)
├── name: "agent-backend:create-mutation"
├── description: "Generate Convex mutations..."
└── Cost: ~50 tokens

                    ↓ [Skill Triggered]

Skill Instructions (Loaded on Demand)
├── Purpose section
├── Instructions section
├── Patterns section
└── Cost: ~500 tokens

                    ↓ [Examples Needed]

Skill Examples (Loaded if Needed)
├── Code examples
├── Walkthroughs
├── Related skills
└── Cost: ~1500 tokens
```

### Token Budget Management

Each agent has a context budget for skills:

| Agent | Budget | Current Use | Available |
|-------|--------|-------------|-----------|
| agent-backend | 3000 | 1050 | 1950 |
| agent-frontend | 3000 | 1050 | 1950 |
| agent-designer | 2000 | 700 | 1300 |
| agent-quality | 2500 | 0 | 2500 |
| agent-director | 3500 | 0 | 3500 |
| agent-ops | 3500 | 0 | 3500 |

### Auto-Discovery Rules

Skills are auto-discovered when:

1. File exists: `.claude/skills/agent-{name}-{skill-name}.md`
2. YAML frontmatter with `name` and `description`
3. Referenced in agent's `skills:` field in frontmatter
4. Agent is invoked via Task tool with `subagent_type`

---

## Creating New Skills

### Step 1: Create Skill File

```bash
cat > .claude/skills/agent-{name}-{skill-name}.md << 'EOF'
---
name: agent-name:skill-name
description: What this skill does (max 1024 chars)
---

# Skill Title

## Purpose
What problem does this solve?

## Instructions
Step-by-step guidance.

## Examples
Concrete code examples.

## Related Skills
Links to complementary skills.

## Version History
- **1.0.0** (2025-10-27): Initial implementation
EOF
```

### Step 2: Add to Agent Frontmatter

```yaml
---
name: agent-name
description: Agent description
tools: Read, Write, Edit
skills: agent-name:skill-1, agent-name:skill-2, agent-name:skill-3
---
```

### Step 3: Test Discovery

Skills will be auto-discovered when agent is invoked.

---

## Best Practices

### 1. Keep Skills Focused
- One skill = one clear task
- Examples: "create-mutation", "validate-query", "optimize-index"

### 2. Include Examples
- Concrete code samples (before/after)
- Real-world use cases
- Variations and edge cases

### 3. Document Dependencies
- Link to related skills
- Mention prerequisites
- Note version compatibility

### 4. Version Your Skills
- Track changes in version history
- Update when requirements change
- Maintain backwards compatibility

### 5. Progressive Detail
- Metadata (name, description) ~100 tokens
- Instructions ~500 tokens
- Examples/resources ~2000 tokens (on-demand)

### 6. Multi-Tenant Awareness
- Include groupId/organizationId in examples
- Show organization scoping
- Demonstrate isolation boundaries

### 7. 6-Dimension Mapping
- Every skill should reference applicable dimensions
- Show how skill maps to ontology
- Include entity types, connection types, event types

---

## Integration with Agent Lifecycle

```
User Request
    ↓
Invoke Agent via Task Tool
    ↓
Agent Initialized
    ↓
Skills Discovered
    │
    ├─→ Metadata Loaded (~50 tokens)
    │
    └─→ [Agent works on task]
            ↓
        Skill Needed?
            ↓
        Instructions Loaded (~500 tokens)
            ↓
        Example Needed?
            ↓
        Examples Loaded (~1500 tokens)
            ↓
        Agent Executes Skill
            ↓
[Task Complete]
```

---

## Troubleshooting

### Skill Not Found
```
❌ Symptom: "Skill not found"
✅ Solution:
1. Check directory: `.claude/skills/agent-{name}-{skill}.md`
2. Verify YAML frontmatter with `name` field
3. Check skill is referenced in agent's `skills:` field
```

### Token Overload
```
❌ Symptom: "Agent hitting token limits"
✅ Solution:
1. Reduce instruction size (keep under 500 tokens)
2. Move examples to knowledge base
3. Link to detailed docs instead of including inline
4. Use summary format in instructions
```

### Outdated Skill
```
❌ Symptom: "Skill produces outdated code"
✅ Solution:
1. Update version in "## Version History"
2. Test with actual agent
3. Document breaking changes
4. Add migration guide if needed
```

---

## Performance Targets

### Metadata Load Time
- **Target:** < 100ms
- **Budget:** ~50 tokens
- **Caching:** Session-level

### Skill Invocation Time
- **Target:** < 500ms
- **Budget:** ~500 tokens (instructions)
- **Caching:** Session-level

### Example Loading Time
- **Target:** < 1000ms
- **Budget:** ~1500 tokens
- **Caching:** Request-level

---

## Related Documentation

- [Claude Code Agent System](./agents/README.md)
- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [6-Dimension Ontology](../one/knowledge/ontology.md)
- [Backend Agent](./agents/agent-backend.md)
- [Frontend Agent](./agents/agent-frontend.md)
- [Designer Agent](./agents/agent-designer.md)

---

## Next Steps

### Immediate (This Phase)
- [x] Create foundational skills for backend, frontend, designer
- [x] Add skills to agent frontmatter
- [ ] Create skills for quality, director, ops agents
- [ ] Document skill examples comprehensively

### Short-Term (Next Phase)
- [ ] Create skills for remaining agents (builder, clean, clone, etc.)
- [ ] Build skill discovery UI
- [ ] Implement skill caching optimization
- [ ] Create skill testing framework

### Long-Term (Future)
- [ ] Skill marketplace for sharing
- [ ] Community-contributed skills
- [ ] Version management system
- [ ] AI-generated skill optimization

---

**Status:** Foundation Phase Complete
**Maintained By:** Engineering Team
**Last Review:** 2025-10-27
