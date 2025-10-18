# Agent Skills Implementation Plan

**Version:** 1.0.0
**Date:** 2025-10-18
**Status:** Planning
**Reference:** https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview

## Overview

Implement Claude Code agent skills for all ONE Platform agents in `.claude/agents/*` to enable:
- Reusable, composable skill modules
- Skill invocation from within agents
- Skill-to-skill communication
- Better separation of concerns
- Easier testing and maintenance

## Current State

### Existing Agents (17 total)

**Coding Specialists (7):**
- `agent-backend.md` - Convex backend (schema, mutations, queries, services)
- `agent-frontend.md` - Astro 5 + React 19 UI components
- `agent-builder.md` - Full-stack engineering
- `agent-integrator.md` - Protocol integrations (A2A, ACP, AP2, X402, AG-UI)
- `agent-designer.md` - Wireframes, components, design tokens
- `agent-clean.md` - Code quality, refactoring, technical debt
- `agent-quality.md` - Testing, validation, ontology alignment

**Business Specialists (10):**
- `agent-ops.md` - DevOps, releases, deployments, CI/CD
- `agent-director.md` - Idea validation, planning, specialist orchestration
- `agent-sales.md` - Lead qualification, demos, KYC, trials
- `agent-documenter.md` - Documentation, knowledge capture
- `agent-clone.md` - Data migration, AI clones from content
- `agent-problem-solver.md` - Root cause analysis, solution proposals
- Plus general-purpose agents

### Current Pain Points

1. **Code Duplication:** Common tasks (read schema, validate ontology, check build) repeated across agents
2. **No Reusability:** Each agent re-implements similar functionality
3. **Hard to Test:** Logic embedded in agent prompts, not isolated skills
4. **Inconsistent Patterns:** Different agents use different approaches for same tasks
5. **No Composition:** Can't combine skills or build on existing capabilities

## Target State: Skill-Based Architecture

### Skill Categories

#### 1. **Ontology Skills** (`skills/ontology/`)

**`validate-schema.md`** - Validate against 6-dimension ontology
- Input: Schema definition or code file
- Output: Validation report with errors/warnings
- Used by: agent-backend, agent-quality, agent-director

**`check-dimension.md`** - Check if feature maps to dimensions
- Input: Feature description
- Output: Dimension mapping (groups, people, things, connections, events, knowledge)
- Used by: agent-director, agent-quality

**`generate-entity-type.md`** - Generate new entity type from description
- Input: Plain English entity description
- Output: TypeScript type definition + schema
- Used by: agent-backend, agent-builder

**`verify-relationships.md`** - Verify connection types are valid
- Input: Connection definition
- Output: Valid/invalid with reasoning
- Used by: agent-backend, agent-quality

#### 2. **Convex Skills** (`skills/convex/`)

**`read-schema.md`** - Read and parse Convex schema
- Input: Schema file path
- Output: Parsed schema with tables, indexes, types
- Used by: All backend-related agents

**`create-mutation.md`** - Generate Convex mutation
- Input: Operation description
- Output: Typed mutation code with validation
- Used by: agent-backend, agent-builder

**`create-query.md`** - Generate Convex query
- Input: Query description
- Output: Typed query code with indexes
- Used by: agent-backend, agent-builder

**`test-function.md`** - Test Convex function
- Input: Function name, test cases
- Output: Test results
- Used by: agent-quality, agent-backend

**`check-deployment.md`** - Verify Convex deployment status
- Input: Deployment name
- Output: Status, functions, schema version
- Used by: agent-ops, agent-quality

#### 3. **Astro Skills** (`skills/astro/`)

**`create-page.md`** - Generate Astro page
- Input: Route, layout, components
- Output: Astro page file with SSR
- Used by: agent-frontend, agent-builder

**`create-component.md`** - Generate React component
- Input: Component spec
- Output: React component with types
- Used by: agent-frontend, agent-designer

**`add-content-collection.md`** - Add content collection
- Input: Collection name, schema
- Output: Collection config + type definitions
- Used by: agent-frontend, agent-builder

**`check-build.md`** - Run Astro build check
- Input: None
- Output: Build status, errors, warnings
- Used by: agent-quality, agent-ops

