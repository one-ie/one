# Quick Start: Backend Convex Migration

## Test 1: Simple Backend Connection

Switch frontend from `frontend/convex` to `backend/convex` with one command:

```bash
./scripts/migrate-to-backend-convex.sh
```

This will:
- ✅ Create backup of current setup
- ✅ Copy all Convex files to backend
- ✅ Deploy backend Convex
- ✅ Update frontend to use backend
- ✅ Clear caches and restart

**Time:** 5-10 minutes

## Rollback (if needed)

```bash
./scripts/rollback-to-frontend-convex.sh
```

## After Migration Works

Once Test 1 passes, proceed to full API separation:

```bash
# See detailed plan
cat one/things/plans/separate.md
```

## Documentation

- **Migration Scripts:** `scripts/README.md`
- **Backend Connection Test:** `one/things/plans/test-backend-connection.md`
- **Full API Separation:** `one/things/plans/separate.md`

## Quick Status Check

```bash
# Check where frontend currently connects
grep PUBLIC_CONVEX_URL frontend/.env.local

# Should show:
# - Frontend Convex: https://veracious-marlin-319.convex.cloud (before)
# - Backend Convex: https://[backend-deployment].convex.cloud (after)
```

## Success Criteria

✅ **Test 1 passes if:**
1. Frontend connects to backend Convex
2. Sign up creates user in backend
3. Sign in works
4. No console errors

Then proceed to Test 2 (API separation).

## Timeline

- **Test 1 (Backend Connection):** 10 minutes
- **Test 2 (API Separation):** 6-8 weeks (see separate.md)

---

**Start here:** `./scripts/migrate-to-backend-convex.sh`
