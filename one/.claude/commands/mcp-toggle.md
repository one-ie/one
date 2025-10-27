# MCP Management Commands

Manage MCP context usage - enable/disable MCPs on demand to save tokens.

## Usage

```bash
# Show current MCP status and token usage
./scripts/mcp-toggle.sh status

# Switch to minimal config (only shadcn) - saves ~10k tokens
./scripts/mcp-toggle.sh minimal

# Restore all MCPs
./scripts/mcp-toggle.sh full

# Backup current config
./scripts/mcp-toggle.sh backup

# Restore from backup
./scripts/mcp-toggle.sh restore
```

## Available MCPs

- **shadcn**: 4.7k tokens (component registry)
- **cloudflare-docs**: 1.4k tokens (documentation search)
- **cloudflare-builds**: 5.7k tokens (Workers builds)
- **figma**: 2.0k tokens (design data)
- **ide**: 1.3k tokens (VS Code integration)

**Total:** ~15.1k tokens when all enabled

## Quick Commands

### Daily Development (Recommended)
```bash
./scripts/mcp-toggle.sh minimal
# Only shadcn enabled, saves ~10k tokens
# Restart Claude Code
```

### When Deploying to Cloudflare
```bash
./scripts/mcp-toggle.sh full
# Enable all MCPs
# Restart Claude Code
```

### When Designing with Figma
```bash
# Manually add figma to minimal config
# Or use full config temporarily
```

## Important Notes

1. **Restart Required**: After changing .mcp.json, restart Claude Code
2. **Backup Created**: Script automatically backs up before changes
3. **Token Savings**: Minimal config saves ~10k tokens (66% reduction)
4. **Default Minimal**: Use minimal config for daily work, switch to full only when needed

## Workflow

```bash
# Start of day: Go minimal
./scripts/mcp-toggle.sh minimal
# Restart Claude Code
# Work with ~5k MCP tokens instead of 15k

# When you need Cloudflare tools:
./scripts/mcp-toggle.sh full
# Restart Claude Code
# All MCPs available

# End of day: Back to minimal
./scripts/mcp-toggle.sh minimal
```

## Manual Override

Edit `.mcp.json` directly to enable specific MCPs:

```json
{
  "mcpServers": {
    "shadcn": { ... },           // Always keep
    "cloudflare-docs": { ... }   // Add when needed
  }
}
```

Restart Claude Code after editing.
