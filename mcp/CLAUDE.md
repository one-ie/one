# CLAUDE.md — `mcp/`

`@oneie/mcp` — Model Context Protocol server exposing ONE substrate verbs to
Claude Desktop, Cursor, and any MCP-aware client. Under the hood, calls
`@oneie/sdk`.

## What this gives Claude

Six substrate verbs as callable MCP tools, plus read-only queries:

| MCP tool       | Substrate verb | Effect                                    |
|----------------|----------------|-------------------------------------------|
| `one_signal`   | signal         | Fire-and-forget signal                    |
| `one_ask`      | ask            | Signal + wait for result (blocking)       |
| `one_mark`     | mark           | Strengthen a path                         |
| `one_warn`     | warn           | Weaken a path                             |
| `one_follow`   | follow         | Read strongest path                       |
| `one_know`     | harden         | Promote highways → hypotheses             |
| `one_recall`   | —              | Query hypotheses from TypeDB              |
| `one_reveal`   | —              | Full MemoryCard for a uid                 |
| `one_forget`   | —              | GDPR erasure for a uid                    |
| `one_frontier` | —              | Unexplored tag clusters                   |
| `one_highways` | follow (batch) | Top N weighted paths                      |
| `one_sync`     | —              | Fire /api/tick (all L1-L7 loops)          |

Once installed, Claude can reach into ONE the same way a user would — but
typed, scoped, and auditable.

## Claude Desktop wiring

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "one": {
      "command": "npx",
      "args": ["-y", "@oneie/mcp"],
      "env": {
        "ONE_API_URL": "https://dev.one.ie",
        "ONE_API_KEY": "<optional>"
      }
    }
  }
}
```

## Claude becomes an agent

When Claude calls `one_signal`, it IS an actor in the substrate. Its UID is
the MCP session ID. Its outcomes `mark`/`warn` the same paths as any other
agent. The substrate doesn't distinguish between human-driven Claude and
autonomous agents — they're all units that emit and consume signals.

## Don't

- Don't add MCP tools that bypass the SDK — wrap, don't reimplement
- Don't expose raw TypeDB queries — the SDK is the contract
- Don't cache tool results across sessions — MCP calls should be fresh

## See also

- Root `CLAUDE.md` — architecture
- `sdk/CLAUDE.md` — underlying API
- `one/dictionary.md` — verb canon
- `https://modelcontextprotocol.io` — MCP spec
