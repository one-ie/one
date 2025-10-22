# /one - ONE Platform Quick Start

## Instructions for Claude

When user types `/one`, display the ONE Platform welcome screen and provide quick access to all commands.

### Step 1: Check Status (< 1 second)

Run quick parallel checks:

```bash
find . -maxdepth 2 -name ".onboarding.json" -type f 2>/dev/null | head -1 && \
lsof -ti:4321 2>/dev/null
```

**Parse output:**
- Line 1: Path to `.onboarding.json` (if exists)
- Line 2: Server PID (if running)

### Step 2: Read Onboarding Data (if exists)

If `.onboarding.json` found, read to extract:
- `user.name`
- `organization.name`
- `website.url`

### Step 3: Display Welcome Screen

**WITH onboarding data:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

   https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome back, [user.name]!

Organization: [organization.name]
Website: [website.url]
Dev Server: http://localhost:4321 [✓ Running / ⭕ Stopped]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Quick Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server Management:
• /server         - Check server status
• /server start   - Start development server
• /server stop    - Stop development server
• /server restart - Restart development server

Onboarding & Setup:
• /onboard        - Analyze website & extract brand

Feature Development:
• /build          - Build features with AI specialists
• /design         - Create wireframes & UI components
• /deploy         - Deploy to production

Workflow Management:
• /now            - View current task
• /next           - Advance to next inference
• /todo           - View complete task list
• /done           - Mark task complete

Analytics & Insights:
• /see            - View analytics & explore courses

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Quick Start
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Start server: /server start
2. Analyze website: /onboard
3. Build features: /build [feature-name]
4. Deploy: /deploy

Or just tell me what you want to build!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**WITHOUT onboarding data:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

   https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dev Server: http://localhost:4321 [✓ Running / ⭕ Stopped]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Essential Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Get Started:
• /server start   - Start development server
• /onboard        - Analyze your website & extract brand

Build & Deploy:
• /build          - Build features with AI specialists
• /deploy         - Deploy to production

Need Help?
• /server         - Full server management commands
• /now            - View current workflow state
• /see            - Explore platform capabilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ What would you like to build?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Examples:
• "Build a landing page for my product"
• "Create a blog with content management"
• "Add user authentication"
• "Set up payment processing"

Just tell me what you want!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Command Reference

### Server Commands

Use `/server` for all development server management:
- `/server` - Check if server is running
- `/server start` - Start server in background
- `/server stop` - Stop running server
- `/server restart` - Restart server

See `.claude/commands/server.md` for implementation details.

### Onboarding Commands

Use `/onboard` to analyze websites and extract brand identity:
- Analyzes website structure and content
- Extracts brand colors, fonts, and voice
- Maps features to 6-dimension ontology
- Creates installation-specific documentation

See `.claude/commands/onboard.md` for implementation details.

### Workflow Commands

Use workflow commands for inference-based development:
- `/now` - Display current inference and progress
- `/next` - Advance to next inference
- `/todo` - View complete 100-inference sequence
- `/done` - Mark current inference complete

See `one/knowledge/todo.md` for the 100-inference template.

---

## Key Principles

1. **FAST** - Show welcome screen instantly (< 1 second)
2. **CLEAR** - Display server status and available commands
3. **MODULAR** - Each feature has dedicated command
4. **ACTIONABLE** - Provide specific next steps
5. **HELPFUL** - Guide users to right command for their needs

---

## Implementation Notes

**DO NOT:**
- Start server automatically (let user control with `/server start`)
- Launch agent-onboard automatically (let user run `/onboard`)
- Block waiting for background processes

**DO:**
- Display current status (server running/stopped, onboarding complete/pending)
- Show relevant commands based on context
- Guide users to specific commands for detailed operations
- Keep welcome screen fast and lightweight
