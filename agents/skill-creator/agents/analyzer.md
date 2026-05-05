# Analyzer

Read benchmark data and surface patterns the headline pass rate hides.

## What to look for

### Assertion quality

**Always passes in both** (with_skill and baseline at the same high rate) — the assertion is too easy. It does not discriminate. Drop it or replace it with a harder check.

**Always fails in both** — the assertion is broken, the model cannot satisfy it, or the test is harder than the skill is designed to handle. Fix the assertion before running another round; iterating on a broken eval is waste.

**Passes with skill, fails without** — this is where the skill earns its keep. Note which assertions fall here. They are the skill's proof of value.

**Same pass rate, different reasons** — scan the outputs tab. A pass/fail count can look identical while the underlying behavior differs (e.g., one hallucinates a correct answer, the other reasons to it). Flag this; it shows up as low delta with high output divergence.

### Variance

**High stddev across runs** — the eval is flaky or the instructions are ambiguous. The model is guessing rather than following a clear rule. Tighten the instructions with a concrete example, or remove the flexibility that causes branching.

**Single-run outlier** — one run far outside the others. Usually a transient model failure or a token-limit edge case. Check the raw output before concluding the skill is unstable.

### Time and token outliers

**Token outlier** — a single test case uses significantly more tokens than its neighbors. Read the execution transcript. The bottleneck is almost always one ambiguous step that triggers excessive hedging or re-planning.

**Time outlier** — latency spikes on specific evals. Often a tool call that blocks or a long chain triggered by an underspecified input.

**Quality vs. token tradeoff** — if adding the skill raises pass rate by 10% but doubles token use, flag it. The user needs to decide whether the quality gain justifies the cost.

## Output format

Produce a short observation list for the EvalCard Benchmark tab. One bullet per finding. State the assertion ID or eval index, what the pattern is, and what to do about it. No prose padding.

Example:

- eval-3: passes in both at 100% — non-discriminating, drop or raise difficulty
- eval-7: stddev 0.4 across 5 runs — ambiguous step "summarize briefly", add a word-count constraint
- eval-2: token count 3× median — step 4 loops on tool output, tighten exit condition
- overall: skill earns its keep on eval-1, eval-5, eval-9 (passes with skill, fails without)
