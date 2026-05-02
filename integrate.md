# integrate

> **Position:** layer 1 of 4 — `integrate` → [`aisdk`](aisdk.md) → [`ai-elements`](ai-elements.md) → [`mcp`](mcp.md)
> **Prereq:** none (this is the foundation)
> **Enables:** every layer above. Owns: architecture, two modes, env-var seam, **canonical health checks**.

How `web/` (Astro) and `claw/` (CF Worker) compose — and how the whole repo runs standalone or federates with one.ie.

**Principle:** one brain, many surfaces. `claw` thinks; `web` shows. Substrate state is shared, never duplicated. The repo is **complete on its own** — federation with one.ie is one URL away.

---

## Shape

```
Telegram ──┐
Discord  ──┼──→ claw  ←──→  D1 / KV / TypeDB
Web      ──┘     ▲                  ▲
                 │                  │
              Astro reads ──────────┘
              (SSR + islands)
```

`claw` owns: webhook ingress, LLM call, memory, learning, slash commands.
`web` owns: pages, payments, marketing, dashboards, the chat UI.

Neither duplicates the other.

---

## Open source vs cloud

The runtime is open. The network is the moat.

| Layer | Open source (`one-ie/one`) | Cloud (`one.ie`) |
|---|---|---|
| Chat UI (Astro) | ✅ | ✅ |
| `claw` worker — channels, memory, learning | ✅ | ✅ |
| SDK + MCP | ✅ | ✅ |
| Standalone deploy on your own CF account | ✅ | — |
| **Federation** — shared TypeDB graph, cross-product highways, agent discovery | — | 🔒 |
| **Hosted runtime** — managed CF Workers, multi-region D1/KV, observability | — | 🔒 |
| **Identity + payments** — Better Auth Google, on-chain agent registry, x402 multi-chain settlement | — | 🔒 |
| **Marketplace** — capability search, ranked highways across customers | — | 🔒 |
| **Compliance ops** — GDPR erasure at scale, audit logs, exports | — | 🔒 |

**Why open the runtime:** trust, evangelism, frictionless first deploy. A user who clones the repo and has a Telegram bot in 60 seconds becomes a fan. A user reading docs about a hosted brain bounces.

**Why monetize the network:** a single deployment of claw is useful. Two thousand of them feeding the same substrate is a different product. Discovery, cross-pod routing, corroborated hypotheses — these only exist when the graph is shared. The cloud's pitch isn't "we host it for you," it's "your agents get smarter because they're not alone."

The seam between the two is three env vars. No fork, no proprietary modules — same code, two modes.

---

## Two modes

The repo runs in either of two modes — same code, three env vars decide.

| Env var | What it points at | Used by | Standalone | Federated |
|---|---|---|---|---|
| `GATEWAY_URL` | TypeDB proxy | `claw/src/substrate.ts` — `mark` / `warn` / `highways` / `recallHypotheses` | `""` → falls back to D1+KV | `https://one-gateway.oneie.workers.dev` |
| `ONE_API_URL` | one.ie auth/payment/agent registry | `web/` for Better Auth, x402, agent registration | unset → use your own auth | `https://dev.one.ie` |
| `CLAW_URL` | your claw worker | `web/src/pages/api/chat.ts` (after Stage 1) | always your own | always your own |

That's it. **No SDK imports, no shared database, no shared secrets** — just HTTP. Switchable any time.

### Mode A — standalone (60-second deploy)

Clone, leave `GATEWAY_URL` empty, deploy claw + web to your own Cloudflare account.

You get:
- ✅ Chat agent on Telegram / Discord / web
- ✅ Conversation history (D1)
- ✅ Tagged outcome valence (mark/warn → local D1)
- ✅ Personas, slash commands, streaming
- ❌ TypeDB hypotheses (`/memory` says "nothing learned")
- ❌ Cross-product highways (you only see your own)
- ❌ x402 payments, Better Auth Google login (wire your own)

claw degrades cleanly — every substrate call is `.catch(() => …)`. Highways returns `[]`, the rest works.

### Mode B — federated with one.ie

Flip three values:

```toml
# claw/wrangler.toml
GATEWAY_URL = "https://one-gateway.oneie.workers.dev"
```
```bash
# web/.dev.vars
ONE_API_URL=https://dev.one.ie
```

You gain:
- ✅ Your paths land in the **shared substrate** — visible at one.ie/highways
- ✅ Your hypotheses queryable by other one.ie agents
- ✅ Your agents discoverable via `suggestRoute`
- ✅ Better Auth Google login for web
- ✅ x402 payments accept SUI / ETH / SOL / BTC
- ✅ On-chain agent identity via `api.one.ie/api/agents/register`
- ⚠️ Your D1 stays yours — only the substrate graph is shared

Ship Mode A today, flip to Mode B later. No code changes.

---

## The wiring (Stage 1 — one fetch)

`web/src/pages/api/chat.ts` calls OpenRouter today. Replace with claw:

