# 100-Inference Plan Generation - Quick Reference

**For:** Developers extending agent-director
**Version:** 2.0.0

---

## Feature Library Structure

```typescript
const FEATURE_DEFINITION = {
  "feature-key": {
    name: "Display Name",
    description: "What this feature does",
    inferences: [start, end],          // Where in 1-100
    specialist: "agent-name",          // Which agent builds it
    duration: "~X min",                // Time estimate
    cost: "$X",                        // Cost estimate
    required: true|false,              // Must be included?
    dependencies: ["other-feature"],   // What it needs
    status: "available"|"existing",    // Implementation status
    ontology: {
      things: ["entity_types"],
      connections: ["relationship_types"],
      events: ["event_types"],
      knowledge: ["knowledge_types"]
    }
  }
};
```

---

## Inference Ranges

**Foundation (Required):**
- 1-10: Landing page
- 11-20: Authentication
- 21-30: Multi-tenant groups

**User Features:**
- 31-40: Content/Projects/Integrations
- 41-50: Memberships/Repos/Email
- 51-60: Revenue/Pipelines/Community

**AI & Advanced:**
- 61-70: AI agents
- 71-80: RAG/Knowledge/Design
- 81-90: Search/Performance/Analytics

**Always Included:**
- 91-100: Deployment & Documentation

---

## Adding a New Feature

### Step 1: Define Feature

```typescript
// Add to appropriate category (CREATOR_FEATURES, DEVELOPER_FEATURES, etc.)
const NEW_FEATURES = {
  "my-feature": {
    name: "My Feature",
    description: "What it does",
    inferences: [31, 40],  // Find available range
    specialist: "agent-builder",
    duration: "~15 min",
    cost: "$0",
    dependencies: ["multi-tenant-groups"],  // What it needs
    status: "available",
    ontology: {
      things: ["my_entity"],
      connections: ["my_relationship"],
      events: ["my_event"],
      knowledge: ["my_pattern"]
    }
  }
};
```

### Step 2: Map Ontology

**Always include:**
- **things**: What entities are created?
- **connections**: How do they relate?
- **events**: What actions are logged?
- **knowledge**: What's learned/searched?

### Step 3: Test

```bash
# Test feature individually
agent-director generate-plan --features "my-feature"

# Test with dependencies
agent-director generate-plan --features "my-feature,ai-agents"

# Verify output
cat .onboarding.json
```

---

## Dependency Resolution

**Rules:**
1. Foundation features (landing-page, auth, groups) have no dependencies
2. All other features must depend on at least one foundation feature
3. Circular dependencies are invalid
4. Missing dependencies auto-resolved

**Example:**
```typescript
// User selects: ["ai-agents"]
// Auto-resolves to: ["landing-page", "authentication", "multi-tenant-groups", "ai-agents"]
```

---

## Specialist Agent Mapping

| Specialist | Responsibilities | Inference Ranges |
|-----------|-----------------|------------------|
| agent-frontend | Astro pages, React components, UI/UX | 1-10, 21-30, 71-80 |
| agent-backend | Convex queries/mutations, schemas | 11-20, 41-60, 71-90 |
| agent-builder | Full-stack features (backend + frontend) | 31-40, 61-70 |
| agent-integrator | External APIs, protocols, webhooks | 31-60 |
| agent-designer | Wireframes, design systems, components | 71-80 |
| agent-ops | Deployment, monitoring, performance | 51-60, 81-100 |
| existing | Already implemented, no build needed | 11-20 (auth) |

---

## Execution Plan Structure

```typescript
interface ExecutionPlan {
  version: "1.0.0",
  organizationName: string,
  createdAt: number,
  plan: {
    phases: Phase[],
    totalInferences: number,
    currentInference: number,
    completedInferences: number[],
    estimates: {
      duration: string,  // "60 minutes (~1 hours)"
      cost: string,      // "$0.00"
      inferences: number // 60
    }
  },
  progress: {
    status: "pending" | "in_progress" | "completed",
    startedAt?: number,
    completedAt?: number,
    currentPhase?: string,
    errors?: Error[]
  }
}
```

---

## Progress Tracking

### Update Progress

```typescript
function updateProgress(update: Partial<ProgressUpdate>): void {
  const plan = readOnboardingJson();
  plan.progress = { ...plan.progress, ...update };

  // Calculate percentage
  const pct = (plan.plan.completedInferences.length / plan.plan.totalInferences) * 100;

  writeOnboardingJson(plan);

  // Emit event
  emitEvent({
    type: "progress_updated",
    metadata: { percentage: pct, currentInference: plan.plan.currentInference }
  });
}
```

### Mark Phase Complete

```typescript
function markPhaseComplete(phase: Phase): void {
  updateProgress({
    currentInference: phase.inferences.end,
    completedInferences: range(phase.inferences.start, phase.inferences.end),
    currentPhase: null  // Clear current phase
  });

  emitEvent({
    type: "phase_complete",
    targetId: phase.featureKey,
    metadata: { phaseName: phase.name, duration: "actual time" }
  });
}
```

---

## Event-Driven Coordination

### Events Emitted

