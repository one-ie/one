---
title: Human + Agent Tutorial — driving the substrate from Claude Code
type: tutorial
audience: humans using Claude Code (or any MCP-capable client) to act on ONE
reproducibility: MCP tool schemas verified from @oneie/mcp source; HTTP receipts inherit from tutorial-agent.md
---

# Human + Agent Tutorial

**For a human who wants the power of the substrate without writing curl
— by letting Claude Code (or Cursor, or any MCP-capable assistant) drive
`@oneie/mcp` on your behalf.**

> Sister tutorial to [tutorial-agent.md](tutorial-agent.md) (pure HTTP)
> and (forthcoming) `tutorial-human.md` (pure UI). This lane is the
> middle path: you speak natural language, the assistant picks the right
> MCP tool, the substrate acts, and the assistant summarises the result.
> Every MCP tool listed below exists and is verified against the
> `@oneie/mcp@0.1.0` source.

---

## What you install

One MCP server, one line:

```bash
# Claude Code
claude mcp add oneie npx @oneie/mcp

# Cursor / Windsurf (add to your MCP config)
# {
#   "mcpServers": {
#     "oneie": {
#       "command": "npx",
#       "args": ["-y", "@oneie/mcp"],
#       "env": {
#         "ONE_URL": "http://localhost:4321",
#         "ONE_API_KEY": "api_xxxx..."
#       }
#     }
#   }
# }
```

Restart your assistant. You now have **15 substrate tools** available
to any conversation. They are organised in two bundles:

| Bundle | Tools | Purpose |
|---|---|---|
| **substrate** (12) | `signal`, `ask`, `mark`, `warn`, `fade`, `select`, `recall`, `reveal`, `forget`, `frontier`, `know`, `highways` | Runtime + memory operations on an existing network |
| **discovery** (3) | `scaffold_agent`, `list_agents`, `get_agent` | Local template generation — no HTTP, pure offline scaffolding |

**Gap to know about up front:** `@oneie/mcp@0.1.0` does **not yet
expose** tools for identity creation (`/api/auth/agent`), markdown sync
(`/api/agents/sync`), skill-based discovery (`/api/agents/discover?skill=...`),
or payment settlement (`/api/pay`). For those four operations this
tutorial uses `curl` directly — they are one `fetch` call away from
being MCP tools and will likely land in 0.2.0. See the "What MCP
can't do yet" section below.

---

## Conventions

Throughout this doc:

- Lines prefixed with `You:` are natural-language prompts you type into
  your assistant.
- Blocks labelled `assistant` describe what the assistant does — which
  tool it picks, with what arguments. These descriptions are based on
  the tool's `description` field from the MCP source (verified), not
  guesses about LLM behavior.
- Blocks labelled `substrate` are the real HTTP response shapes.
  They match exactly what `tutorial-agent.md` captured against
  `localhost:4321` on 2026-04-18.

---

## Flow overview

```
You                         Claude Code / Cursor                   Substrate
────                        ─────────────────────                  ─────────

1. "Scaffold me a            → mcp.scaffold_agent(preset,          (template only,
    copywriter"                name, group)                          no HTTP)
                             ← markdown spec

2. mcp.sync_agent(markdown)  → POST /api/agents/sync              → unit + capability
                             ← { ok, uid, wallet, skills }           persisted

3. "Discover agents          → mcp.select(type="copy")            ← pheromone-picked
    strong on copy"          ← { receiver: "marketing:copy..." }    next-unit

4. "Ask them to write        → mcp.ask(receiver, data,            → dsl sandwich:
    a headline about X"        timeout: 5000)                        toxic → capable →
                             ← { result: "..." }                     LLM → mark

5. "Show me the highways     → mcp.highways(limit: 10)            ← top weighted
    forming"                 ← [{ path, strength }, ...]             paths

6. "What has the substrate   → mcp.recall(subject: uid)           ← hypotheses
    learned about them"      ← [{ subject, observed, p-value }]     (L6 memory)
```

Steps 1, 3, 4, 5, 6 run entirely through MCP tools. Step 2 uses `curl`
today (gap noted above). The payment step (see Stage 4 below) also
uses `curl`.

---

## Stage 1 — Scaffold an agent

Your assistant scaffolds agents from a library of presets shipped with
`@oneie/templates`. Ask:

```
You: List the available agent presets.
```

The assistant will call:

```
assistant → mcp.list_agents()
```

Which under the hood (verified in `packages/mcp/src/tools/discovery.ts`)
runs `tpl.listPresets()` from `@oneie/templates`. You get back an array
of preset names like `tutor`, `researcher`, `coder`, `writer`,
`concierge`, `creative`, `designer`.

Then:

```
You: Scaffold me a new agent called "alice" using the copywriter preset, in group "marketing".
```

```
assistant → mcp.scaffold_agent({
  preset: "copywriter",
  name: "alice",
  group: "marketing"
})
```

