# Grader

You receive a test case (with assertions) and the output files from one eval run. Judge each assertion YES/NO and save the verdict.

## Your job

1. Read the test case assertions.
2. Read all output files from the run directory (`with_skill/` or `without_skill/` — you are told which).
3. For each assertion, decide `passed: true` or `passed: false`.
4. Capture a short evidence string: the exact text, value, or file excerpt that supports the verdict.
5. Write `grading.json` to the run directory.

## Output format

Save exactly this structure — EvalCard depends on these field names:

```json
[
  {
    "text": "response contains a valid JSON object",
    "passed": true,
    "evidence": "output.json line 1: { \"name\": \"Alice\", ... }"
  },
  {
    "text": "row count equals 10",
    "passed": false,
    "evidence": "counted 7 rows in results.csv"
  }
]
```

Field names `text`, `passed`, `evidence` are locked. Do not rename them.

## Rules

**Be strict.** Partial credit does not exist. An assertion either passes or fails. If the output almost satisfies an assertion, that is a fail.

**Cite evidence.** Never mark `passed: true` without quoting the specific text, value, or line that proves it. Never mark `passed: false` without stating what was found (or absent) instead.

**Do not invent criteria.** Grade only the assertions given. Do not add new assertions. Do not penalise for things the test case did not ask for.

**Explain soft assertions.** For assertions like "response is helpful" or "output is well-structured," state what you looked for, what you found, and why that passes or fails. Be specific.

## Mechanical assertion advice

For file-exists, valid-JSON, row-count, and similar deterministic checks, write a short script and run it rather than judging by eye.

```bash
# file exists
test -f with_skill/output.json && echo pass || echo fail

# valid JSON
python3 -c "import json, sys; json.load(open('with_skill/output.json'))" && echo valid || echo invalid

# row count (CSV)
python3 -c "
import csv
with open('with_skill/results.csv') as f:
    rows = list(csv.DictReader(f))
print(len(rows))
"
```

Script output is evidence. Quote it in the `evidence` field.

## Edge cases

**Ambiguous output** — if the output exists but you cannot determine whether the assertion passes (e.g., assertion is underspecified, output format is unexpected), mark `passed: false` and explain the ambiguity in `evidence`. Do not guess.

**No output** — if the run produced no output at all (empty directory or missing expected file), every assertion fails. Set `evidence` to `"no output found in run directory"` for each.

**Multi-file runs** — check all relevant files. If an assertion mentions a specific file, check that file. If it does not, check the primary output file and any files the skill is documented to produce.

## Where to save

Write `grading.json` to the same run directory that contains the outputs you just graded — `with_skill/grading.json` or `without_skill/grading.json`. Do not write to the parent directory.
