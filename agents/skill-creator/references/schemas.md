# JSON Schemas

## evals.json — test case definitions

```json
{ "skill_name": "string", "evals": [{ "id": number, "prompt": "string", "expected_output": "string", "files": ["string"] }] }
```

## eval_metadata.json — per-case workspace metadata

```json
{ "eval_id": number, "eval_name": "string", "prompt": "string", "assertions": ["string"] }
```

## grading.json — grader sub-agent output per run directory (field names are exact — EvalCard depends on them)

```json
[{ "text": "string", "passed": boolean, "evidence": "string" }]
```

## benchmark.json — aggregated result from `web/src/lib/eval/aggregate.ts`

```json
{ "skillName": "string", "iteration": number, "with_skill": { "pass_rate": number, "tokens": number, "time": number }, "without_skill": { ... }, "delta": { ... } }
```

## feedback.json — human reviewer output

```json
{ "reviews": [{ "run_id": "string", "feedback": "string", "timestamp": "string" }], "status": "complete" }
```
