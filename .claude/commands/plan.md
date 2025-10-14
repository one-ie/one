# /plan - View Complete Inference Plan

**Purpose:** Display the complete 100-inference plan with progress, dependencies, and filtering options.

## Basic Usage

```bash
/plan
```

Shows complete 100-inference plan with:
- Current inference highlighted
- Completed inferences (✅)
- Skipped inferences (⏭️)
- Pending inferences (⏹️)
- Progress percentage

## Filtering Options

### By Dimension
```bash
/plan --dimension=organizations    # Show only org-related inferences
/plan --dimension=people          # Show only people/auth inferences
/plan --dimension=things          # Show only entity inferences
/plan --dimension=connections     # Show only relationship inferences
/plan --dimension=events          # Show only event inferences
/plan --dimension=knowledge       # Show only knowledge/RAG inferences
```

### By Specialist
```bash
/plan --specialist=backend        # Show backend inferences (11-20, 41-50)
/plan --specialist=frontend       # Show frontend inferences (21-30, 71-80)
/plan --specialist=integration    # Show integration inferences (31-40)
/plan --specialist=quality        # Show testing inferences (61-70)
/plan --specialist=design         # Show design inferences (71-80)
/plan --specialist=documenter     # Show documentation inferences (95-100)
```

### By Status
```bash
/plan --status=completed          # Show only completed inferences
/plan --status=skipped            # Show only skipped inferences
/plan --status=pending            # Show only pending inferences
/plan --status=blocked            # Show inferences with unmet dependencies
```

### By Range
```bash
/plan --range=1-10               # Show inferences 1-10 (Foundation)
/plan --range=11-20              # Show inferences 11-20 (Backend)
/plan --range=21-30              # Show inferences 21-30 (Frontend)
```

## Combined Filters

```bash
/plan --specialist=backend --status=pending
/plan --dimension=knowledge --range=51-60
/plan --status=skipped --show-dependencies
```

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INFERENCE PLAN: Feature Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Progress: 23/100 (23%) | Completed: 22 | Skipped: 1 | Pending: 77

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 INFER 1-10: FOUNDATION & SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Infer 1: Validate idea against 6-dimension ontology
   └─ Dimensions: foundation | Specialist: director

✅ Infer 2: Map idea to specific entity types
   └─ Dimensions: things | Specialist: director

⏸️ Infer 3: Identify connection types needed
   └─ Dimensions: connections | Specialist: director

⏹️  Infer 4: List event types that will be triggered
   └─ Dimensions: events | Specialist: director

[... continues through 100 ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Legend

- ✅ = Completed
- ⏸️ = Current (in progress)
- ⏭️ = Skipped (not applicable)
- ⏹️ = Pending
- 🚫 = Blocked (dependencies not met)

## Dependencies View

```bash
/plan --show-dependencies
```

Shows dependency graph:
```
Infer 21 (Create Astro page)
  ├─ Requires: Infer 12 (schema.ts updated)
  ├─ Requires: Infer 13 (Effect.ts service)
  └─ Requires: Infer 15 (Convex queries)
```

## Export Plan

```bash
/plan --export=markdown          # Export to one/plans/current-feature.md
/plan --export=json             # Export to .claude/state/plan.json
```

## Use Cases

1. **Starting a feature:** Review complete plan before beginning
2. **Mid-feature:** Check progress and what's remaining
3. **Blocked:** See dependencies for current inference
4. **Skipped review:** Verify skipped inferences were correct
5. **Handoff:** Share plan with team members
