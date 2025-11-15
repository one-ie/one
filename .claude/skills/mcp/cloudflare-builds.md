---
name: mcp:cloudflare-builds
description: Monitor Cloudflare Pages builds, view deployment logs, and track build status. Use for deployment monitoring and troubleshooting.
---

# Cloudflare Builds MCP

## Purpose

Provides on-demand access to Cloudflare Pages build monitoring, deployment logs, and build status tracking.

## When to Use

- Monitoring deployment builds
- Viewing build logs
- Troubleshooting failed deployments
- Tracking deployment status
- Analyzing build performance

## MCP Server Details

**Server:** `cloudflare-builds`
**Type:** Remote SSE endpoint (via mcp-remote)
**Status:** Available on-demand
**Token Cost:** ~3,000 tokens when loaded
**Authentication:** Requires `CLOUDFLARE_API_KEY` from `.env`

## Available Tools

### 1. List Builds
View recent builds:
- Build status (success, failure, in progress)
- Build timestamps
- Deployment IDs
- Branch information

### 2. View Build Logs
Access detailed logs:
- Build output
- Error messages
- Deployment steps
- Performance metrics

### 3. Monitor Deployments
Track deployments:
- Real-time build status
- Deployment URLs
- Build duration
- Asset information

### 4. Analyze Failures
Debug build issues:
- Error stack traces
- Failed build steps
- Dependency issues
- Configuration errors

## Usage Pattern

**Before using this skill:**
```bash
# Ensure CLOUDFLARE_API_KEY is in .env
# Requires Node.js 20.19.0+ (run: nvm use)
```

**Common workflows:**
1. Check recent builds: "Show recent Cloudflare deployments"
2. View logs: "Show logs for latest build"
3. Debug failure: "Why did the last deployment fail?"
4. Track status: "Is the deployment complete?"

## Examples

### Monitoring Recent Deployments
```typescript
// MCP shows:
// - Last 10 deployments
// - Status for each
// - Deployment URLs
// - Build times
```

### Debugging Failed Build
```typescript
// MCP provides:
// - Error messages
// - Failed build step
// - Dependency issues
// - Suggested fixes
```

### Performance Analysis
```typescript
// MCP displays:
// - Build duration trends
// - Asset sizes
// - Optimization opportunities
// - Build time comparisons
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 3,000 tokens always consumed
- Usage: Even when not deploying

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~700 tokens (instructions)
- Savings: ~2,300 tokens (77%)

## Integration

**Works with:**
- `agent-ops:deploy-web` - Deployment automation
- `/deploy` command - Web deployment workflow
- `agent-ops` specialist - DevOps operations

**Complements:**
- Cloudflare Analytics
- Wrangler CLI
- GitHub Actions

## Related Skills

- `mcp:cloudflare-docs` - Cloudflare API documentation
- `agent-ops:deploy-web` - Automated deployment
- `agent-ops:check-deployment-health` - Health checks

## Environment Setup

**Required in `.env`:**
```bash
CLOUDFLARE_GLOBAL_API_KEY=your-key-here
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_EMAIL=your-email
```

**Required Node version:**
- Node.js 20.19.0 or higher
- Use `nvm use` to switch versions

## Best Practices

1. **Monitor deployments** - Check builds after push
2. **Review logs** - Analyze build output for warnings
3. **Track performance** - Monitor build times
4. **Debug quickly** - Use logs to identify issues
5. **Optimize builds** - Review asset sizes

## Common Issues

### Authentication errors
- Verify `CLOUDFLARE_API_KEY` in `.env`
- Check API key permissions
- Ensure account ID is correct

### Node version errors
- Requires Node 20.19.0+
- Run `nvm use` to switch versions
- Update `.nvmrc` if needed

### Connection issues
- Check internet connectivity
- Verify Cloudflare API status
- Review firewall settings

## Deployment Workflow

```bash
# 1. Make changes
git add . && git commit -m "Update"

# 2. Deploy
/deploy  # or: wrangler pages deploy dist

# 3. Monitor build (this skill)
# - Check build status
# - Review logs
# - Verify deployment
```

## Version History

- **1.0.0** (2025-11-15): Initial MCP skill migration from always-loaded MCP server

---

**Token-optimized:** Load only during deployment, save ~2,300 tokens per session
