# /mission - Mission Planning & Management with Real-time Status

🎯 **Direct access to strategic mission planning with live progress tracking**

*Alternative to `/one` > 1. Start New Mission for advanced users*

💡 **TIP: Use `/one` for guided experience with full dashboard context**

## 📊 Real-time Status Features

### Progress Indicators
```
🎯 Mission 2 of 5: "AI Marketing System" | 67% Complete
   📖 Stories: 2 of 3 Complete | ✅ 4.2⭐ Average Quality
   ✅ Tasks: 8 of 12 Complete | 🤖 4 agents active
```

### Live Updates
- **Mission Status**: Planning → Active → Review → Complete
- **Story Progress**: Real-time task completion tracking  
- **Agent Activity**: Current assignments and availability
- **Quality Gates**: Live score updates and validation status

When this command is used:

1. **Read User Context**: Parse `one/me/me.md` for user's personal goals and theme
2. **Show Personal Missions**: Display user's active missions from `one/missions/`
3. **Goal Alignment**: Suggest missions that align with user's configured goals
4. **Brand Consistency**: Apply user's theme and voice to mission interface

```yaml
activation:
  - Read user's me.md for goal alignment and theme
  - Scan one/missions/ for existing user missions
  - Display personalized mission management interface
  - Show mission options that align with user's goals

display:
  header: |
    🎯 {{USER_NAME}} Mission Control
    {{USER_TAGLINE}}
    
    📊 Your Goals:
    {{#each USER_GOALS}}
    • {{this}}
    {{/each}}

behavior:
  goal_aligned_suggestions: |
    # Suggest missions based on user's configured goals
    - Analyze user's goals from me.md
    - Recommend mission types that advance those goals
    - Show how each mission contributes to goal achievement
    - Prioritize missions by goal alignment score

  personalized_mission_creation: |
    # Create missions that reflect user's style and objectives
    - Use user's brand voice for mission descriptions
    - Align mission objectives with user's personal goals
    - Reference user's configured spaces and agents
    - Apply user's theme colors to mission documentation

commands:
  - create: Create new mission with real-time status tracking
  - list: Show your active missions with live progress indicators
  - status: Mission progress dashboard with cascade tracking
  - align: Check mission alignment with your goals
  - update: Update mission with automatic status refresh
  - complete: Mark mission as completed with final quality validation
  - archive: Archive completed missions
  - track: Real-time cascade progress monitoring

mission_templates:
  goal_based: |
    # Mission: {{MISSION_NAME}}
    **Goal Alignment**: {{ALIGNED_GOALS}}
    **Your Role**: {{USER_ROLE}}
    **Success Metric**: {{SUCCESS_CRITERIA}}
    **Timeline**: {{TIMELINE}}
    **Agents Assigned**: {{ASSIGNED_AGENTS}}
```

Transform user requests into personalized missions that advance their specific goals using their configured AI agents and spaces.