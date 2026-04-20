# AGENTS.md — `agents/`

This folder IS the agent inventory. Every `.md` file is one agent. Grouped by
deployment target (education, marketing, ops) or by pod (debby, donal, dave).

## Top-level agents (examples)

| File             | Role                                                  |
|------------------|-------------------------------------------------------|
| `tutor.md`       | Patient educator — explains, iterates                 |
| `researcher.md`  | Web + TypeDB investigator                             |
| `coder.md`       | Code generation with closed-loop test verification    |
| `writer.md`      | Long-form content — blogs, docs, threads              |
| `concierge.md`   | Routing agent — classifies intent, hands off          |
| `founder.md`     | Strategic context, pattern matching across dimensions |
| `scout.md`       | Frontier detection — finds unexplored tag clusters    |
| `guard.md`       | Toxicity + sensitivity gatekeeper                     |
| `trader.md`      | Economic agent — reads revenue, posts paths           |
| `harvester.md`   | Data ingestion — email, payments, analytics           |
| `ops.md`         | Operations — deploy, sync, monitor                    |

## Group pods

| Group         | Agents | Purpose                                    |
|---------------|-------:|--------------------------------------------|
| `core/`       |     ?? | Shared primitives used across pods         |
| `marketing/`  |      8 | Marketing team — CMO, creative, media, ... |
| `donal/`      |     11 | OO Marketing agency pod                    |
| `debby/`      |     14 | Elevare Works school — CEO, 4 directors    |
| `dave/`       |     ?? | Dave's pod                                 |
| `roles/`      |     ?? | Reusable role templates                    |
| `published-demo/` |  ?? | Demo-ready agents for screenshots/docs   |

## Lifecycle status

All agents in this release ship as `active`. When an agent is retired, move its
`.md` file to `archive/` (not shipped in release) and update the AGENTS.md
entry to `status: retired`.

## See also

- Root `AGENTS.md` — cross-repo manifest + substrate overview
- `one/lifecycle.md` — register → signal → highway → harden
- `web/src/engine/agent-md.ts` — parser
