# Plan: Backend-Agnostic Frontend Architecture

**Plan ID:** `2-backend-agnostic-frontend`
**Idea:** `2-backend-agnostic-frontend`
**Status:** Active
**Priority:** High (Strategic Enhancement)
**Duration:** 4-6 weeks
**Team Size:** 3 specialists (Backend, Frontend, Integration)
**Created:** 2025-10-13

---

## Executive Summary

Transform the current tightly-coupled Astro/React frontend + Convex backend architecture into a fully backend-agnostic system using the DataProvider interface pattern. This enables organizations to use ANY backend (Convex, WordPress, Notion, Supabase, custom APIs) by changing ONE line of configuration.

**Strategic Value:** Removes vendor lock-in, enables multi-backend federation, supports organizations with existing infrastructure, proves ontology is truly protocol-agnostic.

---

## Ontology Validation

### ✅ Organizations (Dimension 1)
- Each organization configures `properties.backendProvider`
- Multi-tenant isolation maintained across all providers
- Organizations can swap providers independently

### ✅ People (Dimension 2)
- Only `org_owner` role can configure backend providers
- Authorization enforced at backend, not frontend
- All 4 roles work identically across providers

### ✅ Things (Dimension 3)
- New thing type: `external_connection` (backend configurations)
- All 66 thing types work through DataProvider interface
- Generic ThingService handles all types uniformly

### ✅ Connections (Dimension 4)
- New relationship: `configured_by` (org → external_connection)
- Uses consolidated type: `communicated` with protocol metadata
- Cross-backend connections supported

### ✅ Events (Dimension 5)
- New event: `provider_changed` (when backend swaps)
- Uses consolidated type: `communication_event` with protocol metadata
- Complete audit trail preserved

### ✅ Knowledge (Dimension 6)
- Labels: Backend provider capabilities
- Tags: `protocol:data_provider`, `provider:convex`, `status:active`
- RAG can index provider documentation

**Verdict:** ✅ PASS - All 6 dimensions successfully mapped

---

## Feature Collection

This plan breaks down into **7 features** assigned to specialists:

### Feature 2-1: DataProvider Interface & ConvexProvider
**ID:** `2-1-dataprovider-interface`
**Owner:** Backend Specialist
**Duration:** 1 week
**Dependencies:** None
**Status:** Not Started
**File:** `one/things/features/2-1-dataprovider-interface.md`

**Scope:**
- Define TypeScript interface for 6-dimension ontology operations
- Implement ConvexProvider (wraps existing Convex SDK)
- Create provider factory pattern
- Write comprehensive tests

**Success Criteria:**
- [ ] DataProvider interface fully typed
- [ ] ConvexProvider passes all unit tests
- [ ] Zero TypeScript errors
- [ ] Documentation complete

---

### Feature 2-2: Configuration System
**ID:** `2-2-config-system`
**Owner:** Backend Specialist
**Duration:** 3 days
**Dependencies:** Feature 2-1
**Status:** Not Started
**File:** `one/things/features/2-2-config-system.md`

**Scope:**
- Environment-based provider configuration
- Runtime provider switching
- Multi-tenant provider isolation
- Configuration validation

**Success Criteria:**
- [ ] Organizations can configure backend via .env
- [ ] Provider switching works at runtime
- [ ] Multi-tenant isolation maintained
- [ ] Configuration errors caught early

---

### Feature 2-3: Effect.ts Service Layer
**ID:** `2-3-effectts-services`
**Owner:** Backend Specialist
**Duration:** 1 week
**Dependencies:** Features 2-1, 2-2
**Status:** Not Started
**File:** `one/things/features/2-3-effectts-services.md`

**Scope:**
- ThingService, ConnectionService, EventService
- Pure business logic (backend-agnostic)
- Error handling with Effect.ts patterns
- Service composition and dependencies

**Success Criteria:**
- [ ] All 6-dimension services implemented
- [ ] Services work with any DataProvider
- [ ] Business logic isolated from backend
- [ ] Error handling comprehensive

---

