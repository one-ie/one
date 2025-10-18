---
title: "Visual Integration Map: OrbitingCircles Component"
date: 2025-10-17T14:30:00Z
description: "Added animated visual showing ONE's ecosystem connections to commerce platforms and AI providers"
type: "feature_added"
tags: ["ui", "animation", "integrations", "homepage"]
repo: "web"
path: "web/src/pages/index.astro"
author: "Claude"
---

Added an animated **OrbitingCircles** component to the homepage showcasing ONE Platform's integration ecosystem.

## What Was Built

### Visual Design
- Central ONE logo with two orbital rings
- Inner orbit (4 platforms): Commerce & Payments
- Outer orbit (5 platforms): AI Providers
- Smooth rotation animations with staggered start angles

### Inner Orbit - Commerce Ecosystem
1. **Shopify** (Storefront) - 0° start, 36s rotation
2. **WooCommerce** (Commerce) - 90° start, 36s rotation
3. **Magento** (Enterprise) - 180° start, 36s rotation
4. **Stripe** (Billing) - 270° start, 36s rotation

### Outer Orbit - AI Ecosystem
1. **OpenAI** (GPT-4) - 0° start, 48s rotation
2. **Anthropic** (Claude 3) - 72° start, 48s rotation
3. **Google Gemini** (Multimodal) - 144° start, 48s rotation
4. **Mistral AI** (Open-Weight) - 216° start, 48s rotation
5. **DeepSeek** (Optimized) - 288° start, 48s rotation

## Technical Implementation

```typescript
// Inner orbit configuration
const innerOrbits = [
  { startAngle: 0, duration: 36, logo: '/logos/shopify.svg', ... },
  // ... 3 more platforms
];

// Outer orbit configuration
const outerOrbits = [
  { startAngle: 0, duration: 48, logo: '/logos/openai.svg', ... },
  // ... 4 more AI providers
];
```

### Features
- **Responsive scaling**: 85% on mobile, 100% on desktop
- **Dashed orbital paths**: Visual guides with subtle opacity
- **Logo containers**: Rounded backgrounds with backdrop blur
- **Platform labels**: Name + caption for each integration
- **Smooth animations**: CSS-based rotation with `client:load`

## Why This Matters

The orbiting circles visually communicate:
1. **Platform agnostic**: ONE connects to any commerce backend
2. **AI flexible**: Works with multiple AI providers
3. **Ecosystem thinking**: Not a walled garden, an integration hub
4. **Professional polish**: Enterprise-grade visual design

Users immediately see ONE as a central orchestration layer connecting commerce and AI, not just another isolated platform.

## Visual Impact

- Center: ONE logo (primary brand presence)
- 240px radius: Commerce integrations (closer orbit)
- 360px radius: AI providers (wider orbit)
- Gentle rotation creates living, breathing ecosystem feel

The animation runs indefinitely, making the homepage feel dynamic and alive.