**`optimize-performance.md`** - Optimize Astro performance
- Input: Page or component path
- Output: Optimization recommendations + changes
- Used by: agent-clean, agent-quality

#### 4. **Design Skills** (`skills/design/`)

**`generate-wireframe.md`** - Create wireframe from spec
- Input: Feature spec, test requirements
- Output: Wireframe document
- Used by: agent-designer

**`create-component-spec.md`** - Define component specifications
- Input: Component description
- Output: Component spec with props, states, events
- Used by: agent-designer, agent-frontend

**`generate-design-tokens.md`** - Create design tokens
- Input: Brand guidelines
- Output: Design token definitions (colors, spacing, typography)
- Used by: agent-designer

**`check-accessibility.md`** - Verify WCAG compliance
- Input: Component or page
- Output: Accessibility report with fixes
- Used by: agent-quality, agent-designer

#### 5. **Testing Skills** (`skills/testing/`)

**`generate-tests.md`** - Generate test suite
- Input: Feature description, code file
- Output: Complete test suite (unit + integration)
- Used by: agent-quality

**`run-tests.md`** - Execute test suite
- Input: Test file path or pattern
- Output: Test results with coverage
- Used by: agent-quality, agent-ops

**`analyze-coverage.md`** - Check test coverage
- Input: None (uses project coverage data)
- Output: Coverage report with gaps
- Used by: agent-quality

**`validate-e2e.md`** - Run end-to-end tests
- Input: User flow description
- Output: E2E test results
- Used by: agent-quality

#### 6. **Deployment Skills** (`skills/deployment/`)

**`deploy-cloudflare.md`** - Deploy to Cloudflare Pages
- Input: Build directory
- Output: Deployment URL, status
- Used by: agent-ops

**`deploy-convex.md`** - Deploy Convex backend
- Input: Deployment name
- Output: Deployment status, function list
- Used by: agent-ops

**`create-release.md`** - Create GitHub release
- Input: Version, changelog
- Output: Release URL
- Used by: agent-ops

**`sync-repositories.md`** - Sync files to multiple repos
- Input: File patterns, target repos
- Output: Sync status for each repo
- Used by: agent-ops

**`check-deployment-health.md`** - Verify deployment is healthy
- Input: Deployment URL
- Output: Health check results
- Used by: agent-ops, agent-quality

#### 7. **Documentation Skills** (`skills/documentation/`)

**`generate-readme.md`** - Create README from code
- Input: Project directory
- Output: Comprehensive README.md
- Used by: agent-documenter

**`update-knowledge.md`** - Update knowledge dimension
- Input: Feature description, lessons learned
- Output: Updated knowledge docs
- Used by: agent-documenter

**`generate-api-docs.md`** - Generate API documentation
- Input: Function/schema definitions
- Output: API reference docs
- Used by: agent-documenter

**`create-migration-guide.md`** - Create migration documentation
- Input: Old version, new version, changes
- Output: Migration guide
- Used by: agent-documenter

#### 8. **Integration Skills** (`skills/integration/`)

**`implement-a2a.md`** - Implement Agent-to-Agent protocol
- Input: Agent definitions, protocol spec
- Output: A2A implementation
- Used by: agent-integrator

**`implement-acp.md`** - Implement Agent Communication Protocol
- Input: Communication flow
- Output: ACP implementation
- Used by: agent-integrator

**`connect-external-system.md`** - Connect external API/service
- Input: API spec, credentials
- Output: Integration code
- Used by: agent-integrator

**`verify-integration.md`** - Test integration
- Input: Integration name
- Output: Integration test results
- Used by: agent-quality, agent-integrator

#### 9. **Problem Solving Skills** (`skills/problem-solving/`)

**`analyze-test-failure.md`** - Deep analysis of failed tests
- Input: Test failure output
- Output: Root cause analysis with solutions
- Used by: agent-problem-solver

**`identify-root-cause.md`** - Find root cause of issues
- Input: Error logs, symptoms
- Output: Root cause with evidence
- Used by: agent-problem-solver

**`propose-solution.md`** - Generate solution proposals
- Input: Problem description, constraints
- Output: Ranked solution options
- Used by: agent-problem-solver, agent-director

