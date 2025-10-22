# PROMPT: Fix Frontend-Only Mode in npx oneie Source

## Context

The `npx oneie` package installs a web application that crashes with "Client created with undefined deployment address" error when `ONE_BACKEND=off` is set. This breaks the onboarding flow for new users.

## Task

Apply the following fixes to `/Users/toc/Server/ONE/web/` source directory to enable frontend-only mode support. These changes will be synced to the npm package via `/release`.

---

## Step 1: Create Convex Client Helper

**Create new file:** `/Users/toc/Server/ONE/web/src/lib/convex-client.ts`

```typescript
/**
 * Convex Client Helper
 *
 * Provides safe Convex client creation that handles frontend-only mode
 * when ONE_BACKEND=off
 */

import { ConvexHttpClient } from "convex/browser";

/**
 * Get Convex client URL from environment
 * Returns null if backend is disabled
 */
export function getConvexUrl(): string | null {
  // Check if backend is disabled
  const backendEnabled = import.meta.env.ONE_BACKEND !== 'off';

  if (!backendEnabled) {
    console.log('[Frontend-Only Mode] Backend disabled, skipping Convex client creation');
    return null;
  }

  const url = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;

  if (!url) {
    console.warn('[Convex] No PUBLIC_CONVEX_URL found in environment');
    return null;
  }

  return url;
}

/**
 * Create Convex HTTP client safely
 * Returns null if backend is disabled or URL is missing
 *
 * @example
 * ```typescript
 * const client = createConvexClient();
 * if (client) {
 *   // Use client
 * } else {
 *   // Frontend-only mode - skip backend operations
 * }
 * ```
 */
export function createConvexClient(): ConvexHttpClient | null {
  const url = getConvexUrl();

  if (!url) {
    return null;
  }

  return new ConvexHttpClient(url);
}

/**
 * Check if backend is enabled
 */
export function isBackendEnabled(): boolean {
  return import.meta.env.ONE_BACKEND !== 'off';
}
```

---

## Step 2: Update Configuration Loader

**File:** `/Users/toc/Server/ONE/web/src/config/providers.ts`

Find this function (around line 129):

```typescript
export function loadProviderConfig(): ProviderConfig {
  const providerType = import.meta.env.BACKEND_PROVIDER || import.meta.env.PUBLIC_BACKEND_PROVIDER;

  if (!providerType) {
    throw new Error(
      "BACKEND_PROVIDER environment variable required. " +
      "Set to: convex, wordpress, notion, or supabase"
    );
  }
```

Replace with:

```typescript
export function loadProviderConfig(): ProviderConfig | null {
  // Check if backend is disabled
  const backendEnabled = import.meta.env.ONE_BACKEND !== 'off';

  if (!backendEnabled) {
    console.log('[Frontend-Only Mode] Backend disabled via ONE_BACKEND=off');
    return null;
  }

  const providerType = import.meta.env.BACKEND_PROVIDER || import.meta.env.PUBLIC_BACKEND_PROVIDER;

  if (!providerType) {
    throw new Error(
      "BACKEND_PROVIDER environment variable required. " +
      "Set to: convex, wordpress, notion, or supabase"
    );
  }
```

---

## Step 3: Update ConfigService (3 functions)

**File:** `/Users/toc/Server/ONE/web/src/services/ConfigService.ts`

### 3a. Update `getForOrganization()` (around line 209)

Find:

```typescript
    // Fall back to default config
    try {
      const defaultConfig = loadProviderConfig();
      return defaultConfig;
    } catch (error) {
```

Replace with:

```typescript
    // Fall back to default config
    try {
      const defaultConfig = loadProviderConfig();

      // Handle frontend-only mode (backend disabled)
      if (defaultConfig === null) {
        return yield* Effect.fail(
          new ConfigNotFoundError({
            organizationId,
            message: `Backend disabled (ONE_BACKEND=off). Frontend-only mode active.`,
          })
        );
      }

      return defaultConfig;
    } catch (error) {
```

### 3b. Update `initializeProvider()` (around line 380)

Find:

