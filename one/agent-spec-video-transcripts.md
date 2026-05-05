# agent-spec-video-transcripts

> A reusable pipeline that turns a corpus of expert content (video transcripts, podcasts, course recordings, internal Notion archives) into a published pack of agents and skills — measured, priced, and discoverable. The marketing pack of 1,600 scraped videos is its first invocation; the pipeline applies to any expert corpus.

---

## Why this exists

`agent-spec-prompt.md` insists: *"Start from real expertise — generic LLM-derived skills are mush."* A corpus of expert content is the highest-quality input we can give the system. The trap is the naïve path: paste transcripts into a prompt, ask for "agents," ship summaries-with-YAML-hats. The pipeline below treats the corpus as **source material AND test bed simultaneously** — extracting patterns *and* the eval cases that prove they work.

It is also a **reusable artifact**. Whoever scrapes the next corpus (2,000 sales calls, a course library, a backlog of internal docs) runs the same pipeline.

---

## Inputs / outputs at a glance

```
inputs                                  outputs
──────                                  ───────
N transcripts (markdown)                M agents (markdown, our schema)
  + optional creator metadata           ↳ each with K skills (priced, evaled)
  + optional permission rights          ↳ each with N test cases from real scenarios
                                        cluster-report.md (territory inventory)
                                        pack-manifest.json (what's in, what's not)
                                        per-agent benchmark.json (pass rate, deltas)
                                        per-agent trigger-eval.json (activation rate)
```

**Concretely**: 1,600 marketing videos in → ~10-20 agents out, each with 3-7 skills, each skill at ≥ 0.85 output pass-rate and ≥ 0.80 trigger-rate. All landing under one owner's slug, A2A-discoverable, x402-priced, optionally emitted to agentskills.io.

---

## Pipeline overview

```
  N transcripts
       │
       ▼  ① embed         each transcript → vector
       ▼  ② cluster       HDBSCAN/k-means over vectors
       ▼  ③ triage        drop noise, rank survivors by viability
       ▼  ④ extract       per cluster: frameworks · gotchas · scenarios · vocab
       ▼  ⑤ draft         per cluster: 1 agent + 3-7 skills, populated body
       ▼  ⑥ test-mine     per cluster: real scenarios from videos → evals.json
       ▼  ⑦ harden        skill-creator batch mode — eval, iterate ≤5×, ship ≥0.85
       ▼  ⑧ publish       owner's slug, A2A card, x402 priced, optional skillmd emit
       │
       ▼
   pack-manifest.json + N agents/M skills live
```

Two passes. Don't combine. Quality collapses past the third distinct topic in one prompt.

---

## Stage-by-stage

### ① Embed

| What | How | Cost (est.) |
|------|-----|-------------|
| One vector per transcript | OpenAI `text-embedding-3-small` (1536d) or Voyage `voyage-3-lite` | ~$0.02 / 1,000 transcripts |
| Storage | Local `.parquet` or any vector DB (LanceDB, Qdrant); for 1,600 docs in-memory works | — |

Skip if the corpus is already indexed (some scraping pipelines produce this).

**Deliverable:** `corpus/<pack-name>/embeddings.parquet` with columns `{ id, source_url, embedding, n_tokens, n_chars, scraped_at }`.

### ② Cluster

| What | How |
|------|-----|
| Group transcripts by territory | HDBSCAN on UMAP-reduced vectors (defaults: `min_cluster_size=10`, UMAP to 30d) — handles density variance better than k-means for noisy corpora |
| Sample + name each cluster | Pick 5-10 per cluster; LLM names the territory in 3-5 words |

For 1,600 videos expect **30-80 clusters** with very uneven sizes. The big ones (>200) are usually generic noise; the medium ones (15-100) tend to host real expertise.

**Deliverable:** `corpus/<pack-name>/clusters.json`:

