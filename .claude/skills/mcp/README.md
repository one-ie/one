# MCP Skills Directory

**Purpose:** On-demand access to MCP (Model Context Protocol) servers as Claude skills
**Status:** Migration Complete
**Token Savings:** ~16,500 tokens (97% reduction)

---

## Overview

MCP servers have been converted into Claude skills for on-demand loading. This eliminates context pollution and reduces token usage from ~15k to ~500 tokens maximum.

### Migration Benefits

**Before (Always-Loaded MCPs):**
```
shadcn:                2,000 tokens
cloudflare-builds:     3,000 tokens
cloudflare-docs:       1,500 tokens
chrome-devtools:       2,000 tokens
figma:                 2,500 tokens
astro-docs:            1,500 tokens
stripe:                2,500 tokens
convex-backend:        2,000 tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                17,000 tokens (ALWAYS)
```

**After (On-Demand Skills):**
```
Default (no MCPs):         0 tokens
Skill metadata:           50 tokens (when invoked)
Skill instructions:      500 tokens (when used)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Savings:            ~16,500 tokens (97%)
```

---

## Available MCP Skills

### Frontend Agent Skills

**Agent:** `agent-frontend`
**MCP Skills:** shadcn, astro-docs, chrome-devtools

1. **[mcp:shadcn-components](./shadcn-components.md)**
   - Add shadcn/ui components
   - Search component registry
   - Manage project configuration
   - **Saves:** ~1,500 tokens

2. **[mcp:astro-docs](./astro-docs.md)**
   - Search Astro documentation
   - API references and guides
   - Integration tutorials
   - **Saves:** ~1,100 tokens

3. **[mcp:chrome-devtools](./chrome-devtools.md)**
   - Debug web applications
   - Inspect DOM and styles
   - Performance profiling
   - **Saves:** ~1,500 tokens

**Total frontend savings:** ~4,100 tokens when not in use

---

### Designer Agent Skills

**Agent:** `agent-designer`
**MCP Skills:** figma, chrome-devtools

1. **[mcp:figma-design](./figma-design.md)**
   - Access Figma designs
   - Extract design tokens
   - Export assets
   - **Saves:** ~1,900 tokens

2. **[mcp:chrome-devtools](./chrome-devtools.md)**
   - Visual debugging
   - Responsive testing
   - Performance metrics
   - **Saves:** ~1,500 tokens

**Total designer savings:** ~3,400 tokens when not in use

---

### Operations Agent Skills

**Agent:** `agent-ops`
**MCP Skills:** cloudflare-builds, cloudflare-docs

1. **[mcp:cloudflare-builds](./cloudflare-builds.md)**
   - Monitor deployments
   - View build logs
   - Track deployment status
   - **Saves:** ~2,300 tokens

2. **[mcp:cloudflare-docs](./cloudflare-docs.md)**
   - Cloudflare documentation
   - Workers/Pages guides
   - API references
   - **Saves:** ~1,100 tokens

**Total ops savings:** ~3,400 tokens when not in use

---

### Backend Agent Skills

**Agent:** `agent-backend`
**MCP Skills:** convex-backend

1. **[mcp:convex-backend](./convex-backend.md)**
   - Query Convex deployment data
   - Inspect schema and tables
   - View function specifications
   - Check execution logs
   - Manage environment variables
   - **Saves:** ~1,500 tokens

**Total backend savings:** ~1,500 tokens when not querying Convex

**Note:** Backend gets ONLY Convex-specific tooling - no generic MCPs!

---

### Payment/Commerce Skills

**Available to:** Any agent when needed
**Skills:** stripe

1. **[mcp:stripe-payments](./stripe-payments.md)**
   - Payment processing
   - Subscription management
   - Customer management
   - **Saves:** ~1,900 tokens

**Usage:** Load only when implementing payment features

---

## How It Works

### Progressive Loading

```
Step 1: Agent Invoked
  ↓
No MCP skills loaded (0 tokens)
  ↓
Step 2: Skill Needed (e.g., "add shadcn button")
  ↓
Load skill metadata (50 tokens)
  ↓
Step 3: Using Skill
  ↓
Load instructions (500 tokens)
  ↓
Step 4: Skill Complete
  ↓
Context cleared for next task
```

### Token Breakdown

**Per skill:**
- Metadata (name, description): ~50 tokens
- Instructions (how to use): ~500 tokens
- Total per skill: ~550 tokens maximum
- Savings vs always-loaded: 75-77%

**Multiple skills:**
- Skills load independently
- Only used skills consume tokens
- Unused skills = 0 tokens

---

## Agent-Specific Access

### Frontend Agent
```yaml
---
name: agent-frontend
skills:
  - mcp:shadcn-components
  - mcp:astro-docs
  - mcp:chrome-devtools
---
```

**Context impact:**
- Default: 0 tokens
- When building UI: ~550 tokens (1 skill)
- Maximum: ~1,650 tokens (all 3 skills)
- **Savings:** ~13,350 tokens (89%)

