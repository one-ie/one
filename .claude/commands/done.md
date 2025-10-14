# /done - Mark Current Inference Complete

**Purpose:** Mark the current inference as complete and advance to the next inference in the sequence.

## Behavior

When `/done` is invoked:

1. **Mark Complete:** Current inference is marked as complete in state
2. **Capture Lesson:** Any lessons learned are extracted from conversation
3. **Advance:** Move to next inference (Infer N+1)
4. **Show Context:** Display context for next inference automatically

## When to Use

Use `/done` when you have **completed** the current inference task:
- ✅ Task is fully accomplished
- ✅ All acceptance criteria met
- ✅ Tests pass (if applicable)
- ✅ No blockers or errors

## When NOT to Use

Do NOT use `/done` if:
- ❌ Task is partially complete
- ❌ Tests are failing
- ❌ You encountered errors
- ❌ You need to investigate further

**Instead:** Continue working on current inference until it's truly complete.

## Example Usage

```
User: I've finished implementing the Effect.ts service with error handling. All tests pass.