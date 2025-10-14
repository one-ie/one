# Frontend Migration Checklist

## Phase 0: Foundation (✅ COMPLETE)

- [x] Create `useEffectRunner` hook
- [x] Create `useThingService` hook
- [x] Create `useConnectionService` hook
- [x] Define `DataProvider` interface
- [x] Create example components
- [x] Write migration guide
- [x] Write implementation summary
- [x] TypeScript compilation passes

## Phase 1: Provider Implementation (⏳ BACKEND SPECIALIST)

### ConvexProvider
- [ ] Create `/frontend/src/providers/convex.ts`
- [ ] Implement `ThingOperations`
  - [ ] `list()` - Query entities by type/status
  - [ ] `get()` - Get single entity by ID
  - [ ] `create()` - Create new entity
  - [ ] `update()` - Update entity properties
  - [ ] `delete()` - Soft delete entity
- [ ] Implement `ConnectionOperations`
  - [ ] `list()` - Query connections
  - [ ] `get()` - Get single connection
  - [ ] `getRelated()` - Get related entities
  - [ ] `create()` - Create relationship
  - [ ] `update()` - Update connection metadata
  - [ ] `delete()` - Remove connection
- [ ] Implement `EventOperations`
  - [ ] `list()` - Query events
  - [ ] `get()` - Get single event
  - [ ] `create()` - Log new event
- [ ] Implement `KnowledgeOperations`
  - [ ] `search()` - Semantic search
  - [ ] `create()` - Create knowledge item
  - [ ] `linkToThing()` - Link to entity
- [ ] Handle real-time subscriptions (WebSocket)
- [ ] Error transformation to `DataProviderError` types
- [ ] Write unit tests for provider

### Hook Updates
- [ ] Update `useThingService` to use DataProvider
- [ ] Update `useConnectionService` to use DataProvider
- [ ] Add Effect.ts Layer composition
- [ ] Test with real Convex backend

### WordPressProvider (Optional)
- [ ] Create `/frontend/src/providers/wordpress.ts`
- [ ] Implement REST API calls
- [ ] Add polling for real-time updates
- [ ] Authentication handling
- [ ] Error handling and retries

## Phase 2: Page Migration - Phase A (Low Traffic)

### `/about` Page
- [ ] Replace Convex hooks with Effect.ts services
- [ ] Test page functionality
- [ ] Run `bunx astro check` ✅
- [ ] Run `bun test` ✅
- [ ] Manual testing ✅
- [ ] Build test ✅

### `/blog` Index Page
- [ ] Replace Convex hooks
- [ ] Test blog list rendering
- [ ] Test search functionality
- [ ] Run tests ✅
- [ ] Manual testing ✅

### `/blog/[...slug]` Detail Pages
- [ ] Replace Convex hooks
- [ ] Test blog post rendering
- [ ] Test related posts
- [ ] Run tests ✅
- [ ] Manual testing ✅

### `/docs` Pages (if exist)
- [ ] Replace Convex hooks
- [ ] Test documentation rendering
- [ ] Run tests ✅
- [ ] Manual testing ✅

**Phase A Complete?** ✅ All tests pass, all pages work, no TypeScript errors

## Phase 3: Page Migration - Phase B (Medium Traffic)

### `/courses` Index
- [ ] Replace Convex hooks
- [ ] Test course listing
- [ ] Test filters/search
- [ ] Run tests ✅
- [ ] Manual testing ✅

### `/courses/[id]` Detail
- [ ] Replace Convex hooks
- [ ] Test course details
- [ ] Test enrollment flow
- [ ] Test related courses
- [ ] Run tests ✅
- [ ] Manual testing ✅

### `/products` Page
- [ ] Replace Convex hooks
- [ ] Test product listing
- [ ] Test purchase flow
- [ ] Run tests ✅
- [ ] Manual testing ✅

### `/dashboard` Page
- [ ] Replace Convex hooks
- [ ] Test user dashboard
- [ ] Test data visualization
- [ ] Run tests ✅
- [ ] Manual testing ✅
- [ ] Test auth integration ✅

**Phase B Complete?** ✅ All tests pass, all pages work, performance maintained

## Phase 4: Page Migration - Phase C (High Traffic)

### `/` Homepage
- [ ] Replace Convex hooks
- [ ] Test hero section
- [ ] Test feature cards
- [ ] Test dynamic content
- [ ] Run tests ✅
- [ ] Manual testing ✅
- [ ] Performance testing ✅
- [ ] Lighthouse score > 90 ✅

### `/account/index` Dashboard
- [ ] Replace Convex hooks
- [ ] Test account overview
- [ ] Test settings links
- [ ] Run tests ✅
- [ ] Manual testing ✅
- [ ] **Auth tests** ✅

**Phase C Complete?** ✅ All tests pass, high-traffic pages optimized, auth works

## Phase 5: Page Migration - Phase D (Auth Pages) 🚨 CRITICAL

**⚠️ WARNING: Test extensively before deploying**

### Pre-Migration
- [ ] Backup current auth implementation
- [ ] Document all auth flows
- [ ] Prepare rollback plan
- [ ] Schedule deployment window

### `/account/signin`
- [ ] Replace Convex hooks
- [ ] Test email/password signin
- [ ] Test OAuth signin (GitHub, Google)
- [ ] Test magic link signin
- [ ] Test 2FA flow
- [ ] Run **ALL** auth tests ✅
- [ ] Manual testing (all methods) ✅
- [ ] Error handling ✅

