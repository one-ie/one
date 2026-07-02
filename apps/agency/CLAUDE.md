# CLAUDE.md — agency node

You are building **as an agency on ONE**. You resell credits at a margin, provision branded client workspaces, and ship your own agents and skills — all from this repo, operated with `one` (`@oneie/cli`).

## Setup (2 min, one-time)

1. **Install the CLI** — `npm install -g @oneie/cli` (gives you `one` and `oneie`)
2. **Fill `.env.local`** with `AGENCY_OWNER_EMAIL`
3. **Run `one setup`** — returns `{ uid, scopedKey, ownerKey }`. Put `ownerKey` in `ONE_API_KEY`.
4. Done. Your `AGENCY_SLUG`, `CC_ACTOR_ID`, and `ONE_API_KEY` are now in `.env.local`

`one setup` now mints an owner key directly — no Settings UI visit needed.

## One key, full authority

`ONE_API_KEY` is a slug-based owner key (human-class). It covers everything: provisioning, billing, staff ops, and agent pushes.

```bash
export ONE_API_KEY=$(grep '^ONE_API_KEY=' .env.local | cut -d= -f2)
```

To mint a new owner key for any workspace on demand (staff only):

```bash
curl -s -X POST "https://one.ie/api/ask/world:mint-owner-key" \
  -H "Authorization: Bearer $ONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{"slug":"<your-slug>","label":"<your-label>"}}'
```

**API base URL is `https://one.ie`** — not `https://api.one.ie` (that returns 404).

## Who you are

Your agency slug is the `slug` in `agency.toml`. Your Claude Code actor id is `$CC_ACTOR_ID`. You write Markdown and TOML — never TypeDB, never SQL, never substrate internals.

## The node shape

Agency and client are the same three-folder shape. A client overrides the agency by filename; the substrate walk takes the first answer going down.

```
<node>/
├── ai/              knows  →  agents · skills · tools · workflows · context.md
├── data/            grows  →  types · content · lifecycles
├── site/            shows  →  Astro + shadcn + ONE plugins (one.config.ts)
└── _node.toml       who it is  (clients use _node.toml, not client.toml)
```

## What you edit

| File / folder | What it is |
|---|---|
| `agency.toml` | Your agency node: `slug`, `name`, `plan = agency`, `markup_pct`, `pool` |
| `ai/agents/*.md` | Agent definitions — pushed as `<slug>--<name>` with `group: "<slug>"` |
| `ai/skills/*/SKILL.md` | Skill definitions |
| `ai/tools/*.toml` | Tools to connect (`one push` calls `tools:connect`; OAuth via `one ask`) |
| `ai/workflows/*.md` | Workflow definitions — pushed via `world:create-thing` with `group: "<slug>"` |
| `ai/context.md` | Company context — agents read this on every turn |
| `data/types/*.toml` | Custom entity types pushed via `world:declare-types` |
| `data/lifecycles/*.toml` | Lifecycle definitions — convert TOML→JSON with `python3 tomllib` before pushing |
| `site/` | Astro starter — shadcn, React 19, Cloudflare Workers, pre-wired to ONE |
| `site/one.config.ts` | Brand tokens + backend key — the only file you need to edit in `site/` |
| `clients/<slug>/` | Per-client fractal node — same shape, overrides root by filename |
| `clients/<slug>/_node.toml` | Client identity: plan, markup, cap, brand, credits, agents[] |

## The commands

**Build recipe** — provision + operate your agency:

```bash
one setup                      # once — stand up your agency (idempotent)
one client add <slug>          # managed client you own (workspace + credits + brand + agents)
one client invite <slug>       # self-serve client who owns their own workspace
one push [path] [--dry-run]    # ship your agents + skills
one deploy                     # wrangler pages deploy site/
one status                     # your P&L — funded · burned · margin · balance · cap
one ship "<message>"           # git add + commit + push in one step
```

**If `one` CLI isn't available**, call the API directly:

```bash
# Provision a client workspace
curl -s -X POST "https://one.ie/api/ask/world:create-workspace" \
  -H "Authorization: Bearer $ONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"...","slug":"...","parent":"<your-slug>","plan":"studio","markup":20,"cap":50000}}'

# Push an agent
curl -s -X POST "https://one.ie/api/ask/world:create-thing" \
  -H "Authorization: Bearer $ONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"<your-slug>--marketing","type":"agent","group":"<your-slug>","md":"..."}}'

# Check P&L
curl -s -X POST "https://one.ie/api/ask/billing:clients" \
  -H "Authorization: Bearer $ONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{"slug":"<your-slug>"}}'

# Set markup (if showing 0%)
curl -s -X POST "https://one.ie/api/ask/billing:set-markup" \
  -H "Authorization: Bearer $ONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data":{"slug":"<your-slug>","markup_pct":20}}'
```

**The rest of ONE** — discover, then reach anything:

```bash
one catalog [--goal G]         # discover the typed namespace grouped by recipe
one ask <receiver> {json}      # typed pass-through to any receiver (validated before network)
one signal <receiver> {json}   # fire-and-forget variant
one market | hire | bounty     # trade — list, hire peers, post bounties
one earn | usage               # transact — accept payment, read plan usage
one recall | reputation        # coordinate — cross-session memory; standing
```

`--dry-run` validates and prints the plan, writing nothing. Dry-run-first on every irreversible verb.

## MCP tools (native, in this Claude Code session)

`.mcp.json` wires the `@oneie/mcp` server (`one`) so the substrate's tools appear **natively** in this session — no `one ask` wrapper. Approve it in your own `.claude/settings.json` (`enabledMcpjsonServers: ["one"]`); the server reads `ONEIE_API_URL=https://one.ie` + `ONEIE_API_KEY=${ONE_API_KEY}`.

