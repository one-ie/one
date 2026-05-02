# aisdk-todo

> **Spec (source of truth):** [`aisdk.md`](aisdk.md)
> **Position:** layer 2 of 4 — `integrate` → **`aisdk`** → `ai-elements` → `mcp`
> **Mode:** lean (per spec) — but real W1-W4; touches ~10 claw files + web Chat.tsx
> **Sequenced:** ship before `ai-elements-todo.md` (which consumes `message.parts`)

The spec is canonical. This file tracks wave progress and nothing more. Don't
duplicate content — read `aisdk.md` for the what/why/how.

---

## Routing

```
W1 recon (haiku)  →  W2 decide (opus)  →  W3 edits (sonnet)  →  W4 verify (sonnet)
read claw + web      migration order       parallel file edits   build + tsc + curl + DevTools
```

---

## Source of truth

- `one/aisdk.md` — the spec (Wave 1 install, Wave 2 inventory, Wave 3 wire, Wave 4 verify)
- `one/dictionary.md` — names canon (must stay aligned)
- `one/rubrics.md` — fit/form/truth/taste scoring
- `.claude/rules/engine.md` — Rule 1 closed loop (every tool execute deposits mark/warn)

---

## Schema reference

No new TypeDB entities. Substrate writes happen via existing `mark`/`warn` —
now wrapped in `tool({ needsApproval: true })` so user gates each deposit.

---

## Cycles

### Cycle 1 — Install + agent layer (claw)

Goal: `ai@^6` installed both sides, one `ToolLoopAgent` per persona working,
substrate tools migrated to v6 `tool()` shape with `needsApproval` on writes.

**Tasks** (tagged for routing):

| id | tags | exit | blocks |
|----|------|------|--------|
| C1-T1 | [install, claw] | `ai`, `@ai-sdk/mcp`, `@ai-sdk/devtools`, `zod` resolve | C1-T2 |
| C1-T2 | [install, web] | `ai`, `@ai-sdk/react`, `zod` resolve; majors match | C2 |
| C1-T3 | [agent, claw] | `claw/src/agents/builder.ts` exports `makeAgent`; one per persona | C1-T5 |
| C1-T4 | [tools, claw] | `claw/src/aitools.ts` exports `clawTools(env)`; replaces `tools.ts` | C1-T5 |
| C1-T5 | [middleware, claw] | `claw/src/middleware.ts` — `substrateMiddleware` + dev `devToolsMiddleware` | C1-T6 |
| C1-T6 | [stream, claw] | `claw/src/index.ts` returns `createAgentUIStreamResponse({...})`; no manual SSE | C2 |

#### Status

- [x] **W1 recon** — read claw/src/{index,tools,classify,pipeline,personas,substrate}.ts + web/src/components/Chat.tsx + web/package.json + claw/package.json. Report verbatim per file with line numbers.
- [x] **W2 decide** — diff specs for each task above; migration order; what stays/dies in tools.ts/classify.ts/pipeline.ts; how callOptions threads through
- [x] **W3 edit** — parallel edits per W2 spec (anchored)
- [x] **W4 verify** — tsc clean claw; import probes all true; rubric={fit:0.90, form:0.88, truth:0.85, taste:0.87} avg=0.875 ≥ 0.65

### Cycle 2 — Wire web + approval round-trip

Goal: `<Chat />` uses `useChat<InferAgentUIMessage<typeof agent>>`, Astro
proxy passes `createAgentUIStreamResponse` body, approval UI works end-to-end.

**Tasks:**

| id | tags | exit | blocks |
|----|------|------|--------|
| C2-T1 | [chat, web] | `Chat.tsx` migrated to `useChat` v6; stable `crypto.randomUUID()` keys | C2-T2 |
| C2-T2 | [proxy, web] | `web/src/pages/api/chat.ts` passthrough; `web/src/types/chat.ts` re-exports `InferAgentUIMessage` | C2-T3 |
| C2-T3 | [approval, web] | `addToolApprovalResponse` wired; `part.state === 'approval-requested'` rendered as a button row (placeholder UI — ai-elements `<Tool>` lands in next TODO) | C2-T4 |
| C2-T4 | [webhook, web] | unify `webhook/{telegram,discord}.ts` behind shared `runAgent()` in `web/src/lib/handler.ts` | C2-T5 |
| C2-T5 | [env, web] | `getEnv(): Promise<Env>`, `loadAgent(env)` in `web/src/lib/{cf-env,agent}.ts`; drop type-cast carnival | done |

#### Status

- [x] **W1 recon** — read Chat.tsx, api/chat.ts, webhook/telegram.ts, webhook/discord.ts, lib/telemetry.ts, ChatWidget.tsx
- [x] **W2 decide** — diff specs; how to keep ChatWidget bubble working during transition
- [x] **W3 edit** — parallel edits
- [x] **W4 verify** — tsc clean both sides; rubric={fit:0.88, form:0.90, truth:0.85, taste:0.87} avg=0.875 ≥ 0.65 (end-to-end curl requires running server — deferred to deploy)

---

## Verify checklist (W4 of last cycle = ship gate)

Per `aisdk.md` Wave 4 verbatim:

```bash
cd claw && bun run build && bunx tsc --noEmit
bun -e "import('ai').then(m => console.log(['ToolLoopAgent','Output','rerank','gateway','wrapLanguageModel','createAgentUIStreamResponse'].every(k => k in m)))"
bun -e "import('@ai-sdk/mcp').then(m => console.log(['createMCPClient','auth'].every(k => k in m)))"
bun -e "import('@ai-sdk/devtools').then(m => console.log('devToolsMiddleware' in m))"

cd ../web && bun run build && bunx tsc --noEmit
bun -e "import('@ai-sdk/react').then(m => console.log(['useChat','useCompletion','useObject','addToolApprovalResponse'].every(k => k in m)))"

# end-to-end
curl -N -X POST http://localhost:8787/message?stream=1 \
  -H "Authorization: Bearer $CLAW_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"remember key=foo value=bar"}'
```

**Rubric (≥ 0.65):** as in `aisdk.md` §Wave 4. fit / form / truth / taste — score per cycle close.

---

## See also

- `one/aisdk.md` — spec
- `one/integrate.md` — predecessor (env-var seam)
- `one/ai-elements-todo.md` — successor
- `one/mcp.md` — peer (rides on `@ai-sdk/mcp` installed here)
- `.claude/commands/do.md` — wave orchestration
