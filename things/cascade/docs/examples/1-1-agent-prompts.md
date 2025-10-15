# Feature 1-1: Agent Prompts System

**Assigned to:** Backend Specialist Agent (agent-backend.md)
**Status:** ✅ Complete (12 agent files implemented)
**Plan:** 1-create-workflow
**Priority:** Critical
**Dependencies:** None
**Implementation:** `/one/things/agents/` (12 files, 303KB total)

---

## Feature Specification

### What We're Building

A complete prompt system for 6 agent roles that enables autonomous collaboration in the workflow. Each prompt defines behavior, responsibilities, context requirements, and decision-making frameworks.

**Not the "how"** - This spec defines what the prompts need to accomplish, not the implementation details.

---

## Ontology Types

### Things
- `agent` - Engineering units with specific roles
  - Properties: `role`, `responsibilities`, `contextTokens`, `inputTypes`, `outputTypes`
  - Validates: type structure is in ontology

### Connections
- `coordinates_with` - How agents interact
  - Metadata: `eventTypes[]`, `communicationPattern`

### Events
- `agent_prompt_created` - New agent prompt defined
  - Metadata: `role`, `responsibilities`, `contextTokens`
- `agent_prompt_validated` - Prompt tested and approved
  - Metadata: `testResults`, `approvedBy`

---

## The 6 Agent Roles

### 1. Engineering Director Agent

**Core responsibility:** Validates ideas, creates plans, assigns features, marks complete

**Input:**
- User ideas (raw text)
- Feature status updates (from events)
- Quality reports (from quality agent)

**Output:**
- Validated ideas → plans
- Plans with feature assignments
- Task lists for parallel execution
- Feature completion events

**Context budget:** 200 tokens (ontology type names only)

**Decision framework:**
- Is idea mappable to ontology types? → Valid or Invalid
- Should idea be plan or single feature? → Plan if 3+ features
- Which specialist for which feature? → Based on category (backend/frontend/integration)

**Key behaviors:**
- Always validate against ontology first
- Break plans into parallel-executable features
- Assign based on specialist expertise
- Review and refine when quality flags issues
- Update completion events

---

### 2. Specialist Agents (Backend, Frontend, Integration)

**Core responsibility:** Write features, execute tasks, fix problems

**Types:**
- **Backend Specialist** - Services, mutations, queries, schemas
- **Frontend Specialist** - Pages, components, UI/UX
- **Integration Specialist** - Connections between systems, data flows

**Input:**
- Feature assignments (from director)
- Solution proposals (from problem solver)
- Design specifications (from design agent)

**Output:**
- Feature specifications (Level 3)
- Working implementations (Level 6)
- Fixed code (after problem solving)
- Lessons learned entries

**Context budget:** 1,500 tokens (types + patterns)

**Decision framework:**
- What ontology types does this feature use?
- What patterns apply? (from knowledge/patterns/)
- What tests must pass? (from quality agent)
- Does design satisfy test criteria?

**Key behaviors:**
- Write feature specs before implementation
- Reference patterns from knowledge base
- Implement exactly to design specifications
- Fix problems when tests fail
- Add lessons learned after fixes

---

### 3. Quality Agent

**Core responsibility:** Define tests, validate implementations, ensure ontology alignment

**Input:**
- Feature specifications (from specialists)
- Completed implementations (from specialists)

**Output:**
- User flows (what users must accomplish)
- Acceptance criteria (how we know it works)
- Technical tests (unit, integration, e2e)
- Quality reports (pass/fail with details)

**Context budget:** 2,000 tokens (ontology + feature + UX patterns)

**Decision framework:**
- Does feature align with ontology structure?
- What user flows must work?
- What acceptance criteria validate the flows?
- What technical tests validate the implementation?

**Key behaviors:**
- Define user flows FIRST (user perspective)
- Then acceptance criteria (specific, measurable)
- Then technical tests (implementation validation)
- Keep tests as simple as possible
- Validate implementations against all three

---

### 4. Design Agent

**Core responsibility:** Create wireframes and component architecture that enable tests to pass

**Philosophy:** Design exists to make tests pass (test-driven design)

**Input:**
- Feature specifications (from specialists)
- Test criteria (user flows + acceptance criteria from quality)

**Output:**
- Wireframes (visual structure)
- Component architecture (hierarchy and relationships)
- Design tokens (colors, timing, spacing)
- Design decisions (why each choice was made)

