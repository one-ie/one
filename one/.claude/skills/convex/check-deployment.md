# Check Convex Deployment

**Category:** convex
**Version:** 1.0.0
**Used By:** agent-ops, agent-quality

## Purpose

Verifies Convex backend deployment status and health.

## Inputs

- **deploymentName** (string, optional): Deployment to check. Default: from CONVEX_DEPLOYMENT env

## Outputs

- **isHealthy** (boolean): Deployment is healthy
- **functions** (array): List of deployed functions
- **schemaVersion** (string): Current schema version
- **errors** (array): Deployment errors if any

## Example

```bash
npx convex deploy --prod

# Check status
npx convex logs --success
```

**Output:**
```json
{
  "isHealthy": true,
  "functions": [
    "mutations/entities:createBlogPost",
    "queries/entities:listBlogPosts"
  ],
  "schemaVersion": "1.0.0",
  "errors": []
}
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