**Requirement:** `ONE_API_KEY` must be in the environment where you launch Claude Code (it lives in `.env.local`). If the `one` MCP tools don't appear, export it first, then restart:

```bash
export ONE_API_KEY=$(grep '^ONE_API_KEY=' .env.local | cut -d= -f2)
```

**Pull your work queue** — the headline tool:

```
tasks_mine { limit?: 20 }   # the OPEN tasks whose words match what you subscribed to,
                            # ranked by LEARNED weight (context-strength), not authored priority
```

Pattern: `tasks_mine` → pick the top task → `/do "<that task>"` → close (the `mark` raises context-strength, so the next pull re-ranks). Subscribe to your words first with `one ask subscriptions:register '{"tags":["marketing","build","sales"]}'`. The generic `signal`/`ask` tools reach every other receiver.

## How you earn

Every credit a client burns is split at the substrate: their cost, **your margin** (`markup_pct`), and the platform's. You never compute margin — `one status` reads it back from the ledger. Fund your pool once; provision clients; watch the margin column.

After provisioning, verify markup is set: `billing:clients {slug:"<your-slug>"}` should show `markup_pct: 20`. If it shows 0, call `billing:set-markup {slug:"<your-slug>", markup_pct:20}`.

## The two halves

| Half | Is | Use it to |
|---|---|---|
| **`one` — the reach** | `@oneie/cli` — every command is one typed SDK call | *act on the world* — provision, push, hire, earn, recall |
| **`/do` — the build** | `@oneie/claude` harness (devDependency) | *improve the thing acting* — author agents, skills, code; gated by rubric ≥ 0.65 |

`one` is how an agent acts; `/do` is how it gets better. Neither invents substrate — `one` only calls existing receivers, `/do` only writes files here.

## `/do` in this repo

`/do "<idea>"` walks the artifact spine — AIM → PROMISE → SURVEY → DESIGN → PLAN → BUILD → TEST → VERIFY → PROVE → TEACH → SHIP → LEARN. Rubric ≥ 0.65 gates every cycle.

In this repo the spine ends at `one push --dry-run` (PROVE).

## Site

`site/` is the ONE Astro starter ([github.com/one-ie/one](https://github.com/one-ie/one)). The only file you edit is `site/one.config.ts`:

```ts
import { defineOne } from '@oneie/frontend'

export default defineOne({
  backend: { baseUrl: 'https://one.ie' },
  brand: {
    tokens: {
      primary: '#your-brand',
      // ... 5 more tokens
    },
  },
  plugins: [
    auth(),
    track({ ws: 'your-slug' }),
    chat({ agent: 'your-agent' }),
  ],
})
```

6 tokens rebrand the entire site. Plugins are served from `one.ie` — zero bundle cost.

## Platform knowledge

### Agency provisioning model

`one setup` calls `agent:bootstrap` with `{ name, actorName?, scope?, ownerEmail? }` → `{ uid, gid, aid, scopedKey }`. Does NOT set plan, markup_pct, or pool — those come from the ONE platform after upgrading the account.

After setup: run `billing:set-markup {slug:"<your-slug>", markup_pct:20}` to set the correct margin if `billing:clients` shows 0%.

### `world:create-workspace` — atomic client provision

```
Request: { name, slug, ownerEmail?, parent?, plan?, credit?, markup?, cap?, brand?, agents? }
Response: { wsid, slug }
Auth:     owner key (manage_workspace) — CC actor key is insufficient
```

`parent` = your agency's own slug. `markup` = per-client override (0–100).

### `world:create-thing` — push agents and workflows

```
Request: { name, type, group, md? }
Response: { tid }
```

**`group` is required.** Always pass your agency's own slug — omitting it stores the thing under the caller's personal workspace and `world:list-things` won't find it.

### `billing:clients` — your P&L

```
Request: { slug: "<your-slug>" }   ← slug is required for staff/owner key calls
Returns: { agency: { slug, name, markup_pct, pool }, clients: [...] }
```

### `billing:set-markup` — fix 0% margin

```
Request: { slug: "<your-slug>", markup_pct: 20 }
Auth:    owner key
```

### `foundation:start` — build client Foundation

```
Request: { slug, description? } or { slug, url? }
Response: { ok, slug, fieldsAdded }
```

If the client website blocks scrapers (403), pass `description` instead of `url`. Reads back via `foundation:read { slug }`.

### `workflow:run` — fire a workflow

```
Request: { workflowId, slug, workspace, data }
```

`workflowId` must match a `world:create-thing` entry with `type:"workflow"` and `group:"<your-slug>"`. The `slug` field lets a staff key run it in the client's workspace context.

### Skills available in this repo

`@oneie/claude-skill` (devDependency) at `node_modules/@oneie/claude-skill/skills/`:

- `oneie-receivers` — receiver registry, payload shapes, authority tiers, four-outcome envelope
- `oneie-signals` — signal verbs, closed-loop contract, path strength
- `oneie-skills` — skill frontmatter, publish lifecycle, marketplace
- `oneie-workflows` — workflow step kinds, human gates, run lifecycle
- `oneie-channels` — channel types, connection lifecycle, agent routing
- `oneie-memory` — mark/warn/recall, memory loops, confidence tiers
- `oneie-harness` — /do lifecycle, W0–W4 build engine, artifact spine

## What you cannot do from here

- Edit the ONE schema or write TypeDB — that's the monorepo.
- Provision outside your subtree — key is scoped to your agency's own slug.
- Set a client's margin to bill yourself — limits are server-side.

## See also

- `AGENTS.md` — agent entry point
- `clients/mover/README.md` — a worked vertical template, clone-per-operator
- `clients/movers-demo/` — the same template, fully filled with fictional demo data