| Event | When | Metadata |
|-------|------|----------|
| `plan_generated` | Plan created | totalInferences, estimates |
| `phase_started` | Phase begins | phaseName, inferences, specialist |
| `progress_updated` | Inference completes | percentage, currentInference |
| `phase_complete` | Phase finishes | phaseName, duration, quality |
| `phase_failed` | Phase errors | phaseName, error, attempts |
| `plan_complete` | All done | totalDuration, qualityScore |

### Events Watched

| Event | Action |
|-------|--------|
| `implementation_complete` | Trigger quality check |
| `quality_check_complete` | Mark phase complete or retry |
| `solution_proposed` | Retry failed phase |

---

## Error Handling

### Retry Pattern

```typescript
async function executePhaseWithRetry(phase: Phase): Promise<void> {
  let attempt = 0;

  while (attempt < 3) {
    try {
      await executePhase(phase);
      return; // Success
    } catch (error) {
      attempt++;

      if (attempt >= 3) {
        // Delegate to problem solver
        await emitEvent({ type: "phase_failed", ... });
        await waitForEvent("solution_proposed");
        attempt = 0; // Reset after manual fix
      } else {
        // Exponential backoff
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
}
```

---

## Parallel Execution

### Detection Rules

Phases can run in parallel if:
1. No shared dependencies
2. No overlapping inference ranges
3. Different specialists (optional optimization)

### Example

```typescript
// These can run in parallel:
Phase A: "content-publishing" (Infer 31-40, agent-frontend)
Phase B: "membership-tiers" (Infer 41-50, agent-backend)

// These CANNOT (overlap):
Phase A: "ai-agents" (Infer 61-70)
Phase B: "rag-knowledge" (Infer 71-80, depends on content)
```

---

## Cost Estimation

### Parse Cost String

```typescript
function parseCost(costString: string): number {
  // "$0" → 0
  // "$0.10 - $1.00" → 0.55 (average)
  const matches = costString.match(/\$(\d+\.?\d*)/g);
  if (!matches) return 0;

  const costs = matches.map(m => parseFloat(m.replace('$', '')));
  return costs.reduce((a, b) => a + b, 0) / costs.length;
}
```

---

## Common Patterns

### Read Feature Selections

```typescript
const selections = JSON.parse(fs.readFileSync('.onboarding.json'));
const selectedFeatures = selections.selectedFeatures;
```

### Resolve Dependencies

```typescript
const resolved = new Set<string>();
const queue = [...selectedFeatures];

while (queue.length > 0) {
  const feature = queue.shift()!;
  if (resolved.has(feature)) continue;

  resolved.add(feature);
  queue.push(...ALL_FEATURES[feature].dependencies);
}
```

### Generate Plan

```typescript
const plan = {
  phases: resolved.map(key => ({
    name: ALL_FEATURES[key].name,
    featureKey: key,
    inferences: {
      start: ALL_FEATURES[key].inferences[0],
      end: ALL_FEATURES[key].inferences[1]
    },
    specialist: ALL_FEATURES[key].specialist,
    duration: ALL_FEATURES[key].duration,
    cost: ALL_FEATURES[key].cost,
    status: "pending",
    ontology: ALL_FEATURES[key].ontology
  })),
  totalInferences: calculateTotal(resolved),
  currentInference: 1,
  completedInferences: [],
  estimates: calculateEstimates(resolved)
};
```

---

## Testing Checklist

- [ ] Feature has unique key
- [ ] Inference range doesn't overlap with others
- [ ] Dependencies are valid (exist in library)
- [ ] Ontology mapping is complete (all 6 dimensions)
- [ ] Duration estimate is realistic
- [ ] Cost estimate includes all resources
- [ ] Specialist agent can handle the work
- [ ] Plan generates without errors
- [ ] Execution completes successfully
- [ ] Progress tracking updates correctly

---

## Debugging

### View Current Plan

```bash
cat .onboarding.json | jq '.plan'
```

### Check Progress

```bash
cat .onboarding.json | jq '.progress'
```

### List All Features

```typescript
Object.keys(ALL_FEATURES).forEach(key => {
  const f = ALL_FEATURES[key];
  console.log(`${key}: Infer ${f.inferences[0]}-${f.inferences[1]} (${f.specialist})`);
});
```

### Validate Dependencies

```typescript
Object.entries(ALL_FEATURES).forEach(([key, feature]) => {
  feature.dependencies.forEach(dep => {
    if (!ALL_FEATURES[dep]) {
      console.error(`ERROR: ${key} depends on missing feature: ${dep}`);
    }
  });
});
```

---

## Quick Commands

```bash
# Generate plan from selections
agent-director generate-plan --features "landing-page,ai-agents"

# Execute plan
agent-director execute-plan

# Show progress
agent-director show-progress

# Resume from inference N
agent-director resume --from 50

# Add feature to running plan
agent-director add-feature "semantic-search"

# Mark phase complete
agent-director mark-complete "ai-agents"
```

---

**Need Help?**
- Read: `/.claude/agents/agent-director.md`
- See: `/one/things/plans/agent-director-100-inference-plans.md`
- Example: `/.onboarding-plan.json.example`
