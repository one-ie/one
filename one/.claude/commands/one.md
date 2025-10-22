# /one - ONE Platform Quick Start

## Instructions for Claude

When user types `/one`, follow this fast flow:

### Step 1: Quick Initialization (< 2 seconds)

Run these checks IN PARALLEL (single bash command):

```bash
find . -maxdepth 2 -name ".onboarding.json" -type f 2>/dev/null | head -1 && \
lsof -ti:4321 2>/dev/null && \
[ -d web ] && echo "web_exists"
```

**Parse the output:**
- Line 1: Path to .onboarding.json (if exists)
- Line 2: Process ID if server running (if exists)
- Line 3: "web_exists" if web directory found

### Step 2: Read Onboarding Data

If `.onboarding.json` found, read it to extract:
- `user.name`
- `organization.name`
- `website.url`

### Step 3: Start Web Server (if not running)

If server NOT running AND web directory exists:

```bash
cd web && bun run dev > /dev/null 2>&1 &
```

**Show to user:**
```
🚀 Starting dev server...
✓ Server running at http://localhost:4321
```

### Step 4: Display Welcome (< 3 seconds total)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome, [user.name]!

Organization: [organization.name]
Website: [website.url]
Dev Server: http://localhost:4321

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI is analyzing your website...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

agent-onboard is running in the background to:
• Extract your brand (colors, fonts, voice)
• Detect existing features
• Recommend new features

This takes ~2 minutes. Continue working while it runs!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Try this now!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Edit your homepage:

  "Change the hero heading on the homepage to say
   'Welcome to [organization.name]' and update the
   subtext to match our brand"

I'll update web/src/pages/index.astro with your brand!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5: Launch agent-onboard (Background)

**IMPORTANT:** Launch agent-onboard using Task tool in the BACKGROUND. DO NOT WAIT for it to complete.

```
Analyze website [website.url] for onboarding:

1. Extract brand identity (colors, logo, fonts, tone)
2. Detect existing features and content types
3. Map detected features to 6-dimension ontology
4. Create installation-specific branding documentation
5. Recommend features based on analysis

Save results to:
- /[org-slug]/knowledge/brand-guide.md
- /[org-slug]/knowledge/features.md
- /[org-slug]/knowledge/ontology-mapping.md

Update .onboarding.json with results.
```

### Step 6: Wait for User Input

User will either:
1. Give you a command to edit their homepage
2. Wait for onboarding to complete
3. Ask questions

**Be ready to help immediately!**

---

## Fallback (No Onboarding Data)

If no `.onboarding.json` found, show:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dev Server: http://localhost:4321

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

## Key Principles

1. **FAST** - Show UI in < 3 seconds
2. **BACKGROUND** - Don't make user wait for analysis
3. **ACTIONABLE** - Give immediate example they can try
4. **FRIENDLY** - Use their name and org name
5. **SIMPLE** - No menus, just get started