```json
[
  { "id": 12, "size": 87, "name": "Meta ad creative testing",
    "samples": ["v_a3..", "v_kc.."], "centroid_topics": ["CTR","CPM","creative angles","split test"] },
  { "id": 19, "size": 34, "name": "B2B SaaS pricing tiers",
    "samples": [...], "centroid_topics": ["anchoring","decoy","tiers","willingness-to-pay"] }
]
```

### ③ Triage — drop most clusters

This is where 60% of the corpus goes to the floor. **Keep a cluster only if all four hold:**

| Question | If no |
|----------|-------|
| Is the territory specific enough to host *sharp* skills? | Drop ("growth marketing" too broad; "Meta ad creative testing" right) |
| ≥ 10 videos in the cluster? | Drop |
| Is there a recurring procedure across ≥ 3 sampled videos? | Drop |
| Is the outcome measurable? ("CTR went 1.2% → 2.8%" yes; "vibes" no) | Drop |
| Would someone pay $0.05+ for one call? | Drop or mark `accepts: []` (free tier) |

A human curator must do this pass. **Don't automate it.** Auto-triage produces over-broad clusters; a human takes 1-2 hours and the quality difference is permanent.

**Deliverable:** `corpus/<pack-name>/cluster-report.md` — markdown table, each row marked `KEEP` / `DROP` with one-sentence justification:

```
| id | name                          | size | viability | decision |
|----|-------------------------------|------|-----------|----------|
| 12 | Meta ad creative testing      | 87   | strong    | KEEP     |
| 04 | "Build great brands" content  | 340  | noise     | DROP     |
| 19 | B2B SaaS pricing tiers        | 34   | strong    | KEEP     |
```

Output of triage: typically **10-20 KEEP clusters** out of 30-80. Quality compounds; coverage doesn't.

### ④ Extract patterns, not summaries

The whole game is here. Most teams generate prompts that summarize content; they get Wikipedia articles with YAML hats. What you actually want from a cluster's transcripts:

| Extract | Becomes |
|---------|---------|
| Recurring frameworks (≥ 3 videos describe the same flow) | Numbered procedure in skill body |
| Recurring failure modes (≥ 3 warn against the same mistake) | **Gotchas** section (per skill-creator: highest-value content) |
| Recurring tools / vocabulary | Canonical terms in body, keywords in `description` |
| Recurring client scenarios (real situations a speaker walked through) | Eval test cases — `evals/evals.json` writes itself |
| Recurring quantitative outcomes ("CPM dropped 40%") | Pricing anchors — what's it worth per call? |

The extraction is itself a meta-skill: `transcript-pattern-extractor`. It's an agent built using `agent-spec-prompt.md` that takes a cluster of transcripts and returns the five categories above. Run it per cluster.

**Deliverable:** `corpus/<pack-name>/clusters/<id>/patterns.json`:

```json
{
  "cluster_id": 12,
  "frameworks": [
    { "name": "4-step creative test", "frequency": 8,
      "steps": ["winners-only base", "isolate one variable per ad", "minimum spend", "scale survivors"] }
  ],
  "gotchas": [
    { "rule": "Never test 4+ variables at once", "frequency": 6,
      "rationale": "noise dominates signal at small sample sizes" }
  ],
  "vocab": ["CTR","CPM","ROAS","ATC","creative fatigue"],
  "scenarios": [
    { "id": "scen-01", "context": "12 ads, CPM climbing, CTR fell 1.8 → 1.1 last week",
      "decision": "kill 8 underperformers, isolate hook variable, test 4 new" }
  ],
  "outcomes": [
    { "from": "CPM $42", "to": "CPM $26", "via": "creative refresh" }
  ]
}
```

### ⑤ Draft per cluster — one agent, sharp skills

For each KEEP cluster, run the `agent-spec-prompt.md` decomposition (Step 2 + Step 3): one persona, 3-7 narrow skills, populated frontmatter, body assembled from extracted patterns.

For cluster 12 (Meta ad creative testing):

```
agent: meta-creative-tester
skills:
  audit-creative-set        — review existing live creatives, flag fatigue
  propose-test-matrix       — 4-step framework, ≥ 4 variables filtered, output a brief
  score-iteration           — given a week's metrics, label winners/killers
  kill-or-scale-decision    — given current pipe, decide next-week budget shifts
```

