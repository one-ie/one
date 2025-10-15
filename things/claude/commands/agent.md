# /agent - Direct Agent Access with Real-time Status

🤖 **Quick access to AI specialists with live activity tracking**

*Alternative to `/one` > 4. Get Agent Help for direct agent connection*

## 📊 Real-time Agent Status

### Agent Activity Dashboard
```
🤖 Agent Status Overview:
🟢 Engineering Architect: Ready | Available for new tasks
🟡 Content Creator: Working | "Blog Posts" (ETA: 5 min)  
🔴 UI Designer: Busy | 3 tasks queued
⚪ Data Analyst: Offline | Maintenance mode
```

### Live Coordination
- **Availability Tracking**: Real-time agent status and workload
- **Task Assignments**: Current tasks and completion estimates
- **Performance Metrics**: Quality scores and success rates
- **Queue Management**: Task prioritization and scheduling

When this command is used:

1. **Read User Agents**: Parse `one/me/me.md` for user's configured Top 8 agents
2. **Show Agent Roster**: Display user's personalized agents with custom names and roles
3. **Direct Access**: Enable immediate connection to user's favorite agents
4. **Customization Options**: Allow user to modify agent configurations

```yaml
activation:
  - Display: "💡 TIP: Use /one for complete agent directory (112+ specialists)"
  - Show user's personalized Top 8 agents
  - Enable direct agent connection
  - Provide path to browse full agent directory

display:
  agent_roster: |
    🤖 {{USER_NAME}}'s AI Agent Team
    
    Your Top 8 Agents:
    {{#each TOP_AGENTS}}
    [{{slot}}] {{name}} - {{role}}
         Personality: {{personality}}
         Catchphrase: "{{catchphrase}}"
         Status: {{status}}
    {{/each}}
    
    Available Commands:
    [1-8] Connect to agent by slot
    [list] Show all agents
    [customize] Edit agent configuration
    [add] Add new agent to roster
    [swap] Change agent positions

behavior:
  direct_agent_access: |
    # Connect to user's configured agents
    - Launch agent with user's custom name and personality
    - Apply agent's configured catchphrase and behavior
    - Reference user's goals and mission context
    - Maintain agent's assigned role and specialization

  agent_customization: |
    # Allow users to personalize their agents
    - Edit agent names, roles, and personalities
    - Modify agent catchphrases and behavior patterns
    - Assign agents to specific missions or tasks
    - Save customizations back to me.md configuration

  roster_management: |
    # Manage the Top 8 agent slots
    - Add/remove agents from roster
    - Reorder agents by preference/usage
    - Import agents from the 43+ agent library
    - Create custom agent configurations

commands:
  - connect [slot]: Connect to agent by slot number (1-8)
  - list: Show all available agents
  - roster: Display your Top 8 roster
  - customize [slot]: Edit agent configuration
  - add: Add agent to your roster
  - remove [slot]: Remove agent from roster
  - swap [slot1] [slot2]: Swap agent positions
  - import: Import from agent library
  - export: Export your agent configurations

agent_templates:
  custom_agent: |
    slot: {{SLOT_NUMBER}}
    name: "{{AGENT_NAME}}"
    base: "{{BASE_SPECIALIZATION}}"
    role: "{{CUSTOM_ROLE}}"
    personality: "{{PERSONALITY_DESCRIPTION}}"
    catchphrase: "{{AGENT_CATCHPHRASE}}"
    specializations:
      - {{SKILL_1}}
      - {{SKILL_2}}
    mission_alignment: {{USER_GOALS}}
```

Connect directly to your personalized AI agents or customize your agent roster to match your unique needs and working style.