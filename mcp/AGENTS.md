# AGENTS.md — `mcp/`

This MCP server turns any MCP-aware client (Claude Desktop, Cursor, Zed)
into an agent in the ONE substrate. The client's session IS an actor.

## The "Claude becomes an agent" pattern

```
Claude Desktop session
        │
        └── MCP tool call: one_signal({receiver:"tutor:explain", data})
                │
                └── @oneie/mcp (this package)
                        │
                        └── @oneie/sdk HTTP call
                                │
                                └── POST /api/signal
                                        │
                                        └── Substrate routes via pheromone
                                                │
                                                └── Response → mark/warn path
```

No new agent definition needed. Claude participates by calling tools.

## Tool surface

All 12 tools (listed in `CLAUDE.md`) wrap SDK methods 1:1. Adding a new tool
means: add to SDK first, then wrap here.

## Auth

If the substrate instance has API key auth enabled, set `ONE_API_KEY` in the
MCP server env. Otherwise public endpoints work anonymously (but your session
still gets a synthetic UID for pheromone accounting).

## Don't

- Don't add tools that aren't in the SDK — single source of truth
- Don't mutate TypeDB directly via MCP — use the verbs
- Don't expose admin endpoints (deploy, admin sync) through MCP

## See also

- Root `AGENTS.md` — repo-wide manifest
- `sdk/AGENTS.md` — who consumes the SDK
- `one/sdk.md` — contract spec
