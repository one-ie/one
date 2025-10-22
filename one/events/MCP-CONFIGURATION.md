# MCP Server Configuration

This document explains the Model Context Protocol (MCP) server configuration for the ONE Platform.

## Prerequisites

### Node.js Version

**Required:** Node.js 20.19.0 or higher

The project includes a `.nvmrc` file that specifies Node 20.19.0. To use it:

```bash
# Install nvm if you haven't already
# See: https://github.com/nvm-sh/nvm

# Use the version specified in .nvmrc
nvm use

# Or install and use in one command
nvm install
```

### Environment Variables

**Required in `.env`:**

```bash
# Cloudflare (for cloudflare-builds MCP)
CLOUDFLARE_GLOBAL_API_KEY=your-cloudflare-global-api-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_EMAIL=your-cloudflare-email

# Anthropic (for claude MCP)
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# Figma (for framelink-figma MCP)
FIGMA_ACCESS_TOKEN=figd_your-figma-token
```

These credentials are automatically passed to their respective MCP servers via the `env` configuration in `.mcp.json`.

## Working MCP Servers

### 1. Stripe (`stripe`)
**Status:** ✅ Working
**Type:** Remote HTTPS endpoint
**Configuration:**
```json
{
  "stripe": {
    "url": "https://mcp.stripe.com"
  }
}
```

**Features:**
- Search Stripe documentation
- Manage customers, products, prices
- Create payment links and invoices
- Handle subscriptions and refunds
- View disputes and coupons

### 2. shadcn (`shadcn`)
**Status:** ✅ Available
**Type:** Command-based (npx)
**Configuration:**
```json
{
  "shadcn": {
    "command": "npx",
    "args": ["shadcn@latest", "mcp"]
  }
}
```

**Features:**
- Add shadcn/ui components to projects
- Search component registry
- View component details
- Manage project configuration

### 3. Cloudflare Builds (`cloudflare-builds`)
**Status:** ✅ Enabled (requires Node 20.19.0+)
**Type:** Command-based with authentication
**Configuration:**
```json
{
  "cloudflare-builds": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://builds.mcp.cloudflare.com/sse"],
    "env": {
      "CLOUDFLARE_API_KEY": "${CLOUDFLARE_GLOBAL_API_KEY}",
      "CLOUDFLARE_API_TOKEN": "${CLOUDFLARE_GLOBAL_API_KEY}"
    }
  }
}
```

**Features:**
- Monitor Cloudflare Pages builds
- View build logs and status
- Manage deployments

**Requirements:**
- Node.js 20.19.0+ (use `nvm use` to switch)
- `CLOUDFLARE_GLOBAL_API_KEY` in `.env`

### 4. Chrome DevTools (`chrome-devtools`)
**Status:** ✅ Enabled (requires Node 20.19.0+)
**Type:** Command-based (npx)
**Configuration:**
```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"]
  }
}
```

**Features:**
- Debug web applications
- Inspect DOM and styles
- Monitor network activity
- Access Chrome DevTools Protocol

**Requirements:**
- Node.js 20.19.0+ (use `nvm use` to switch)
- Chrome browser running

### 5. Claude MCP (`claude`)
**Status:** ✅ Enabled
**Type:** Command-based with authentication
**Configuration:**
```json
{
  "claude": {
    "command": "npx",
    "args": ["-y", "@anthropic-ai/mcp-server-claude"],
    "env": {
      "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
    }
  }
}
```

**Features:**
- Access Claude AI capabilities
- Enhanced AI-powered development workflows
- Integration with Anthropic services

**Requirements:**
- `ANTHROPIC_API_KEY` in `.env`

### 6. Framelink Figma MCP (`framelink-figma`)
**Status:** ✅ Enabled
**Type:** Command-based with authentication
**Configuration:**
```json
{
  "framelink-figma": {
    "command": "npx",
    "args": [
      "-y",
      "figma-developer-mcp",
      "--figma-api-key=${FIGMA_ACCESS_TOKEN}",
      "--stdio"
    ]
  }
}
```

**Features:**
- Access Figma designs and files
- Retrieve design tokens and styles
- Export assets and components
- Developer-focused Figma integration

