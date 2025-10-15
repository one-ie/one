# /infer N - Jump to Specific Inference

**Purpose:** Jump directly to a specific inference number in the sequence.

⚠️ **Use Sparingly:** This command breaks sequential flow. Only use when absolutely necessary.

## Usage

```bash
/infer 42        # Jump to inference 42
/infer 95        # Jump to inference 95 (documentation)
```

## When to Use

Use `/infer N` only in these situations:

1. **Fixing broken build:** Jump to Infer 91 (Build production bundle) to fix deployment issues
2. **Emergency hotfix:** Jump to relevant inference for urgent fix
3. **Parallel work:** Different team members working on different inferences simultaneously
4. **Recovering from error:** Jump back to specific inference after system crash

## When NOT to Use

Do NOT use `/infer N` to:
- ❌ Skip ahead to "easier" work
- ❌ Avoid difficult inferences
- ❌ Work out of order without reason
- ❌ Jump around randomly

**Golden Rule:** Sequential execution ensures dependencies are met.

## Safety Checks

When you use `/infer N`, the system checks:

1. **Dependencies:** Are required inferences complete?
2. **Context:** Do you have necessary context to complete this inference?
3. **State:** Is the codebase in correct state for this inference?

### Example Safety Check

```
User: /infer 21

Claude: ⚠️  WARNING: Jumping to Infer 21 (Create Astro page)

Dependencies check:
  ✅ Infer 12 (schema.ts) - Complete
  ❌ Infer 13 (Effect.ts service) - Not complete
  ❌ Infer 15 (Convex queries) - Not complete

Recommendation: Complete Infer 13 and 15 first, or continue anyway?
  1. Go back to sequential flow (/next from current)
  2. Continue to Infer 21 anyway (not recommended)
  3. Cancel

Choice: _
```

## Marking Previous Inferences

When you jump, you must decide what to do with skipped inferences:

```
User: /infer 50

Claude: You are jumping from Infer 23 to Infer 50.

What should I do with Infer 24-49?
  1. Mark as skipped (can review later)
  2. Mark as complete (assume done elsewhere)
  3. Leave as pending (must do later)

Choice: _
```

## Recovery Mode

If you crash or lose state, use `/infer` to recover:

```bash
/infer --recover    # Analyze codebase and suggest current inference
```

This scans the codebase and suggests which inference you're likely on based on:
- Files present
- Schema defined
- Tests written
- Components created

## Parallel Execution

For parallel work with multiple team members:

```bash
# Team member 1
/infer 11 --parallel=backend     # Work on backend (11-20)

# Team member 2
/infer 21 --parallel=frontend    # Work on frontend (21-30)
```

System tracks multiple inference branches and merges when ready.

## Jump History

View your jump history:

```bash
/infer --history
```

Output:
```
Jump History:
  Infer 1 → 15 (Skipped 2-14)
  Infer 15 → 21 (Completed 16-20)
  Infer 21 → 50 (Skipped 22-49)
  Infer 50 → Current
```

## Best Practices

1. **Default to sequential:** Use `/next` and `/done` for normal flow
2. **Document jumps:** Add reason when jumping: `/infer 42 --reason="Fixing production bug"`
3. **Review skipped:** Use `/plan --status=skipped` to review what you jumped over
4. **Fill gaps:** Return to skipped inferences when possible

## Philosophy

Inference-based planning works best **sequentially**. Each inference builds on previous ones. Jumping breaks this flow and may cause:
- Missing dependencies
- Incomplete context
- Integration issues
- Failed tests

**Use `/infer` only when sequential flow is not possible.**
