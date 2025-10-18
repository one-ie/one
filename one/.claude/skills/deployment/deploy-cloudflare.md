# Deploy to Cloudflare Pages

**Category:** deployment
**Version:** 1.0.0
**Used By:** agent-ops

## Purpose

Deploys Astro site to Cloudflare Pages.

## Steps

```bash
cd web/
bun run build
wrangler pages deploy dist --project-name=web
```

## Output

```json
{
  "url": "https://web.one.ie",
  "deploymentId": "abc123",
  "status": "success"
}
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
