---
name: mcp:convex-backend
description: Access Convex deployment to query data, inspect schema, view function specs, check logs, and manage environment variables. Use when developing Convex backend features.
---

# Convex Backend MCP

## Purpose

Provides on-demand access to your Convex deployment for querying data, inspecting schema, viewing function specifications, checking execution logs, and managing environment variables.

## When to Use

- Inspecting Convex schema and tables
- Running read-only queries against data
- Viewing function specifications
- Debugging with execution logs
- Managing environment variables
- Understanding database structure
- Testing query logic

## MCP Server Details

**Server:** `convex-backend`
**Type:** Built-in Convex CLI (npx convex mcp start)
**Status:** Available on-demand
**Token Cost:** ~2,000 tokens when loaded
**Authentication:** Uses Convex deployment credentials

## Available Tools

### 1. Status
Query available deployments:
- List all Convex deployments
- Get deployment selector
- Verify deployment access
- Check deployment status

**Usage:** This is typically the first tool to use to find your deployment.

### 2. Tables
List all tables in deployment:
- Table names
- Table metadata
- Schema information
- Index definitions

**Usage:** Understand database structure before querying.

### 3. Run One-Off Query
Execute sandboxed JavaScript queries:
- Read-only access
- Full JavaScript syntax
- Query against any table
- Test query logic

**Usage:** Test queries before implementing in code.

**Example:**
```javascript
// Query all courses
const courses = await ctx.db.query("things")
  .filter(q => q.eq(q.field("type"), "course"))
  .collect()
return courses
```

### 4. Function Spec
Get metadata for all functions:
- Function signatures
- Argument types
- Return types
- Visibility (public/internal)

**Usage:** Understand available mutations and queries.

### 5. Logs
View recent execution logs:
- Function execution logs
- Error messages
- Performance metrics
- Structured log objects

**Usage:** Debug issues and monitor performance.

### 6. Environment Variables
Manage deployment environment:
- **envList** - List all environment variables
- **envGet** - Get specific variable value
- **envSet** - Set environment variable
- **envRemove** - Remove environment variable

**Usage:** Configure deployment settings.

## Usage Pattern

**Before using this skill:**
```bash
# Ensure you have Convex CLI installed
# and deployment is accessible
npx convex dev  # Or your deployment URL
```

**Common workflows:**
1. Inspect schema: "Show me all tables in Convex"
2. Query data: "Query all courses with status 'published'"
3. Check functions: "List all mutation functions"
4. Debug: "Show recent error logs"
5. Config: "List environment variables"

## Examples

### Inspecting Database Schema
```javascript
// Use tables tool to see:
// - things (organizations, people, entities)
// - connections (relationships)
// - events (audit trail)
// - knowledge (labels, vectors)
```

### Running Test Queries
```javascript
// Test query before implementing
const result = await ctx.db.query("things")
  .withIndex("by_type_and_org", q =>
    q.eq("type", "course")
     .eq("organizationId", "org_123")
  )
  .filter(q => q.eq(q.field("status"), "published"))
  .collect()

return result
```

### Viewing Function Specifications
```javascript
// See all mutations and queries:
// - courses:create
// - courses:update
// - courses:delete
// - courses:list
// - courses:get
```

### Checking Execution Logs
```javascript
// View recent logs for debugging:
// - Error messages
// - Performance metrics
// - Function execution traces
// - Database query timing
```

### Managing Environment Variables
```javascript
// List all env vars
envList()

// Set new variable
envSet("STRIPE_WEBHOOK_SECRET", "whsec_xxx")

// Get specific variable
envGet("CONVEX_DEPLOYMENT")
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 2,000 tokens always consumed
- Usage: Even when not querying Convex

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~500 tokens (instructions)
- Savings: ~1,500 tokens (75%)

## Integration

**Works with:**
- `agent-backend:create-mutation` - Build mutations
- `agent-backend:create-query` - Build queries
- `agent-backend:design-schema` - Schema design

**Complements:**
- Convex Dashboard (visual inspection)
- `npx convex dev` (local development)
- TypeScript (type safety)

## Related Skills

- `agent-backend:create-mutation` - Mutation implementation
- `agent-backend:create-query` - Query implementation
- `convex/test-function` - Function testing

## Installation

**Convex MCP is built into the CLI:**
```bash
# Already available if you have Convex installed
npx convex --version

# Start MCP server (if needed standalone)
npx convex mcp start
```

## Best Practices

1. **Use status first** - Find your deployment before other operations
2. **Test queries** - Use runOneoffQuery before implementing
3. **Check function specs** - Understand available functions
4. **Review logs** - Debug with execution logs
5. **Secure env vars** - Never expose secrets in queries

## Common Workflows

### Schema Exploration
```bash
# 1. Check deployment status
# 2. List all tables
# 3. Understand table structure
# 4. Plan new schema changes
```

### Query Development
```bash
# 1. Test query with runOneoffQuery
# 2. Verify results
# 3. Implement in mutation/query file
# 4. Test with Convex dev
```

### Debugging
```bash
# 1. Check recent logs
# 2. Identify error patterns
# 3. Test fix with runOneoffQuery
# 4. Implement fix
# 5. Verify in logs
```

### Configuration
```bash
# 1. List current env vars
# 2. Set new variables
# 3. Verify with envGet
# 4. Test deployment
```

## 6-Dimension Ontology Integration

**Schema Understanding:**
```javascript
// Inspect ontology tables
tables() // Shows:
// - groups (organizations)
// - things (66 entity types)
// - connections (25 relationship types)
// - events (67 event types)
// - knowledge (labels, vectors)
```

**Query Testing:**
```javascript
// Test organization-scoped query
const courses = await ctx.db.query("things")
  .withIndex("by_org_and_type", q =>
    q.eq("organizationId", orgId)
     .eq("type", "course")
  )
  .collect()
```

## Deployment Configuration

**Current setup:**
- **Deployment:** shocking-falcon-870.convex.cloud
- **Schema:** 5 tables (groups, things, connections, events, knowledge)
- **Functions:** Mutations, queries, actions
- **Environment:** Production + dev

## Troubleshooting

### Can't find deployment
- Check Convex credentials
- Verify deployment URL
- Run `npx convex dev` first

### Query fails
- Check table names
- Verify index exists
- Test simpler query first
- Review function spec

### Logs not showing
- Check time range
- Verify function executed
- Review log level
- Check deployment

### Environment variables
- Use envList to see all vars
- Check variable name spelling
- Verify permissions
- Review deployment config

## Security Notes

1. **Read-only queries:** runOneoffQuery cannot modify data
2. **Environment variables:** Store secrets securely
3. **Deployment access:** Requires proper credentials
4. **Logs:** May contain sensitive data

## Version History

- **1.0.0** (2025-11-15): Initial Convex MCP skill for agent-backend

---

**Token-optimized:** Load only when querying Convex, save ~1,500 tokens per session
