# /deploy

Build and deploy this ONE site to Cloudflare Workers.

```bash
bun run build          # astro build → dist/ (CF Workers static + SSR)
bunx wrangler deploy   # deploy to your Cloudflare account
```

## Before deploying

- Set `ONE_API_KEY` as a Cloudflare secret: `bunx wrangler secret put ONE_API_KEY`
- Confirm `one.config.ts backend.baseUrl` points at the right ONE backend (default `https://one.ie`).
- `bun run test` is green and `bun run typecheck` (astro check) passes.

The chat/track scripts load from `one.ie` at runtime — no extra deploy step for them.
