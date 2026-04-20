# CLAUDE.md — `.claude/`

Claude Code harness. Commands, skills, rules, hooks, and internal subagents
that let Claude Code operate this repo with full context.

## What's inside

```
.claude/
├── commands/      # Slash commands: /see, /create, /do, /close, /sync, /deploy, /claw
├── skills/        # Domain-specific skill packs: /typedb, /sui, /astro, /react19, /shadcn, /reactflow, /deploy
├── rules/         # Auto-loaded rules: engine.md, react.md, astro.md, ui.md, documentation.md
├── agents/        # Internal Claude Code subagents (w1-recon, w2-decide, w3-edit, w4-verify, Explore, Plan)
├── hooks/         # Shell hooks wired to events
├── settings.json  # Tool permissions, env vars, model defaults
└── README.md      # High-level intro
```

## How these compose

| Layer     | When loaded                                   |
|-----------|-----------------------------------------------|
| `rules/`  | Auto-loaded every message based on file globs (e.g. `*.astro` → `astro.md`) |
| `skills/` | Loaded on explicit invocation or trigger description match |
| `commands/` | User types `/<name>` |
| `agents/` | Spawned via Agent tool for parallel/isolated work |
| `hooks/`  | Fire on events (pre-tool-use, stop, etc.) per `settings.json` |

## The /do → W1-W4 cycle

`/do <TODO-file>` runs the four-wave sandwich:

1. **W1 recon** (`w1-recon` agent) — reads files, reports findings verbatim
2. **W2 decide** (`w2-decide` agent) — tradeoffs, file list, rubric targets
3. **W3 edit** (`w3-edit` agent) — precise edits from W2 spec, docs+code parallel
4. **W4 verify** (`w4-verify` agent) — biome + tsc + vitest, rubric >= 0.65

Every cycle ends with deterministic numbers feeding back as pheromone — the
harness itself participates in substrate learning.

## The 3 locked rules apply here

Every command and skill in this folder must:

1. Close its loop with numeric receipts
2. Plan in tasks → waves → cycles (not time)
3. Report verified results, not vibes

`.claude/rules/engine.md` locks the code-level enforcement.

## Don't

- Don't add commands that don't end with a numeric report
- Don't write skills that bypass the rules — extend them instead
- Don't hardcode API keys in `settings.json` — use env vars

## See also

- `README.md` — high-level intro
- `AGENTS.md` — internal subagents available
- Root `CLAUDE.md` — repo context
- `one/patterns.md` — closed loop, sandwich, zero returns
