# create-one-app

Scaffold a ONE-connected Astro site in seconds.

```bash
npm create one-app@latest my-app
# or
bunx create-one-app my-app
```

Copies `site/` as a starting point, prompts for a project name and optional `ONE_API_KEY`, then sets up the workspace.

## What gets scaffolded

```
my-app/
├── src/
│   ├── pages/        ← Astro pages
│   ├── components/   ← shadcn/ui components
│   └── layouts/      ← base layout
├── one.config.ts     ← single config surface
├── .env.example      ← ONE_API_KEY + auth secret
└── wrangler.toml     ← Cloudflare Workers config
```

## Development

```bash
cd my-app
bun install
bun run dev           # localhost:4321
```