Body uses the cluster's procedures, gotchas, and vocab verbatim. Pricing comes from extracted outcomes — auditing a creative set is worth $5; full test matrix proposal is worth $25 (informed by the "$42 → $26 CPM" outcome appearing 4 times in the cluster).

**Deliverable:** `corpus/<pack-name>/draft/<agent-name>/{agent.md, skills/*.md}` — schema-valid, body populated, no test cases yet.

### ⑥ Test-mine — real scenarios from the videos

Per cluster, pull the `scenarios` from patterns.json. Each scenario is a real client situation the speaker walked through. Convert to eval test cases:

```yaml
# corpus/marketing-2026/draft/meta-creative-tester/skills/propose-test-matrix.md (excerpt)
evals:
  - id: scen-01
    prompt: |
      I have 12 ads running. CPM is climbing. CTR dropped from 1.8% to 1.1% last week.
      Conversions are flat but the cost is bleeding. What should I test next?
    expected: A 4-step test matrix isolating one variable per new ad,
              with a kill recommendation for current underperformers.
    files: []
    assertions: []   # filled after first eval run, per skill-creator workflow
```

You'll typically get **20-50 high-quality scenarios per cluster**. Use the top 5-10 for the eval iteration loop; reserve the rest for a regression set (`evals/regression.json`).

**Deliverable:** Each draft skill now has `evals[]` populated.

### ⑦ Harden — skill-creator in batch mode

For each draft agent, run skill-creator's eval loop. Three deltas from chat-driven mode:

| Delta | Why |
|-------|-----|
| **Batch / non-interactive** | Owner approves the *initial* draft once; subsequent iterations auto-approved against programmatic feedback (failed assertion → "fix this") |
| **Cost cap $5 / agent** | Hard ceiling per agent on the whole eval pass; pauses + asks if exceeded |
| **Dry-run during eval, production once before publish** | Already in skill-creator delta #3 — uses free Workers AI fallback for benchmarking; one production-mode blessing run before shipping |

Each agent goes through ≤ 5 iterations. Stop when pass rate ≥ 0.85 on the held-out validation split, OR plateau across 2 iterations.

After output eval passes, run trigger eval (per `agent-spec-prompt.md` description-optimization section): 20 queries, 60/40 train/validation, target ≥ 0.80 activation accuracy on validation.

**Deliverable:** `corpus/<pack-name>/hardened/<agent-name>/{benchmark.json, trigger-eval.json}` per agent. Agent files updated with the optimized description.

### ⑧ Publish

The hardened pack lands at the owner's slug:

```
/u/<owner-slug>/
├── agents/
│   ├── meta-creative-tester.md
│   ├── b2b-pricing-strategist.md
│   └── ... (10-20 agents)
└── skills/
    ├── audit-creative-set.md
    ├── propose-test-matrix.md
    └── ... (3-7 per agent, total ~50-100 skills)
```

Each agent has `discovery.agentCard: true` (default — A2A-discoverable), each paid skill has `accepts[]` populated. Optionally `oneie skill emit` produces the agentskills.io directory format under `_emit/` so Claude Code / Cursor users can install.

`pack-manifest.json` summarizes:

```json
{
  "pack": "marketing-2026",
  "owner_slug": "alice",
  "source_corpus": "1600 marketing videos, scraped 2026-04",
  "creators_credited": ["@example1", "@example2"],
  "license": "skill bodies CC-BY-4.0; corpus pointers fair-use citations",
  "agents": [
    { "name": "meta-creative-tester", "skills": 4,
      "output_pass_rate": 0.87, "trigger_rate": 0.84,
      "price_range_usd": [0, 25] }
  ]
}
```

---

## Two routes — start cheap, escalate

