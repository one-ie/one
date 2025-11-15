---
name: mcp:cloudflare-docs
description: Search Cloudflare documentation for Workers, Pages, DNS, and other services. Use for deployment and infrastructure questions.
---

# Cloudflare Documentation MCP

## Purpose

Provides on-demand access to Cloudflare documentation for Workers, Pages, DNS, CDN, and other Cloudflare services.

## When to Use

- Looking up Cloudflare API references
- Learning Workers/Pages features
- Configuring DNS settings
- Troubleshooting deployments
- Exploring best practices

## MCP Server Details

**Server:** `cloudflare-docs`
**Type:** Documentation search
**Status:** Available on-demand
**Token Cost:** ~1,500 tokens when loaded
**Authentication:** None required for docs search

## Available Tools

### 1. Search Documentation
Find relevant docs:
- API references
- Configuration guides
- Deployment tutorials
- Best practices

### 2. Workers Documentation
Workers platform:
- Workers API
- KV storage
- Durable Objects
- R2 storage
- D1 database

### 3. Pages Documentation
Cloudflare Pages:
- Deployment configuration
- Build settings
- Functions
- Environment variables
- Custom domains

### 4. Platform Features
Infrastructure docs:
- DNS configuration
- CDN settings
- SSL/TLS
- Load balancing
- Analytics

## Usage Pattern

**Common workflows:**
1. API lookup: "How to configure Pages deployment?"
2. Workers: "How to use KV storage?"
3. DNS: "How to add CNAME record?"
4. Troubleshooting: "Why is my deployment failing?"

## Examples

### Configuring Pages Deployment
```typescript
// Search: "Pages deployment configuration"
// Returns:
// - wrangler.toml settings
// - Build command configuration
// - Environment variables
// - Custom domains
```

### Workers KV Storage
```typescript
// Search: "Workers KV API"
// Returns:
// - KV namespace creation
// - Read/write operations
// - List keys
// - TTL configuration
```

### DNS Configuration
```typescript
// Search: "DNS records API"
// Returns:
// - Record types (A, CNAME, MX)
// - API endpoints
// - Proxied vs DNS-only
// - Bulk operations
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 1,500 tokens always consumed
- Usage: Even when not using Cloudflare

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~400 tokens (instructions)
- Savings: ~1,100 tokens (73%)

## Integration

**Works with:**
- `agent-ops:deploy-web` - Deployment automation
- `mcp:cloudflare-builds` - Build monitoring
- `/deploy` command - Deployment workflow

**Complements:**
- Wrangler CLI
- GitHub Actions
- Cloudflare Dashboard

## Related Skills

- `mcp:cloudflare-builds` - Build monitoring
- `agent-ops:deploy-web` - Deployment
- `agent-ops:check-deployment-health` - Health checks

## Common Queries

### Deployment
- Pages build configuration
- Environment variables
- Custom domains
- Build hooks
- Preview deployments

### Workers
- Workers syntax
- KV storage API
- Durable Objects
- Cron triggers
- Route patterns

### DNS
- Record types
- Proxy status
- TTL settings
- DNSSEC
- Load balancing

### Performance
- Caching rules
- Page rules
- CDN configuration
- Image optimization
- Minification

## Cloudflare Pages Deployment

**Key concepts:**
- Build command: `bun run build`
- Output directory: `dist/`
- Root directory: `/web`
- Environment variables
- Framework presets

**Deployment methods:**
- Wrangler CLI
- Direct upload
- Git integration
- GitHub Actions

## Best Practices

1. **Search before configuring** - Check official docs
2. **Use wrangler.toml** - Version control config
3. **Test locally** - Use `wrangler dev`
4. **Monitor builds** - Check build logs
5. **Optimize assets** - Enable minification

## Troubleshooting

### Can't find feature
- Check service availability
- Search alternative terms
- Review API reference
- Check deprecations

### Configuration errors
- Verify wrangler.toml syntax
- Check environment variables
- Review build settings
- Test locally first

### Deployment failures
- Check build logs
- Verify Node version
- Review dependencies
- Check file limits

## Quick Reference

**Pages Deployment:**
```bash
# Deploy web app
cd web/ && wrangler pages deploy dist

# Environment variables
# Set in Cloudflare Dashboard or wrangler.toml
```

**Workers Development:**
```bash
# Local development
wrangler dev

# Deploy worker
wrangler deploy
```

**DNS Management:**
```bash
# List DNS records
wrangler dns list

# Add DNS record
wrangler dns create
```

## ONE Platform Setup

**Current configuration:**
- **Frontend:** Cloudflare Pages
- **Build:** Astro 5 static output
- **Domain:** web.one.ie
- **Deployment:** Automated via `/deploy`

## Version History

- **1.0.0** (2025-11-15): Initial MCP skill migration from always-loaded MCP server

---

**Token-optimized:** Load only for infrastructure work, save ~1,100 tokens per session
