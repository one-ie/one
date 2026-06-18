# /create

Scaffold a new ONE site from this starter.

```bash
npm create one-app my-site
cd my-site
bun install
bun run dev
```

This clones the starter, installs the workspace packages, and starts Astro dev.

## Customize

1. **Branding** — edit `one.config.ts brand.tokens` (the 6 colors). No hex in components.
2. **Backend** — set `backend.baseUrl` + `ONE_API_KEY` in `.env`.
3. **Plugins** — add `chat()`, `track()`, `auth()`, `backend()` to `one.config.ts plugins`.
4. **Pages** — add `.astro` files in `src/pages/`.
