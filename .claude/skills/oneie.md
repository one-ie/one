---
name: oneie
description: ONE substrate CLI + SDK + MCP toolkit — 17 verbs, 6 dimensions, launch handoff to agent-launch. Use when working on cli/, packages/sdk/, packages/mcp/, packages/templates/, or when the user mentions `oneie`, "dimension", "verb", "launch".
---

# oneie

The substrate-wired CLI/SDK/MCP toolkit owned by this repo. Not to be confused with the legacy `../ONE/cli` (merged in) or `../agent-launch-toolkit` (strip-lifted).

## Layout

```
cli/                      — oneie npm package (v3.6.40-next), ESM, node>=22
packages/sdk/             — @oneie/sdk (re-exports + launchToken handoff)
packages/mcp/             — @oneie/mcp (15 tools = 12 substrate + 3 discovery)
packages/templates/       — @oneie/templates (16 C-suite + marketing + service presets)
```

## Verbs (17)

| Category | Verbs |
|---|---|
| Substrate (12) | signal, ask, mark, warn, fade, select, recall, reveal, forget, frontier, know, highways |
| Deploy (4) | init, agent, deploy, claw, sync |
| Handoff (1) | launch (→ agent-launch) |

## The Boundary

**In scope:** the 6 dimensions, substrate learning, routing.
**Out of scope:** tokenize, buy, sell, holders, bonding curve, ERC-20, ethers, cosmjs. These live at [agent-launch](https://agent-launch.ai). `oneie launch` is the only call that crosses the boundary.

## When to use

- User asks about `oneie <verb>` — see `docs/cli-reference.md`
- User touches `packages/{sdk,mcp,templates}/` — see the per-package README
- User wants to mint a token for an agent — route to `oneie launch <uid> --dry-run`, then handoff docs
- User asks why buy/sell isn't in ONE — [launch-handoff.md](../../docs/launch-handoff.md) is the "why"

## Guardrails

**Never introduce:** `tokenize`, `buy`, `sell`, `holders`, `ERC-20`, `@cosmjs/*`, `ethers`, `bonding curve` code in `packages/` or `cli/src/commands/`. The `test-no-mint-code.mjs` smoke test enforces this.

**Always:** wrap HTTP calls in `cli/src/lib/http.ts`. Share arg parsing via `cli/src/lib/args.ts`. Use `@oneie/sdk` as the one place that knows how to talk to `api.one.ie`.

## See Also

- [cli-reference.md](../../docs/cli-reference.md)
- [sdk-reference.md](../../docs/sdk-reference.md)
- [mcp-tools.md](../../docs/mcp-tools.md)
- [launch-handoff.md](../../docs/launch-handoff.md)
- [TODO-copy-toolkit.md](../../docs/TODO-copy-toolkit.md) — the merge plan (3 cycles)