### Feature 2-4: React Hooks
**ID:** `2-4-react-hooks`
**Owner:** Frontend Specialist
**Duration:** 3 days
**Dependencies:** Feature 2-1
**Status:** Not Started
**File:** `one/things/features/2-4-react-hooks.md`

**Scope:**
- Generic hooks: `useThings`, `useConnections`, `useEvents`
- Loading and error states
- Real-time subscription handling
- TypeScript type inference

**Success Criteria:**
- [ ] Hooks match Convex API ergonomics
- [ ] Work with any DataProvider
- [ ] Type-safe with full inference
- [ ] Documentation and examples complete

---

### Feature 2-5: Auth Component Migration
**ID:** `2-5-auth-migration`
**Owner:** Frontend Specialist
**Duration:** 1 week
**Dependencies:** Features 2-1, 2-4
**Status:** Not Started
**File:** `one/things/features/2-5-auth-migration.md`

**Scope:**
- Migrate all auth components to use DataProvider
- Maintain 6 authentication methods
- Preserve 50+ passing tests
- Zero functionality regression

**Success Criteria:**
- [ ] All 50+ auth tests pass
- [ ] No direct Convex imports in auth components
- [ ] Performance within 10% of baseline
- [ ] Zero TypeScript errors

---

### Feature 2-6: Dashboard Component Migration
**ID:** `2-6-dashboard-migration`
**Owner:** Frontend Specialist
**Duration:** 1 week
**Dependencies:** Feature 2-5
**Status:** Not Started
**File:** `one/things/features/2-6-dashboard-migration.md`

**Scope:**
- Migrate dashboard components to DataProvider
- Preserve all functionality
- Maintain loading/error states
- Update component tests

**Success Criteria:**
- [ ] All dashboard components migrated
- [ ] No direct Convex imports
- [ ] All tests pass
- [ ] Performance maintained

---

### Feature 2-7: Alternative Providers (WordPress + Notion)
**ID:** `2-7-alternative-providers`
**Owner:** Integration Specialist
**Duration:** 2 weeks
**Dependencies:** Feature 2-6
**Status:** Not Started
**File:** `one/things/features/2-7-alternative-providers.md`

**Scope:**
- Implement WordPressProvider (WP REST API + ACF)
- Implement NotionProvider (Notion API)
- Test multi-backend scenarios
- Document provider creation guide

**Success Criteria:**
- [ ] WordPress provider functional
- [ ] Notion provider functional
- [ ] Organizations can swap backends
- [ ] Provider creation guide complete

---

## Parallel Execution Strategy

### Phase 1: Foundation (Week 1-2)
**Parallel Tracks:**
- Track A: Backend Specialist → Feature 2-1 → Feature 2-2
- Track B: Backend Specialist → Feature 2-3 (starts after 2-1)
- Track C: Frontend Specialist → Feature 2-4 (starts after 2-1)

**Critical Path:** Feature 2-1 (blocks all others)

### Phase 2: Migration (Week 3-4)
**Parallel Tracks:**
- Track A: Frontend Specialist → Feature 2-5 (Auth)
- Track B: Frontend Specialist → Feature 2-6 (Dashboard, sequential after 2-5)

**Can Run Concurrently:** No - auth must complete first (risk mitigation)

### Phase 3: Expansion (Week 5-6)
**Sequential:**
- Feature 2-7 (Alternative Providers) - Proves flexibility

---

## Risk Analysis

### Risk 1: Auth Tests Break During Migration
**Probability:** High
**Impact:** Critical (50+ tests, user-facing functionality)
**Mitigation:**
- Run auth test suite after EVERY component migration
- Keep rollback branch at each milestone
- Feature flag system to toggle implementations
- Incremental migration (one component at a time)

### Risk 2: Performance Regression
**Probability:** Medium
**Impact:** High (user experience degradation)
**Mitigation:**
- Benchmark current performance (baseline)
- Add performance tests for DataProvider
- Implement request caching
- Target: <10ms overhead per operation