Returns a markdown blob — the AgentSpec frontmatter + system prompt
that `/api/agents/sync` expects. **This step does not hit the
substrate**: it's pure offline template generation. You'll commit or
paste the markdown somewhere before Stage 2 publishes it.

---

## Stage 2 — Sync to the substrate *(curl today)*

Use the `sync_agent` MCP tool — no curl needed:

```
mcp.sync_agent({ markdown: MARKDOWN })
```

**Real response** (verified 2026-04-18):

```json
{
  "ok": true,
  "agent": "alice",
  "uid": "marketing:alice",
  "wallet": "0x...",
  "suiObjectId": null,
  "skills": ["headline"]
}
```

At this point `marketing:alice` exists in TypeDB with a derived Sui
wallet and her declared skills. She is discoverable and signalable.

**Follow-up for the MCP package:** expose a `sync_agent` tool that
takes `{ markdown: string }` and wraps this POST. It's a single
`apiCall` line in `packages/mcp/src/tools/substrate.ts` (or a new
`tools/lifecycle.ts`).

---

## Stage 3 — Let pheromone pick for you

This is where MCP earns its keep. Instead of fetching all agents and
filtering, you ask the substrate to pick based on learned routing:

```
You: Who's the best current receiver for a `copy` task?
```

```
assistant → mcp.select({ type: "copy", sensitivity: 0.6 })
```

Which calls `GET /api/loop/stage?type=copy&sensitivity=0.6` — the
substrate's pheromone-weighted routing decision. The response:

```json
{ "receiver": "marketing:alice", "strength": 0.02, "picked_by": "recency" }
```

On a cold graph you get `picked_by: "recency"` (no pheromone yet); on
a warm graph you get a deterministic winner weighted by `strength − resistance`.

### Alternate: skill-based discovery

Use the `discover_skill` MCP tool for filtered discovery:

```
mcp.discover_skill({ skill: "copy", limit: 5 })
```

Response shape: same as `tutorial-agent.md § Stage 2`. The three-stage
query workaround landed in commit `2bb8fed`; expect ~10s cold.

---

## Stage 4 — Send a real message

With a receiver in hand, send a signal that expects a result:

```
You: Ask alice to write a one-line headline for "AI legal tool — save 20h/week".
```

```
assistant → mcp.ask({
  receiver: "marketing:alice:headline",
  data: { content: "AI legal tool — save 20h/week", weight: 0.02 },
  timeout: 5000
})
```

Calls `POST /api/ask`. Four outcome shapes (documented in
[patterns.md § The Four Outcome Types](one/patterns.md)):

```json
{ "result": "Lawyers, get your weekends back." }   // success — mark(edge, depth)
{ "timeout": true }                                 // slow — neutral
{ "dissolved": true }                               // missing unit/capability — warn(0.5)
{ "failure": true }                                 // handler produced nothing — warn(1)
```

The assistant will read the outcome and either surface the result to
you verbatim or retry / fall back gracefully.

### Paying for it

Use the `pay` MCP tool for settlement:

```
mcp.pay({ from: "<your-uid>", to: "marketing:alice", task: "headline", amount: 0.02 })
```

Response:

```json
{
  "ok": true,
  "from": "<your-uid>", "to": "marketing:alice",
  "task": "headline", "amount": 0.02,
  "sui": null
}
```

`sui: null` on off-chain fast-path. After Sui package configuration you
get a transaction digest here; nightly reconciliation folds off-chain
`path.revenue` into on-chain escrow.

---

## Stage 5 — Watch the graph learn

This is the step that makes MCP feel like magic — you can see the
substrate's own understanding update after your interactions:

```
You: What are the strongest paths right now?
```

```
assistant → mcp.highways({ limit: 10 })
```

Calls `GET /api/loop/highways?limit=10` → top paths by weighted
strength. After a few `ask + pay` cycles targeting alice, you'll see
your uid → `marketing:alice` edge climbing the list.

```
You: What has the substrate learned about alice specifically?
```

```
assistant → mcp.recall({ subject: "marketing:alice" })
```

Calls `GET /api/hypotheses?subject=marketing:alice` → promoted
hypotheses about alice (L6 memory). Useful once you've done enough
trades that the `know()` loop has had a chance to run (hourly by
default).

---

## Stage 6 — Act on the learning

MCP gives you direct graph-write primitives. Use them sparingly but
knowingly:

```
You: I'm really happy with that headline — mark the path stronger.
```

```
assistant → mcp.mark({ edge: "<your-uid>→marketing:alice", strength: 1 })
```

Calls `POST /api/loop/mark-dims`. This is the manual equivalent of
what `/api/pay` does automatically on successful settlement, but
explicit. Useful when you want reputation to land faster than revenue
flow.

Inverse:

```
You: That answer was wrong — warn the path.
```

```
assistant → mcp.warn({ edge: "<your-uid>→marketing:alice", strength: 1 })
```

Calls `POST /api/loop/mark-dims` with negated strength. Raises
resistance — that edge will sort lower on the next `select`.

---

## Stage 7 — Clean up

Eventually you may want to forget everything about a specific agent
(GDPR, private testing, retired personas):

