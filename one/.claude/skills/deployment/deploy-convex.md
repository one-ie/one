# Deploy Convex Backend

**Category:** deployment
**Version:** 1.0.0
**Used By:** agent-ops

## Purpose

Deploys Convex backend to production.

## Steps

```bash
cd backend/
npx convex deploy --prod
```

## Output

```json
{
  "deployment": "prod:shocking-falcon-870",
  "functions": 42,
  "status": "deployed"
}
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
