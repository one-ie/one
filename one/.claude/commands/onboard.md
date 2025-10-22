# /onboard - Analyze Website & Extract Brand Identity

## Instructions for Claude

When user types `/onboard`, analyze their website and extract brand identity for ONE Platform customization.

### Step 1: Get Website URL

If `.onboarding.json` exists, read it for `website.url`.

Otherwise, ask user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Website Analysis & Onboarding
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please provide your website URL:

Example: https://example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 2: Launch agent-onboard (Background)

**IMPORTANT:** Use Task tool with `subagent_type=agent-onboard` in BACKGROUND mode.

```
Analyze website [website.url] for ONE Platform onboarding:

1. Extract brand identity:
   - Colors (primary, secondary, accent)
   - Typography (fonts, sizes, weights)
   - Logo and imagery
   - Brand voice and tone

2. Detect existing features:
   - Content types (blog, products, services)
   - Navigation structure
   - Key pages and sections
   - Interactive elements

3. Map to 6-dimension ontology:
   - Things: What entities exist? (products, posts, users)
   - Connections: What relationships? (owns, authored, purchased)
   - Events: What actions? (created, updated, viewed)
   - Knowledge: What content? (blog posts, docs, FAQs)

4. Create installation documentation:
   - Save to: /[org-slug]/knowledge/brand-guide.md
   - Save to: /[org-slug]/knowledge/features.md
   - Save to: /[org-slug]/knowledge/ontology-mapping.md

5. Recommend ONE Platform features:
   - Based on detected patterns
   - Aligned with 6-dimension ontology
   - Prioritized by impact

6. Update .onboarding.json with results

Website URL: [website.url]
Organization: [organization.name]
```

### Step 3: Show Progress to User

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Analyzing your website...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Website: [website.url]

I'm extracting:
✓ Brand colors, fonts, and style
✓ Existing features and content
✓ Ontology mapping (Things, Connections, Events)
✓ Feature recommendations

This takes ~2 minutes. Continue working while it runs!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ While you wait...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Try these commands:
• /server - Manage dev server (start/stop/restart)
• /build - Start building features
• /see - View your platform

I'll notify you when analysis is complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Monitor agent-onboard

Use `AgentOutputTool` to periodically check progress (every 30 seconds).

When complete, show results:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Website Analysis Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brand Identity Extracted:
• Colors: [primary], [secondary], [accent]
• Fonts: [font-family]
• Voice: [brand-tone]

Features Detected:
• [feature-1]
• [feature-2]
• [feature-3]

Ontology Mapping:
• Things: [entity-types]
• Connections: [relationship-types]
• Events: [action-types]

Documentation Created:
✓ /[org-slug]/knowledge/brand-guide.md
✓ /[org-slug]/knowledge/features.md
✓ /[org-slug]/knowledge/ontology-mapping.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Customize homepage:
   "Update the hero section with our brand colors"

2. Build new features:
   /build [feature-name]

3. Deploy to production:
   /deploy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Key Principles

1. **BACKGROUND** - Don't block user, run agent-onboard async
2. **THOROUGH** - Extract complete brand identity and features
3. **MAPPED** - Always map to 6-dimension ontology
4. **DOCUMENTED** - Save everything to installation folder
5. **ACTIONABLE** - Provide clear next steps

---

## Error Handling

If website URL is invalid or unreachable:

```
❌ Could not access website: [website.url]

Please check:
• URL is publicly accessible
• No authentication required
• Website is online

Try again with: /onboard
```

If agent-onboard fails:

```
❌ Website analysis failed

Please try:
1. /onboard - Retry analysis
2. Manual setup in /[org-slug]/knowledge/

Need help? Ask me questions!
```
