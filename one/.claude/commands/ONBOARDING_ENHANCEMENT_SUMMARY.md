# /one Command Onboarding Enhancement

**Date:** 2025-10-20
**File Modified:** `.claude/commands/one.md`
**Lines Added:** ~350 lines (original 214 → updated 564)

---

## Summary of Changes

Enhanced the `/one` command to support seamless onboarding flow for users coming from `npx oneie init`.

### Key Features Added

1. **Onboarding Detection** - Checks for `.onboarding.json` on every `/one` invocation
2. **State-Based Flow** - Handles 4 states: pending_analysis, building, completed, normal
3. **Agent Coordination** - Invokes agent-onboard and agent-director via Task tool
4. **Progress Tracking** - Shows real-time progress during builds
5. **Resumption Support** - Can resume interrupted onboarding flows
6. **Backward Compatibility** - Normal /one behavior if no onboarding detected

---

## Changes in Detail

### 1. Updated Initialization Checks (Lines 48-99)

**Added Step 1: Onboarding Check**

```bash
find . -maxdepth 2 -name ".onboarding.json" -type f 2>/dev/null | head -1
```

- Searches for `.onboarding.json` in installation folders
- Reads file and checks `status` field
- Routes to appropriate flow based on status:
  - `"pending_analysis"` → Start onboarding flow
  - `"building"` → Show progress summary
  - `"completed"` → Show completion summary + normal menu
  - Other/missing → Normal /one behavior

### 2. Added Onboarding Flow Section (Lines 217-564)

**8 Steps for Complete Onboarding:**

#### Step 1: Display Welcome with Context
- Shows organization name, website URL, and status
- Friendly welcome message with user's name

#### Step 2: Invoke agent-onboard
- Uses Task tool (not direct function calls)
- Delegates website analysis to agent-onboard
- Passes website URL and organization slug

#### Step 3: Wait for Analysis
- Shows "Analyzing..." message
- Blocks until agent-onboard completes

#### Step 4: Present Recommended Features
- Reads updated `.onboarding.json`
- Displays extracted brand identity
- Shows custom ontology dimensions
- Lists recommended features in 3 categories:
  - Foundation (always recommended)
  - Detected from site
  - AI & Automation (optional)

#### Step 5: Accept User Feature Selection
- Parses user input (comma-separated, "all foundation", "all")
- Extracts selected feature IDs

#### Step 6: Invoke agent-director
- Uses Task tool to delegate planning
- Passes selected features and custom ontology path
- agent-director creates 100-inference plan

#### Step 7: Show Plan Summary
- Displays total inferences and estimated duration
- Lists phases with specialist assignments
- Announces build start

#### Step 8: Update Status and Let Specialists Work
- Updates `.onboarding.json` status to "building"
- Trusts agent-director to coordinate specialists:
  - agent-backend (backend features)
  - agent-frontend (UI/UX)
  - agent-integrator (external systems)
  - agent-quality (validation)
  - agent-designer (wireframes)
  - agent-documenter (documentation)

### 3. Added Progress Check (Lines 417-441)

When user runs `/one` during build:
- Shows current progress (X/Y inferences, Z% complete)
- Lists phase status with icons (✅ completed, 🔨 in progress, ⏳ pending)
- Displays completion timestamps and URLs
- Reminds user building continues in background

### 4. Added Completion Summary (Lines 443-483)

When user runs `/one` after completion:
- Congratulates user
- Lists completed features with URLs
- Shows documentation locations
- Suggests next steps (/build, /design, /deploy, /see)
- Then continues to normal /one menu

### 5. Added Critical Rules (Lines 487-497)

**8 Critical Rules for Onboarding:**

1. ALWAYS check for `.onboarding.json` FIRST
2. NEVER skip agent-onboard (website analysis is critical)
3. ALWAYS use Task tool to invoke agents
4. WAIT for agents to complete before proceeding
5. UPDATE `.onboarding.json` after each major step
6. SHOW PROGRESS to user (transparency)
7. ENABLE RESUMPTION (can restart if interrupted)
8. BACKWARD COMPATIBLE (normal /one if no onboarding)

