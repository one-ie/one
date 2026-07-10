# AGENTS.md — for an agent working in this repo

You are operating inside a **ONE business workspace**. Your job is to help run
this business: ship agents and skills, and keep it operating. You write
Markdown, TOML, and TypeScript — never SQL, never TypeDB.

## Orient yourself

1. Read `CLAUDE.md` — who the business is and the four files it edits.
2. Read `README.md` — the build recipe, with what each step does at the substrate.
3. **Check your footing before anything else:**
   ```bash
   one whoami                        # who this key is, which workspace
   one doctor                        # config / key / reachability — exit 0/1
   ```
   Both are read-only and take under 5 seconds — run them cold at the start of every
   session, not just when something looks wrong.
4. **Discover the surface from the terminal — don't study it.** The whole 54-receiver
   namespace is one command away:
   ```bash
   one catalog                       # every receiver, grouped by recipe (meta:catalog)
   one catalog --goal trade          # just the trade walk
   one ask meta:schema '{"receiver":"market:hire"}'   # read a contract before you call
   one ask market:hire '{…}' --dry-run                # reach any receiver, validated, simulated
   ```
   `one catalog` to find it, `one ask` to call it — that's the orient step. The named
   shortcuts (`hire`, `bounty`, `earn`, `usage`, `recall`) are sugar over `one ask`.

## The substrate verbs you have

| Receiver | Use it to |
|----------|-----------|
| `world:create-actor` | register an agent/actor in a workspace |
| `world:create-thing` | publish an agent or skill as a thing |
| `agency:push:complete` | signal that a push finished (close the loop) |

Beyond the build recipe, the named shortcuts reach the rest — each composes the
same `SubstrateClient.ask`:

| Shortcut | Receiver | Recipe |
|----------|----------|--------|
| `one market [query]` | `market:list` / `actors:find` | trade |
| `one hire <skillId>` | `market:hire` | trade |
| `one bounty <skillId>` | `market:bounty` | trade |
| `one earn` | `pay:weight` | transact |
| `one usage` | `dashboard:usage` | transact |
| `one recall [--about]` | `meta:recall` | coordinate |
| `one reputation` | *(pending — `meta:reputation` follow-on)* | coordinate |

Every `ask()` resolves to one of four outcomes — `result | timeout | dissolved |
failure`. **Always close the loop**; never swallow a non-result. `src/lib/client.ts`
already enforces this — call through it.

## Two halves: `one` reaches, `/do` builds

You hold two tools, not one. Keep them straight:

- **`one`** is how you *act on the world* — one `SubstrateClient.ask` per command, reaching
  the 54 receivers. Use it to provision, push, hire, earn, recall.
- **`/do`** is how you *improve the thing doing the acting* — it authors the
  agents, skills, and code that `one` then ships. Use it to build, fix, and document.

When a task is "call the substrate," reach for `one ask`. When it's "write or fix a
file in this repo," reach for `/do`. They share one rule: **close every loop,
simulate before you write.**

## Build with `/do`

This repo carries the `@oneie/claude` harness. Drive it with one command:

```
/do "add agent: customer onboarding"
```

`/do` walks the artifact spine — promise → survey → spec → `agents/<slug>.md` →
`one push --dry-run` (proof) → docs — **writing what's missing, skipping what
exists.** A tier (PATCH · FIX · FEATURE · SCHEMA) prunes the spine before any work
starts; the build runs as a four-wave engine (W1 recon · W2 decide · W3 edit ·
W4 verify) at the right model and effort, gated by a rubric ≥ 0.65. Reach for the
cheapest tool that decides (bash → Haiku → Sonnet → Opus). Tick checkboxes as you
go; the file is the progress bar.

The loop has no agency or ONE dependency — it's the portable `@oneie/claude`
harness. Everything you learn driving it here transfers to any repo that runs
`bun add -d @oneie/claude`.

## Rules of the house

- **Dry-run first.** `one push --dry-run` validates and prints the plan with
  zero writes. Use it before any real push.
- **Stay in your own workspace.** Your key is scoped to your own slug; acting
  outside it is rejected server-side. Don't try to work around it.
- **Don't recompute money.** Balance and cap come from `one status` (the
  ledger). Render them; never recalculate them.
- **Secrets live in `.env.local`** (gitignored). Never print or commit a key.
- **Close every loop** with a `mark`, `warn`, or an explicit outcome — no silent returns.

## When you're stuck

A stalled `/do` cycle emits `agency:friction` so the platform hears about it. If
you're blocked, say so plainly and surface what you tried — don't loop on the
same failing action.
