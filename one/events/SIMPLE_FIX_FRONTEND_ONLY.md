# SIMPLE FIX: Frontend-Only Mode (Following Sidebar.tsx Pattern)

## Problem

Files crash with "undefined deployment address" because they create ConvexHttpClient without checking if backend is enabled.

## Solution Pattern (from Sidebar.tsx)

```typescript
// Line 85-86
const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
const AUTH_ENABLED = backendProvider === 'one'

// Then conditionally render or skip backend calls
if (!authEnabled) {
  // Skip backend operations
  return
}
```

---

## Fix for /web Source

Apply to `/Users/toc/Server/ONE/web/` directory.

### 1. Update Auth API Route

**File:** `web/src/pages/api/auth/[...all].ts`

Add at the top of the file (after imports):

```typescript
import type { APIRoute } from "astro"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/lib/convex-api"

export const prerender = false

// Check if backend is enabled
const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
const AUTH_ENABLED = backendProvider === 'one'

const convex = AUTH_ENABLED
  ? new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL)
  : null

// Bridge Better Auth UI requests to our custom Convex auth
export const ALL: APIRoute = async ({ request, cookies }) => {
  // Return early if auth disabled
  if (!AUTH_ENABLED || !convex) {
    return new Response(
      JSON.stringify({ user: null, session: null }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  const url = new URL(request.url)
  // ... rest of code unchanged
```

---

### 2. Update GitHub Callback

**File:** `web/src/pages/api/auth/github/callback.ts`

After line 128, add check:

```typescript
    const { api } = await import("@/lib/convex-api");

    // Check if backend enabled
    const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
    if (backendProvider !== 'one') {
      return new Response("Authentication disabled", { status: 503 })
    }

    const convex = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
    );
```

---

### 3. Update Google Callback

**File:** `web/src/pages/api/auth/google/callback.ts`

After line 88, add check:

```typescript
    const { api } = await import("@/lib/convex-api");

    // Check if backend enabled
    const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
    if (backendProvider !== 'one') {
      return new Response("Authentication disabled", { status: 503 })
    }

    const convex = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
    );
```

---

### 4. Update Settings Page

**File:** `web/src/pages/account/settings.astro`

At line 188, wrap in check:

```typescript
  // Check if backend enabled
  const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
  const AUTH_ENABLED = backendProvider === 'one'

  if (!AUTH_ENABLED) {
    console.log('[Frontend-Only Mode] 2FA disabled')
  } else {
    const convexUrl =
      import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;
    const client = new ConvexHttpClient(convexUrl);
    // ... rest of 2FA code
  }
```

---

### 5. Update Magic Link Form

**File:** `web/src/components/auth/RequestMagicLinkForm.tsx`

At top of file:

```typescript
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/lib/convex-api"

const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
const AUTH_ENABLED = backendProvider === 'one'

const convex = AUTH_ENABLED
  ? new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL)
  : null
```

In handleSubmit:

```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!AUTH_ENABLED || !convex) {
      setError("Authentication is disabled")
      return
    }

    // ... rest of code
  }
```

---

### 6. Update 2FA Settings

**File:** `web/src/components/auth/TwoFactorSettings.tsx`

At top of file:

```typescript
import QRCode from "qrcode"

const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
const AUTH_ENABLED = backendProvider === 'one'

const convex = AUTH_ENABLED
  ? new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL)
  : null
```

Add check to each function:

```typescript
  const handleEnable2FA = async () => {
    if (!AUTH_ENABLED || !convex) return
    // ... rest of code
  }

  const handleDisable2FA = async () => {
    if (!AUTH_ENABLED || !convex) return
    // ... rest of code
  }

  const handleVerify = async () => {
    if (!AUTH_ENABLED || !convex) return
    // ... rest of code
  }
```

---

## Environment Variable Setup

Update `.env.local` template:

```bash
# Backend Configuration
# Set to 'one' to enable authentication backend
# Set to anything else (or leave empty) for frontend-only mode
PUBLIC_BACKEND_PROVIDER=

# Convex Configuration (only needed if PUBLIC_BACKEND_PROVIDER=one)
# PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
# CONVEX_DEPLOYMENT=prod:your-deployment

# Organization Configuration
ORG_NAME=your-org-name
ORG_WEBSITE=https://your-website.com
ORG_FOLDER=your-org-folder
```

---

## Testing

```bash
cd /Users/toc/Server/ONE/web

# Test 1: Frontend-only mode
echo "PUBLIC_BACKEND_PROVIDER=" > .env.local
bun run dev
# Should work without errors

# Test 2: Auth enabled
echo "PUBLIC_BACKEND_PROVIDER=one" > .env.local
echo "PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud" >> .env.local
bun run dev
# Should connect to Convex
```

---

## Summary

**Pattern from Sidebar.tsx:**
```typescript
const backendProvider = (import.meta.env.PUBLIC_BACKEND_PROVIDER ?? '').toLowerCase()
const AUTH_ENABLED = backendProvider === 'one'

if (!AUTH_ENABLED) {
  // Skip backend operations
}
```

**Files to Update:** 6 files
**Lines Changed per File:** ~5-10 lines
**Estimated Time:** 10 minutes
**Risk:** Very low (follows existing pattern)

This is MUCH simpler than my previous approach!