### 6. Added File Update Patterns (Lines 500-563)

Documents how to update `.onboarding.json` at each stage:

- **After agent-onboard:** Add brand, ontology, recommended features
- **After user selection:** Add selected feature IDs
- **After agent-director planning:** Add plan with phases and inferences
- **After completion:** Mark plan as completed with timestamp

---

## Integration Points

### Works With

1. **CLI (`npx oneie init`)** - Creates `.onboarding.json` with user info
2. **agent-onboard** - Analyzes website, extracts brand, generates ontology
3. **agent-director** - Creates 100-inference plan, coordinates specialists
4. **Specialist agents** - Implement features (backend, frontend, integrator, etc.)
5. **Installation folders** - Custom ontology and documentation stored here

### File Dependencies

- **Input:** `.onboarding.json` (created by CLI)
- **Reads:** Installation folder structure, custom ontology
- **Updates:** `.onboarding.json` (status transitions)
- **Creates:** Progress tracking, feature documentation

---

## State Transitions

```
pending_analysis
  ↓ (after agent-onboard completes)
features_presented
  ↓ (after user selects features)
plan_generated
  ↓ (after agent-director creates plan)
building
  ↓ (after all phases complete)
completed
```

---

## User Experience Flow

```
$ npx oneie init
  → Collects name, org, website, email
  → Creates /[org-slug]/ folder
  → Generates .onboarding.json
  → Launches Claude Code

$ /one (in Claude)
  → Detects .onboarding.json (status: pending_analysis)
  → Displays welcome with context
  → Invokes agent-onboard
  → Shows brand extraction results
  → Presents recommended features
  → User selects features
  → Invokes agent-director
  → Shows plan summary
  → Starts build

$ /one (check progress)
  → Detects .onboarding.json (status: building)
  → Shows current progress (X/Y inferences)
  → Lists phase status
  → Building continues

$ /one (after completion)
  → Detects .onboarding.json (status: completed)
  → Shows completion summary
  → Lists live URLs
  → Continues to normal /one menu
```

---

## Backward Compatibility

**No Breaking Changes:**

- If `.onboarding.json` doesn't exist → Normal /one behavior
- All existing functionality preserved
- New onboarding is opt-in (requires CLI to create file)
- Normal menu still accessible after onboarding completes

---

## Testing Checklist

To test this enhancement:

- [ ] Create mock `.onboarding.json` with status "pending_analysis"
- [ ] Run `/one` and verify onboarding flow triggers
- [ ] Verify agent-onboard is invoked via Task tool
- [ ] Check `.onboarding.json` updates after analysis
- [ ] Verify feature selection works (comma-separated input)
- [ ] Verify agent-director is invoked with correct params
- [ ] Test progress check (status: "building")
- [ ] Test completion summary (status: "completed")
- [ ] Test normal /one behavior (no .onboarding.json)
- [ ] Test resumption (interrupt and restart)

---

## Key Benefits

1. **Seamless Handoff** - CLI → Claude coordination is smooth
2. **Personalized** - Website analysis creates custom ontology
3. **Transparent** - User sees progress at every step
4. **Resumable** - Can check status and resume anytime
5. **Automated** - Minimal user input, maximum automation
6. **Backward Compatible** - Doesn't break existing /one usage

---

## Related Files

- **CLI Source:** `cli/src/commands/init.ts` (creates .onboarding.json)
- **Agent Specs:**
  - `.claude/agents/agent-onboard.md` (website analysis)
  - `.claude/agents/agent-director.md` (plan generation)
- **Documentation:**
  - `one/knowledge/cli-claude-handoff.md` (handoff specification)
  - `one/knowledge/installation-folders.md` (folder structure)

---

## Next Steps

1. **Implement CLI side** - `npx oneie init` command
2. **Test onboarding flow** - End-to-end with real website
3. **Enhance agent-onboard** - Website analysis logic
4. **Add feature library** - Predefined features for recommendations
5. **Create analytics** - Track onboarding success rates

---

**Status:** ✅ Implementation Complete

The `/one` command now supports full onboarding flow while maintaining 100% backward compatibility!
