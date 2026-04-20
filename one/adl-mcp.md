# ADL × MCP — Decision Record

**Decision date:** 2026-04-15  
**Cycle:** 3 (GROW)  
**Status:** Accepted

## Finding

`packages/mcp/` does not exist in the repository. The MCP integration is not
present in the codebase as of Cycle 3 execution.

## Decision

MCP tool calls are not in scope for ADL gate enforcement in this cycle.

If and when an MCP server is added, tool invocations SHOULD flow through
`persist.signal()` (the PEP-gated entry point) rather than calling engine
internals directly. This ensures all three ADL gates (lifecycle, network,
schema) apply automatically without additional code.

## Path Forward

When MCP is introduced:

1. Wire tool invocations through `persist.signal()` — gates apply for free.
2. Expose tool schemas as `input-schema` on skill entities so PEP-4 validates
   arguments automatically.
3. File `docs/TODO-mcp.md` with task `adl-mcp-wire` to track the integration.

## Gate Coverage (current, post Cycle 3)

| Surface | Lifecycle | Network | Schema |
|---------|-----------|---------|--------|
| Signal (persist.ts) | ✓ PEP-3.5 | ✓ PEP-3 | ✓ PEP-4 |
| LLM (llm.ts) | — | ✓ perm-env | — |
| API (api.ts) | — | ✓ perm-network | — |
| Bridge (bridge.ts) | — | ✓ canCallSui | — |
| NanoClaw (setup-nanoclaw.ts) | — | ✓ vars injected | — |
| Evolution (loop.ts) | — | ✓ prompt augmented | — |
| Federation (agentverse.ts) | — | ✓ ADL synced | — |
| **MCP** | **pending** | **pending** | **pending** |

## See Also

- [ADL-integration-map.md](ADL-integration-map.md) — task #10 original spec
- [ADL-integration.md](ADL-integration.md) — what shipped
- [TODO-adl.md](TODO-adl.md) — parent TODO
