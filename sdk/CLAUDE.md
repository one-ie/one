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

## See also

- Root `CLAUDE.md` — architecture
- `one/DSL.md` — signal grammar
- `one/sdk.md` — SDK contract (the spec this SDK implements)
- `mcp/` — MCP server wrapping the same API for Claude/Cursor