| Route | What | Cost | When to use |
|-------|------|------|-------------|
| **A — Cheap validation** | Stages ①-⑤ only. Skip skill-creator. Draft skills from extracted patterns in one shot, ship a small pack (3 clusters). | $50-100 | First run of the pipeline. Confirm the shape produces non-mush before paying for full eval. |
| **B — Robust production** | All 8 stages. skill-creator runs per cluster with proper baselines and trigger eval. | $200-500 | After Route A validates. Production-grade quality, ready for paying users. |

Run **Route A on 3 clusters first**. If the drafts feel right after human review, escalate. If they don't, fix the pattern extractor before paying for a full Route B run.

---

## Worked example: `marketing-2026` pack

Hypothetical numbers for the 1,600-video corpus:

```
embed                        $0.03    (text-embedding-3-small × 1,600 × ~5K tokens)
cluster (UMAP+HDBSCAN)       $0       (CPU-bound, runs in ~10 min)
triage (human curator)       2 hrs    one person, one sitting
extract patterns             $30      meta-skill × 18 KEEP clusters × $1.67/cluster avg
draft 18 agents              $40      one-shot draft × 18 × ~$2.20
test-mine 18 packs           $20      scenario extraction × 18 × ~$1.10
─────────                    ─────
Route A total                $90 + 2 hrs human time

skill-creator × 18 agents    $360     5 iterations × 6 runs (3 with + 3 without)
                                       × ~$4 / iteration / agent (dry-run rates)
trigger-eval × 18 agents     $54      run_loop × 5 iterations × ~$0.60 / agent
─────────                    ─────
Route B additional           $414
═════════                    ═════
Total                        $504 + 3 hrs human time
```

Output: 18 agents, ~70 skills, all benchmarked, all priced. Owner publishes to their slug. Skills earn from visitor chats and from agentskills.io ecosystem imports.

---

## Quality bar

The pack is **shippable** when:

```
[ ] Each agent has a populated body (≥ 200 words, H2 sections, Gotchas if any extracted)
[ ] Each agent's description starts with "Use when…" and is ≤ 1024 chars
[ ] Each skill has a tight inputSchema (required-only when possible)
[ ] Each paid skill has accepts[] with at least one network/asset
[ ] Each skill has 5+ test cases from real scenarios
[ ] Output pass rate ≥ 0.85 on validation (held-out 40%)
[ ] Trigger rate ≥ 0.80 on validation
[ ] Owner reviewed at least the first iteration's outputs per agent
[ ] pack-manifest.json names the source corpus and any creator credits
[ ] /.well-known/agent-card.json validates against A2A v1.0 schema
[ ] License posture documented (corpus, agents, skills) — see Attribution below
```

Anything below 0.65 on any rubric dimension — the agent doesn't ship in the pack. It's drafted but parked under `corpus/<pack-name>/parked/` for future iteration.

---

## Attribution and rights

This is unique to corpus-driven packs and matters legally + reputationally.

| Question | Default | If permitted |
|----------|---------|--------------|
| Cite specific creators? | "Patterns synthesized from 14 hours of B2B pricing content" | "Patterns drawn from creators @x, @y, @z (with permission)" |
| Use direct quotes from videos in skill bodies? | No — paraphrase patterns only (fair-use safe; avoids derivative-work claims) | Short attributed quotes (< 5% of any source) |
| Use creator names in `tags`? | No | Yes, with permission |
| Pay creators on skill revenue? | Optional rev-share via creator-specific `accepts[]` rows | Strongly recommended for long-term reciprocity |

**Default posture:** anonymous synthesis, fair-use pattern extraction, no direct quotes. If permission is obtained, the pack levels up to credited (better trust, more traffic, ethical clarity).

The `pack-manifest.json` records the posture explicitly. Owners can flip from anonymous to credited later by amending the manifest and re-emitting.

---

## Files this spec implies

