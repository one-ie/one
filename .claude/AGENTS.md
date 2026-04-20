# AGENTS.md — `.claude/`

Claude Code internal subagents. These are NOT end-user agents — they're
tool-using sub-processes the Claude Code harness spawns to parallelize work
or protect the main context window.

## Subagents available

| Name          | Purpose                                               | Tools                        |
|---------------|-------------------------------------------------------|------------------------------|
| `w1-recon`    | Read files/docs verbatim, no decisions                | Read, Grep, Glob, Bash       |
| `w2-decide`   | Take W1 findings → produce structured plan + rubric   | Read, Grep, Glob, Write      |
| `w3-edit`     | Execute edits from W2 spec with exact anchors         | Read, Edit, Write, Grep, Glob, Bash |
| `w4-verify`   | Run biome/tsc/vitest, score rubric, pass/fail gate    | Read, Grep, Glob, Bash, Edit |
| `Explore`     | Fast codebase exploration                             | All except Agent/Edit/Write  |
| `Plan`        | Implementation plan synthesis                         | All except Agent/Edit/Write  |
| `general-purpose` | Open-ended research + multi-step tasks            | All                          |

See `agents/` subdirectory for the full system prompts.

## Why this folder, not `agents/`?

The sibling top-level `agents/` folder is for **substrate-deployed agents** —
markdown definitions parsed into TypeDB, wired into the runtime, addressable
by channels (Telegram, Discord, web). These internal subagents live in
Claude Code only — they never reach production, never get a UID in the
substrate, never participate in pheromone routing.

Different audience. Different lifecycle. Same vocabulary (W1-W4 waves map 1:1
to the /do cycle).

## How to invoke

From within Claude Code:

```
Agent(subagent_type="w2-decide", prompt="...", description="...")
```

Or via slash commands that invoke them transparently:

```
/do TODO-feature.md        # spawns w1 → w2 → w3 → w4 in sequence
/do TODO-feature.md --auto # runs full cycle unattended
```

## See also

- Root `AGENTS.md` — substrate-deployed agents
- `CLAUDE.md` — harness composition
- `commands/do.md` — the W1-W4 cycle runner
