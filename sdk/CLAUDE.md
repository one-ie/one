# CLAUDE.md — `sdk/`

`@oneie/sdk` — TypeScript SDK for the ONE substrate. Wraps the substrate API
(signal/ask/mark/know/recall/reveal/forget/frontier) in a typed client.

## Install

```bash
npm install @oneie/sdk
# or
bun add @oneie/sdk
```

## The six verbs

| Verb    | SDK method         | Loop | What it does                            |
|---------|--------------------|------|-----------------------------------------|
| signal  | `one.signal(sig)`  | L1   | Send one-way signal to a unit           |
| ask     | `one.ask(sig)`     | L1   | Send and wait — 4 outcomes              |
| mark    | `one.mark(edge)`   | L2   | Strengthen a path                       |
| warn    | `one.warn(edge)`   | L2   | Weaken a path (failure feedback)        |
| fade    | `one.fade()`       | L3   | Asymmetric decay tick                   |
| follow  | `one.follow(type)` | L2/6 | Deterministic routing — strongest path  |

Plus read verbs: `highways`, `recall`, `reveal`, `forget`, `frontier`, `know`.

## Agent registration (markdown → TypeDB)

```ts
import { parse, syncAgent } from "@oneie/sdk";

const spec = parse(await readFile("agents/tutor.md", "utf8"));
await syncAgent(spec);  // writes unit + skills + memberships to TypeDB
```

## The 4 outcomes

Every `ask()` resolves to exactly one:

```ts
const { result, timeout, dissolved } = await one.ask({ receiver: "tutor:explain", data });
if (result)        one.mark(edge, chainDepth);
else if (timeout)  /* neutral — not the agent's fault */
else if (dissolved) one.warn(edge, 0.5);
else               one.warn(edge, 1);
```

Any client-side code MUST close this loop. Silent resolves leak learning.

## Config

```ts
import { ONE } from "@oneie/sdk";

const one = new ONE({
  baseUrl: "https://dev.one.ie",    // or localhost:4321
  apiKey: process.env.ONE_API_KEY,  // optional for public endpoints
});
```

## Don't

- Don't call `fetch` directly — use the SDK so typing stays consistent
- Don't narrow the Signal type locally — `{receiver, data?: unknown}` is frozen
- Don't implement toxicity checks client-side — that's the substrate's job

## Composition with AI SDK v6

`@oneie/sdk` is the **substrate layer**. AI SDK v6 (Vercel) is the **LLM + wire
layer**. They compose without wrapping each other — both read the same
`agents/<name>.md` markdown:

```
agents/<file>.md  ──┬──→  @oneie/sdk    syncAgent() → TypeDB unit + skills + paths
                    │
                    └──→  AI SDK v6     ToolLoopAgent({ model, instructions, tools })
```

Each markdown `skill` becomes BOTH a paid TypeDB capability (this SDK) AND a
v6 `tool()` whose `execute` calls `one.ask()`. The 4 outcomes
(`result | timeout | dissolved | failure`) map directly to v6's `finishReason`
+ error taxonomy, so a single `LanguageModelV2Middleware` in
`claw/src/middleware.ts` auto-closes every loop via `mark`/`warn` — Rule 1
(closed loop) is enforced by the integration, not by hand.

Glue file: `claw/src/agents/builder.ts` (~50 lines). Full spec:
[`one/aisdk.md` § Seam with `@oneie/sdk`](../one/aisdk.md#seam-with-oneiesdk-the-agents-sdk).

## See also

- Root `CLAUDE.md` — architecture
- `one/DSL.md` — signal grammar
- `one/sdk.md` — SDK contract (the spec this SDK implements)
- `one/aisdk.md` — AI SDK v6 wire protocol & full integration seam
- `agents/CLAUDE.md` — markdown contract that both SDKs consume
- `mcp/` — MCP server wrapping the same API for Claude/Cursor