**`verify-fix.md`** - Verify problem is resolved
- Input: Original problem, applied fix
- Output: Verification results
- Used by: agent-problem-solver, agent-quality

#### 10. **Sales & Business Skills** (`skills/sales/`)

**`qualify-lead.md`** - Lead qualification
- Input: Lead information
- Output: Qualification score, next steps
- Used by: agent-sales

**`generate-demo-script.md`** - Create demo script
- Input: Lead profile, use case
- Output: Customized demo script
- Used by: agent-sales

**`verify-kyc.md`** - KYC verification
- Input: Organization details
- Output: KYC status, flags
- Used by: agent-sales

**`track-trial.md`** - Trial management
- Input: Trial status, usage metrics
- Output: Trial health report
- Used by: agent-sales

## Implementation Phases

### Phase 1: Core Skills (Infer 1-20)

**Goal:** Implement foundational skills used by all agents

**Infer 1-5: Ontology Skills**
- Create `skills/ontology/` directory structure
- Implement `validate-schema.md`
- Implement `check-dimension.md`
- Test with agent-director and agent-quality
- Document skill usage patterns

**Infer 6-10: Convex Skills**
- Create `skills/convex/` directory
- Implement `read-schema.md`
- Implement `create-mutation.md`
- Implement `create-query.md`
- Test with agent-backend

**Infer 11-15: Astro Skills**
- Create `skills/astro/` directory
- Implement `create-page.md`
- Implement `create-component.md`
- Implement `check-build.md`
- Test with agent-frontend

**Infer 16-20: Testing Skills**
- Create `skills/testing/` directory
- Implement `generate-tests.md`
- Implement `run-tests.md`
- Test with agent-quality

### Phase 2: Specialist Skills (Infer 21-40)

**Infer 21-25: Design Skills**
- Implement all design skills
- Update agent-designer to use skills
- Test component generation workflow

**Infer 26-30: Deployment Skills**
- Implement all deployment skills
- Update agent-ops to use skills
- Test complete release workflow

**Infer 31-35: Documentation Skills**
- Implement all documentation skills
- Update agent-documenter to use skills
- Test knowledge capture workflow

**Infer 36-40: Integration Skills**
- Implement all integration skills
- Update agent-integrator to use skills
- Test A2A protocol implementation

### Phase 3: Advanced Skills (Infer 41-60)

**Infer 41-45: Problem Solving Skills**
- Implement all problem-solving skills
- Update agent-problem-solver to use skills
- Test root cause analysis workflow

**Infer 46-50: Sales & Business Skills**
- Implement all sales skills
- Update agent-sales to use skills
- Test lead qualification workflow

**Infer 51-55: Performance Optimization**
- Create `optimize-performance.md` skill
- Create `analyze-bundle.md` skill
- Create `improve-lighthouse.md` skill

**Infer 56-60: Security & Compliance**
- Create `check-security.md` skill
- Create `verify-auth.md` skill
- Create `audit-permissions.md` skill

### Phase 4: Agent Migration (Infer 61-80)

**Goal:** Update all agents to use skills instead of embedded logic

**Infer 61-65: Backend Agents**
- Migrate agent-backend to use skills
- Migrate agent-builder (backend parts)
- Test with real schema changes

**Infer 66-70: Frontend Agents**
- Migrate agent-frontend to use skills
- Migrate agent-designer to use skills
- Test with page generation

**Infer 71-75: Operations Agents**
- Migrate agent-ops to use skills
- Migrate agent-quality to use skills
- Test with full release cycle

**Infer 76-80: Business Agents**
- Migrate agent-sales to use skills
- Migrate agent-documenter to use skills
- Migrate agent-clone to use skills

### Phase 5: Testing & Documentation (Infer 81-95)

**Infer 81-85: Skill Testing**
- Create test suite for each skill
- Test skill-to-skill invocation
- Test error handling and edge cases

**Infer 86-90: Integration Testing**
- Test complete agent workflows with skills
- Test parallel skill execution
- Test skill caching and performance

**Infer 91-95: Documentation**
- Document all skills with examples
- Create skill usage guide for agents
- Create troubleshooting guide

### Phase 6: Deployment & Monitoring (Infer 96-100)

