# Signal — The Universal Primitive

**Receiver names the edge. Weight deposits pheromone. Tags classify. Everything else is convention.**

```ts
type Signal = { receiver: string; data?: unknown }
```

Two fields. The type is frozen (see memory `feedback_signal_simplicity.md` — never narrow it). Everything below is a pattern for filling those two fields, not a contract.

## Data convention (router reads these, not the type)

```ts
data = { tags?: string[], weight?: number, content?: unknown }
```

- **`weight`** — `+1` marks, `-1` warns, omitted = `+1`, `0` = neutral. Gradations (`-0.5` for dissolved, chain-depth multipliers for marks) are discretion, not rules.
- **`tags`** — classification. Queries filter on these. Not required.
- **`content`** — opaque payload. Router never reads it for routing.

## The four outcomes (Rule 1)

Every loop closes in exactly one of these. Pick the weight; the substrate does the rest.

| Outcome     | Weight   | When                                   |
|-------------|----------|----------------------------------------|
| result      | `+1`     | success                                |
| timeout     | `0`      | slow, not the agent's fault             |
| dissolved   | `-0.5`   | missing unit/capability, server down    |
| failure     | `-1`     | agent produced nothing                  |

If in doubt: `+1` on success, `-1` on failure. The gradations are discretion.

## Receiver naming

`receiver` matches `/^[a-zA-Z0-9:_-]+$/`, max 255 chars. The first colon-delimited segment is the **surface** — prefixes are **query-partitioning hints**, not a type contract. Any string works; these are the conventions in use:

| Prefix       | Example                       | Emitter                                                 |
|--------------|-------------------------------|---------------------------------------------------------|
| `ui:*`       | `ui:chat:copy`                | React `onClick` via `emitClick()`                        |
| `tool:*`     | `tool:Edit:ok`, `tool:Bash:fail` | `.claude/hooks/tool-signal.sh` on PostToolUse         |
| `hook:*`     | `hook:post-edit:warn`         | other hook scripts via `emit_signal` (`hooks/lib/signal.sh`) |
| `cli:*`      | `cli:signal:send`             | `oneie` CLI verbs                                       |
| `bridge:*`   | `bridge:mirrorMark`           | `src/engine/bridge.ts`                                  |
| `l4:*`       | `l4:payment:settle`           | L4 economic loop                                        |
| `w4:*`       | `w4:verify:ok`                | W4 rubric gate outcomes                                 |
| `do:*`       | `do:close`                    | `/do` wave/cycle boundaries                             |
| `loop:*`     | `loop:feedback`               | `/close` per-task rubric feedback                        |
| `unit:skill` | `scout:observe`               | substrate tasks (plain unit + skill name)               |

Format: `<surface>:<subject>:<action-or-outcome>`. New surfaces are fine — pick a prefix, stick with it.

## Emitters

### Bash hook
```bash
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"
emit_signal "hook:post-edit:ok" 1 "file=$FILE"
```

Fire-and-forget, 2s max. Silent on dev-server-down.

### TypeScript (API route)
```ts
import { signalSend } from '@/lib/signalSender'
await signalSend({ receiver: 'w4:verify:ok', data: { tags: ['verify'], weight: 1, content: { passed: 320 } } })
```

### React click
```tsx
import { emitClick } from '@/lib/ui-signal'
<Button onClick={() => emitClick('ui:chat:copy')}>Copy</Button>
```

### Substrate task
```ts
unit('scout').on('observe', async (data, emit) => {
  emit({ receiver: 'analyst:classify', data: { content: data } })
  return data
})
```

## What `POST /api/signal` validates

Three deterministic pre-checks (no LLM): receiver format regex + length, toxicity (`isToxic(edge)` with cold-start protection), ADL gates (lifecycle → 410, network allowedHosts → 403). All cached 5 min. Full list: `src/pages/api/signal.ts`.

## Observability

- `/api/export/paths` — all edges
- `/api/export/highways` — top by strength
- `/api/export/toxic` — blocked by resistance
- `/api/signals?since=T` — raw history

## Works With

| Skill      | Because                                                     |
|------------|-------------------------------------------------------------|
| `/typedb`  | stores `path.strength` / `path.resistance` / `path.revenue`  |
| `/sui`     | mirrors marks/warns on-chain via `bridge.ts`                 |
| `/react19` | `emitClick` is a React helper                                |
| `/astro`   | API routes on `/api/*` are Astro endpoints                   |
| `/do`      | W1-W4 waves emit `w4:*` and `do:*`                          |
| `/close`   | emits `loop:feedback` with rubric weights                    |

## See Also

- `docs/dictionary.md` § Three Slots of Data — canonical convention
- `docs/routing.md` § Four Outcomes — weight semantics
- `src/engine/CLAUDE.md` § Rule 1 — code-level contract
- `.claude/hooks/lib/signal.sh` — bash helper
- `src/lib/signalSender.ts` — TS helper
- `src/lib/ui-signal.ts` — `emitClick`
- `src/pages/api/signal.ts` — the one receiver
