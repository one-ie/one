# /story - Story Creation & Management with Real-time Status

📖 **Direct access to story workflows with live progress tracking**

*Alternative to `/one` > 2. Continue Story for quick story access*

## 📊 Real-time Story Status

### Progress Tracking
```
📖 Story 2 of 4: "Content Generation System" | 75% Complete
   ✅ Tasks: 6 of 8 Complete | 🤖 2 agents working | ⭐ 4.1⭐ Quality
   🔄 Current: UI Components → 🤖 UI Designer (ETA: 10 min)
```

### Live Status Updates
- **Story Progress**: Task completion and quality tracking
- **Agent Coordination**: Real-time agent assignments and status
- **Quality Validation**: Live quality scores and gate status  
- **Mission Integration**: How story contributes to mission progress

When this command is used:

1. **Read User Context**: Parse `one/me/me.md` for narrative voice and style preferences
2. **Show Personal Stories**: Display user's stories from `one/stories/`
3. **Mission Integration**: Connect stories to user's active missions
4. **Voice Consistency**: Apply user's brand voice to story creation

```yaml
activation:
  - Read user's me.md for voice, style, and mission context
  - Scan one/stories/ for existing user stories
  - Show personalized story creation interface
  - Reference user's active missions for story context

display:
  header: |
    📖 {{USER_NAME}} Story Studio
    Voice: {{USER_VOICE}} | Theme: {{USER_THEME}}
    
    🎯 Active Missions:
    {{#each ACTIVE_MISSIONS}}
    • {{title}} - {{progress}}% complete
    {{/each}}

behavior:
  voice_consistency: |
    # Apply user's configured brand voice
    - Use user's voice setting from me.md (professional, creative, etc.)
    - Maintain narrative consistency with user's personality
    - Reference user's story and values from configuration
    - Adapt tone to user's preferred communication style

  mission_integration: |
    # Connect stories to user's missions
    - Show how each story advances mission objectives
    - Reference user's assigned agents for story execution
    - Align story outcomes with user's personal goals
    - Track story completion within mission context

commands:
  - create: Create new story within your missions
  - list: Show your story library
  - continue: Continue an existing story
  - connect: Connect story to mission
  - voice: Adjust story voice/tone
  - agents: Assign your agents to story execution
  - publish: Share story in your space

story_templates:
  personal_narrative: |
    # Story: {{STORY_TITLE}}
    **Mission Context**: {{PARENT_MISSION}}
    **Your Voice**: {{USER_VOICE_SETTING}}
    **Key Characters**: {{USER_AGENTS}}
    **Setting**: {{USER_SPACE}}
    **Goal Alignment**: {{STORY_GOALS}}
    
    ## Your Story
    {{STORY_CONTENT}}
```

Transform user ideas into compelling narratives that advance their missions using their personal brand voice and configured AI agents.