# agents/

**Describe what you want. Get a live agent.** Every `.md` file here is a
deployable agent — frontmatter for structure, body for system prompt.

## Start with the template org

```bash
# Copy the starter org (CEO + marketing + community)
cp -r agents/templates agents/my-company

# Rename the group
find agents/my-company -name '*.md' -exec sed -i '' 's/group: template/group: my-company/g' {} +

# Sync to TypeDB
bun run scripts/sync-agents.ts
```

That gives you a working 9-agent org in under a minute. See
`templates/README.md` for the full walkthrough.

## Agent format

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

**Required fields:** `name`, `model`, `group`.
**Recommended:** `channels`, `skills` (with price + tags), `sensitivity`.
**Optional:** `wallet`, `tools`, `lifecycle`.

## What gets created in TypeDB

Parsing `tutor.md` with `group: my-company` produces:

```tql
insert $u isa unit, has uid "my-company:tutor", has name "tutor",
  has model "anthropic/claude-haiku-4-5", has system-prompt "You are a patient tutor...";

insert $s isa skill, has skill-id "my-company:explain", has price 0.01, has tag "education";

insert (provider: $u, offered: $s) isa capability, has price 0.01;
insert (group: $g, member: $u) isa membership;
```

## The template org

```
agents/templates/
├── README.md          usage guide
├── ceo.md             strategize · approve · hire · review
├── marketing/
│   ├── director.md    strategize · allocate · brief · review
│   ├── writer.md      blog · email · script · headline · edit
│   ├── seo.md         keywords · audit · optimize · links
│   ├── social.md      post · thread · engage · calendar
│   └── ads.md         campaign · creative · optimize · report
└── community/
    ├── director.md    strategize · moderate · triage · report
    ├── support.md     reply · triage · refund · escalate · faq
    └── moderator.md   review · warn · remove · appeal
```

This is a generic three-tier org — CEO at the top, two directors, and
specialists under each. Clone it, rename the group, customize prompts, and
you have a working hierarchy with the governance model wired in.

## Sensitivity — trust gradients

The `sensitivity` field (0.0-1.0) controls how aggressively pheromone
weights apply. Lower values = more exploration; higher values = lean on
proven paths.

| Role          | Default | Why                                  |
|---------------|--------:|--------------------------------------|
| CEO           | 0.8     | Trust-weighted, consequential        |
| Director      | 0.7     | Balance explore/exploit              |
| Specialist    | 0.5-0.6 | Room for new approaches              |
| Support / Mod | 0.4     | Prefer stable, proven paths          |

## The 4 outcomes — close every loop

Every task an agent runs closes with exactly one of:

| Outcome    | Pheromone effect  | When                             |
|------------|-------------------|----------------------------------|
| `result`   | `mark(+depth)`    | Success — payload returned       |
| `timeout`  | neutral           | Slow but not broken              |
| `dissolved`| `warn(0.5)`       | Capability missing — mild        |
| (none)     | `warn(1)`         | Agent produced nothing           |

Agents that leak signals without closing the loop leak learning. See
`../one/patterns.md`.

## Deploy

See the per-channel guides:

- **Web** — part of the Astro app (`../web/`)
- **Telegram / Discord** — edge worker via `/claw` command (`.claude/commands/claw.md`)
- **MCP** — `../mcp/` makes Claude Desktop an agent-caller

## See also

- `AGENTS.md` — repo-wide agent manifest
- `CLAUDE.md` — local contract for this folder
- `../one/dictionary.md` — verb canon
- `../one/lifecycle.md` — register → signal → highway → harden
