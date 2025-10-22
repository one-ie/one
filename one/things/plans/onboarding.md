# ONE Platform Onboarding Plan

**Version:** 1.0.0
**Status:** Planning Complete - Ready for Implementation
**Type:** thing (plan)
**Purpose:** Complete specification for `npx oneie init` → Live Platform workflow
**Timeline:** Inference-based (not time-based)
**Goal:** From zero to deployed platform in 50-75 minutes

---

## Executive Summary

This plan defines the **complete onboarding experience** for ONE Platform, where a user:

1. Runs `npx oneie init` (1 minute)
2. Provides basic info (name, org, website, email)
3. CLI analyzes their website with AI (30 seconds)
4. User selects features to build (2 minutes)
5. Claude Code builds and deploys iteratively (45-70 minutes)
6. **Result:** Fully functional, personalized platform on custom domain

**Key Innovation:** The platform is **personalized** by analyzing the user's existing website - extracting their brand colors, logo, fonts, and generating a custom 6-dimension ontology that matches their business model.

---

*For full details including all phases, implementation roadmap, and success metrics, see:*
- `/one/connections/workflow-onboarding.md` - Complete workflow specification
- `/one/knowledge/cli-claude-handoff.md` - CLI ↔ Claude coordination
- `/.claude/agents/agent-onboard.md` - Website analyzer agent

**This plan is now ready for implementation!** 🚀