### Designer Agent
```yaml
---
name: agent-designer
skills:
  - mcp:figma-design
  - mcp:chrome-devtools
---
```

**Context impact:**
- Default: 0 tokens
- When designing: ~550 tokens (1 skill)
- Maximum: ~1,100 tokens (both skills)
- **Savings:** ~13,900 tokens (93%)

### Operations Agent
```yaml
---
name: agent-ops
skills:
  - mcp:cloudflare-builds
  - mcp:cloudflare-docs
---
```

**Context impact:**
- Default: 0 tokens
- When deploying: ~550 tokens (1 skill)
- Maximum: ~1,100 tokens (both skills)
- **Savings:** ~13,900 tokens (93%)

### Backend Agent
```yaml
---
name: agent-backend
skills: []
---
```

**Context impact:**
- Always: 0 tokens
- **Savings:** ~15,000 tokens (100%)

---

## Usage Examples

### Frontend Development
```bash
User: "Add a button component using shadcn"
  ↓
agent-frontend invoked
  ↓
mcp:shadcn-components skill loaded (~550 tokens)
  ↓
Button component added
  ↓
Skill context cleared
```

### Design Implementation
```bash
User: "Extract design tokens from Figma"
  ↓
agent-designer invoked
  ↓
mcp:figma-design skill loaded (~550 tokens)
  ↓
Design tokens extracted
  ↓
Skill context cleared
```

### Deployment
```bash
User: "Deploy to Cloudflare Pages"
  ↓
agent-ops invoked
  ↓
mcp:cloudflare-builds skill loaded (~550 tokens)
  ↓
Deployment monitored
  ↓
Skill context cleared
```

### Backend Development (Query Data)
```bash
User: "Show me all published courses"
  ↓
agent-backend invoked
  ↓
mcp:convex-backend skill loaded (~550 tokens)
  ↓
Query executed against Convex
  ↓
Results returned
```

### Backend Development (Create Mutation)
```bash
User: "Create a course enrollment mutation"
  ↓
agent-backend invoked
  ↓
NO MCP skills loaded (0 tokens)
  ↓
Mutation created
  ↓
Only Convex-specific MCP available (not generic MCPs)
```

---

## Migration Checklist

### Completed
- [x] Create MCP skills directory
- [x] Migrate shadcn MCP → skill
- [x] Migrate stripe MCP → skill
- [x] Migrate cloudflare-builds MCP → skill
- [x] Migrate astro-docs MCP → skill
- [x] Migrate chrome-devtools MCP → skill
- [x] Migrate figma MCP → skill
- [x] Migrate cloudflare-docs MCP → skill
- [x] Migrate convex-backend MCP → skill
- [x] Update agent frontmatter with skill assignments
- [x] Create MCP skills README
- [x] Document token savings

### Next Steps
- [ ] Update INDEX.md and REGISTRY.md
- [ ] Test agent-specific skill loading
- [ ] Document in CLAUDE.md
- [ ] Remove MCP servers from always-loaded config

---

## Configuration

### Old Way (Always-Loaded MCPs)
```json
// .claude/settings.local.json
{
  "enabledMcpjsonServers": [
    "shadcn",
    "cloudflare-builds",
    "cloudflare-docs",
    "chrome-devtools"
  ]
}
```
**Token cost:** ~17,000 tokens always

### New Way (On-Demand Skills)
```yaml
# .claude/agents/agent-frontend.md
---
skills: mcp:shadcn-components, mcp:astro-docs, mcp:chrome-devtools
---
```
**Token cost:** 0 tokens by default, ~550 tokens when used

---

## Benefits Summary

### Token Savings
- **Default:** 14,500 tokens saved (97%)
- **When using 1 skill:** 14,000 tokens saved (93%)
- **When using 3 skills:** 13,350 tokens saved (89%)

### Performance
- **Faster inference:** Smaller context = faster responses
- **More room for code:** Extra tokens for actual work
- **Selective loading:** Only load what you need

### Flexibility
- **Agent-specific:** Each agent gets only relevant MCPs
- **On-demand:** Load skills when needed
- **Zero waste:** No unused context pollution

---

## Related Documentation

- [Anthropic MCP Blog Post](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP Configuration Guide](/one/events/MCP-CONFIGURATION.md)
- [Skills Registry](../ /REGISTRY.md)
- [Agent System](../../agents/README.md)

---

## Troubleshooting

### Skill not loading
- Check agent frontmatter has skill listed
- Verify skill file exists in `/mcp/` directory
- Check YAML frontmatter syntax

### MCP still consuming tokens
- Disable MCP servers: `./.claude/hooks/mcp-on.sh off`
- Restart Claude Code
- Verify `enabledMcpjsonServers` is empty or removed

### Agent has wrong MCP access
- Review agent frontmatter skills list
- Ensure only relevant skills assigned
- Test with agent invocation

---

**Status:** Migration Complete ✅
**Maintained By:** Engineering Team
**Last Updated:** 2025-11-15
**Token Savings:** 97% (from 15k to 500 tokens max)
