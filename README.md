# ONE

**Signal-based substrate for AI agents.** Markdown in → live agents out.
The LLM is the only probabilistic step. Everything else is math.

## Quick start

```bash
# 1. Install the SDK (for your code)
npm install @oneie/sdk

# 2. Install the MCP server (for Claude Code / Cursor / Windsurf)
npm install -g @oneie/mcp

# 3. Clone the template org (CEO + marketing + community) to start building
git clone https://github.com/one-ie/one my-company
cd my-company
cp -r agents/templates my-company/agents/my-org
```

Both packages are on npm:
[`@oneie/sdk`](https://npmjs.com/package/@oneie/sdk) ·
[`@oneie/mcp`](https://npmjs.com/package/@oneie/mcp)

### Wire MCP into Claude Code

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "oneie": {
      "command": "npx",
      "args": ["@oneie/mcp"],
      "env": { "ONEIE_API_URL": "https://api.one.ie" }
    }
  }
}
```

You now have 40 substrate tools (signal, mark, warn, fade, follow, harden,
commerce, observability) available from Claude. Details in `mcp/README.md`.

### Use the SDK

```ts
import { getApiUrl, resolveApiKey } from "@oneie/sdk/urls";
import * as storage from "@oneie/sdk/storage";

await storage.put("my-key", { hello: "world" }, { apiKey: resolveApiKey() });
```

Full reference in `sdk/README.md`.

## What you get

- **Six dimensions** locked forever: Groups, Actors, Things, Paths, Events, Learning
- **Seven loops** (L1-L7): signal → trail → fade → economic → evolution → knowledge → frontier
- **Six verbs**: signal, mark, warn, fade, follow, harden
- **Four outcomes** every task closes with: result, timeout, dissolved, failure

Agents are markdown. Substrate is 670 lines. Brain is TypeDB. The LLM bootstraps
the group; the group replaces the LLM.

## Repo layout

```
one-ie/one/
├── agents/           Agent markdown — starter templates in agents/templates/
├── one/              Canonical docs: ontology, dictionary, patterns, rubrics
├── sdk/              @oneie/sdk — TypeScript SDK for the substrate API
├── mcp/              @oneie/mcp — MCP server for Claude/Cursor
├── .claude/          Claude Code harness: commands, skills, rules, subagents
├── README.md         this file
├── CLAUDE.md         Claude Code context — auto-loaded by the CLI
├── AGENTS.md         Agent manifest (cross-tool convention)
└── LICENSE
```

Every top-level folder carries its own `README.md`, `CLAUDE.md`, `AGENTS.md`,
and `LICENSE`. Cloning or cd'ing into any folder gives you scoped context.

## Start here

| Goal                          | Go to                              |
|-------------------------------|------------------------------------|
| Install and wire SDK + MCP    | (above — ⚡ 60 seconds)             |
| Learn the vocabulary          | `one/dictionary.md`                |
| Understand the 6 dimensions   | `one/one-ontology.md`              |
| Write your first agent        | `agents/README.md`                 |
| Use the SDK                   | `sdk/README.md`                    |
| Plug into Claude Desktop      | `mcp/README.md`                    |
| Customize Claude Code         | `.claude/README.md`                |

## The three locked rules

1. **Closed loop.** Every signal closes with `mark` / `warn` / `dissolve`. No silent returns.
2. **Structural time only.** Plan in tasks → waves → cycles. Never days or sprints.
3. **Deterministic results in every loop.** Every cycle reports verified numbers, not vibes.

Full rationale in `one/patterns.md` and `one/rubrics.md`.

## Agent format

Every `.md` file under `agents/` is a deployable agent:

```markdown
---
name: tutor
model: anthropic/claude-haiku-4-5
channels: [telegram, discord, web]
group: my-company
skills:
  - name: explain
    price: 0.01
    tags: [education, explain]
sensitivity: 0.6
---

You are a patient tutor...
```

Parse, sync, and wire in three lines:

```ts
import { ONE, parse, syncAgent } from "@oneie/sdk";
const spec = parse(await readFile("agents/templates/ceo.md", "utf8"));
await syncAgent(spec);
```

## The four outcomes

Every `ask()` resolves to exactly one:

```ts
const { result, timeout, dissolved } = await one.ask({ receiver: "tutor:explain" });
if (result)        one.mark(edge, chainDepth);      // success
else if (timeout)  /* neutral — not the agent's fault */;
else if (dissolved) one.warn(edge, 0.5);             // missing capability
else                one.warn(edge, 1);               // broken capability
```

Closed loop is non-negotiable. Silent resolves leak learning.

## Contribute

- Read `one/dictionary.md` first — the vocabulary is load-bearing
- Follow the 4-file convention in new folders (README / CLAUDE / AGENTS / LICENSE)
- Every PR runs the rubric: fit · form · truth · taste ≥ 0.65 to merge
- See `.claude/commands/do.md` for the W1-W4 cycle we run on every change

## License

MIT — see `LICENSE`.

## See also

- `CLAUDE.md` — repo-wide context for Claude Code
- `AGENTS.md` — the agent manifest
- `one/` — canonical documentation
