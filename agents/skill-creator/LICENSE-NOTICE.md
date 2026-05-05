# LICENSE NOTICE — skill-creator

This skill is forked from **Anthropic's skill-creator**:

- Source: https://github.com/anthropics/skills/tree/main/skills/skill-creator
- License: Apache-2.0
- Copyright: © Anthropic PBC

The fork is also licensed Apache-2.0. The full Apache-2.0 text is reproduced in the parent repo's `LICENSE` file.

## Deltas applied in this fork

The skill body is largely Anthropic's verbatim prose. Three substantive adaptations to fit the ONE chat-driven sandbox:

1. **Eval reviewer renders inline as `<EvalCard>` in the chat conversation** instead of via `eval-viewer/generate_review.py` (a Python HTTP server that opens a browser tab). The chat surface has no shell, no browser, and no display. The chat *is* the UI, so the review tab and the work tab live in the same conversation.

2. **Workspace paths are R2 keys**, scoped by the owner's slug:
   `<slug>/skills/_workspace/<skill-name>/iteration-N/eval-<name>/...`
   Anthropic's skill-creator uses sibling filesystem directories (`<skill>-workspace/iteration-N/`). Sandboxes have no filesystem; R2 is the storage substrate. Sub-paths are otherwise identical.

3. **Paid skills run in dry-run mode by default.** Skills with `accepts[]` (paid x402 skills) charge real USDC per invocation. Running 3 test cases × 2 configurations × 5 iterations × 3 stddev runs = 90 paid invocations during a single benchmark, which would surprise an owner. Dry-run uses the free Workers AI fallback model; pass/fail and benchmarks are real, only cost differs. Production-paid runs are opt-in per session via Face ID. Free skills (no `accepts`) skip this entirely and run as-upstream.

Anthropic's `Claude.ai-specific instructions` and `Cowork-Specific Instructions` sections were dropped (they describe environments we don't target). The `Updating an existing skill` notes from those sections are folded into the *Improving the skill* flow inline.

## Sub-agents and bundled tooling

The `agents/grader.md`, `agents/analyzer.md`, `agents/comparator.md` files are forked verbatim with path adjustments only.

Anthropic's `scripts/` directory (Python helpers: `aggregate_benchmark.py`, `run_loop.py`, `package_skill.py`) is **not** ported per-skill. The equivalent functionality lives once in the platform runtime (`web/src/lib/eval/*` and `web/src/lib/pack/*`, shipped in Cycle 2) and is invoked from the skill body via chat tools (`tools.eval.*`, `tools.pack.*`). One implementation, every skill reuses it.

The `assets/eval_review.html` is forked verbatim and used in SDK-mode runs only (the chat UI uses `<EvalCard>` instead).

## Upstream contributions

The dry-run-for-paid-skills pattern (delta #3) is generally useful — paid skills will become more common as x402 spreads. We will submit the pattern upstream as a PR after this skill stabilizes. The chat-card adaptation (delta #1) is specific to our surface and stays here.

## Attribution

When this skill renders to a user, the EvalCard footer displays:
*"Skill workflow forked from Anthropic's skill-creator. Apache-2.0."*