**Context budget:** 2,000 tokens (feature + tests + design patterns)

**Decision framework:**
- Which test criteria drive design decisions?
- What component structure satisfies user flows?
- What design tokens ensure acceptance criteria met?
- Is design accessible and performant?

**Key behaviors:**
- Start from test requirements
- Every design decision references a test criterion
- Create wireframes that show user flows
- Define component architecture
- Set design tokens that meet performance requirements
- Ensure accessibility standards met

---

### 5. Problem Solver Agent

**Core responsibility:** Analyze failed tests using ultrathink, propose solutions

**Mode:** Deep analysis (ultrathink)

**Input:**
- Failed test results (from quality agent)
- Implementation code (that failed)
- Ontology structure (for context)

**Output:**
- Root cause analysis (why it failed)
- Solution proposals (specific code changes)
- Delegation instructions (assign to specialist)

**Context budget:** 2,500 tokens (failed tests + implementation + ontology)

**Decision framework:**
- What is the root cause? (logic error, missing dependency, wrong pattern?)
- What pattern was missed? (check lessons learned)
- What is the minimum fix required?
- Which specialist should implement the fix?

**Key behaviors:**
- Use ultrathink mode for deep analysis
- Search lessons learned for similar issues
- Identify root cause before proposing solution
- Propose specific, minimal fixes
- Delegate to appropriate specialist
- Ensure lesson is captured after fix

---

### 6. Documenter Agent

**Core responsibility:** Write documentation after features complete

**Input:**
- Completed features (post-quality validation)
- Implementation details (from specialists)
- Test criteria (from quality)

**Output:**
- Feature documentation (what it does, how to use)
- API documentation (if applicable)
- User guides (if user-facing)
- Knowledge base updates

**Context budget:** 1,000 tokens (feature + tests + implementation)

**Decision framework:**
- What does user need to know?
- What are the key features and benefits?
- How do they use it?
- What are common issues and solutions?

**Key behaviors:**
- Write for the target audience (users, developers, or both)
- Include examples and code snippets
- Link to related features and resources
- Keep it concise and scannable
- Update knowledge base with new patterns

---

## Additional Specialized Agents

Beyond the core 6 agents in the workflow, 4 additional specialized agents enhance the system:

### 7. Builder Agent

**Core responsibility:** Advanced feature implementation with deep architecture understanding

**Specialization:** Complex multi-layer implementations requiring coordination across backend, frontend, and integration layers.

**Key capabilities:**
- Full-stack feature implementation
- Advanced Effect.ts patterns
- Multi-agent coordination
- Architecture decision-making

**File:** `one/things/agents/agent-builder.md` (55KB - most comprehensive)

---

### 8. Sales Agent

**Core responsibility:** Customer-facing interactions and business development

**Specialization:** Understanding customer needs and translating them into technical requirements.

**Key capabilities:**
- Customer needs analysis
- Feature requirement translation
- Business value articulation
- Product demonstrations

**File:** `one/things/agents/agent-sales.md` (23KB)

---

### 9. Clean Agent

**Core responsibility:** Code quality, refactoring, and technical debt management

**Specialization:** Improving existing code without changing functionality.

**Key capabilities:**
- Code smell detection
- Refactoring patterns
- Performance optimization
- Dependency cleanup

**File:** `one/things/agents/agent-clean.md` (5.7KB)

---

### 10. Clone Agent

**Core responsibility:** Repository operations, migrations, and code duplication

**Specialization:** Moving code between repositories while maintaining integrity.

**Key capabilities:**
- Repository cloning
- Code migration
- Git operations
- Structure preservation

**File:** `one/things/agents/agent-clone.md` (22KB)

---

## Prompt Structure Template

Each agent prompt should follow this structure:

```markdown
# [Agent Role] Agent

## Role
[One sentence role description]

## Responsibilities
- [Bullet list of key responsibilities]

## Input
- [What this agent receives]

## Output
- [What this agent produces]

## Context Budget
[Token limit]: [What's included in context]

## Decision Framework
[How this agent makes decisions]
- Question 1 → Decision logic
- Question 2 → Decision logic

## Key Behaviors
- [Critical behavior 1]
- [Critical behavior 2]
- [etc.]

## Communication Patterns
### Watches for (Events this agent monitors)
- `event_type` - [Why and what action]

### Emits (Events this agent creates)
- `event_type` - [When and what metadata]

## Examples
### Example 1: [Scenario]
**Input:**
[Example input]

**Process:**
[Step by step what agent does]

**Output:**
[Example output]

## Common Mistakes to Avoid
- [Mistake 1] → [Correct approach]
- [Mistake 2] → [Correct approach]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
```

