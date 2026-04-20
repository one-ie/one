---
title: "@oneie/mcp — 15 tools"
type: reference
version: 0.1.0
---

# `@oneie/mcp` Tools

15 tools. 12 substrate verbs + 3 discovery helpers. Same handlers for stdio (local) and HTTP (`api.one.ie/mcp/:tool`).

**Install:** `npm install @oneie/mcp`
**Run:** `oneie-mcp` (prints manifest) · or `POST https://api.one.ie/mcp/:tool`

---

## Setup

### Claude Code

```json
{
  "mcpServers": {
    "oneie": {
      "command": "oneie-mcp",
      "env": {
        "ONEIE_API_KEY": "...",
        "ONEIE_API_URL": "https://api.one.ie"
      }
    }
  }
}
```

### HTTP

```bash
curl https://api.one.ie/mcp/__list                    # manifest
curl https://api.one.ie/mcp/ask -d '{"receiver":"tutor"}'
```

---

## Tier 1 — Substrate (12)

Wrap engine verbs 1:1 over `/api/*`.

| Tool | Input | Output |
|---|---|---|
| `signal` | `{receiver, data?, sender?}` | `{ok, routed, result, latency, success}` |
| `ask` | `{receiver, data?, timeout?}` | `{result? \| timeout? \| dissolved? \| failure?, latency}` |
| `mark` | `{edge, strength?}` | `{marked}` |
| `warn` | `{edge, strength?}` | `{marked}` |
| `fade` | `{rate?}` | `{faded}` |
| `select` | `{type?, sensitivity?}` | `{selected}` |
| `recall` | `{subject?}` | `Insight[]` |
| `reveal` | `{uid}` | `MemoryCard` |
| `forget` | `{uid}` | `204` |
| `frontier` | `{uid}` | `{uid, frontier: string[]}` |
| `know` | `{}` | `Insight[]` |
| `highways` | `{limit?}` | `Edge[]` |

## Tier 2 — Discovery (3)

Static preset/template queries. No network, no substrate state.

| Tool | Input | Output |
|---|---|---|
| `scaffold_agent` | `{preset, name, group?}` | `{markdown, filename}` |
| `list_agents` | `{}` | `Preset[]` |
| `get_agent` | `{name}` | `Preset \| null` |

---

## Why No Tier 3 (Mint/Trade)?

Mint, buy, sell, holders, delegation all live in [agent-launch](https://agent-launch.ai). ONE is the substrate, agent-launch is the economic layer. See [launch-handoff.md](launch-handoff.md).

---

## See Also

- [cli-reference.md](cli-reference.md) · [sdk-reference.md](sdk-reference.md)
- `packages/mcp/src/tools/{substrate,discovery}.ts` — handler source
- `src/pages/api/mcp/[tool].ts` — the HTTP adapter