### `/account/signup`
- [ ] Replace Convex hooks
- [ ] Test email/password signup
- [ ] Test OAuth signup
- [ ] Test email verification
- [ ] Run **ALL** auth tests ✅
- [ ] Manual testing ✅

### `/account/settings`
- [ ] Replace Convex hooks
- [ ] Test profile updates
- [ ] Test 2FA enable/disable
- [ ] Test password change
- [ ] Run **ALL** auth tests ✅
- [ ] Manual testing ✅

### `/account/forgot-password`
- [ ] Replace Convex hooks
- [ ] Test password reset request
- [ ] Test reset token email
- [ ] Run auth tests ✅
- [ ] Manual testing ✅

### `/account/reset-password`
- [ ] Replace Convex hooks
- [ ] Test password reset flow
- [ ] Test token validation
- [ ] Test token expiry
- [ ] Run auth tests ✅
- [ ] Manual testing ✅

### `/account/verify-email`
- [ ] Replace Convex hooks
- [ ] Test email verification
- [ ] Test token validation
- [ ] Run auth tests ✅
- [ ] Manual testing ✅

### `/account/magic-link`
- [ ] Replace Convex hooks
- [ ] Test magic link request
- [ ] Test magic link authentication
- [ ] Test one-time use
- [ ] Run auth tests ✅
- [ ] Manual testing ✅

### Post-Migration Auth Validation
- [ ] Run complete auth test suite ✅
- [ ] Test all 6 auth methods:
  - [ ] Email/password ✅
  - [ ] GitHub OAuth ✅
  - [ ] Google OAuth ✅
  - [ ] Magic links ✅
  - [ ] Password reset ✅
  - [ ] Email verification ✅
  - [ ] 2FA (TOTP) ✅
- [ ] Security testing ✅
- [ ] Rate limiting works ✅
- [ ] Session management ✅
- [ ] Performance testing ✅

**Phase D Complete?** ✅ **ALL** auth tests pass, **ALL** methods work, security validated

## Phase 6: Cleanup & Optimization

### Code Cleanup
- [ ] Remove commented-out Convex code
- [ ] Remove unused imports
- [ ] Remove `convex` from `package.json` dependencies
- [ ] Delete `/frontend/convex/` directory (moved to backend)
- [ ] Update documentation references

### Optimization
- [ ] Implement optimistic updates
- [ ] Add retry logic for failures
- [ ] Implement request batching
- [ ] Add cache management
- [ ] Performance profiling

### Testing
- [ ] Full test suite passes
- [ ] Integration tests added
- [ ] E2E tests for critical flows
- [ ] Performance benchmarks met

### Documentation
- [ ] Update README with new patterns
- [ ] Document provider configuration
- [ ] Add troubleshooting guide
- [ ] Create video walkthrough

## Phase 7: Deployment

### Pre-Deployment
- [ ] All checklists complete
- [ ] All tests passing
- [ ] Performance validated
- [ ] Rollback plan ready
- [ ] Monitoring configured

### Deployment
- [ ] Deploy to staging
- [ ] Test on staging ✅
- [ ] Monitor for errors
- [ ] Deploy to production
- [ ] Monitor production metrics
- [ ] Validate auth flows on production

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Validate Core Web Vitals
- [ ] User acceptance testing
- [ ] Document lessons learned

## Rollback Triggers

If any of these occur, **ROLLBACK IMMEDIATELY:**

- ❌ Auth tests failing
- ❌ Users can't sign in
- ❌ TypeScript errors in production
- ❌ Performance degradation > 20%
- ❌ Error rate increase > 5%
- ❌ Core Web Vitals failing

## Success Metrics

### Technical
- ✅ Zero TypeScript errors
- ✅ All tests passing (50+ auth tests)
- ✅ Build succeeds
- ✅ No Convex imports in components
- ✅ Lighthouse score > 90

### Performance
- ✅ LCP < 2.5s
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Response times maintained
- ✅ No memory leaks

### User Experience
- ✅ All auth methods work
- ✅ No broken pages
- ✅ Real-time updates working (if supported)
- ✅ Error messages helpful
- ✅ Loading states smooth

## Final Validation

Before marking as **COMPLETE:**

```bash
# Run all checks
bunx astro check          # ✅ No TypeScript errors
bun test                  # ✅ All tests pass
bun run build            # ✅ Build succeeds
bun run preview          # ✅ Preview works

# Auth tests specifically
bun test frontend/tests/auth/email-password.test.ts  # ✅
bun test frontend/tests/auth/oauth.test.ts           # ✅
bun test frontend/tests/auth/magic-link.test.ts      # ✅
bun test frontend/tests/auth/password-reset.test.ts  # ✅
bun test frontend/tests/auth/email-verification.test.ts  # ✅
bun test frontend/tests/auth/two-factor.test.ts      # ✅

# Manual verification
# - Visit every migrated page
# - Test every auth method
# - Check error handling
# - Verify loading states
# - Test on mobile
```

---

**Current Status:** Phase 0 Complete ✅

**Next Step:** Backend Specialist implements ConvexProvider

**Timeline:**
- Phase 0: ✅ Complete
- Phase 1: Week 1 (Backend Specialist)
- Phase 2: Week 2 (Frontend Specialist)
- Phase 3: Week 3 (Frontend Specialist)
- Phase 4: Week 4 (Frontend Specialist - Critical)
- Phase 5: Week 5 (Cleanup)
- Phase 6: Week 6 (Optimization)
- Phase 7: Week 7 (Deployment)

**Contact:** Frontend Specialist & Backend Specialist coordination required
