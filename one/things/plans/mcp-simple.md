# Remove MCP Context Pollution (Simplest Approach)

**Version:** 3.0.0
**Status:** Dead Simple - Just Remove Until Needed
**Purpose:** Stop loading 10,000 tokens of MCP docs until actually using the tools

---

## Problem

MCPs auto-load ~10,000 tokens of documentation into context:

```
shadcn MCP:          ~2,000 tokens
cloudflare-docs:     ~1,500 tokens
cloudflare-builds:   ~3,000 tokens
Figma MCP:           ~2,500 tokens
IDE MCP:             ~1,000 tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:              ~10,000 tokens WASTED
```

**We don't need these until using the actual tools.**

---

## Simplest Solution

Tell Claude:

> **"Don't keep MCP documentation in your active context. Only load it when I actually use an MCP tool."**

That's it. Nothing else needed.

---

## How It Works

### Current Behavior (Bad)

```
User: "Let's work on the homepage"
Claude: [Has 10,000 tokens of MCP docs loaded]
        [Never uses them]
        [Wasted context]
```

### New Behavior (Good)

```
User: "Let's work on the homepage"
Claude: [NO MCP docs loaded]
        [Saves 10,000 tokens]
        [More room for actual work]
```

### When Using MCP

```
User: "Add a button with shadcn"
Claude: [Loads ONLY shadcn docs: ~2,000 tokens]
        [Uses shadcn MCP tool]
        [Still saves 8,000 tokens]
```

---

## One-Time Setup Prompt

Copy and paste this prompt ONCE. Claude will remember and apply it automatically going forward:

```
Claude, from now on and for all future conversations in this project:

AUTOMATICALLY clear all MCP documentation from your active context
unless I'm actually using an MCP tool.

Rules:
1. Default: NO MCP docs loaded (saves ~10,000 tokens)
2. When I use an MCP tool: Load ONLY that MCP's docs
3. After using tool: Clear those docs from context
4. Apply this behavior permanently for this project

Available MCPs:
- shadcn (component registry)
- cloudflare-docs (documentation search)
- cloudflare-builds (Workers builds)
- figma (design data)
- ide (VS Code integration)

Confirm you'll automatically apply this context management going forward.
```

**That's it.** Run once, saves 10,000 tokens forever.

---

## Implementation (2 Steps)

### Step 1: Update CLAUDE.md

Add this to project instructions:

```markdown
# MCP Context Management

**CRITICAL:** Do NOT load MCP documentation in active context unless actually using MCP tools.

## Available MCPs

- shadcn (component registry)
- cloudflare-docs (documentation search)
- cloudflare-builds (Workers builds)
- figma (design data)
- ide (VS Code integration)

## Instructions for Claude

1. **DO NOT keep MCP docs in active context by default**
2. **When user requests MCP tool usage:**
   - Load ONLY that specific MCP's documentation
   - Use the tool
   - Don't keep docs after use
3. **Result:** Save ~10,000 tokens per conversation

## Why This Matters

Loading all MCP docs = 10,000 tokens wasted
Loading only needed MCP = Save 8,000-10,000 tokens
More tokens = Better code, deeper thinking, longer conversations
```

### Step 2: Run the One-Time Prompt

Use the "One-Time Setup Prompt" above. Claude will:
- ✓ Remember this instruction permanently
- ✓ Automatically apply it to all future conversations
- ✓ Save 10,000 tokens in every conversation

Done.

---

## Results

### Before

```
Context Usage:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project instructions:  8,000 tokens
MCP docs (all):       10,000 tokens
Conversation:         10,000 tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                28,000 tokens
```

### After

```
Context Usage:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project instructions:  8,000 tokens
MCP docs:                  0 tokens (not loaded)
Conversation:         10,000 tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                18,000 tokens

Savings:              10,000 tokens (35.7%)
```

### When Using MCP

```
Context Usage (using shadcn):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project instructions:  8,000 tokens
shadcn docs only:      2,000 tokens (loaded on demand)
Conversation:         10,000 tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:                20,000 tokens

Still saves:           8,000 tokens (28.6%)
```

---

## Benefits

1. **Zero Setup** - Just add one section to CLAUDE.md
2. **Zero Code** - No scripts, no files, no hooks
3. **Zero Complexity** - Tell Claude once, it remembers
4. **Maximum Savings** - 10,000 tokens per conversation
5. **Works Everywhere** - Copy to any Claude Code project

---

## For Any Claude Code Project

Copy this to your project's instructions:

```markdown
# MCP Context Management

**Don't load MCP documentation in context unless actually using MCP tools.**

Available MCPs: [list your MCPs]

Instructions:
1. Don't keep MCP docs in active context
2. Load only when user requests MCP tool usage
3. Save ~10,000 tokens per conversation
```

---

## That's It

No memory files.
No API config.
No hooks.
No complexity.

Just: **"Don't load MCP docs until needed."**

---

**Simple. Effective. Saves 10,000 tokens.**
