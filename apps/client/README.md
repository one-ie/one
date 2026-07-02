# Your Business, on ONE

You already know Claude Code. You already know how to get code written fast. This repo is the next step: it gives you the tools and the vocabulary to understand what you're building, not just that it works. That's the difference between vibing and engineering — and it's a smaller gap than you think.

Free plan. No credit card. One business, one workspace.

---

## What this is

Your business node — three folders that declare everything your business knows, grows, and shows. One CLI (`npx oneie`) operates it. No servers to run, no database to manage, no substrate code to write.

```
my-business/            ← your business (a node)
├── ai/                 knows  →  agents · skills · tools · workflows · context.md
├── data/                grows  →  types · content · lifecycles
├── site/                 shows  →  Astro + shadcn + ONE plugins (one.config.ts)
└── workspace.toml         who you are
```

Every file compiles to one typed call on the ONE substrate. Every command calls a **receiver** — a named, typed action. That's the whole model.

**2-minute setup:**

```bash
# 1. Install the ONE CLI
npm install -g @oneie/cli        # gives you: one · oneie

# 2. Configure
cp .env.example .env.local
# Edit .env.local — set WORKSPACE_OWNER_EMAIL

# 3. Provision
one setup

# 4. You're live
one status                    # see your usage + credits
one push                      # ship agents + skills
one deploy                    # ship site/ to Cloudflare Pages
```

---

## The node shape

Three folders, one headline file each:

| Folder | Is | Headline file |
|--------|-----|---------------|
| `ai/` | what it knows | `ai/context.md` → agents read this every turn |
| `data/` | what it grows | `data/lifecycles/*.toml` → up to 5 funnels |
| `site/` | what it shows | `site/one.config.ts` → brand tokens + backend key |

---

## The commands

```bash
one setup                       # stand up your workspace (idempotent)
one push [path] [--dry-run]     # upsert agents + skills, then close the loop
one status                      # your usage — credits, meters, plan
one deploy                      # wrangler pages deploy site/
one market [query]              # browse the capability market
one hire <skillId> --budget 50  # hire a peer agent for a skill
one earn                        # accept payment for work you do
```

`--dry-run` injects `simulate: true` — projects the outcome, commits nothing. Dry-run-first on every irreversible verb.

---

## Site

`site/` is the [ONE Astro starter](https://github.com/one-ie/one) — shadcn/ui, React 19, Cloudflare Workers, pre-wired to ONE.

```bash
cd site && bun install && bun run dev    # local dev
one deploy                               # ship to Cloudflare Pages
```

Brand the site in `site/one.config.ts` — 6 tokens, everything rebrands.

---

## Outgrew a single business?

If you start managing other businesses' workspaces — reselling credits at a
margin, provisioning branded client workspaces — that's the **agency** plan,
a different shape (it adds a `clients/` folder and per-client economics):

```bash
npx oneie create agency my-agency
```

See [github.com/one-ie/one — apps/agency](https://github.com/one-ie/one/tree/main/apps/agency).

---

## Learn more

| Read | For |
|------|-----|
| [CLAUDE.md](CLAUDE.md) | Operating manual — the node shape, the commands, the rules |
| [AGENTS.md](AGENTS.md) | How an agent orients and builds in this repo |