| File | Purpose | Where |
|------|---------|-------|
| `tools/transcript-pipeline/embed.ts` | Run the embedding model over a corpus | one-time tool, repo |
| `tools/transcript-pipeline/cluster.ts` | UMAP + HDBSCAN driver | one-time tool, repo |
| `tools/transcript-pipeline/triage.ts` | Render `cluster-report.md` for human review | one-time tool, repo |
| `agents/transcript-pattern-extractor/SKILL.md` | Meta-skill: cluster transcripts → patterns.json | shipped agent |
| `agents/skill-pack-drafter/SKILL.md` | Meta-skill: patterns + cluster name → draft agent + skills | shipped agent |
| `agents/skill-pack-test-miner/SKILL.md` | Meta-skill: cluster scenarios → evals.json | shipped agent |
| `cli/src/pack-eval.ts` | Batch skill-creator wrapper: `oneie pack eval <dir>` | CLI |
| `cli/src/pack-publish.ts` | Pushes a hardened pack into an owner's slug | CLI |
| `corpus/<pack-name>/...` | Working dir; `.gitignored`; not committed | per-corpus |

The first three are one-time scripts (or rather: scripts you run when you have a new corpus). The three meta-skills are themselves shipped agents — they're skills authored using `agent-spec-prompt.md` that other people can use on their own corpora. The CLI wrappers compose the whole flow.

---

## Build classifier

| Prior | Answer | Justification |
|-------|--------|---------------|
| Spec locked | YES | Eight stages defined, deliverables per stage, quality bar set |
| Variance known | MIXED | Cluster algorithm choice (HDBSCAN vs k-means) settles in stage ②; pattern-extractor prompt is iterative |
| Exit scalar | YES | Pack-manifest.json with ≥ 1 agent at output ≥ 0.85 / trigger ≥ 0.80 |
| Files known | YES | File table above is exhaustive for the pipeline tooling |

**3.5 / 4 → `mode: mixed`.** Run as one cycle that ships Route A (validation) first; Route B (production hardening) is a follow-on cycle once Route A's quality is confirmed.

`lifecycle: construction` for the pipeline tooling; `lifecycle: active` for each pack run.

---

## Dependencies on other plans

| Depends on | Why |
|------------|-----|
| `agent-spec.md` | Schema for the output agents/skills |
| `agent-spec-prompt.md` | The decomposition + body craft principles applied at stage ⑤ |
| `agent-spec-todo.md` C2 | Eval framework runner (used by stage ⑦) |
| `agent-spec-todo.md` C2.5 | skill-creator batch mode (used by stage ⑦) |
| `agent-spec-todo.md` C6 | CLI verbs `oneie pack eval` / `oneie pack publish` |

The pipeline cannot run end-to-end before C2.5 lands. Stages ①-⑥ can run as a pure data pipeline before that and produce drafts that humans review.

---

## Open questions to settle before first run

1. **Indexing state of the 1,600 marketing videos.** Already embedded/indexed, or raw markdown dumps? If raw, stage ① is the first work; if indexed, skip directly to ②.
2. **Attribution rights.** Are any creators reachable for permission? Default to anonymous synthesis; level up to credited per-creator as permissions arrive.
3. **Owner slug.** Which slug hosts the pack at publish time? `/u/<owner>/agents/...` is the destination; pick before stage ⑧.
4. **Pricing posture.** Free tier (no `accepts[]`) for visibility, paid tier for scale, or mixed? Default mixed: 1 free triage skill per agent, others paid per the value-anchor heuristic in stage ④.

---

## See Also

- [`agent-spec.md`](agent-spec.md) — schema for output artifacts
- [`agent-spec-prompt.md`](agent-spec-prompt.md) — body craft + decomposition workflow
- [`agent-spec-todo.md`](agent-spec-todo.md) — system implementation; this pipeline depends on C2 + C2.5
- [`../agents/skill-creator/SKILL.md`](../agents/skill-creator/SKILL.md) — eval loop driver
- [`patterns.md`](patterns.md) — closed loop, deterministic sandwich
- [`rubrics.md`](rubrics.md) — fit / form / truth / taste at gate 0.65

---

*Eight stages. Two routes. One reusable pipeline. Quality compounds; coverage doesn't. The corpus is both the source and the test bed.*
