# /next - Skip to Next Inference

**Purpose:** Skip the current inference and advance to the next one in the sequence.

## Behavior

When `/next` is invoked:

1. **Skip Current:** Current inference is NOT marked as complete
2. **Advance:** Move to next inference (Infer N+1)
3. **Show Context:** Display context for next inference
4. **Log Skip:** Record that inference was skipped (for review later)

## When to Use

Use `/next` when the current inference is **not applicable** to your feature:
- ✅ Feature doesn't need this functionality (e.g., skip auth if public-only)
- ✅ Already implemented in previous iteration
- ✅ Dependency not met (e.g., can't test if no code written yet)
- ✅ Out of scope for current feature

## When NOT to Use

Do NOT use `/next` to:
- ❌ Avoid difficult work
- ❌ Skip failing tests
- ❌ Bypass errors or blockers
- ❌ Rush through quality checks

**Instead:** Use `/done` when work is complete, or continue working if incomplete.

## Example Usage

```
User: This feature doesn't need authentication - it's a public landing page. /next
Claude: Skipping Infer 41 (Configure Better Auth). Moving to Infer 42...
```

## Difference from /done

| Command | Current Inference | Next Inference | Use Case |
|---------|-------------------|----------------|----------|
| `/done` | ✅ Marked complete | Loads automatically | Task finished |
| `/next` | ⏭️ Skipped (not complete) | Loads automatically | Task not applicable |

## Review Skipped Inferences

Later, review skipped inferences with:
```
/plan --show-skipped
```

This shows all skipped inferences for review (in case any should be revisited).