### Risk 3: TypeScript Errors Proliferate
**Probability:** Medium
**Impact:** Medium (development velocity impact)
**Mitigation:**
- Strong interface types from day 1
- Incremental migration (component by component)
- ESLint rule to prevent `any` types
- Type-safe test utilities

### Risk 4: Context Budget Explosion
**Probability:** Medium
**Impact:** Medium (AI costs, development efficiency)
**Mitigation:**
- Keep DataProvider interface minimal
- Use code generation for boilerplate
- Target: 98% context reduction (150K → 3K tokens)
- Document patterns clearly

---

## Quality Gates

### Gate 1: Interface Complete (End of Week 1)
- [ ] DataProvider interface defined
- [ ] ConvexProvider implemented
- [ ] All unit tests pass
- [ ] TypeScript compiles with no errors
- [ ] Performance baseline established

### Gate 2: Services Complete (End of Week 2)
- [ ] All 6-dimension services implemented
- [ ] Configuration system working
- [ ] Integration tests pass
- [ ] Documentation updated

### Gate 3: Auth Migration Complete (End of Week 3)
- [ ] All 50+ auth tests pass
- [ ] Zero regression in functionality
- [ ] Performance within 10% of baseline
- [ ] No TypeScript errors
- [ ] No direct Convex imports in auth

### Gate 4: Full Migration Complete (End of Week 4)
- [ ] All components use DataProvider
- [ ] No direct Convex imports in components
- [ ] Full test suite passes
- [ ] Documentation updated
- [ ] Migration guide published

### Gate 5: Alternative Providers Working (End of Week 6)
- [ ] WordPress provider functional
- [ ] Notion provider functional
- [ ] Provider switching works
- [ ] Multi-tenant support validated
- [ ] Provider creation guide complete

---

## Success Metrics

### Technical Metrics
- **Context Reduction:** 98% (150K → 3K tokens)
- **Code Reduction:** 30% fewer LOC (via abstraction)
- **Type Safety:** 100% typed (no `any` except entity properties)
- **Test Coverage:** 90%+ unit, 80%+ integration
- **Performance:** <10ms DataProvider overhead

### Strategic Metrics
- **Backend Flexibility:** 3+ providers supported
- **Organization Adoption:** Organizations can choose their backend
- **Developer Velocity:** 50% faster to add new providers
- **Migration Time:** 4-6 weeks (efficient execution)
- **Market Expansion:** Ready for enterprise customers

---

## Timeline

| Week | Phase | Features | Deliverables | Owner |
|------|-------|----------|--------------|-------|
| 1 | Foundation | 2-1, 2-2 | DataProvider interface, ConvexProvider, Config system | Backend Specialist |
| 2 | Foundation | 2-3, 2-4 | Effect.ts services, React hooks | Backend + Frontend Specialists |
| 3 | Migration | 2-5 | Auth components migrated, 50+ tests pass | Frontend Specialist |
| 4 | Migration | 2-6 | Dashboard components migrated | Frontend Specialist |
| 5-6 | Expansion | 2-7 | WordPress + Notion providers | Integration Specialist |

---

## Rollback Strategy

### Rollback Points
1. **After Feature 2-1:** Revert to direct Convex hooks (easy)
2. **After Feature 2-5:** Keep auth on DataProvider, rollback dashboard (medium)
3. **After Feature 2-6:** Full rollback not possible (breaking change)

### Rollback Procedure
```bash
# 1. Revert to previous commit
git revert <feature_commit_range>

# 2. Re-enable ConvexClientProvider
# Edit: frontend/src/app.tsx

# 3. Restore direct Convex hook imports
# Edit: Affected component files

# 4. Run full test suite
cd frontend/
bun test
bunx astro check

# 5. Verify auth still works
bun test test/auth
```

**Rollback Time:** <5 minutes at each gate

---

## Dependencies

### External Dependencies
- ✅ Effect.ts library (already installed)
- ✅ Convex SDK (already installed)
- ✅ Better Auth (already configured)
- ✅ Astro 5 + React 19 (already configured)