**Infer 96-98: Deploy Skills**
- Deploy all skills to `.claude/skills/`
- Update all agent files
- Test in production

**Infer 99: Monitor & Optimize**
- Monitor skill usage patterns
- Optimize frequently-used skills
- Collect performance metrics

**Infer 100: Mark Complete & Document Lessons**
- Mark feature complete
- Document lessons learned in `one/knowledge/`
- Notify stakeholders

## Skill File Structure

Each skill follows this template:

```markdown
# Skill Name

**Category:** [ontology|convex|astro|design|testing|deployment|documentation|integration|problem-solving|sales]
**Version:** 1.0.0
**Used By:** [agent-backend, agent-quality, ...]

## Purpose

[One sentence: What does this skill do?]

## Inputs

- **param1** (type): Description
- **param2** (type): Description

## Outputs

- **result** (type): Description

## Prerequisites

- Condition 1
- Condition 2

## Steps

1. Step 1
2. Step 2
3. Step 3

## Examples

### Example 1: [Use Case]

**Input:**
```
[input data]
```

**Output:**
```
[output data]
```

## Error Handling

- **Error 1:** How to handle
- **Error 2:** How to handle

## Dependencies

- Skill: `other-skill.md`
- Tool: Read, Write, Edit, Bash

## Tests

- Test case 1
- Test case 2

## Lessons Learned

- Lesson 1
- Lesson 2
```

## Agent Update Pattern

### Before (Embedded Logic)

```markdown
## Steps

1. Read the schema file from backend/convex/schema.ts
2. Parse the schema to identify tables
3. Validate against 6-dimension ontology
4. Generate mutation code
5. Write tests
```

### After (Skill-Based)

```markdown
## Steps

1. USE SKILL: `skills/convex/read-schema.md`
   - Input: schema file path
   - Save result as SCHEMA

2. USE SKILL: `skills/ontology/validate-schema.md`
   - Input: SCHEMA
   - Ensure valid

3. USE SKILL: `skills/convex/create-mutation.md`
   - Input: operation description, SCHEMA
   - Save result as MUTATION_CODE

4. USE SKILL: `skills/testing/generate-tests.md`
   - Input: MUTATION_CODE
   - Save result as TESTS

5. Run tests to verify
```

## Benefits

### 1. **Reusability**
- Write once, use everywhere
- 40+ skills replacing 1000+ lines of duplicated logic

### 2. **Composability**
- Skills can invoke other skills
- Build complex workflows from simple building blocks

### 3. **Testability**
- Each skill has isolated tests
- Easy to verify correctness

### 4. **Maintainability**
- Fix bugs in one place
- Update skills without touching agents

### 5. **Consistency**
- All agents use same patterns
- Guaranteed ontology compliance

### 6. **Performance**
- Skills can be cached
- Parallel execution when possible

### 7. **Documentation**
- Skills are self-documenting
- Clear inputs/outputs/examples

## Success Metrics

### Quantitative
- **Code Reduction:** 60% reduction in agent file size
- **Reuse Rate:** Each skill used by 3+ agents on average
- **Test Coverage:** 90%+ coverage for all skills
- **Performance:** 30% faster agent execution (via caching)

### Qualitative
- Agents easier to understand
- Faster agent development
- Fewer bugs in agents
- Better separation of concerns

## Risks & Mitigations

### Risk 1: Skill Overhead
**Mitigation:** Cache skill results, measure performance

### Risk 2: Breaking Changes
**Mitigation:** Version skills, maintain backwards compatibility

### Risk 3: Skill Dependencies
**Mitigation:** Keep skills independent, use composition

### Risk 4: Learning Curve
**Mitigation:** Document thoroughly, provide examples

## Next Steps

1. Review this plan with team
2. Get approval to proceed
3. Start Phase 1 (Infer 1-20)
4. Create first 5 ontology skills
5. Test with agent-director

## References

- [Claude Code Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [ONE Ontology Specification](../knowledge/ontology.md)
- [Development Workflow](../../one/connections/workflow.md)
- [Agent Coordination Rules](../../AGENTS.md)

---

**Status:** Ready for Implementation
**Next Inference:** Infer 1 - Create ontology skills directory structure
**Owner:** agent-director (orchestration) → agent-builder (implementation)
