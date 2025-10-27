# Plan: Backend-Agnostic Frontend Architecture

**Plan ID:** `plan_backend_agnostic_frontend`
**Status:** Validated
**Priority:** High (Strategic Enhancement)
**Duration:** 4-6 weeks
**Team Size:** 3 specialists (Backend, Frontend, Integration)

---

## Executive Summary

Transform the current tightly-coupled Astro/React frontend + Convex backend architecture into a fully backend-agnostic system using the DataProvider interface pattern. This enables organizations to use ANY backend (Convex, WordPress, Notion, Supabase, custom APIs) by changing ONE line of configuration.

**Strategic Value:** Removes vendor lock-in, enables multi-backend federation, supports organizations with existing infrastructure.

---

## Ontology Validation

### ✅ Groups (Dimension 1)
- Each group configures `properties.backendProvider` (optional)
- Multi-tenant isolation maintained across all providers
- Groups can swap providers independently
- Hierarchical nesting supported (parent/child groups can use different backends)

### ✅ People (Dimension 2)
- Only `group_owner` role can configure backend providers
- Authorization enforced at backend, not frontend
- All 4 roles work identically across providers (platform_owner, group_owner, group_user, customer)

### ✅ Things (Dimension 3)
- New thing type: `external_connection` (backend configurations)
- All 66 thing types work through DataProvider interface
- Generic ThingService handles all types uniformly
- Things scoped to groups via `groupId`

### ✅ Connections (Dimension 4)
- New relationship: `configured_by` (group → external_connection)
- Uses consolidated type: `communicated` with protocol metadata
- Cross-backend connections supported
- Connections scoped to groups via `groupId`

### ✅ Events (Dimension 5)
- New event: `provider_changed` (when backend swaps)
- Uses consolidated type: `communication_event` with protocol metadata
- Complete audit trail preserved
- Events scoped to groups via `groupId`

### ✅ Knowledge (Dimension 6)
- Labels: Backend provider capabilities
- Tags: `protocol:data_provider`, `provider:convex`, `status:active`
- RAG can index provider documentation
- Knowledge scoped to groups via `groupId`

**Verdict:** ✅ PASS - All 6 dimensions successfully mapped

---

## Feature Collection

This plan breaks down into **7 features** that can be assigned to specialists:

### Feature 1: DataProvider Interface & ConvexProvider
**Owner:** Backend Specialist
**Duration:** 1 week
**Dependencies:** None
**File:** `one/things/features/dataprovider-interface.md`

### Feature 2: Configuration System
**Owner:** Backend Specialist
**Duration:** 3 days
**Dependencies:** Feature 1
**File:** `one/things/features/config-system.md`

### Feature 3: Effect.ts Service Layer
**Owner:** Backend Specialist
**Duration:** 1 week
**Dependencies:** Features 1, 2
**File:** `one/things/features/effectts-services.md`

### Feature 4: Auth Component Migration
**Owner:** Frontend Specialist
**Duration:** 1 week
**Dependencies:** Features 1, 2
**File:** `one/things/features/auth-migration.md`

### Feature 5: Dashboard Component Migration
**Owner:** Frontend Specialist
**Duration:** 1 week
**Dependencies:** Feature 4
**File:** `one/things/features/dashboard-migration.md`

### Feature 6: Remove Direct Convex Dependencies
**Owner:** Integration Specialist
**Duration:** 3 days
**Dependencies:** Features 4, 5
**File:** `one/things/features/remove-convex-deps.md`

### Feature 7: Alternative Providers (WordPress + Notion)
**Owner:** Integration Specialist
**Duration:** 2 weeks
**Dependencies:** Feature 6
**File:** `one/things/features/alternative-providers.md`

---

## Parallel Execution Strategy

### Phase 1: Foundation (Week 1-2)
**Parallel Tracks:**
- Track A: Feature 1 (DataProvider) → Feature 2 (Config)
- Track B: Feature 3 (Services) starts after Feature 1 completes

**Critical Path:** Feature 1 → Feature 2

### Phase 2: Migration (Week 3-4)
**Parallel Tracks:**
- Track A: Feature 4 (Auth Migration)
- Track B: Feature 5 (Dashboard Migration)

**Can Run Concurrently:** Yes (different component sets)

### Phase 3: Cleanup + Expansion (Week 5-6)
**Sequential:**
- Feature 6 (Remove Dependencies) - MUST complete first
- Feature 7 (Alternative Providers) - Proves flexibility

---

## Risk Analysis

### Risk 1: Auth Tests Break During Migration
**Probability:** High
**Impact:** Critical
**Mitigation:**
- Run auth test suite after EVERY component migration
- Keep rollback branch at each milestone
- Feature flag system to toggle implementations