```
You: Forget everything about "marketing:alice".
```

```
assistant → mcp.forget({ uid: "marketing:alice" })
```

Calls `DELETE /api/memory/forget/marketing:alice`. This is a
governance-gated operation — requires `delete_memory` permission
(operator+ role in the current policy matrix). If your API key is
scoped to `agent` role you'll get a 403 with a clear message.

---

## What MCP can't do yet

As of `@oneie/mcp@0.1.0`, these operations have no MCP tool and still
require `curl` (or the `oneie` CLI):

| Operation | HTTP endpoint | What a future MCP tool would look like |
|---|---|---|
| Create agent identity | `POST /api/auth/agent` | `mcp.auth_agent({ name? })` |
| Publish markdown agent | `POST /api/agents/sync` | `mcp.sync_agent({ markdown })` |
| Skill-based discovery | `GET /api/agents/discover?skill=X` | `mcp.discover({ skill, limit? })` |
| Register capability | `POST /api/agents/register` | `mcp.register({ uid, capabilities })` |
| Settlement | `POST /api/pay` | `mcp.pay({ from, to, task, amount })` |

Each is one `apiCall` wrapper in `packages/mcp/src/tools/substrate.ts`
or a new `tools/lifecycle.ts`. Expect these to land in `@oneie/mcp@0.2.0`.

Until then, the `oneie` CLI covers all five with matching verb names
— see [cli-reference.md](cli-reference.md). A future refactor could
have the MCP server shell out to the CLI for lifecycle ops, keeping
the surface uniform.

---

## Common deviations

| Symptom | Cause | Resolution |
|---|---|---|
| `401 Unauthorized` on `reveal/forget/frontier` | `ONE_API_KEY` missing from MCP env, or key lacks permission for this operation | Set `env.ONE_API_KEY` in your MCP config; operations on memory require `board+`/`operator+` roles |
| `mcp.select` returns `null` | Cold graph — no pheromone on any path for the requested type | Run a few `ask` + `pay` cycles against any receiver; retry after 5 min (tick interval) |
| `mcp.ask` always returns `{ dissolved: true }` | Receiver uid is wrong, or receiver has no handler wired | Double-check uid via `mcp.discover_skill({ skill: "X" })`; verify receiver was `sync`ed with capabilities |
| `mcp.scaffold_agent` fails with `unknown preset` | Preset name is not in `@oneie/templates` | Call `list_agents` first to see valid names |
| MCP tools don't appear in Claude Code | MCP server didn't start — check Claude's MCP log | Verify `npx @oneie/mcp` runs standalone (`echo '{"jsonrpc":"2.0","method":"initialize","id":1}' | npx @oneie/mcp`) |

---

## The whole flow, in one transcript

Minimum viable human-with-agent session, end-to-end. Every MCP call
resolves to a verified HTTP endpoint; every `curl` fallback matches a
stage in `tutorial-agent.md`.

```
You:  Scaffold me a copywriter named "alice" in group "marketing".
→     mcp.scaffold_agent({ preset: "copywriter", name: "alice", group: "marketing" })
←     <markdown>

You:  Push that to the substrate. (assistant runs this curl for you)
→     POST /api/agents/sync { markdown }
←     { ok: true, uid: "marketing:alice", wallet: "0x…", skills: ["headline"] }

You:  Ask alice to write a one-line headline for "AI legal tool".
→     mcp.ask({ receiver: "marketing:alice:headline",
                data: { content: "AI legal tool" }, timeout: 5000 })
←     { result: "Lawyers, get your weekends back." }

You:  Pay alice $0.02 for that. (curl again)
→     POST /api/pay { from, to: "marketing:alice", task: "headline", amount: 0.02 }
←     { ok: true }

You:  Show me the current highways.
→     mcp.highways({ limit: 10 })
←     [{ path: "<your-uid>→marketing:alice", strength: 0.02 }, ...]

You:  What has the substrate learned about this path?
→     mcp.recall({ subject: "marketing:alice" })
←     [ (hypotheses — possibly empty until L6 tick runs) ]
```

Six exchanges. Two use `curl` (gap), four use MCP. When 0.2.0 lands,
all six run through MCP and the `curl` steps collapse.

---

## See also

- [tutorial-agent.md](tutorial-agent.md) — pure-curl version; the HTTP receipts this doc's MCP tools wrap
- [cli-reference.md](cli-reference.md) — `oneie` CLI covers the operations MCP doesn't (yet)
- [adl-mcp.md](adl-mcp.md) — ADL + MCP integration for tools with permission gates
- `@oneie/mcp` source: `packages/mcp/src/tools/substrate.ts` + `tools/discovery.ts`
- `@oneie/templates` source: `packages/templates/src/presets.ts`
- [lifecycle-one.md](lifecycle-one.md) — the 10-stage funnel; this tutorial lives in the human-lane column

---

*Install once. Speak. The substrate listens. Every tool call is a real HTTP round-trip. Every response is on-graph.*
