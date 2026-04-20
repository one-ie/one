# CLAUDE.md — `one-ie/one`

Project context auto-loaded by Claude Code. The ground truth for how this
repo organizes work, names things, and closes loops.

## What this repo is

ONE — a signal-based substrate for AI agents. Six dimensions, seven loops,
six verbs, four outcomes. The runtime is ~670 lines; the brain lives in
TypeDB; the LLM is the only probabilistic step.

## The 6 dimensions (LOCKED — never rename)

| # | Dimension | What it holds                      |
|---|-----------|-------------------------------------|
| 1 | Groups    | Containers — worlds, teams, orgs    |
| 2 | Actors    | Who acts — humans, agents, worlds   |
| 3 | Things    | What exists — skills, tasks, tokens |
| 4 | Paths     | Weighted connections — strength/resistance |
| 5 | Events    | What happened — signals, payments   |
| 6 | Learning  | What was discovered — hypotheses    |

Dead names (never use): *knowledge, connections, people, node, scent, alarm, trail, colony*.

## The 7 loops

```
L1 SIGNAL     per message     signal → ask → outcome
L2 TRAIL      per outcome     mark/warn → strength/resistance accumulates
L3 FADE       every 5 min     asymmetric decay (resistance forgives 2x faster)
L4 ECONOMIC   per payment     revenue on paths (capability price)
L5 EVOLUTION  every 10 min    rewrite struggling agent prompts
L6 KNOWLEDGE  every hour      harden highways into hypotheses
L7 FRONTIER   every hour      detect unexplored tag clusters
```

## The 3 locked rules

### Rule 1 — Closed loop

Every signal closes with `mark()` on result, `warn()` on failure, or
`dissolve` on missing unit/capability. No silent returns, no orphan
signals, no handler that returns nothing without emitting a warn. Width
only compounds if every parallel branch deposits pheromone.

### Rule 2 — Structural time only

Plan in **tasks → waves → cycles**. Never days, hours, weeks, sprints, or
wall-clock units. Width = tasks-per-wave. Depth = waves-per-cycle. Learning
= cycles-per-path. Calendar time can't be `mark()`d, so it doesn't compound.
(Genuine external deadlines — merge freezes, release cuts — are the only
exception.)

### Rule 3 — Deterministic results in every loop

Every loop reports verified numbers, not vibes. Tests passed/total. Build
time in ms. Deploy time per service. Rubric dimension scores. Path strength
without verification is superstition; with verification it's learning.

## Slot map

| Folder       | What | Read first |
|--------------|------|------------|
| `agents/`    | Markdown agent definitions (templates in `agents/templates/`) | `agents/README.md` |
| `one/`       | Canonical docs — ontology, dictionary, patterns, rubrics | `one/dictionary.md` |
| `web/`       | Astro 6 + React 19 + CF Workers substrate app | `web/CLAUDE.md` |
| `sdk/`       | `@oneie/sdk` — TypeScript SDK | `sdk/CLAUDE.md` |
| `mcp/`       | `@oneie/mcp` — MCP server for Claude/Cursor | `mcp/CLAUDE.md` |
| `.claude/`   | Claude Code harness — commands, skills, rules, subagents | `.claude/CLAUDE.md` |

Each folder carries its own `CLAUDE.md` with the local contract. Cd into a
folder and Claude Code auto-loads its context on top of this one.

## Tech stack

- **Astro 6** — SSR islands on CF Workers Static Assets
- **React 19** — Actions, `use()`, transitions, ref-as-prop
- **Tailwind 4** + **shadcn/ui** — styling
- **TypeDB 3.0** — brain: paths, classification, learning
- **Cloudflare Workers** — substrate runtime; D1 for signals/messages, KV for snapshots
- **OpenRouter** — LLM router (default: Haiku 4.5 for speed, Sonnet 4.5 for decisions)

## The 4 outcomes

Every `ask()` resolves to exactly one. Every client-side caller MUST close
the loop based on which:

```ts
const { result, timeout, dissolved } = await one.ask({ receiver });
if (result)        one.mark(edge, chainDepth);
else if (timeout)  /* neutral */;
else if (dissolved) one.warn(edge, 0.5);
else               one.warn(edge, 1);
```

## Style

- TypeScript always typed — no `any`, no untyped props
- Short sentences, dense paragraphs, ASCII diagrams over prose for architecture
- Every onClick emits `emitClick('ui:<surface>:<action>')` to the substrate — see `.claude/rules/ui.md`
- Never narrow the Signal type — it's frozen `{receiver, data?: unknown}`
- Don't add backwards-compat shims; just change the code

## Canonical docs

Always consult these; they define the system's vocabulary and must stay in
sync with the code:

| Doc | Locks |
|-----|-------|
| `one/dictionary.md` | Canonical names, 6 verbs, dimension → runtime map |
| `one/one-ontology.md` | 6 dimensions, actor/group/thing types |
| `one/patterns.md` | Closed loop, zero returns, deterministic sandwich |
| `one/rubrics.md` | Quality scoring (fit/form/truth/taste, gate 0.65) |
| `one/lifecycle.md` | Agent journey: register → signal → highway → harden |
| `one/dsl.md` | Signal grammar |

## The /do cycle (how we ship)

Every non-trivial change runs four waves:

```
W1 recon  → W2 decide  → W3 edit  → W4 verify  → gate rubric ≥ 0.65 → ship
haiku     opus         sonnet     sonnet
```

Subagents in `.claude/agents/` implement each wave. `/do <TODO-file>` runs
the whole cycle. Full contract in `.claude/commands/do.md`.

## Don't

- Don't rename dimensions, verbs, or outcomes — they're locked
- Don't catch-all errors to `dissolved` — let real failures surface as `warn(1)`
- Don't plan in calendar time
- Don't add `/releases` to git — it's staged locally only
- Don't write comments that describe WHAT code does; only WHY when non-obvious

## See also

- `AGENTS.md` — agent manifest
- `one/dictionary.md` — names canon
- `.claude/commands/` — slash commands available
