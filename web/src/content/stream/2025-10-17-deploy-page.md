---
title: "Deploy Page: 60-Second Edge Deployment Guide"
date: 2025-01-16
description: "Comprehensive deployment page showing Cloudflare Edge deployment, pricing comparison, and agent-ops automation"
type: "feature_added"
tags: ["deployment", "cloudflare", "documentation", "performance"]
repo: "web"
path: "web/src/pages/deploy.astro"
author: "Claude"
featured: true
---

Created a comprehensive deployment page at `/deploy` showcasing how quickly users can deploy to Cloudflare's global edge network.

## What Was Built

### 60-Second Deployment Timeline
Visual breakdown showing:
- 10s: Build app (Astro optimizes code)
- 15s: Upload assets (Wrangler pushes to edge)
- 20s: Global replication (330+ locations)
- 15s: DNS propagation (custom domain resolves)

### Architecture Explanation
- **Edge-Native**: Astro + React 19 SSR on Cloudflare Workers
- **Nanostores**: 334-byte state management (96% smaller than Redux)
- **Backend Agnostic**: Works with Convex, Supabase, Firebase, any API

### Pricing Comparison
Side-by-side cards showing:
- **Cloudflare Pages** (Free forever): Unlimited bandwidth, static requests, 500 builds/month
- **Cloudflare Workers** ($5/month if needed): 10M requests, KV, Durable Objects

Key insight: By using Astro Islands Architecture (shipping ~30KB JS instead of 800KB), we stay on the free tier forever.

### Agent-Ops Integration
4-step autonomous deployment process:
1. Add Cloudflare Global API Key
2. Agent monitors git repository
3. Auto-deploy on push to main
4. Real-time Slack/Discord notifications

### Performance Stats
Highlighted metrics:
- ~30KB JavaScript (96% reduction)
- <330ms average page load
- 100/100 Lighthouse scores
- 330+ global edge locations

### Cloudflare MCP Servers
Explained Model Context Protocol integration:
- 13 public MCP servers available
- Remote deployment to Workers
- MCP Server Portals with Zero Trust
- Use cases: autonomous deployments, IaC, monitoring

### Wrangler Pre-Configuration
Showed pre-configured setup:
- `wrangler.toml` example
- `package.json` deploy scripts
- One-command deployment

## Why This Matters

The page clarifies we **deploy TO Cloudflare** (not being Cloudflare) and explains how our stripped-down architecture keeps deployment costs at $0 while maintaining enterprise-grade speed.

## Links to Performance Posts
- [Why Speed Matters](/blog/why-speed-matters) - Subsecond loads, 100% Lighthouse
- [100% Lighthouse Score](/blog/one-hundred-percent-lighthouse-score) - How we achieve perfection

## Result

Users can now understand:
1. How fast they can deploy (60 seconds)
2. What it costs (free forever for most use cases)
3. How agent-ops automates it (hands-off)
4. Why our architecture is cost-effective (stripped JS, edge SSR)

The deploy page positions ONE as a smart user of Cloudflare's infrastructure, not as Cloudflare itself, while showcasing the technical advantages of our approach.