```typescript
      try {
        return loadProviderConfig();
      } catch (error) {
        return yield* Effect.fail(
```

Replace with:

```typescript
      try {
        const defaultConfig = loadProviderConfig();

        // Handle frontend-only mode
        if (defaultConfig === null) {
          return yield* Effect.fail(
            new ConfigNotFoundError({
              organizationId,
              message: `Backend disabled (ONE_BACKEND=off). Frontend-only mode active.`,
            })
          );
        }

        return defaultConfig;
      } catch (error) {
        return yield* Effect.fail(
```

### 3c. Update `getDefault()` (around line 428)

Find:

```typescript
    getDefault: () =>
      Effect.sync(() => {
        try {
          return loadProviderConfig();
        } catch {
```

Replace with:

```typescript
    getDefault: () =>
      Effect.sync(() => {
        try {
          const config = loadProviderConfig();

          // Handle frontend-only mode
          if (config === null) {
            // Return dummy config for frontend-only mode
            return {
              type: "convex" as const,
              client: null as any,
              cacheEnabled: false,
              cacheTTL: 0,
            };
          }

          return config;
        } catch {
```

---

## Step 4: Update Auth API Route

**File:** `/Users/toc/Server/ONE/web/src/pages/api/auth/[...all].ts`

Find (lines 1-12):

```typescript
import type { APIRoute } from "astro"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/lib/convex-api"

export const prerender = false

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

// Bridge Better Auth UI requests to our custom Convex auth
export const ALL: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url)
```

Replace with:

```typescript
import type { APIRoute } from "astro"
import { createConvexClient } from "@/lib/convex-client"
import { api } from "@/lib/convex-api"

export const prerender = false

const convex = createConvexClient()

// Bridge Better Auth UI requests to our custom Convex auth
export const ALL: APIRoute = async ({ request, cookies }) => {
  // Handle frontend-only mode (backend disabled)
  if (!convex) {
    return new Response(
      JSON.stringify({
        user: null,
        session: null,
        message: "Backend disabled (ONE_BACKEND=off). Frontend-only mode active."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  const url = new URL(request.url)
```

---

## Step 5: Update GitHub OAuth Callback

**File:** `/Users/toc/Server/ONE/web/src/pages/api/auth/github/callback.ts`

Find (around line 128):

```typescript
    const { api } = await import("@/lib/convex-api");

    const convex = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
    );
```

Replace with:

```typescript
    const { api } = await import("@/lib/convex-api");
    const { createConvexClient } = await import("@/lib/convex-client");

    const convex = createConvexClient();

    if (!convex) {
      return new Response("Backend disabled", { status: 503 });
    }
```

---

## Step 6: Update Google OAuth Callback

**File:** `/Users/toc/Server/ONE/web/src/pages/api/auth/google/callback.ts`

Find (around line 88):

```typescript
    const { api } = await import("@/lib/convex-api");

    const convex = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
    );
```

Replace with:

```typescript
    const { api } = await import("@/lib/convex-api");
    const { createConvexClient } = await import("@/lib/convex-client");

    const convex = createConvexClient();

    if (!convex) {
      return new Response("Backend disabled", { status: 503 });
    }
```

---

## Step 7: Update Account Settings Page

**File:** `/Users/toc/Server/ONE/web/src/pages/account/settings.astro`

Find (around line 188):

```typescript
  const convexUrl =
    import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL;
  const client = new ConvexHttpClient(convexUrl);
```

Replace with:

```typescript
  import { createConvexClient } from '@/lib/convex-client';
  const client = createConvexClient();

  if (!client) {
    console.warn('Backend disabled, skipping 2FA setup');
  }
```

---

## Step 8: Update Magic Link Form Component

**File:** `/Users/toc/Server/ONE/web/src/components/auth/RequestMagicLinkForm.tsx`

Find (around line 10):

```typescript
import { api } from "@/lib/convex-api"

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)
```

Replace with:

```typescript
import { api } from "@/lib/convex-api"
import { createConvexClient } from "@/lib/convex-client"

const convex = createConvexClient()
```

