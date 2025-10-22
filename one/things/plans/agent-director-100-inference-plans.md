# Agent Director: 100-Inference Plan Generation

**Version:** 2.0.0
**Status:** Specification Complete
**Type:** Enhancement to agent-director
**Purpose:** Generate executable 100-inference plans from feature selections

---

## Overview

The agent-director has been enhanced to generate complete 100-inference plans from user feature selections. This transforms the onboarding experience from manual planning to automated, intelligent plan generation with real-time execution tracking.

**Key Innovation:** Plans are inference-based (not time-based), enabling precise execution, transparent progress tracking, and intelligent coordination across specialist agents.

---

## Core Capabilities

### 1. Feature Library (20+ Features)

Complete library mapping every feature to specific inference ranges:

| Feature | Inferences | Specialist | Duration | Cost |
|---------|-----------|-----------|----------|------|
| **Foundation** ||||
| landing-page | 1-10 | agent-frontend | ~5 min | $0 |
| authentication | 11-20 | existing | ~0 min | $0 |
| multi-tenant-groups | 21-30 | agent-backend | ~10 min | $0 |
| **Creator Features** ||||
| content-publishing | 31-40 | agent-frontend | ~15 min | $0 |
| membership-tiers | 41-50 | agent-backend | ~15 min | $0 |
| revenue-tracking | 51-60 | agent-backend | ~10 min | $0 |
| **Developer Features** ||||
| project-management | 31-40 | agent-builder | ~15 min | $0 |
| code-repositories | 41-50 | agent-integrator | ~15 min | $0 |
| deployment-pipeline | 51-60 | agent-ops | ~20 min | $0 |
| **AI Features** ||||
| ai-agents | 61-70 | agent-builder | ~20 min | $0 |
| rag-knowledge | 71-80 | agent-backend | ~15 min | $0.10-$1.00 |
| semantic-search | 81-90 | agent-backend | ~10 min | $0 |
| **Integration Features** ||||
| stripe-payments | 31-40 | agent-integrator | ~15 min | $0 |
| email-marketing | 41-50 | agent-integrator | ~10 min | $0 |
| discord-community | 51-60 | agent-integrator | ~15 min | $0 |
| **Design Features** ||||
| design-system | 71-80 | agent-designer | ~15 min | $0 |
| wireframes | 71-75 | agent-designer | ~10 min | $0 |
| **Performance Features** ||||
| performance-monitoring | 81-90 | agent-ops | ~10 min | $0 |
| analytics-dashboard | 81-90 | agent-frontend | ~15 min | $0 |

Each feature includes complete ontology mapping (things, connections, events, knowledge).

### 2. Plan Generation Algorithm

**6-Step Process:**

1. **Read Feature Selections** - From `.onboarding.json` or user input
2. **Resolve Dependencies** - Automatically include required features
3. **Map to Inference Ranges** - Assign phases with specialist agents
4. **Calculate Estimates** - Total duration, cost, inference count
5. **Generate Execution Plan** - Complete ExecutionPlan structure
6. **Write to Files** - Save JSON plan + markdown summary

### 3. Execution Coordination

**Event-Driven Workflow:**

1. Emit `phase_started` event
2. Delegate to specialist agent
3. Monitor progress via events
4. Update `.onboarding.json` progress
5. Emit `phase_complete` event

**Progress Tracking:**
- Real-time updates to `.onboarding.json`
- Completion percentage calculation
- Current inference tracking
- Phase status tracking (pending → in_progress → completed)

**Error Handling:**
- Retry with exponential backoff (max 3 attempts)
- Delegate to problem-solver on final failure
- Error logging to `.onboarding.json`

### 4. Data Structures

**ExecutionPlan:**
```typescript
interface ExecutionPlan {
  version: string;
  organizationName: string;
  createdAt: number;
  plan: {
    phases: Phase[];
    totalInferences: number;
    currentInference: number;
    completedInferences: number[];
    estimates: {
      duration: string;
      cost: string;
      inferences: number;
    };
  };
  progress: {
    status: "pending" | "in_progress" | "completed";
    startedAt?: number;
    completedAt?: number;
    currentPhase?: string;
  };
}
```

**Phase:**
```typescript
interface Phase {
  name: string;
  featureKey: string;
  inferences: { start: number; end: number };
  specialist: string;
  duration: string;
  cost: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  ontology: {
    things?: string[];
    connections?: string[];
    events?: string[];
    knowledge?: string[];
  };
}
```

---

## Example Usage

### Input: User Selects 5 Features

```json
{
  "selectedFeatures": [
    "landing-page",
    "authentication",
    "multi-tenant-groups",
    "project-management",
    "ai-agents"
  ],
  "organizationName": "Acme Corp",
  "websiteUrl": "https://acme.com"
}
```

### Output: 60-Inference Plan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 BUILDING Acme Corp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Progress: 0.0% (0/60 inferences)

Current Phase: Starting...
Current Inference: 1

Phases:
  ⏳ Landing Page (Infer 1-10)
     agent-frontend • ~5 min
  ⏳ Authentication (Infer 11-20)
     existing • ~0 min
  ⏳ Multi-Tenant Groups (Infer 21-30)
     agent-backend • ~10 min
  ⏳ Project Management (Infer 31-40)
     agent-builder • ~15 min
  ⏳ AI Agents (Infer 61-70)
     agent-builder • ~20 min
  ⏳ Deployment & Documentation (Infer 91-100)
     agent-ops • ~10 min

Estimates:
  Duration: 60 minutes (~1 hours)
  Cost: $0.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Execution Flow

1. **Phase 1: Landing Page** (Infer 1-10)
   - agent-frontend creates Astro page
   - Brand colors from website analysis
   - Deploy to Cloudflare Pages
   - **Result:** Live landing page in ~5 min

