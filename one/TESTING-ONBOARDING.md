# Testing Frontend-First Onboarding

## Quick Test Guide

### Test 1: ONE Platform Mode (Default)

**Setup:**
```bash
cd web
cp .env.local.example .env.local
# Edit .env.local:
# ORG_NAME=one (or leave blank)
# ORG_WEBSITE=https://one.ie (or leave blank)
bun run dev
```

**Expected Result:**
- Visit http://localhost:4321
- Should see full ONE Platform homepage
- Sidebar should show all navigation items (Stream, Language, Ontology, CLI, etc.)
- Logo should be ONE graphic logo

---

### Test 2: Customer Org Mode

**Setup:**
```bash
cd web
# Edit .env.local:
ORG_NAME=acme
ORG_WEBSITE=https://acme.com
ORG_FOLDER=acme
ONE_BACKEND=off

bun run dev
```

**Expected Result:**
- Visit http://localhost:4321
- Should see "Welcome to acme" with GetStartedPrompt
- Simple prompt: "What would you like to build?"
- 4 quick start buttons (Ecommerce, Blog, Community, Dashboard)
- Sidebar should only show:
  - "acme" text logo
  - Blog link
  - License link
  - acme.com website link
  - "Built with ONE Platform" footer

---

### Test 3: Reserved Name Validation

**Setup:**
```bash
cd cli
bun run build
node dist/index.js
```

**Test Cases:**

1. **Reserved Organization Name:**
   ```
   Organization name: one
   Expected: ❌ Error: Organization name "one" is reserved for ONE Platform
   ```

2. **Reserved Website:**
   ```
   Website: https://one.ie
   Expected: ❌ Error: Website one.ie is reserved for ONE Platform
   ```

3. **Valid Names:**
   ```
   Organization name: acme ✓
   Website: https://acme.com ✓
   Expected: Creates .env.local with proper configuration
   ```

---

### Test 4: Environment Variables Created

**After running `npx oneie`:**

Check that `.env.local` contains:
```bash
# Organization Configuration
ORG_NAME=acme
ORG_WEBSITE=https://acme.com
ORG_FOLDER=acme
ONE_BACKEND=off
```

---

### Test 5: Mobile Responsiveness

**Customer Org Mode:**
1. Resize browser to mobile width (< 768px)
2. Hamburger menu should appear
3. Click to open sidebar
4. Should see minimal navigation (Blog + License)
5. Sidebar should close when clicking outside

---

### Test 6: Backend On/Off Switch

**Frontend-Only Mode (`ONE_BACKEND=off`):**
- No Convex connection attempts
- No auth flows
- All pages work statically
- No console errors about missing backend

**Full Platform Mode (`ONE_BACKEND=on`):**
- Convex client initializes
- Auth flows available
- Real-time subscriptions work
- (Note: Requires valid `PUBLIC_CONVEX_URL` to be set)

---

## Known Issues

### PerformanceChart Hydration Error
```
[astro-island] Error hydrating /src/components/features/PerformanceChart.tsx
```

**Status:** Pre-existing issue, unrelated to onboarding changes
**Impact:** Does not affect onboarding functionality
**Fix:** Will be addressed separately

---

## Files Modified

### CLI
- `cli/src/utils/validation.ts` - Reserved name validation
- `cli/src/commands/init.ts` - Validation in prompts
- `cli/src/utils/installation-setup.ts` - `updateOrgEnvFile` function

### Frontend
- `web/src/components/Sidebar.tsx` - Conditional rendering based on ORG_NAME
- `web/src/components/MinimalSidebar.tsx` - Complete layout for customer orgs
- `web/src/components/GetStartedPrompt.tsx` - Prompt interface
- `web/src/layouts/Layout.astro` - Removed custom conditional logic
- `web/src/pages/index.astro` - Conditional homepage rendering

### Documentation
- `one/things/plans/start-new.md` - Complete implementation guide
- `web/.env.local.example` - Configuration template

---

## Success Criteria

- [ ] ONE Platform mode shows full homepage ✓
- [ ] Customer org mode shows GetStartedPrompt ✓
- [ ] Reserved names are rejected ✓
- [ ] MinimalSidebar renders correctly ✓
- [ ] Mobile navigation works ✓
- [ ] Environment variables created correctly ✓
- [ ] No TypeScript errors ✓
- [ ] No console errors (except known PerformanceChart issue) ✓

---

## Next Steps

1. **Test with real organization** (not just "acme")
2. **Implement AI prompt handling** in GetStartedPrompt
3. **Create template system** (`web/src/templates/`)
4. **Add analytics** to track usage patterns
5. **User testing** with 3-5 beta customers
6. **Production release** announcement

---

**Status:** Ready for testing ✅
**Date:** 2025-01-22
