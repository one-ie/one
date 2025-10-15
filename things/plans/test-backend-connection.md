# Test: Switch Frontend to Backend Convex

## Goal

Simple test to verify frontend can connect to `backend/convex` instead of `frontend/convex` and auth still works.

**No code changes required** - just environment variable swap.

---

## Current State

```
frontend/
├── convex/           ← Frontend's own Convex deployment
│   ├── schema.ts
│   ├── auth.ts
│   └── mutations/
└── .env.local
    └── PUBLIC_CONVEX_URL=https://frontend-deployment.convex.cloud

backend/
└── convex/           ← Backend's Convex deployment (copy of frontend)
    ├── schema.ts
    ├── auth.ts
    └── mutations/
```

**Frontend connects to:** `frontend/convex` deployment

---

## Target State (Test)

```
frontend/
├── convex/           ← Keep for now (don't delete)
│   └── [unused]
└── .env.local
    └── PUBLIC_CONVEX_URL=https://backend-deployment.convex.cloud
                          ^^^^^^^^ Changed to backend

backend/
└── convex/           ← Frontend now uses this
    ├── schema.ts
    ├── auth.ts
    └── mutations/
```

**Frontend connects to:** `backend/convex` deployment

---

## Prerequisites

### 1. Verify Backend Convex is Deployed

```bash
cd backend/
convex deploy

# Output should show:
# ✓ Deployment successful
# URL: https://your-backend-deployment.convex.cloud
```

### 2. Verify Schemas Match

Both `frontend/convex/schema.ts` and `backend/convex/schema.ts` should be identical.

```bash
# Check if they're the same
diff frontend/convex/schema.ts backend/convex/schema.ts

# If different, copy frontend schema to backend
cp frontend/convex/schema.ts backend/convex/schema.ts

# Redeploy backend
cd backend/ && convex deploy
```

### 3. Verify Auth Configuration Matches

Check that `backend/convex/auth.ts` and `backend/convex/auth.config.ts` match frontend.

```bash
# Compare auth files
diff frontend/convex/auth.ts backend/convex/auth.ts
diff frontend/convex/auth.config.ts backend/convex/auth.config.ts

# If different, copy
cp frontend/convex/auth.ts backend/convex/auth.ts
cp frontend/convex/auth.config.ts backend/convex/auth.config.ts

# Redeploy
cd backend/ && convex deploy
```

---

## Test Steps

### Step 1: Get Backend Convex URL

```bash
cd backend/

# Get deployment URL
convex dev --once

# Output will show:
# Convex URL: https://your-backend-deployment.convex.cloud
#             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#             Copy this URL
```

Or find it in the Convex dashboard at https://dashboard.convex.dev

### Step 2: Update Frontend Environment

**File: `frontend/.env.local`**

```bash
# Before
PUBLIC_CONVEX_URL=https://frontend-deployment.convex.cloud
CONVEX_DEPLOYMENT=frontend-deployment-name
CONVEX_URL=https://frontend-deployment.convex.cloud

# After
PUBLIC_CONVEX_URL=https://backend-deployment.convex.cloud
CONVEX_DEPLOYMENT=backend-deployment-name
CONVEX_URL=https://backend-deployment.convex.cloud
```

**Important:** Make sure to update ALL three variables if they exist.

### Step 3: Restart Frontend Dev Server

```bash
cd frontend/

# Stop current dev server (Ctrl+C)

# Clear any cached environment
rm -rf .astro/

# Start fresh
bun run dev
```

Frontend should now connect to `backend/convex` instead of `frontend/convex`.

### Step 4: Verify Connection

Open browser console (F12) and check:

```javascript
// Check which Convex deployment is being used
console.log(import.meta.env.PUBLIC_CONVEX_URL);

// Should output:
// https://backend-deployment.convex.cloud
```

### Step 5: Test Auth Flow

**Sign Up Test:**
1. Go to `http://localhost:4321/account/signup`
2. Create new account with email/password
3. Check that user is created

**Verify in Convex Dashboard:**
1. Go to https://dashboard.convex.dev
2. Open **backend** deployment (not frontend)
3. Click "Data" tab
4. Check `users` table - new user should be there

**Sign In Test:**
1. Go to `http://localhost:4321/account/signin`
2. Sign in with credentials from step 5.2
3. Should redirect to `/account` (dashboard)
4. Check `sessions` table in backend Convex - session should exist

**Sign Out Test:**
1. Click sign out button
2. Should redirect to home
3. Session should be marked as expired

### Step 6: Test Queries/Mutations

If you have any existing pages that use Convex:

```typescript
// Example: Token listing page
const tokens = useQuery(api.queries.entities.list, { type: "token" });
```

Verify that:
- Queries return data from **backend** Convex
- Mutations write to **backend** Convex
- Real-time subscriptions work

---

## Verification Checklist

- [ ] `PUBLIC_CONVEX_URL` points to backend deployment
- [ ] Frontend dev server restarted with new env
- [ ] Browser console shows correct Convex URL
- [ ] Sign up creates user in **backend** `users` table
- [ ] Sign in creates session in **backend** `sessions` table
- [ ] Sign out works correctly
- [ ] All existing queries return data from backend
- [ ] All mutations write to backend
- [ ] Real-time subscriptions still work
- [ ] No console errors related to Convex

---

## Common Issues

### Issue 1: "Schema mismatch" Error

**Error:**
```
Error: Schema mismatch between client and server
```

**Fix:**
```bash
# Backend schema needs to match frontend schema exactly
cp frontend/convex/schema.ts backend/convex/schema.ts
cd backend/ && convex deploy
```