Then find the `handleSubmit` function and add null check at the start:

```typescript
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!convex) {
      setError("Backend disabled (frontend-only mode)")
      return
    }

    // ... rest of code
  }
```

---

## Step 9: Update Two-Factor Settings Component

**File:** `/Users/toc/Server/ONE/web/src/components/auth/TwoFactorSettings.tsx`

Find (around line 12):

```typescript
import QRCode from "qrcode"

const convex = new ConvexHttpClient(
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)
```

Replace with:

```typescript
import QRCode from "qrcode"
import { createConvexClient } from "@/lib/convex-client"

const convex = createConvexClient()
```

Then add null checks to all async functions:

```typescript
  const handleEnable2FA = async () => {
    if (!convex) {
      console.error("Backend disabled")
      return
    }
    // ... rest of code
  }

  const handleDisable2FA = async () => {
    if (!convex) {
      console.error("Backend disabled")
      return
    }
    // ... rest of code
  }

  const handleVerify = async () => {
    if (!convex) {
      console.error("Backend disabled")
      return
    }
    // ... rest of code
  }
```

---

## Step 10: Update Convex Provider

**File:** `/Users/toc/Server/ONE/web/src/providers/convex/ConvexProvider.ts`

Find (around line 53):

```typescript
export const makeConvexProvider = (config: ConvexProviderConfig): DataProvider => {
  const client = config.client || new ConvexHttpClient(config.url);
```

Replace with:

```typescript
export const makeConvexProvider = (config: ConvexProviderConfig): DataProvider => {
  if (!config.client && !config.url) {
    throw new Error("ConvexProvider requires either client or url in config");
  }

  const client = config.client || new ConvexHttpClient(config.url);
```

---

## Step 11: Test Changes

After applying all fixes:

```bash
cd /Users/toc/Server/ONE/web

# Test 1: Frontend-only mode
echo "ONE_BACKEND=off" > .env.local
echo "ORG_NAME=test" >> .env.local
echo "ORG_WEBSITE=https://test.com" >> .env.local
echo "ORG_FOLDER=test" >> .env.local
bun run dev
# Should start without errors, log "[Frontend-Only Mode]" messages

# Test 2: With Convex backend
echo "ONE_BACKEND=on" > .env.local
echo "PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud" >> .env.local
echo "CONVEX_DEPLOYMENT=prod:shocking-falcon-870" >> .env.local
bun run dev
# Should connect to Convex successfully

# Test 3: Type checking
bunx astro check
# Should have no type errors
```

---

## Step 12: Release to NPM

After all tests pass:

```bash
cd /Users/toc/Server/ONE

# Sync changes to cli and apps/one
/release sync

# Test the package
cd cli
npm publish --dry-run

# Publish if everything looks good
npm version patch  # or minor/major
npm publish
```

---

## Expected Results

After these fixes are applied and published:

✅ Users running `npx oneie init` will get a working frontend-only setup
✅ No "undefined deployment address" errors
✅ Clear console messages: "[Frontend-Only Mode] Backend disabled"
✅ Graceful degradation when backend is unavailable
✅ Easy toggle between frontend-only and full-stack mode
✅ All existing functionality preserved (backwards compatible)

---

## Files Modified Summary

**1 new file:**
- `web/src/lib/convex-client.ts`

**9 existing files updated:**
1. `web/src/config/providers.ts` (1 function signature + logic)
2. `web/src/services/ConfigService.ts` (3 functions)
3. `web/src/pages/api/auth/[...all].ts` (imports + null check)
4. `web/src/pages/api/auth/github/callback.ts` (imports + null check)
5. `web/src/pages/api/auth/google/callback.ts` (imports + null check)
6. `web/src/pages/account/settings.astro` (imports + null check)
7. `web/src/components/auth/RequestMagicLinkForm.tsx` (imports + null check)
8. `web/src/components/auth/TwoFactorSettings.tsx` (imports + null checks)
9. `web/src/providers/convex/ConvexProvider.ts` (validation)

**Estimated time:** 30 minutes
**Risk level:** Low (all changes backwards compatible)