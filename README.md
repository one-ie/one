<h1 align="center">ONE</h1>

<p align="center">
  <strong>AI agents that learn. Build in markdown. Deploy everywhere.</strong>
</p>

<p align="center">
  <a href="https://npmjs.com/package/oneie"><img src="https://img.shields.io/npm/v/oneie.svg" alt="npm version"></a>
  <a href="https://github.com/one-ie/one/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://one.ie"><img src="https://img.shields.io/badge/docs-one.ie-green.svg" alt="Documentation"></a>
</p>

---

Write a markdown file. Get a live AI agent that learns from every conversation, remembers users across sessions, and can charge for its services.

```bash
npx oneie
```

---

## See it work

**1. Write an agent in markdown:**

```markdown
---
name: tutor
model: claude-haiku-4-5
channels: [telegram, discord, web]
skills:
  - name: explain
    price: 0.01
    tags: [education, math, science]
---

You are a patient tutor who explains concepts clearly.
Break down complex topics into simple steps.
Ask questions to check understanding.
```

**2. Deploy it:**

```bash
npx oneie
```

**3. Talk to it:**

Your agent is now live on Telegram, Discord, and web. Users can message it. It remembers them. It learns what works.

---

## Why ONE?

### Your agents get smarter over time

Every conversation teaches your agents. Success strengthens pathways. Failure weakens them. After 1000 conversations, your agents route around problems you never anticipated.

```
Day 1:    Agent tries everything, some fails
Day 30:   Agent avoids approaches that failed
Day 90:   Agent finds optimal paths automatically
```

### Memory that actually works

Not just chat history. Structured memory per user:

- What topics interest them
- What explanations worked
- What to avoid
- When they last engaged

GDPR-compliant. One-click forget.

### Commerce built in

Set a price. Users pay. You earn.

```markdown
skills:
  - name: tax-advice
    price: 5.00      # $5 per question
    tags: [tax, legal]
```

Escrow, settlement, revenue tracking — handled. You focus on the agent, not billing infrastructure.

### Deploy once, run everywhere

One markdown file → live on:

| Channel | What you get |
|---------|--------------|
| **Telegram** | Instant bot, group support |
| **Discord** | Server integration, slash commands |
| **Web** | Embeddable chat widget |
| **API** | Call from any application |

### Works with your AI tools

Native MCP integration:

```json
{
  "mcpServers": {
    "one": { "command": "npx", "args": ["@oneie/mcp"] }
  }
}
```

Claude Code, Cursor, Windsurf — 40 tools for signaling agents, checking memory, viewing analytics, managing commerce.

---

## Quick start

### Full project (recommended)

```bash
npx oneie
```

Interactive setup: clones the platform, creates your org, wires Claude Code.

### Just the SDK

```bash
npm install @oneie/sdk
```

```typescript
import { ONE } from "@oneie/sdk";

const one = new ONE();

// Signal an agent
await one.signal({ receiver: "tutor:explain", data: { topic: "calculus" } });

// Ask and wait for response
const { result } = await one.ask({ receiver: "tutor:explain", data: { topic: "calculus" } });

// Check what's working
const highways = await one.highways(10);  // top 10 proven paths
```

### MCP for Claude/Cursor

```bash
npm install -g @oneie/mcp
```

Then ask Claude: *"Signal the tutor agent to explain calculus"* — it just works.

---

## How it works

ONE is a **substrate** — infrastructure that sits under your agents:

```
┌─────────────────────────────────────────────────────────┐
│                     YOUR AGENTS                          │
│   (markdown files with personality + skills + pricing)   │
├─────────────────────────────────────────────────────────┤
│                        ONE                               │
│                                                          │
│   Routing      →  signals flow to the right agent        │
│   Memory       →  structured recall per user             │
│   Learning     →  every outcome updates the graph        │
│   Commerce     →  pricing, escrow, settlement            │
│   Evolution    →  struggling agents auto-improve         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                       LLM                                │
│            (Claude, GPT, Llama — your choice)            │
└─────────────────────────────────────────────────────────┘
```

The LLM handles conversation. ONE handles everything else.

### The learning loop

```
User sends message
        ↓
ONE routes to best agent (learned from history)
        ↓
Agent responds (LLM generates)
        ↓
ONE records outcome
        ↓
    ┌───┴───┐
    ↓       ↓
Success   Failure
mark()    warn()
    ↓       ↓
Path      Path
stronger  weaker
        ↓
Next time: smarter routing
```

This compounds. Width (parallel agents) × Depth (chain of tasks) × Learning (outcome feedback) = agents that genuinely improve.

---

## Example agents

### The Orchestrator (CEO)

Routes work to specialists, makes final calls:

```markdown
---
name: ceo
model: claude-sonnet-4
skills:
  - name: delegate
    tags: [management, routing]
  - name: decide  
    tags: [strategy, decisions]
---

You are the CEO. You don't do the work — you delegate to the right specialist
and make final decisions when needed. Be decisive. Trust your team.
```

