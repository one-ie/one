# /one - ONE Platform Command Center

🌟 **Welcome to the ONE Platform**

The `/one` command displays the welcome screen and guides you to your next action.

## Quick Start

When user types `/one`, display the ONE Platform welcome screen.

### Step 1: Check Server Status (< 1 second)

Run a quick check:

```bash
lsof -ti:4321 2>/dev/null
```

**Parse output:**
- If output exists: Server is running on port 4321
- If empty: Server is not running

### Step 2: Read Onboarding Data (if exists)

Check for `.onboarding.json` in current directory and parent directories:

```bash
find . -maxdepth 3 -name ".onboarding.json" -type f 2>/dev/null | head -1
```

If found, read to extract:
- `user.name`
- `organization.name`
- `website.url`

### Step 3: Display Welcome Screen ONLY

**WITH onboarding data:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

    ONE Platform v1.0.0
  Transform Ideas into Code

   https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome back, [user.name]!

Organization: [organization.name]
Website: [website.url]
Dev Server: http://localhost:4321 [✓ Running / ⭕ Stopped]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server:
  /server start           - Start development server (if stopped)
  /server stop            - Stop development server
  /server status          - Check server status

Planning:
  /plan convert [idea]    - Create a 100-inference plan for your idea

Examples:
  • /plan convert "Build an ecommerce store for custom clothes"
  • /plan convert "Create a course platform with AI tutors"
  • /plan convert "Add real-time notifications to my app"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**WITHOUT onboarding data:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

    ONE Platform v1.0.0
  Transform Ideas into Code

   https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dev Server: http://localhost:4321 [✓ Running / ⭕ Stopped]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server:
  /server start           - Start development server
  /server stop            - Stop development server
  /server status          - Check server status

Planning:
  /plan convert [idea]    - Create a 100-inference plan for your idea

Examples:
  • /plan convert "Build an ecommerce store for custom clothes"
  • /plan convert "Create a course platform with AI tutors"
  • /plan convert "Add real-time notifications to my app"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Implementation Notes

**DO NOT:**
- Start server automatically
- Launch agent-onboard automatically
- Block waiting for processes
- Jump into planning automatically
- Execute `/plan convert` without user input

**DO:**
- Show current status (server running/stopped)
- Display the welcome screen
- Guide users to their next action (e.g., `/server start` or `/plan convert [idea]`)
- Reference cascade system for orchestration
- Show agent-director as central coordinator
- Highlight 15-specialist availability

**Execution Flow:**
1. Check server status (running/stopped)
2. Read onboarding data if exists
3. Display welcome screen (with or without onboarding data)
4. Show available next commands
5. Wait for user input (DO NOT auto-execute anything)

**Key Integration Points:**
- `/plan convert` merges CASCADE planning into plan command
- Agent assignments are automatic based on inference type
- Dependencies are calculated and shown
- Quality loop is visualized in task breakdown
