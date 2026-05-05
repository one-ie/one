export const TEMPLATES: Record<string, string> = {
  core: `---
agentmd: "0.1"
name: template
title: Template Agent
model: anthropic/claude-haiku-4-5
summary: A helpful agent.
description: Use when you need to accomplish tasks.
sensitivity: public
lifecycle: active
---

You are a helpful assistant. Complete tasks clearly and concisely.
`,
  commerce: `---
agentmd: "0.1"
name: template
title: Template Commerce Agent
model: anthropic/claude-haiku-4-5
summary: An agent that provides paid services.
description: Use when you need paid skill execution with x402 payments.
sensitivity: public
lifecycle: active
skills: []
wallet: ""
accepts:
  - scheme: exact
    network: "eip155:8453"
    asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    max: "0.05"
---

You provide services at a fee. Verify payment before executing paid skills.
`,
  asi: `---
agentmd: "0.1"
name: template
title: Template ASI Agent
model: anthropic/claude-opus-4-7
summary: An autonomous agent registered on Fetch.ai Almanac.
description: Use for long-running autonomous tasks and multi-agent coordination.
sensitivity: restricted
lifecycle: active
mailbox: true
agentverse: https://agentverse.ai
intervals:
  - period: 300
    task: Check for new signals and coordinate with peer agents.
skills: []
---

You are an autonomous agent. Coordinate with peers, monitor signals, and act on intervals.
`,
}
