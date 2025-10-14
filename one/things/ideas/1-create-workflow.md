# Idea: Agent-Based Ontology-Driven Workflow System

**Status:** Validated by Director Agent (bootstrapped - self-implementation)
**Decision:** Approved as Plan #1
**Priority:** Critical - Foundation for all future development

---

## Description

Implement the agent-based, ontology-driven workflow system described in `one/things/plans/workflow.md`. This system will enable:

- **6-level workflow:** ideas → plans → features → tests → design → implementation
- **6 agent roles:** Director, Specialists, Quality, Design, Problem Solver, Documenter
- **YAML-driven orchestration:** Single source of truth in `ontology-minimal.yaml`
- **Event-based coordination:** Autonomous agents coordinating through events
- **Quality loops:** Continuous testing and problem solving
- **Knowledge accumulation:** Lessons learned capture institutional knowledge

---

## Meta-Implementation Strategy

**Bootstrap approach:** Use the workflow system to create itself

1. **This idea document** validates the concept (Level 1: IDEAS)
2. **Plan document** breaks into features (Level 2: PLANS)
3. **Feature documents** specify each component (Level 3: FEATURES)
4. **Tests** define success criteria (Level 4: TESTS)
5. **Design** shows structure and flows (Level 5: DESIGN)
6. **Implementation** builds the actual system (Level 6: IMPLEMENTATION)

---

## Ontology Validation

### Things (Entities)

- ✅ `agent` - Engineering units with specific roles and responsibilities
- ✅ `idea` - User concepts validated against ontology
- ✅ `plan` - Collections of features with team assignments
- ✅ `feature` - Specifications of what to build
- ✅ `test` - User flows, acceptance criteria, technical validations
- ✅ `design` - Wireframes and component architecture
- ✅ `task` - Individual units of work
- ✅ `lesson` - Knowledge captured from problem solving

### Connections (Relationships)

- ✅ `validates` - Director validates ideas
- ✅ `creates` - Director creates plans from ideas
- ✅ `assigns_to` - Director assigns features to specialists
- ✅ `part_of` - Features are part of plans
- ✅ `tests_for` - Tests validate features
- ✅ `designs_for` - Designs enable tests to pass
- ✅ `implements` - Specialists implement designs
- ✅ `reviews` - Quality reviews implementations
- ✅ `solves` - Problem solver fixes failed tests
- ✅ `documents` - Documenter writes docs for completed features

### Events (State Changes)

- ✅ `idea_validated` - Idea approved as plan
- ✅ `plan_started` - Director begins plan
- ✅ `feature_assigned` - Specialist receives feature
- ✅ `feature_started` - Specialist begins work
- ✅ `implementation_complete` - Code written
- ✅ `quality_check_started` - Quality begins review
- ✅ `test_passed` / `test_failed` - Test results
- ✅ `problem_analysis_started` - Problem solver investigates
- ✅ `solution_proposed` - Fix identified
- ✅ `fix_complete` - Problem resolved
- ✅ `lesson_learned_added` - Knowledge captured
- ✅ `documentation_complete` - Docs written
- ✅ `feature_complete` - Feature finished

### Knowledge (Intelligence)

- ✅ Agent prompts define behavior and context requirements
- ✅ Patterns library provides implementation guidance
- ✅ Lessons learned accumulate institutional knowledge
- ✅ Event history provides complete audit trail
- ✅ Ontology types enable type-driven generation

---

## Complexity Assessment

**Scope:** Large (4-6 weeks for full implementation)

**Phases:**

1. **Phase 1 (Week 1-2):** Agent prompts + basic orchestrator + file structure
2. **Phase 2 (Week 2-3):** Event coordination + quality loops
3. **Phase 3 (Week 3-4):** Knowledge management + problem solver (ultrathink)
4. **Phase 4 (Week 4-6):** Testing, refinement, documentation

**Risk:** Medium

- This is meta-work (building the system that builds systems)
- Must be simple enough for humans and agents to understand
- Must prove value immediately or development velocity suffers

**Mitigation:**

- Start with minimal viable workflow
- Test on simple feature first
- Iterate based on real usage
- Keep YAML configuration simple

---

## Success Criteria

### Immediate (MVP)

- [ ] Director agent can validate ideas and create plans
- [ ] Specialist agents can write features
- [ ] Basic orchestrator executes 6-level flow
- [ ] Numbering system works (`1-plan` → `1-1-feature`)
- [ ] Events logged to track progress

### Near-term (Month 1)

- [ ] Quality agent defines tests and validates implementations
- [ ] Design agent creates wireframes from test criteria
- [ ] Problem solver handles test failures (ultrathink mode)
- [ ] Knowledge base captures lessons learned
- [ ] Complete workflow from idea to implementation works

### Long-term (Quarter 1)

- [ ] 98% context reduction vs old CASCADE system
- [ ] 5x faster feature delivery
- [ ] Quality improves with each feature (learning)
- [ ] Developers prefer this workflow to manual process
- [ ] System pays for itself within 2 weeks

---

## Business Impact

**Why this matters:**

1. **Velocity multiplier:** Build features 5x faster
2. **Quality improvement:** Continuous learning prevents repeated mistakes
3. **Context efficiency:** 98% reduction in context usage = lower AI costs
4. **Scalability:** Same workflow for all 66 thing types
5. **Maintainability:** Single source of truth (ontology)
6. **Developer experience:** Clear process, autonomous agents, parallel execution

**Cost-benefit:**

- **Investment:** 4-6 weeks upfront
- **Return:** 5x velocity improvement on every future feature
- **Break-even:** ~2 weeks after completion
- **Ongoing:** Continuous quality improvement through learning

---

## Next Steps

**Director Agent Decision:**

- ✅ Approved as Plan #1
- ✅ Assign plan number: `1-create-workflow`
- ✅ Create team structure:
  - Backend Specialist (orchestrator, event system)
  - Documentation Specialist (agent prompts, patterns)
  - Integration Specialist (coordination, knowledge management)

**Proceed to Level 2 (PLANS):**

- Break into 6 features (one per major component)
- Assign features to specialists
- Create feature specifications
- Define success criteria

---

## References

- **Source:** `one/things/plans/workflow.md` (complete workflow specification)
- **Ontology:** `one/knowledge/ontology-minimal.yaml` (types and patterns)
- **Philosophy:** The ontology IS the workflow. Agents collaborate. Everything else is noise.

---

**Status:** Validated ✅ → Proceeding to Plan #1