---

## Scope

### In Scope
- ✅ 6 complete agent prompt files
- ✅ Clear role definitions
- ✅ Input/output specifications
- ✅ Context requirements
- ✅ Decision frameworks
- ✅ Communication patterns (events)
- ✅ Examples for each agent
- ✅ Success criteria

### Out of Scope
- ❌ Orchestrator implementation (Feature 1-2)
- ❌ Event system implementation (Feature 1-3)
- ❌ Knowledge base setup (Feature 1-4)
- ❌ Actual test execution (Feature 1-5)

---

## Agent Files (Implemented)

```
one/things/agents/
├── agent-director.md         # Engineering Director Agent (39KB)
├── agent-backend.md          # Backend Specialist Agent (7.7KB)
├── agent-frontend.md         # Frontend Specialist Agent (47KB)
├── agent-integration.md      # Integration Specialist Agent (6.7KB)
├── agent-quality.md          # Quality Agent (7.6KB)
├── agent-designer.md         # Design Agent (54KB)
├── agent-problem-solver.md   # Problem Solver Agent with ultrathink (10KB)
├── agent-documenter.md       # Documenter Agent (9.7KB)
├── agent-builder.md          # Builder Agent - Advanced implementation (55KB)
├── agent-sales.md            # Sales Agent - Customer-facing (23KB)
├── agent-clean.md            # Clean Agent - Code quality (5.7KB)
└── agent-clone.md            # Clone Agent - Repository operations (22KB)
```

**Naming Convention:** All agent files use `agent-{role}.md` format for consistency.

---

## Success Criteria

### Immediate
- [x] All 8 core prompt files created (director, backend, frontend, integration, quality, designer, problem-solver, documenter)
- [x] 4 additional specialized agents created (builder, sales, clean, clone)
- [x] Each follows prompt structure template
- [x] Clear role separation (no overlap)
- [x] Communication patterns defined (events)
- [x] Examples demonstrate behavior

### Near-term
- [ ] Prompts tested with actual features
- [ ] Agents coordinate successfully via events
- [ ] Context budgets respected
- [ ] Decisions align with specifications

### Long-term
- [ ] Agents deliver quality features autonomously
- [ ] Communication patterns enable parallel execution
- [ ] Prompts require minimal refinement
- [ ] System scales to all 66 thing types

---

## Integration Points

### With Feature 1-2 (Orchestrator)
- Orchestrator reads these prompts
- Routes work to appropriate agents
- Provides context within token budgets

### With Feature 1-3 (Events)
- Communication patterns become event subscriptions
- Agents coordinate via events
- No manual handoffs needed

### With Feature 1-4 (Knowledge)
- Agents reference patterns from knowledge base
- Problem solver searches lessons learned
- Documenter updates knowledge base

### With Feature 1-5 (Quality)
- Quality agent prompt defines test strategy
- Problem solver prompt defines fix strategy
- Specialists implement based on specifications

---

## Next Steps

This feature will proceed to:
1. **Level 4 (Tests):** Quality agent defines success criteria for prompts
2. **Level 5 (Design):** Design agent structures prompt templates
3. **Level 6 (Implementation):** Documentation specialist writes all 8 prompts

---

## References

- **Plan:** `one/things/plans/1-create-workflow.md`
- **Workflow spec:** `one/things/plans/workflow.md` (Agent Roles section)
- **Ontology:** `one/connections/ontology-minimal.yaml`

---

**Status:** ✅ COMPLETE - All 12 agent prompt files created and implemented

**Implementation Notes:**
- Core 8 agents implemented as specified (director, backend, frontend, integration, quality, designer, problem-solver, documenter)
- 4 additional specialized agents enhance capabilities (builder, sales, clean, clone)
- All agents follow consistent `agent-{role}.md` naming convention
- Total 303KB of agent documentation
- Builder and Designer agents are most comprehensive (55KB and 54KB respectively)
- Ready for orchestrator integration (Feature 1-2)