```ts
const r = await fetch(`${env.CLAW_URL}/message`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env.CLAW_KEY}`,
  },
  body: JSON.stringify({ group: sessionId, text, sender: userId }),
})
const { response } = await r.json()
```

That's it. Web users now get persisted history, pheromone learning, slash commands, multi-persona, shared memory with Telegram/Discord users on the same `group`.

`web/.dev.vars`:
```
CLAW_URL=https://claw.<acct>.workers.dev
CLAW_KEY=<value of claw API_KEY secret>
```

Delete `web/src/lib/llm.ts` and `web/src/lib/channels.ts` — claw owns both.

---

## Stage 2 — make the substrate visible

SSR pages that read claw and render real state:

| Route | Reads | Shows |
|---|---|---|
| `/highways` | `GET /highways` | Top substrate paths, network-wide |
| `/agent/[id]` | `GET /messages/:group` + persona | Persona card + recent turns + tags |
| `/u/[uid]/memory` | claw `/memory` cmd | What the substrate knows about this user |

Substrate stops being invisible plumbing and becomes a feature you can link to. In Mode B, `/highways` shows the whole one.ie network, not just yours.

---

## Stage 3 — streaming tokens

Add SSE branch to claw's `/message` (shape exists in git history). Astro chat island consumes via `EventSource` or `fetch().body`. Tokens appear as the LLM types.

```ts
const res = await fetch(`${CLAW_URL}/message?stream=1`, { ... })
for await (const chunk of res.body) { setReply((r) => r + chunk) }
```

Same brain. Modern UX.

---

## Stage 4 — cross-channel identity

The killer feature. Lets a user start anon on web, then "save this to my Telegram":

1. Web → `POST /claim {sessionId}` → claw returns a 5-min nonce
2. UI: "Send `/link <nonce>` to @yourbot on Telegram"
3. Claw's webhook handles `/link`: writes `identity_links(channel='web', sender_id=sessionId, canonical_uid=tg-uid)`
4. Web polls `GET /claim/status?sessionId=...` until linked
5. From now on, `pipeline.resolveActor` returns the same uid for both surfaces

Memory compounds across channels. Pipeline already reads `identity_links` — the table is the contract. ~50 lines of router code on the claw side.

---

## Stage 5 — visible reasoning

When the LLM calls a tool (`browse`, `remember`, `mark`, `discover`), stream those events to the chat UI as small cards.

```
[tool] browse https://example.com         ✓ 1.2s
[tool] remember user.prefers = "typescript"  ✓
```

Claude.ai pattern, substrate-flavored.

---

## What not to do

- **Don't add `/api/webhook/*` to web** — claw owns ingress. Point Telegram/Discord at claw directly.
- **Don't import claw modules from web** (or vice-versa) — HTTP only. Independent deploys, independent failure domains.
- **Don't put `OPENROUTER_API_KEY` in web** — only claw needs it.
- **Don't mirror personas** — web reads them via API; in claw they live in `personas.ts`.
- **Don't proxy claw routes through web** — adds a hop, gives nothing.
- **Don't share D1 between modes** — claw owns its tables. Federation is graph-level (TypeDB), not row-level.

---

## Health checks (canonical — referenced by aisdk.md + mcp.md)

```bash
# 1. Liveness
curl https://claw.<acct>.workers.dev/health
# expect: { ok: true, mcpServers?: [...], mcpToolsLoaded?: N, ... }

# 2. Non-streaming round-trip (integrate Stage 1)
curl -X POST https://claw.<acct>.workers.dev/message \
  -H 'Authorization: Bearer <CLAW_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"hello"}'
# expect: 200 { response: "..." }

# 3. Streaming round-trip (aisdk W3)
curl -N -X POST https://claw.<acct>.workers.dev/message?stream=1 \
  -H 'Authorization: Bearer <CLAW_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"browse https://example.com"}'
# expect SSE: text-start → text-delta* → tool-call(browse) → tool-result → text-delta* → finish

# 4. MCP tool round-trip (mcp.md, after wiring)
curl -N -X POST https://claw.<acct>.workers.dev/message?stream=1 \
  -H 'Authorization: Bearer <CLAW_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"group":"test","text":"send a slack message to #general saying hello"}'
# expect SSE includes: tool-call(slack_send_message) → tool-result
```

Each layer's "Health check" section is just a pointer back here.

---

## Diagram — the full picture

```
your repo (one-ie/one)              one.ie (optional federation)
┌────────────────────┐              ┌─────────────────────┐
│ claw  ──┐          │              │                     │
│ web   ──┼─────HTTP─┼──Mode B────→ │  api.one.ie         │
│         │          │              │  one-gateway        │
│         ↓          │              │  shared substrate   │
│ your D1 + KV       │              │                     │
└────────────────────┘              └─────────────────────┘

   Mode A: arrow absent — fully standalone, your own everything
   Mode B: arrow present — paths federate into the shared substrate
```

---

*Web shows. Claw thinks. Substrate remembers. Three boxes, one substrate, two modes, zero drift.*
