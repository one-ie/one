---
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
