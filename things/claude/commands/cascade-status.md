# /cascade-status - Real-time Cascade Progress Tracking

Check the status of your Mission→Story→Task→Agent workflows with clear progress indicators and quality tracking.

## Usage

```
/cascade-status [mission-id]
```

## Features

### 📊 Progress Indicators
- **Mission Progress**: "Mission 2 of 5 Complete"
- **Story Progress**: "Story 3 of 8 In Progress" 
- **Task Progress**: "Task 5 of 12 Pending"
- **Agent Status**: "🤖 Engineering Agent: Active"

### ⭐ Quality Score Tracking
- **Mission Quality**: "✅ Mission 1: Complete (4.5⭐)"
- **Story Quality**: "🔄 Story 2: In Review (3.8⭐)"
- **Task Quality**: "⏳ Task 3: Pending Review"
- **Agent Quality**: "✅ Agent Output: Validated (4.2⭐)"

### 🔄 Real-time Status Updates
- **Active Workflows**: Shows currently running cascades
- **Queue Status**: Pending tasks and agent assignments
- **Completion Timeline**: Estimated completion times
- **Bottleneck Detection**: Identifies workflow delays

## Example Output

```
📊 CASCADE STATUS DASHBOARD
==========================

🎯 Mission: "Build AI-Powered Marketing System" (Mission 2 of 3)
   Status: 🔄 IN PROGRESS | Quality: 4.1⭐ | 67% Complete
   
   📖 Stories Progress:
   ✅ Story 1: "Marketing Agent Design" (4.5⭐) Complete
   🔄 Story 2: "Content Generation System" (3.8⭐) In Progress  
   ⏳ Story 3: "Analytics Dashboard" Pending
   
   ✅ Tasks Progress (5 of 8 Complete):
   ✅ Task 1: Agent Architecture → 🤖 Engineering Architect (4.2⭐)
   ✅ Task 2: UI Components → 🤖 UI Designer (4.4⭐)
   🔄 Task 3: Content Templates → 🤖 Content Creator (Loading...)
   ⏳ Task 4: Database Schema → 🤖 Data Architect (Queued)
   ⏳ Task 5: Testing Suite → 🤖 QA Engineer (Queued)
   
   🤖 Agent Status:
   🟢 Engineering Architect: Ready
   🟢 UI Designer: Ready  
   🟡 Content Creator: Working (ETA: 2 min)
   🔴 Data Architect: Waiting for Task 3
   🔴 QA Engineer: Waiting for Task 4

📈 Overall Progress: 67% Complete | ETA: 8 minutes
🎯 Next Action: Review Task 3 output for quality gate approval
```

## Status Indicators

### Mission Status
- 🎯 **PLANNING** - Mission being defined
- 🔄 **IN PROGRESS** - Stories actively being executed  
- ⏳ **PENDING** - Waiting for dependencies
- ✅ **COMPLETE** - All stories finished and validated
- ❌ **BLOCKED** - Issues preventing progress

### Story Status
- 📝 **DRAFT** - Story being written
- 🔄 **IN PROGRESS** - Tasks being executed
- 👀 **REVIEW** - Quality validation in progress
- ✅ **COMPLETE** - All tasks finished (4.0⭐+)
- ❌ **FAILED** - Quality gate not met

### Task Status
- ⏳ **QUEUED** - Waiting for agent assignment
- 🔄 **ACTIVE** - Agent currently working
- 👀 **REVIEW** - Output being validated
- ✅ **COMPLETE** - Delivered and approved
- ❌ **FAILED** - Requires rework

### Agent Status
- 🟢 **READY** - Available for new tasks
- 🟡 **WORKING** - Currently executing task
- 🔴 **BUSY** - Handling multiple tasks
- ⚪ **OFFLINE** - Temporarily unavailable

## Quality Gates Integration

The status command shows real-time quality scores:

- **🟢 4.0+ Stars**: Approved, proceed to next level
- **🟡 3.5-3.9 Stars**: Review required, potential approval
- **🔴 Below 3.5 Stars**: Blocked, rework needed
- **⚪ Not Rated**: Pending quality evaluation

## Workflow Commands

```bash
# Check all active cascades
/cascade-status

# Check specific mission
/cascade-status mission-3

# Show detailed agent status
/cascade-status --agents

# Show quality gate details
/cascade-status --quality

# Watch mode (auto-refresh)
/cascade-status --watch
```

## Integration Points

- **Mission Command**: Auto-shows status after mission updates
- **Story Command**: Displays story progress in context
- **Task Command**: Shows task queue and agent assignments
- **Quality Check**: Integrates with quality-check command
- **Agent Commands**: Shows agent workload and availability

This command reduces the 45% uncertainty users experience by providing clear, real-time visibility into cascade progress and quality validation.