**Requirements:**
- `FIGMA_ACCESS_TOKEN` in `.env`

### 7. Astro Documentation (`astro-docs`)
**Status:** ✅ Enabled
**Type:** Remote HTTP endpoint
**Configuration:**
```json
{
  "astro-docs": {
    "transport": "http",
    "url": "https://mcp.docs.astro.build/mcp"
  }
}
```

**Features:**
- Search Astro documentation
- Get API references
- Access guides and tutorials
- Framework-specific help

**Requirements:**
- None (public endpoint)

## Setup Instructions

### Step 1: Upgrade to Node 20.19.0+

```bash
# If using nvm (recommended)
nvm install 20.19.0
nvm use

# Verify version
node --version  # Should show v20.19.0 or higher
```

### Step 2: Verify Environment Variables

Ensure your `.env` file contains:

```bash
CLOUDFLARE_GLOBAL_API_KEY=your-cloudflare-global-api-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_EMAIL=your-cloudflare-email
```

### Step 3: Restart Claude Code

After making any changes to `.mcp.json` or upgrading Node.js, restart Claude Code to reload the MCP configuration.

## MCP Configuration Patterns

### Pattern 1: Remote HTTPS Endpoint (Stripe)
```json
{
  "server-name": {
    "url": "https://mcp.example.com"
  }
}
```

**When to use:** For hosted MCP servers with simple HTTP/HTTPS access.

### Pattern 2: Command-based (shadcn)
```json
{
  "server-name": {
    "command": "npx",
    "args": ["package-name@latest", "mcp"]
  }
}
```

**When to use:** For npm-installable MCP servers that run as Node.js processes.

### Pattern 3: Remote SSE with Wrapper (mcp-remote)
```json
{
  "server-name": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://sse-endpoint.com"]
  }
}
```

**When to use:** For Server-Sent Events (SSE) endpoints that need the `mcp-remote` wrapper.

## Testing MCP Servers

### Test Remote Endpoint
```bash
curl -s -I https://mcp.example.com
# Should return HTTP 200 or 405 (but not 401/404)
```

### Test Command-based
```bash
npx package-name@latest --help
# Should show help or version info without errors
```

### Check Node Version Requirements
```bash
node --version
# Compare against package requirements
```

## Adding New MCP Servers

1. **Test the server first** using bash commands
2. **Choose the right pattern** (URL vs command)
3. **Add to `.mcp.json`** with minimal configuration
4. **Restart Claude Code** to reload MCP configuration
5. **Document in this file** if it requires special setup

## Current Status Summary

| MCP Server | Status | Type | Notes |
|------------|--------|------|-------|
| Stripe | ✅ Working | Remote HTTPS | Payment processing, no auth needed |
| shadcn | ✅ Working | Command (npx) | UI component management |
| Cloudflare Builds | ✅ Enabled | Command + Auth | Requires Node 20.19.0+ and `.env` credentials |
| Chrome DevTools | ✅ Enabled | Command (npx) | Requires Node 20.19.0+ |
| Claude | ✅ Enabled | Command + Auth | Requires `ANTHROPIC_API_KEY` in `.env` |
| Framelink Figma | ✅ Enabled | Command + Auth | Requires `FIGMA_ACCESS_TOKEN` in `.env` |
| Astro Docs | ✅ Working | Remote HTTP | Astro documentation, no auth needed |

## Troubleshooting

### MCP Server Not Responding

1. Check `.mcp.json` syntax (valid JSON)
2. Restart Claude Code to reload config
3. Test endpoint/command manually
4. Check Claude Code logs for errors
5. Verify Node.js version for command-based MCPs

### Authentication Errors

1. Some MCP servers require API keys
2. Add credentials to environment variables
3. Configure auth in `.mcp.json` (if supported)
4. Contact service provider for access

### Version Conflicts

1. Check Node.js version: `node --version`
2. Upgrade Node if needed
3. Try specific package versions instead of `@latest`
4. Check package documentation for requirements

---

**Last Updated:** 2025-10-22
**ONE Platform Version:** v3.0.0+