### Risk 2: Performance Regression
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Benchmark current performance
- Add performance tests for DataProvider
- Implement request caching
- Target: <10ms overhead

### Risk 3: TypeScript Errors Proliferate
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Strong interface types from day 1
- Incremental migration (component by component)
- ESLint rule to prevent `any` types

### Risk 4: Context Budget Explosion
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Keep DataProvider interface minimal
- Use code generation for boilerplate
- Target: 98% context reduction (150K → 3K tokens)

---

## Quality Gates

### Gate 1: Interface Complete
- [ ] DataProvider interface defined
- [ ] ConvexProvider implemented
- [ ] All tests pass
- [ ] TypeScript compiles with no errors

### Gate 2: Auth Migration Complete
- [ ] All 50+ auth tests pass
- [ ] Zero regression in functionality
- [ ] Performance within 10% of baseline
- [ ] No TypeScript errors

### Gate 3: Full Migration Complete
- [ ] All components use DataProvider
- [ ] No direct Convex imports in components
- [ ] Full test suite passes
- [ ] Documentation updated

### Gate 4: Alternative Providers Working
- [ ] WordPress provider functional
- [ ] Notion provider functional
- [ ] Provider switching works
- [ ] Multi-tenant support validated

---

## Success Metrics

### Technical Metrics
- **Context Reduction:** 98% (150K → 3K tokens)
- **Code Reduction:** 30% fewer LOC
- **Type Safety:** 100% typed (no `any` except entity properties)
- **Test Coverage:** 90%+ unit, 80%+ integration
- **Performance:** <10ms DataProvider overhead

### Strategic Metrics
- **Backend Flexibility:** 3+ providers supported
- **Organization Adoption:** Organizations can choose their backend
- **Developer Velocity:** 50% faster to add new providers
- **Migration Time:** 4-6 weeks (vs 6-8 weeks old plan)

---

## Timeline

| Week | Phase | Features | Deliverables |
|------|-------|----------|--------------|
| 1 | Foundation | F1, F2 | DataProvider interface, ConvexProvider, Config system |
| 2 | Foundation | F3 | Effect.ts service layer |
| 3 | Migration | F4 | Auth components migrated |
| 4 | Migration | F5 | Dashboard components migrated |
| 5 | Cleanup | F6 | Direct Convex dependencies removed |
| 6 | Expansion | F7 | WordPress + Notion providers |

---

## Rollback Strategy

### Rollback Points
1. After Feature 1: Revert to direct Convex hooks
2. After Feature 4: Keep auth on DataProvider, rollback dashboard
3. After Feature 6: Full rollback not possible (breaking change)

### Rollback Procedure
```bash
# Revert to previous commit
git revert <feature_commit_range>

# Re-enable ConvexClientProvider
# Restore direct Convex hook imports

# Run full test suite
bun test
bunx astro check
```

**Rollback Time:** <5 minutes at each gate

---

## Dependencies

### External Dependencies
- Effect.ts library (already installed)
- Convex SDK (already installed)
- Better Auth (already configured)
- Astro 5 + React 19 (already configured)

### Team Dependencies
- Backend Specialist available (Features 1-3)
- Frontend Specialist available (Features 4-5)
- Integration Specialist available (Features 6-7)
- Quality Agent validates after each feature

### Infrastructure Dependencies
- Test Convex deployment (for testing)
- CI/CD pipeline configured
- Feature flag system (for rollback)

---

## Next Actions

### Immediate (This Week)
1. ✅ APPROVED - Ontology validation passed
2. Create feature specification documents (7 features)
3. Set up feature branch: `feature/1-backend-agnostic-frontend`
4. Begin DataProvider interface design
5. Set up performance benchmarking infrastructure

### Week 2-4
1. Implement DataProvider + ConvexProvider
2. Migrate auth components (critical path)
3. Run auth tests continuously
4. Document migration patterns

### Week 5-6
1. Complete dashboard migration
2. Remove direct Convex dependencies
3. Implement alternative providers
4. Update all documentation

---

## Communication Plan

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

---

## Related Documents

- **Idea:** `one/things/ideas/separate.md` (original proposal)
- **Features:** `one/things/features/dataprovider-*.md` (7 feature specs)
- **Implementation:** `frontend/src/providers/` (code location)
- **Tests:** `frontend/tests/integration/dataProvider.test.ts`
- **Migration Guide:** `frontend/MIGRATION.md`

---

**Plan Status:** ✅ Validated and Ready for Implementation
**Created:** 2025-10-13
**Validated By:** Engineering Director Agent
**Ontology Check:** ✅ PASS (all 6 dimensions mapped)
**Risk Level:** Medium (mitigated)
**Strategic Value:** High
