# Claude Code Skills Directory

**Purpose:** Home directory for all agent skills for the ONE Platform
**Status:** Foundation Phase
**Last Updated:** 2025-10-27

---

## 📚 Quick Navigation

### Essential Reading
1. **[REGISTRY.md](./REGISTRY.md)** - Complete skill inventory, discovery mechanism, best practices
2. **[agents/README.md](./agents/README.md)** - How agent skills work, skill organization, creation guide

### Available Skills (3 Foundational)
- **[agent-backend:create-mutation](./agent-backend-create-mutation.md)** - Generate Convex mutations
- **[agent-frontend:create-page](./agent-frontend-create-page.md)** - Generate Astro pages with SSR
- **[agent-designer:create-wireframe](./agent-designer-create-wireframe.md)** - Generate test-driven wireframes

### Skill Categories

**By Agent:**
- [Backend Agent Skills](#backend-agent-skills)
- [Frontend Agent Skills](#frontend-agent-skills)
- [Designer Agent Skills](#designer-agent-skills)
- [Other Agents](#other-agents)

**By Category:**
- [Schema & Data](#schema--data)
- [User Interface](#user-interface)
- [Design & Layout](#design--layout)
- [Quality & Testing](#quality--testing)
- [Operations & DevOps](#operations--devops)

---

## 🏗️ Directory Structure

```
.claude/skills/
├── INDEX.md                              # This file
├── REGISTRY.md                           # Complete skill registry (529 lines)
├── agents/                               # Agent skill organization
│   └── README.md                         # How to create agent skills
├── agent-backend-create-mutation.md      # ✅ Backend skill 1/3
├── agent-frontend-create-page.md         # ✅ Frontend skill 1/3
├── agent-designer-create-wireframe.md    # ✅ Designer skill 1/3
├── astro/                                # Astro-specific skills
├── convex/                               # Convex-specific skills
├── deployment/                           # Deployment skills
├── design/                               # Design skills
├── documentation/                        # Documentation skills
├── integration/                          # Integration skills
├── ontology/                             # Ontology skills
├── problem-solving/                      # Problem-solving skills
├── sales/                                # Sales skills
└── testing/                              # Testing skills
```

---

## Backend Agent Skills

### 1. ✅ `agent-backend:create-mutation` (Complete)

**File:** `agent-backend-create-mutation.md` (8.3 KB)

Generate Convex mutations with:
- Authentication validation
- Organization quota checking
- Event logging for audit trail
- 6-dimension ontology operations
- Multi-tenant isolation

**When to Use:**
- Implementing write operations
- Creating CRUD mutations
- Building state-change operations
- Adding event logging

**Example:** Full course creation mutation with all 8 steps

---

### 2. ⏳ `agent-backend:create-query` (Planned)

Generate optimized Convex queries with:
- Index selection and optimization
- Organization filtering
- Pagination support
- Type-safe arguments

**When to Use:**
- Implementing read operations
- Building list queries
- Filtering and searching
- Complex queries with joins

---

### 3. ⏳ `agent-backend:design-schema` (Planned)

Design Convex schema implementing 6-dimension ontology:
- Table design for groups, entities, connections, events, knowledge
- Index strategy
- Quota tracking
- Organization isolation

**When to Use:**
- Creating new tables
- Designing entity types
- Planning indexes
- Multi-tenant scoping

---

## Frontend Agent Skills

### 1. ✅ `agent-frontend:create-page` (Complete)

**File:** `agent-frontend-create-page.md` (10 KB)

Generate Astro pages with:
- Server-side rendering (SSR)
- Strategic React islands for interactivity
- Convex data fetching at build time
- Organization scoping and role-based rendering
- Image optimization
- 90+ Lighthouse score targets

**When to Use:**
- Creating new public pages
- Building list pages
- Implementing detail pages
- Organization-scoped pages
- Role-based access control

**Example:** Full course detail page with islands and SSR

---

### 2. ⏳ `agent-frontend:create-component` (Planned)

Generate React components with:
- Convex useQuery/useMutation hooks
- shadcn/ui component composition
- React Hook Form integration
- Zod validation
- Loading/error states
- Accessibility compliance

**When to Use:**
- Building interactive components
- Creating forms with validation
- Building real-time features
- Entity display components

---

### 3. ⏳ `agent-frontend:optimize-performance` (Planned)

Optimize Lighthouse scores with:
- Core Web Vitals targets
- Code splitting strategies
- Image optimization
- CSS critical path optimization
- Performance budgeting

**When to Use:**
- Improving Core Web Vitals (LCP, FID, CLS)
- Reducing JavaScript bundle size
- Optimizing images
- Implementing lazy loading

---

## Designer Agent Skills

### 1. ✅ `agent-designer:create-wireframe` (Complete)

**File:** `agent-designer-create-wireframe.md` (11 KB)

Generate test-driven wireframes with:
- Acceptance criteria to UI element mapping
- All states specified (default, loading, error, success, empty)
- Responsive breakpoints (320px, 768px, 1024px, 1440px)
- WCAG 2.1 AA accessibility validation
- Component hierarchy and layout patterns
- No design ambiguity for developers

**When to Use:**
- Converting tests to visual designs
- Planning feature interfaces
- Specifying component structure
- Creating layout specifications
- Designing for accessibility

**Example:** Course enrollment page with all states and responsiveness

---

### 2. ⏳ `agent-designer:define-components` (Planned)

Define React component specifications with:
- TypeScript props interfaces
- State management patterns
- shadcn/ui component usage
- Loading/error states
- Example implementations
- Implementation guidance

**When to Use:**
- Creating component APIs
- Specifying props and types
- Planning state management
- Writing implementation guides

---

### 3. ⏳ `agent-designer:set-design-tokens` (Planned)

Generate design tokens from brand guidelines:
- Brand color extraction
- WCAG AA contrast validation
- Tailwind v4 @theme format
- Dark mode support
- Spacing and typography scales

**When to Use:**
- Creating design token systems
- Implementing brand guidelines
- Generating Tailwind v4 themes
- Validating color contrast

---

## Other Agents

### Quality Agent Skills (Planned)
- `agent-quality:define-tests` - Test requirement definition
- `agent-quality:write-tests` - Test implementation
- `agent-quality:validate-ontology` - Ontology compliance

### Director Agent Skills (Planned)
- `agent-director:plan-feature` - Feature planning and sequencing
- `agent-director:coordinate-agents` - Agent orchestration
- `agent-director:manage-inference` - Inference workflow management

### Operations Agent Skills (Planned)
- `agent-ops:deploy-web` - Cloudflare Pages deployment
- `agent-ops:deploy-backend` - Convex deployment
- `agent-ops:ci-cd-setup` - CI/CD pipeline configuration

### Documentation Agent Skills (Planned)
- `agent-documenter:write-docs` - Documentation generation
- `agent-documenter:update-changelog` - Changelog management
- `agent-documenter:capture-lessons` - Lessons learned

### Other Agents (Placeholder)
- `agent-builder` - Feature implementation coordination
- `agent-clean` - Code quality and refactoring
- `agent-clone` - Data migration and AI clones
- `agent-integrator` - Protocol integrations
- `agent-lawyer` - Legal and compliance
- `agent-onboard` - Website generation
- `agent-sales` - Lead qualification and demos
- `agent-problem-solver` - Root cause analysis

---

## 🎯 How to Use Skills

### For Users

When you invoke an agent via the Task tool, skills are auto-discovered and available:

```
User: Implement a course creation feature
  ↓
Invoke: Task tool with subagent_type=agent-backend
  ↓
Agent discovers: agent-backend:create-mutation skill
  ↓
Agent auto-invokes skill when relevant
  ↓
Skill provides tested patterns and examples
```

### For Developers

To create a new skill:

1. **Create skill file:**
```bash
cat > .claude/skills/agent-{name}-{skill}.md << 'EOF'
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
- **1.0.0** (date): Initial implementation
EOF
```

2. **Add to agent frontmatter:**
```yaml
---
name: agent-name
skills: agent-name:skill-1, agent-name:skill-2
---
```

3. **Test discovery** - Agent will auto-discover when invoked

---

## 📊 Skill Inventory

### Status Summary

| Category | Implemented | Planned | Total |
|----------|-------------|---------|-------|
| Backend | 1 | 2 | 3 |
| Frontend | 1 | 2 | 3 |
| Designer | 1 | 2 | 3 |
| Quality | 0 | 3 | 3 |
| Director | 0 | 3 | 3 |
| Operations | 0 | 3 | 3 |
| Documentation | 0 | 3 | 3 |
| Other Agents | 0 | 8 | 8 |
| **TOTAL** | **3** | **26** | **29** |

### Implementation Progress

```
████████░░░░░░░░░░░░░░░░░░░░░░  10% Complete (3/29 skills)

Next Phase:
- Quality agent (tests, validation)
- Operations agent (deployment)
- Director agent (orchestration)
```

---

## 📖 Documentation Files

### Core Documentation
- **[REGISTRY.md](./REGISTRY.md)** (529 lines)
  - Complete skill inventory
  - Discovery mechanism
  - Token budgets
  - Best practices
  - Troubleshooting
  - Performance targets

- **[agents/README.md](./agents/README.md)** (238 lines)
  - Skill organization
  - File structure
  - Naming conventions
  - Usage examples
  - Best practices
  - Integration lifecycle

### Category Directories
- **[astro/](./astro/)** - Astro framework skills
- **[convex/](./convex/)** - Convex backend skills
- **[deployment/](./deployment/)** - Deployment skills
- **[design/](./design/)** - Design system skills
- **[documentation/](./documentation/)** - Documentation skills
- **[integration/](./integration/)** - Integration skills
- **[ontology/](./ontology/)** - Ontology skills
- **[problem-solving/](./problem-solving/)** - Debugging skills
- **[sales/](./sales/)** - Sales and demo skills
- **[testing/](./testing/)** - Testing skills

---

## 🚀 Getting Started

### Read First
1. **[REGISTRY.md](./REGISTRY.md)** - Understand what skills are and how they work
2. **[agents/README.md](./agents/README.md)** - Learn how to use and create skills

### See Examples
1. **[agent-backend:create-mutation](./agent-backend-create-mutation.md)** - Backend mutation generation
2. **[agent-frontend:create-page](./agent-frontend-create-page.md)** - Frontend page generation
3. **[agent-designer:create-wireframe](./agent-designer-create-wireframe.md)** - Design wireframing

### Use Skills
1. Invoke agent via Task tool: `subagent_type=agent-backend`
2. Agent discovers available skills
3. Skills provide patterns, examples, and guidance

---

## 💡 Key Concepts

### Progressive Token Loading
```
Metadata (50 tokens) → Instructions (500 tokens) → Examples (1500 tokens)
```
Only load what's needed, when it's needed.

### 6-Dimension Integration
Every skill maps to:
- **Groups:** Organization scoping
- **People:** Authorization/roles
- **Things:** Entity types
- **Connections:** Relationships
- **Events:** Activity logging
- **Knowledge:** RAG/embeddings

### Test-Driven Skills
Skills are designed around:
- Acceptance criteria
- User flows
- Quality requirements
- Ontology compliance

---

## 🔍 Find Skills

### By Agent
- Backend: `agent-backend:*`
- Frontend: `agent-frontend:*`
- Designer: `agent-designer:*`

### By Category
- Data: Schema, queries, mutations
- UI: Pages, components, styling
- Design: Wireframes, tokens, specs
- Quality: Tests, validation
- Ops: Deployment, CI/CD

### By Use Case
- Creating: `*:create-*`
- Validating: `*:validate-*`
- Optimizing: `*:optimize-*`
- Testing: `*:test-*`

---

## 📝 Contributing

### Submit a New Skill

1. Create skill file following the template
2. Include comprehensive examples
3. Map to 6-dimension ontology
4. Update REGISTRY.md
5. Submit for review

### Improve Existing Skills

1. Update version history
2. Add missing patterns
3. Improve examples
4. Update documentation
5. Test with actual agent

---

## 🆘 Support

### Skills Not Found?
1. Check file exists: `.claude/skills/agent-{name}-{skill}.md`
2. Verify YAML frontmatter has `name` field
3. Check agent's `skills:` field in frontmatter
4. Read [REGISTRY.md](./REGISTRY.md#troubleshooting) troubleshooting section

### Need More Detail?
1. Read full [REGISTRY.md](./REGISTRY.md)
2. Check specific skill implementation
3. Review [agents/README.md](./agents/README.md)
4. Look at related skills for patterns

---

## 📚 Related Documentation

- [Agent System Overview](../.claude/agents/README.md)
- [6-Dimension Ontology](../../one/knowledge/ontology.md)
- [Simple Implementation Plan](../../one-group/things/plans/simple.md)
- [Claude Code Official Docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| Total Skills Defined | 29 |
| Implemented Skills | 3 |
| Skill Documentation | 1,296 lines |
| Skill Files | 7 markdown files |
| Total Skill Size | 52 KB |
| Token Budget Available | 7,000 |
| Token Budget Used | 2,700 |
| Token Budget Available | 4,300 |

---

**Status:** Foundation Phase Complete ✅
**Maintained By:** Engineering Team
**Last Review:** 2025-10-27
**Next Review:** When new agent skills are created
