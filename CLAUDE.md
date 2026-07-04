# CLAUDE.md — business node

You are building **as a business on ONE**. You ship your own agents and skills, and operate a single workspace — all from this repo, operated with `one` (`@oneie/cli`).

## Setup (2 min, one-time)

**Fastest path — zero config:**

```bash
npm install -g @oneie/cli   # gives you `one` and `oneie`
one onboard                 # provisions a workspace + agent identity, no .env.local prep needed
```

Prints your workspace URL and exactly where you are in the agent lifecycle
(`registered → bootstrapped → active → settled → adopted`) plus what unlocks
each remaining stage. Writes `ONE_API_KEY` (+ `ONE_REG_KEY`, `ONE_UID`,
`AGENCY_WSID`) to `.env.local`. Re-run it any time — idempotent, never mints
a second identity.

**Named-workspace path — when you want a specific slug/brand (edits `workspace.toml` first):**

1. Set `slug`/`name`/`plan` in `workspace.toml`
2. Fill `.env.local` with `WORKSPACE_OWNER_EMAIL`
3. Run `one setup` — returns `{ uid, scopedKey, ownerKey }`. Put `ownerKey` in `ONE_API_KEY`.
4. Done. Your `WORKSPACE_SLUG`, `CC_ACTOR_ID`, and `ONE_API_KEY` are now in `.env.local`

`one setup` now mints an owner key directly — no Settings UI visit needed.

## One key, full authority

`ONE_API_KEY` is a slug-based owner key (human-class). It covers everything: workspace ops, billing, agent pushes.

```bash
export ONE_API_KEY=$(grep '^ONE_API_KEY=' .env.local | cut -d= -f2)
```

**API base URL is `https://one.ie`** — not `https://api.one.ie` (that returns 404).

## Who you are

Your workspace slug is the `slug` in `workspace.toml`. Your Claude Code actor id is `$CC_ACTOR_ID`. You write Markdown and TOML — never TypeDB, never SQL, never substrate internals.

## The node shape

```
<node>/
├── ai/              knows  →  agents · skills · tools · workflows · context.md
├── data/            grows  →  types · content · lifecycles
├── site/            shows  →  Astro + shadcn + ONE plugins (one.config.ts)
├── packages/         paid, zero-bundle plugin stubs (see below)
└── workspace.toml   who it is
```

## What you edit

| File / folder | What it is |
|---|---|
| `workspace.toml` | Your workspace identity: `slug`, `name`, `plan` |
| `ai/agents/*.md` | Agent definitions — pushed as `<slug>--<name>` with `group: "<slug>"` |
| `ai/skills/*/SKILL.md` | Skill definitions |
| `ai/tools/*.toml` | Tools to connect (`one push` calls `tools:connect`; OAuth via `one ask`) |
| `ai/workflows/*.md` | Workflow definitions — pushed via `world:create-thing` with `group: "<slug>"` |
| `ai/context.md` | Company context — agents read this on every turn |
| `data/types/*.toml` | Custom entity types pushed via `world:declare-types` |
| `data/lifecycles/*.toml` | Lifecycle definitions — `one push` parses the TOML's `id`/`label`/`stages` directly and calls `lifecycle:save`; stages need a manual move (drag a card, an `entity:tag` call) — `enter_when` auto-advance isn't wired for this path yet. Copy `_example.toml` (mirrors ONE's own agent-onboarding funnel) to start |
| `site/` | Astro starter — shadcn, React 19, Cloudflare Workers, pre-wired to ONE. No `ONE_API_KEY` yet? The site still runs — Better Auth + D1 handle sessions standalone (`site/src/lib/auth.ts`), no backend connection required to develop the UI |
| `packages/` | Paid, zero-bundle plugin stubs (`admin`, `course`, `dashboard`, `shop`) — each calls `premium({ plugin: name })` (`@oneie/plugin-premium`) to load its real UI from `one.ie/x/<plugin>.js` at runtime, gated by an entitlement claim. Nothing ships to your repo until the entitlement is bought (`one plugin buy <name>`) |
| `site/one.config.ts` | Brand tokens + backend key — the only file you need to edit in `site/` |

## The commands

```bash
one setup                      # once — stand up your workspace (idempotent)
one onboard [--name N]         # deterministically walk register→bootstrap, then show your position in the agent lifecycle + what unlocks each remaining stage
one push [path] [--dry-run]    # ship your agents + skills
one deploy                     # wrangler pages deploy site/
one status                     # your usage — credits, meters, plan
one ship "<message>"           # git add + commit + push in one step
```

`one onboard` is idempotent — re-run it any time to see your current stage. It reuses the same zero-to-live path as `one setup`'s underlying provisioning, so it never creates a second identity. `data/lifecycles/_example.toml` mirrors the same 5 stages (`registered → bootstrapped → active → settled → adopted`) as a template — copy it (drop the `_`) and `one push` to declare a visible funnel for your own agents/customers on `/u/<slug>/lifecycles`.

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

## The two halves

| Half | Is | Use it to |
|---|---|---|
| **`one` — the reach** | `@oneie/cli` — every command is one typed SDK call | *act on the world* — push, hire, earn, recall |
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

## What you cannot do from here

- Edit the ONE schema or write TypeDB — that's the monorepo.
- Provision another business's workspace — reselling and managing multiple client workspaces is a different plan; not this repo's shape.

## See also

- `AGENTS.md` — agent entry point
- `README.md` — the build recipe