2. **Phase 2: Authentication** (Infer 11-20)
   - Already implemented (skip)
   - **Result:** Ready immediately

3. **Phase 3: Multi-Tenant Groups** (Infer 21-30)
   - agent-backend updates schema
   - Creates group mutations/queries
   - **Result:** Hierarchical groups working

4. **Phase 4: Project Management** (Infer 31-40)
   - agent-builder implements full-stack
   - Backend + Frontend + Tests
   - **Result:** Projects, tasks, milestones live

5. **Phase 5: AI Agents** (Infer 61-70)
   - agent-builder creates agent framework
   - 9 specialist agents configured
   - **Result:** AI coordination working

6. **Phase 6: Deployment** (Infer 91-100)
   - agent-ops deploys to production
   - agent-documenter writes docs
   - **Result:** Complete platform live

---

## Benefits

### 1. Transparent Planning
- Users see exactly what will be built
- Clear inference count (e.g., 60/100)
- Accurate time and cost estimates

### 2. Incremental Value
- Each phase deploys immediately
- User sees progress in real-time
- Can stop/resume at any inference

### 3. Intelligent Dependencies
- Automatic dependency resolution
- No breaking changes from missing features
- Optimized execution order

### 4. Multi-Agent Coordination
- Event-driven workflow (no manual handoffs)
- Parallel execution where possible
- Automatic error recovery

### 5. Complete Tracking
- `.onboarding.json` contains full history
- Markdown summary for human readability
- Progress events for real-time monitoring

---

## Integration with Onboarding Workflow

```
1. CLI runs npx oneie init
   ↓
2. User provides org name, website URL
   ↓
3. agent-onboard analyzes website
   ↓
4. Custom ontology generated
   ↓
5. User selects features from menu
   ↓
6. agent-director generates plan
   ↓
7. Execution begins (Phase 1)
   ↓
8. Real-time progress shown
   ↓
9. Each phase deploys live
   ↓
10. Final result: Complete platform
```

---

## Files

### Modified
- `/.claude/agents/agent-director.md` - Enhanced specification

### Created
- `/one/events/agent-director-enhancement-summary.md` - Detailed summary
- `/one/things/plans/agent-director-100-inference-plans.md` - This document
- `/.onboarding-plan.json.example` - Example plan structure

---

## Implementation Checklist

### Phase 1: Core Algorithm
- [ ] Implement feature library (20+ features)
- [ ] Implement dependency resolution
- [ ] Implement inference mapping
- [ ] Implement estimate calculation
- [ ] Test with various feature combinations

### Phase 2: Execution Coordination
- [ ] Implement phase execution pattern
- [ ] Implement progress tracking
- [ ] Implement parallel execution detection
- [ ] Implement error handling & retry
- [ ] Test sequential and parallel execution

### Phase 3: CLI Integration
- [ ] Add feature selection menu
- [ ] Display real-time progress
- [ ] Handle user interruption
- [ ] Stream events to terminal
- [ ] Send notifications

### Phase 4: Testing & Validation
- [ ] Test all 20+ features individually
- [ ] Test various combinations
- [ ] Verify estimates accuracy
- [ ] Test error recovery
- [ ] Performance optimization

### Phase 5: Documentation
- [ ] User guide for feature selection
- [ ] Developer guide for adding features
- [ ] API documentation
- [ ] Examples and tutorials

---

## Success Metrics

The enhancement is successful if:

- [ ] Feature library contains 20+ features with complete metadata
- [ ] Plan generation resolves dependencies correctly
- [ ] Estimates are accurate (±10% margin of error)
- [ ] Execution coordinator handles all phases sequentially
- [ ] Progress tracking updates `.onboarding.json` in real-time
- [ ] Parallel execution works for independent phases
- [ ] Error recovery retries failed phases correctly
- [ ] Real-time display shows current status

---

## Future Enhancements

### 1. Custom Features
Allow users to define custom features:
```json
{
  "name": "Custom CRM",
  "inferences": [31, 50],
  "specialist": "agent-builder",
  "ontology": {
    "things": ["customer", "deal", "contact"],
    "connections": ["assigned_to", "related_to"],
    "events": ["deal_closed", "customer_added"]
  }
}
```

### 2. Feature Marketplace
Share features across organizations:
- Public feature library
- Community-contributed features
- Verified specialist implementations

### 3. A/B Testing
Test different feature combinations:
- Track completion rates
- Measure user satisfaction
- Optimize default selections

### 4. Cost Optimization
Minimize inference costs:
- Batch similar operations
- Reuse computations
- Cache common patterns

### 5. Predictive Planning
AI-generated feature recommendations:
- Analyze website to suggest features
- Predict success likelihood
- Estimate ROI per feature

---

## Conclusion

The agent-director's 100-inference plan generation capability transforms the ONE Platform onboarding experience from manual planning to intelligent, automated execution. Users select features, the director generates a complete plan, and specialist agents coordinate to build and deploy everything automatically.

**Key Benefits:**
- Transparent (users see exactly what's being built)
- Incremental (each phase deploys immediately)
- Intelligent (automatic dependency resolution)
- Coordinated (multi-agent event-driven workflow)
- Trackable (complete history in `.onboarding.json`)

**Ready to generate 100-inference plans from feature selections!** 🚀

---

**Next Steps:**
1. Implement core algorithm (6 steps)
2. Test plan generation with feature library
3. Integrate with CLI (`npx oneie init`)
4. Add real-time progress display
5. Deploy to production

---

**Version History:**
- v2.0.0 (2025-10-20) - 100-inference plan generation added
- v1.0.0 (2025-09-15) - Initial agent-director specification