### Team Dependencies
- Backend Specialist available (Features 2-1, 2-2, 2-3)
- Frontend Specialist available (Features 2-4, 2-5, 2-6)
- Integration Specialist available (Feature 2-7)
- Quality Agent validates after each feature
- Documenter writes docs after completion

### Infrastructure Dependencies
- Test Convex deployment (for testing)
- CI/CD pipeline configured
- Feature flag system (for rollback)
- Performance monitoring setup

---

## Communication Plan

### Daily Standups
- What: Quick sync on progress and blockers
- When: 9:00 AM daily
- Who: All 3 specialists + Director
- Duration: 15 minutes

### Weekly Status Updates
- Monday: Sprint planning with all specialists
- Wednesday: Mid-week sync on blockers
- Friday: Demo + retrospective

### Stakeholder Updates
- Weekly email update to platform owner
- Bi-weekly demo to org_owners
- Monthly metrics report

### Documentation Updates
- Feature docs updated after each feature completion
- Migration guide updated after each phase
- Knowledge base updated with lessons learned
- API reference auto-generated from types

---

## Event Coordination

### Events Emitted by Director

**Plan Started:**
```typescript
{
  type: "plan_started",
  actorId: directorId,
  targetId: "2-backend-agnostic-frontend",
  metadata: {
    featureCount: 7,
    estimatedDuration: 3628800000, // 6 weeks in ms
    priority: "high",
  }
}
```

**Feature Assigned:**
```typescript
{
  type: "feature_assigned",
  actorId: directorId,
  targetId: "2-1-dataprovider-interface",
  metadata: {
    assignedTo: backendSpecialistId,
    planId: "2-backend-agnostic-frontend",
    priority: "high",
    dependencies: [],
  }
}
```

**Plan Complete:**
```typescript
{
  type: "plan_complete",
  actorId: directorId,
  targetId: "2-backend-agnostic-frontend",
  metadata: {
    totalFeatures: 7,
    completedFeatures: 7,
    totalDuration: 3542400000, // Actual duration
    qualityScore: 94,
  }
}
```

### Events Monitored by Director

- `feature_started` - Track progress
- `implementation_complete` - Trigger quality check
- `quality_check_complete` (approved) - Mark feature done
- `quality_check_complete` (rejected) - Delegate to problem solver
- `documentation_complete` - Final completion check

---

## Next Actions

### Immediate (Today)
1. ✅ Plan created and validated
2. Create 7 feature specification documents
3. Assign features to specialists
4. Set up feature branch: `feature/2-backend-agnostic-frontend`
5. Emit `plan_started` event

### Week 1
1. Backend Specialist begins Feature 2-1
2. Set up performance benchmarking infrastructure
3. Create rollback branch strategy
4. Document migration patterns

### Week 2-4
1. Implement DataProvider + ConvexProvider
2. Migrate auth components (critical path)
3. Run auth tests continuously
4. Document lessons learned

### Week 5-6
1. Complete dashboard migration
2. Implement alternative providers
3. Update all documentation
4. Prepare launch communication

---

## Related Documents

- **Idea:** `one/things/ideas/2-backend-agnostic-frontend.md`
- **Features:** `one/things/features/2-{1-7}-*.md` (7 feature specs)
- **Implementation:** `frontend/src/providers/` (code location)
- **Tests:** `frontend/tests/integration/dataProvider.test.ts`
- **Migration Guide:** `frontend/MIGRATION.md`
- **CASCADE Tracker:** `CASCADE-2-BACKEND-AGNOSTIC.md`

---

## Lessons Learned (To Be Updated)

This section will be populated with lessons learned during implementation:

- Patterns that worked well
- Patterns that didn't work
- Performance insights
- TypeScript tips and tricks
- Migration gotchas
- Best practices for future providers

---

**Plan Status:** ✅ Validated and Ready for Implementation
**Created:** 2025-10-13
**Validated By:** Engineering Director Agent
**Ontology Check:** ✅ PASS (all 6 dimensions mapped)
**Risk Level:** Medium (mitigated)
**Strategic Value:** High
**Team:** Backend + Frontend + Integration Specialists