### Issue 2: "Auth configuration not found"

**Error:**
```
Error: Better Auth not configured
```

**Fix:**
```bash
# Copy auth files from frontend to backend
cp frontend/convex/auth.ts backend/convex/auth.ts
cp frontend/convex/auth.config.ts backend/convex/auth.config.ts
cd backend/ && convex deploy
```

### Issue 3: Old environment cached

**Error:**
```
Still connecting to old deployment
```

**Fix:**
```bash
# Clear all caches
cd frontend/
rm -rf .astro/
rm -rf node_modules/.vite/

# Restart
bun run dev
```

### Issue 4: Missing environment variables

**Error:**
```
Error: CONVEX_URL is not defined
```

**Fix:**
```bash
# Make sure ALL Convex env vars are set
cd frontend/
cat .env.local

# Should have:
PUBLIC_CONVEX_URL=https://backend-deployment.convex.cloud
CONVEX_DEPLOYMENT=backend-deployment-name
CONVEX_URL=https://backend-deployment.convex.cloud
```

### Issue 5: CORS errors

**Error:**
```
CORS policy blocked request to Convex
```

**Fix:**
```bash
# Make sure frontend URL is allowed in Convex dashboard
# Go to dashboard.convex.dev → Settings → CORS
# Add: http://localhost:4321
```

---

## Success Criteria

✅ **Test passes if:**
1. Frontend connects to backend Convex deployment
2. User can sign up (creates user in backend)
3. User can sign in (creates session in backend)
4. User can sign out
5. All queries/mutations work with backend data
6. No console errors

❌ **Test fails if:**
1. Frontend still connects to frontend Convex
2. Auth doesn't work
3. Queries return empty data
4. Console shows Convex errors

---

## Rollback Plan

If test fails, easily rollback:

```bash
# Revert frontend/.env.local
PUBLIC_CONVEX_URL=https://frontend-deployment.convex.cloud
CONVEX_DEPLOYMENT=frontend-deployment-name
CONVEX_URL=https://frontend-deployment.convex.cloud

# Restart frontend
cd frontend/
bun run dev
```

Everything goes back to using `frontend/convex`.

---

## Next Steps After Test Passes

Once this basic connection test works:

1. **Sync Data:** Copy any existing data from `frontend/convex` to `backend/convex`
2. **Update Production:** Point production frontend to backend Convex
3. **Deprecate Frontend Convex:** Stop using `frontend/convex` entirely
4. **Then:** Move to full API separation (using `separate.md` plan)

---

## Quick Command Reference

```bash
# Deploy backend Convex
cd backend/ && convex deploy

# Copy schema from frontend to backend
cp frontend/convex/schema.ts backend/convex/schema.ts

# Copy all Convex files from frontend to backend
cp -r frontend/convex/* backend/convex/

# Restart frontend with new env
cd frontend/ && rm -rf .astro/ && bun run dev

# Check current Convex URL in browser console
console.log(import.meta.env.PUBLIC_CONVEX_URL)
```

---

## Testing Timeline

**Total Time:** 15-30 minutes

1. **5 min:** Verify backend Convex deployed
2. **5 min:** Update environment variables
3. **5 min:** Restart and verify connection
4. **10 min:** Test auth flow (signup, signin, signout)
5. **5 min:** Test queries/mutations

---

## What This Tests

✅ **Tests:**
- Frontend can connect to different Convex deployment
- Auth works across different deployments
- Queries/mutations work across deployments
- Real-time subscriptions work

❌ **Does NOT test:**
- API key authentication (that's in `separate.md`)
- REST API endpoints (that's in `separate.md`)
- Multi-tenancy (that's in `separate.md`)

This is purely a **connection test** - making sure the plumbing works before we change the architecture.

---

## File Changes Required

### Only 1 file changes:

**`frontend/.env.local`:**
```diff
- PUBLIC_CONVEX_URL=https://frontend-deployment.convex.cloud
- CONVEX_DEPLOYMENT=frontend-deployment-name
- CONVEX_URL=https://frontend-deployment.convex.cloud

+ PUBLIC_CONVEX_URL=https://backend-deployment.convex.cloud
+ CONVEX_DEPLOYMENT=backend-deployment-name
+ CONVEX_URL=https://backend-deployment.convex.cloud
```

No code changes. No schema changes. Just environment variables.

---

## Expected Console Output

**Before (using frontend/convex):**
```
[vite] connecting to Convex...
[convex] Connected to https://frontend-deployment.convex.cloud
```

**After (using backend/convex):**
```
[vite] connecting to Convex...
[convex] Connected to https://backend-deployment.convex.cloud
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                       Should show backend deployment
```

---

## Data Migration (Optional)

If you have existing data in `frontend/convex` that you want in `backend/convex`:

### Option 1: Manual Export/Import

```bash
# Export from frontend deployment
cd frontend/
convex export --path ./data-export/

# Import to backend deployment
cd ../backend/
convex import --path ../frontend/data-export/
```

### Option 2: Copy Schema and Start Fresh

```bash
# Just copy schema, start with empty backend database
cp frontend/convex/schema.ts backend/convex/schema.ts
cd backend/ && convex deploy
```

**For this test:** Start fresh (Option 2) is easier.

---

## Conclusion

This test answers one simple question:

**Can the frontend successfully connect to and use backend/convex instead of frontend/convex?**

If yes → proceed to full API separation plan
If no → debug connection issues first

**Expected result:** Everything works exactly the same, just pointing to a different Convex deployment.