### The Helper (Support)

Handles tickets, escalates when stuck:

```markdown
---
name: support
model: claude-haiku-4-5
channels: [telegram, discord]
skills:
  - name: troubleshoot
    price: 0
    tags: [support, debug]
  - name: escalate
    tags: [support, escalation]
---

You handle customer support. Be helpful, be fast.
If you can't solve it in 3 messages, escalate.
```

### The Expert (Paid Consultant)

Charges per query:

```markdown
---
name: tax-advisor
model: claude-sonnet-4
skills:
  - name: tax-question
    price: 5.00
    tags: [tax, legal, advice]
---

You are a tax advisor. Be accurate. Cite sources.
If you're uncertain, say so — don't guess on tax matters.
```

### The Team (Multi-Agent)

CEO delegates to specialists:

```
agents/
├── ceo.md           # Routes and decides
├── researcher.md    # Deep research
├── writer.md        # Content creation
├── reviewer.md      # Quality check
└── publisher.md     # Final delivery
```

Signal the CEO. Work flows through the team. Each step learns.

---

## The six verbs

Everything in ONE uses six verbs. Learn these, you understand the whole system:

| Verb | What it does | When to use |
|------|--------------|-------------|
| **signal** | Send a message to an agent | Starting any interaction |
| **mark** | Record success, strengthen pathway | Task completed well |
| **warn** | Record failure, weaken pathway | Task failed or was poor |
| **fade** | Decay old pathways over time | Automatic — forgetting is healthy |
| **follow** | Route to the strongest pathway | Automatic — routing decisions |
| **harden** | Promote patterns to permanent knowledge | Automatic — confirmed learnings |

```typescript
// The closed loop pattern — every interaction ends with mark or warn
const { result, timeout, dissolved } = await one.ask({ receiver: "tutor:explain" });

if (result)         one.mark(edge);       // success — path gets stronger
else if (timeout)   /* neutral */;        // slow, not bad
else if (dissolved) one.warn(edge, 0.5);  // missing — mild penalty
else                one.warn(edge, 1);    // failed — full penalty
```

---

## Packages

| Package | Purpose | Install |
|---------|---------|---------|
| [`oneie`](https://npmjs.com/package/oneie) | CLI — scaffold, deploy, manage | `npx oneie` |
| [`@oneie/sdk`](https://npmjs.com/package/@oneie/sdk) | TypeScript SDK — full API access | `npm i @oneie/sdk` |
| [`@oneie/mcp`](https://npmjs.com/package/@oneie/mcp) | MCP server — AI IDE integration | `npm i -g @oneie/mcp` |

---

## What's in this repo

```
one-ie/one/
│
├── agents/          # Agent templates — copy and customize
│   └── templates/   # CEO, support, researcher, writer...
│
├── one/             # Documentation
│   ├── dictionary.md    # The vocabulary
│   ├── lifecycle.md     # Agent journey
│   ├── patterns.md      # Core patterns
│   └── ...
│
├── sdk/             # @oneie/sdk source
├── mcp/             # @oneie/mcp source
├── web/             # Astro starter (chat UI + landing)
│
├── .claude/         # Claude Code harness
│   ├── commands/    # /see, /create, /do, /sync
│   ├── skills/      # /typedb, /deploy, /astro
│   └── rules/       # Auto-loaded patterns
│
├── CLAUDE.md        # Context for Claude Code
├── AGENTS.md        # Agent manifest
└── LICENSE          # MIT
```

Every folder has its own README. Cd in, get scoped context.

---

## Documentation

| Start here | What you'll learn |
|------------|-------------------|
| **[one/dictionary.md](one/dictionary.md)** | The vocabulary — this is the foundation |
| **[agents/README.md](agents/README.md)** | Agent format — frontmatter, skills, channels |
| **[sdk/README.md](sdk/README.md)** | SDK reference — methods, hooks, errors |
| **[mcp/README.md](mcp/README.md)** | MCP tools — what's available in Claude/Cursor |
| **[one/lifecycle.md](one/lifecycle.md)** | Agent journey — register → signal → highway → harden |
| **[one/patterns.md](one/patterns.md)** | Core patterns — closed loop, zero returns |

---

## Community

**Questions?** Open an issue or talk to [@onedotbot](https://t.me/onedotbot) on Telegram.

**Contributing?** Read `one/dictionary.md` first — the vocabulary is load-bearing.

---

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  <strong>ONE</strong> — AI agents that learn.<br>
  Build in markdown. Deploy everywhere.
</p>

<p align="center">
  <a href="https://one.ie">one.ie</a> · 
  <a href="https://npmjs.com/package/oneie">npm</a> · 
  <a href="https://github.com/one-ie/one">github</a>
</p>
