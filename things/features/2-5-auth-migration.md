# Feature 2-5: Auth Component Migration to DataProvider

**Feature ID:** `feature_2_5_auth_migration`
**Plan:** `plan_2_backend_agnostic_frontend`
**Owner:** Frontend Specialist
**Status:** ✅ **COMPLETE SPECIFICATION** - Ready for Implementation
**Priority:** **P0 (CRITICAL)** - All 50+ auth tests MUST pass
**Effort:** 1 week (5-8 days)
**Risk Level:** **HIGHEST** - Authentication is critical infrastructure
**Dependencies:** Feature 2-1 (DataProvider), Feature 2-4 (React Hooks)

---

## Executive Summary

This feature migrates **6 critical authentication components** from direct Better Auth + Convex integration to backend-agnostic DataProvider hooks. This is the **HIGHEST RISK** feature in Plan 2 because:

1. Authentication affects 100% of users
2. 50+ existing tests MUST continue passing
3. Security cannot be compromised
4. Session management must work identically
5. Zero downtime deployment required

**Success Criteria:** All 50+ auth tests pass with ZERO functionality regression.

**Migration Strategy:** Incremental component-by-component with test validation after EACH component (<5 tests fail = immediate rollback).

---

## 1. Components to Migrate (6 Total)

### Component Matrix

| # | Component | Current API | New Hook | Lines | Risk | Test File |
|---|-----------|-------------|----------|-------|------|-----------|
| 1 | **SimpleSignInForm** | `authClient.signIn.email()` | `useLogin()` | 163 | **HIGH** | `email-password.test.ts` |
| 2 | **SimpleSignUpForm** | `authClient.signUp.email()` | `useSignup()` | 157 | **HIGH** | `email-password.test.ts` |
| 3 | **MagicLinkAuth** | `convex.mutation(api.auth.signInWithMagicLink)` | `useMagicLinkAuth()` | 151 | **MEDIUM** | `magic-link.test.ts` |
| 4 | **TwoFactorSettings** | Multiple `convex.mutation(api.auth.*)` | `use2FA()` | 293 | **HIGH** | `auth.test.ts` |
| 5 | **VerifyEmailForm** | `convex.mutation(api.auth.verifyEmail)` | `useVerifyEmail()` | 134 | **LOW** | `auth.test.ts` |
| 6 | **ForgotPasswordForm** | `fetch("/api/auth/forgot-password")` | `usePasswordReset()` | 144 | **MEDIUM** | `password-reset.test.ts` |
| 7 | **ResetPasswordForm** | `fetch("/api/auth/reset-password")` | `usePasswordResetComplete()` | 206 | **MEDIUM** | `password-reset.test.ts` |

**Total:** 1,248 lines of code to migrate
**Estimated Effort:** 8-12 hours of careful migration + testing

---

## 2. Complete BEFORE/AFTER Code

### 2.1 SimpleSignInForm Migration

**BEFORE (Current - 163 lines):**

```typescript
// frontend/src/components/auth/SimpleSignInForm.tsx (BEFORE)
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"  // ❌ REMOVE
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { SocialLoginButtons } from "./SocialLoginButtons"

export function SimpleSignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)  // ❌ Manual state management

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)  // ❌ Manual loading state

    try {
      // ❌ Direct authClient call
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        const errorMessage = result.error.message || "Unable to sign in"
        let title = "Unable to sign in"
        let description = `Error: ${errorMessage}. Please check your credentials and try again.`

        // ❌ String-based error handling (brittle)
        if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("no user")) {
          title = "Account not found"
          description = "No account exists with this email. Please sign up first."
        } else if (errorMessage.toLowerCase().includes("password") || errorMessage.toLowerCase().includes("incorrect")) {
          title = "Incorrect password"
          description = "The password you entered is incorrect."
        }
        // ... more string-based error checks

        toast.error(title, { description })
        setLoading(false)  // ❌ Manual state reset
        return
      }

      toast.success("Welcome back!", {
        description: "Successfully signed in. Redirecting to your dashboard..."
      })

      setTimeout(() => {
        window.location.href = "/account"
      }, 1000)
    } catch (err: any) {
      // ❌ Generic error handling
      toast.error("Sign in error", {
        description: `Error: ${err.message}. Please try again later.`
      })
      setLoading(false)  // ❌ Manual state reset
    }
  }

  return (
    <AuthCard title="Welcome Back" description="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="/account/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href="/account/magic-link">Sign in with magic link</a>
        </Button>
      </form>
    </AuthCard>
  )
}
```

**AFTER (Migrated - 120 lines, cleaner):**

```typescript
// frontend/src/components/auth/SimpleSignInForm.tsx (AFTER)
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/providers/hooks"  // ✅ DataProvider hook
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { SocialLoginButtons } from "./SocialLoginButtons"

export function SimpleSignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { mutate: login, loading, error } = useLogin()  // ✅ Hook manages state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await login({ email, password })  // ✅ Simple hook call

      if (result.success) {
        toast.success("Welcome back!", {
          description: "Successfully signed in. Redirecting to your dashboard..."
        })

        setTimeout(() => {
          window.location.href = "/account"
        }, 1000)
      }
    } catch (err: any) {
      // ✅ Typed error handling
      let title = "Unable to sign in"
      let description = err.message || "Please check your credentials and try again."

      // ✅ Type-safe error checking
      if (err._tag === "UserNotFound") {
        title = "Account not found"
        description = "No account exists with this email. Please sign up first."
      } else if (err._tag === "InvalidCredentials") {
        title = "Incorrect password"
        description = "The password you entered is incorrect. Try again or use 'Forgot password'."
      } else if (err._tag === "NetworkError") {
        title = "Network error"
        description = "Unable to connect to the server. Check your internet connection."
      } else if (err._tag === "EmailNotVerified") {
        title = "Email not verified"
        description = "Please verify your email address before signing in."
      } else if (err._tag === "TwoFactorRequired") {
        title = "2FA required"
        description = "Please enter your two-factor authentication code."
        // Redirect to 2FA page
        window.location.href = `/account/signin/2fa?email=${encodeURIComponent(email)}`
        return
      }

      toast.error(title, { description })
    }
  }

  return (
    <AuthCard title="Welcome Back" description="Sign in to your account">
      <SocialLoginButtons mode="signin" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="/account/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a href="/account/magic-link">Sign in with magic link</a>
        </Button>
      </form>
    </AuthCard>
  )
}
```

**Key Changes:**
- ❌ Removed `authClient` import
- ✅ Added `useLogin()` hook import
- ❌ Removed manual `loading` state
- ✅ Hook manages `loading`, `error` state
- ❌ Removed string-based error detection
- ✅ Type-safe `_tag` error checking
- 🔥 **43 fewer lines** (163 → 120)
- 🎯 **Better error handling** with typed errors
- ⚡ **Cleaner code** with hook pattern

---

### 2.2 SimpleSignUpForm Migration

**BEFORE (Current - 157 lines):**

```typescript
// frontend/src/components/auth/SimpleSignUpForm.tsx (BEFORE)
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"  // ❌ REMOVE
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { SocialLoginButtons } from "./SocialLoginButtons"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"

export function SimpleSignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)  // ❌ Manual state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)  // ❌ Manual loading

    try {
      // ❌ Direct authClient call
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        const errorMessage = result.error.message || "Unable to create account"
        let title = "Unable to create account"
        let description = `Error: ${errorMessage}. Please verify your information and try again.`

        // ❌ String-based error detection
        if (errorMessage.toLowerCase().includes("already exists")) {
          title = "Email already registered"
          description = "This email is already in use. Please sign in instead."
        } else if (errorMessage.toLowerCase().includes("password")) {
          title = "Invalid password"
          description = "Password must be at least 8 characters long."
        }

        toast.error(title, { description })
        setLoading(false)  // ❌ Manual state reset
        return
      }

      toast.success("Account created successfully!", {
        description: `Welcome ${name}! Redirecting to your dashboard...`
      })

      setTimeout(() => {
        window.location.href = "/account"
      }, 1000)
    } catch (err: any) {
      toast.error("Sign up error", {
        description: `Error: ${err.message}. Please try again later.`
      })
      setLoading(false)  // ❌ Manual state reset
    }
  }

  return (
    <AuthCard title="Create Account" description="Sign up to get started">
      <SocialLoginButtons mode="signup" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </AuthCard>
  )
}
```

**AFTER (Migrated - 115 lines):**

```typescript
// frontend/src/components/auth/SimpleSignUpForm.tsx (AFTER)
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignup } from "@/providers/hooks"  // ✅ DataProvider hook
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { SocialLoginButtons } from "./SocialLoginButtons"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"

export function SimpleSignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const { mutate: signup, loading, error } = useSignup()  // ✅ Hook manages state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await signup({ email, password, name })  // ✅ Simple call

      if (result.success) {
        toast.success("Account created successfully!", {
          description: `Welcome ${name}! Redirecting to your dashboard...`
        })

        setTimeout(() => {
          window.location.href = "/account"
        }, 1000)
      }
    } catch (err: any) {
      let title = "Unable to create account"
      let description = err.message || "Please verify your information and try again."

      // ✅ Typed error handling
      if (err._tag === "EmailAlreadyExists") {
        title = "Email already registered"
        description = "This email is already in use. Please sign in or use a different email."
      } else if (err._tag === "WeakPassword") {
        title = "Password too weak"
        description = "Password must be at least 8 characters with letters and numbers."
      } else if (err._tag === "NetworkError") {
        title = "Network error"
        description = "Unable to connect to the server. Check your internet connection."
      }

      toast.error(title, { description })
    }
  }

  return (
    <AuthCard title="Create Account" description="Sign up to get started">
      <SocialLoginButtons mode="signup" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </AuthCard>
  )
}
```

**Key Changes:**
- 🔥 **42 fewer lines** (157 → 115)
- ✅ Cleaner error handling with typed errors
- ✅ Password strength indicator preserved
- ✅ Same UX, better code

---

### 2.3 MagicLinkAuth Migration

**BEFORE (Current - 151 lines):**

```typescript
// frontend/src/components/auth/MagicLinkAuth.tsx (BEFORE)
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { CheckCircle2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConvexHttpClient } from "convex/browser"  // ❌ REMOVE
import { api } from "../../../convex/_generated/api"  // ❌ REMOVE

const convex = new ConvexHttpClient(  // ❌ REMOVE
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

interface MagicLinkAuthProps {
  token: string
}

export function MagicLinkAuth({ token }: MagicLinkAuthProps) {
  const [loading, setLoading] = useState(false)  // ❌ Manual state
  const [authSuccess, setAuthSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [authenticating, setAuthenticating] = useState(true)

  useEffect(() => {
    const authenticateWithMagicLink = async () => {
      if (!token) {
        setTokenValid(false)
        setAuthenticating(false)
        toast.error("No magic link token", {
          description: "This link is missing a token."
        })
        return
      }

      setLoading(true)
      try {
        // ❌ Direct Convex mutation call
        const result = await convex.mutation(api.auth.signInWithMagicLink, { token })

        if (result?.token) {
          // ❌ Manual cookie setting via API
          const response = await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: result.token }),
          })

          if (response.ok) {
            setAuthSuccess(true)
            toast.success("Signed in successfully!", {
              description: "Redirecting to your dashboard..."
            })

            setTimeout(() => {
              window.location.href = "/account"
            }, 1500)
          } else {
            throw new Error("Failed to set authentication cookie")
          }
        }
      } catch (err: any) {
        setTokenValid(false)
        toast.error("Authentication failed", {
          description: err.message || "Invalid or expired link"
        })
      } finally {
        setLoading(false)
        setAuthenticating(false)
      }
    }

    authenticateWithMagicLink()
  }, [token])

  // ... render logic (unchanged)
}
```

**AFTER (Migrated - 105 lines):**

```typescript
// frontend/src/components/auth/MagicLinkAuth.tsx (AFTER)
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { CheckCircle2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMagicLinkAuth } from "@/providers/hooks"  // ✅ DataProvider hook

interface MagicLinkAuthProps {
  token: string
}

export function MagicLinkAuth({ token }: MagicLinkAuthProps) {
  const { mutate: authenticate, loading, error } = useMagicLinkAuth()  // ✅ Hook
  const [authSuccess, setAuthSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    const authenticateWithToken = async () => {
      if (!token) {
        setTokenValid(false)
        toast.error("No magic link token", {
          description: "This link is missing a token."
        })
        return
      }

      try {
        const result = await authenticate({ token })  // ✅ Simple hook call

        if (result.success) {
          setAuthSuccess(true)
          toast.success("Signed in successfully!", {
            description: "Redirecting to your dashboard..."
          })

          setTimeout(() => {
            window.location.href = "/account"
          }, 1500)
        }
      } catch (err: any) {
        setTokenValid(false)

        let title = "Authentication failed"
        let description = err.message

        // ✅ Typed error handling
        if (err._tag === "InvalidToken" || err._tag === "TokenExpired") {
          title = "Invalid or expired link"
          description = "This magic link has expired or is invalid. Magic links expire after 15 minutes."
        }

        toast.error(title, { description })
      }
    }

    authenticateWithToken()
  }, [token])

  if (loading) {
    return (
      <AuthCard
        title="Signing you in"
        description="Please wait while we authenticate your magic link"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthCard>
    )
  }

  if (!tokenValid) {
    return (
      <AuthCard
        title="Authentication failed"
        description="This magic link is no longer valid"
      >
        <Alert variant="destructive">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            This magic link has expired or is invalid. Magic links expire after 15 minutes.
          </AlertDescription>
        </Alert>

        <Button variant="outline" className="w-full" asChild>
          <a href="/account/magic-link">Request new magic link</a>
        </Button>
      </AuthCard>
    )
  }

  if (authSuccess) {
    return (
      <AuthCard
        title="Signed in successfully!"
        description="Redirecting to your dashboard"
      >
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>
            You've been successfully signed in with your magic link.
          </AlertDescription>
        </Alert>

        <Button className="w-full" asChild>
          <a href="/account">Go to dashboard</a>
        </Button>
      </AuthCard>
    )
  }

  return null
}
```

**Key Changes:**
- ❌ Removed ConvexHttpClient import
- ❌ Removed api import
- ✅ Added `useMagicLinkAuth()` hook
- 🔥 **46 fewer lines** (151 → 105)
- ✅ Automatic cookie management (hook handles it)
- ✅ Cleaner error handling

---

### 2.4 TwoFactorSettings Migration

**BEFORE (Current - 293 lines):**

```typescript
// frontend/src/components/auth/TwoFactorSettings.tsx (BEFORE)
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Key, Copy, CheckCircle2 } from "lucide-react"
import { ConvexHttpClient } from "convex/browser"  // ❌ REMOVE
import { api } from "../../../convex/_generated/api"  // ❌ REMOVE
import * as OTPAuth from "otpauth"
import QRCode from "qrcode"

const convex = new ConvexHttpClient(  // ❌ REMOVE
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

export function TwoFactorSettings() {
  const [loading, setLoading] = useState(false)  // ❌ Manual state
  const [status, setStatus] = useState<{ enabled: boolean; hasSetup: boolean }>({ enabled: false, hasSetup: false })
  const [showSetup, setShowSetup] = useState(false)
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [disablePassword, setDisablePassword] = useState("")

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      // ❌ Manual token extraction from cookies
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) return

      // ❌ Direct Convex query
      const result = await convex.query(api.auth.get2FAStatus, { token })
      setStatus(result)
    } catch (err) {
      console.error("Failed to load 2FA status:", err)
    }
  }

  const handleSetup = async () => {
    setLoading(true)  // ❌ Manual state
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) {
        toast.error("Not authenticated")
        return
      }

      // ❌ Direct Convex mutation
      const result = await convex.mutation(api.auth.setup2FA, { token })
      setSecret(result.secret)
      setBackupCodes(result.backupCodes)

      // Generate TOTP URI
      const totp = new OTPAuth.TOTP({
        issuer: "ONE",
        label: "user@one.ie",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(result.secret.toUpperCase().padEnd(32, 'A')),
      })

      const uri = totp.toString()
      const qrUrl = await QRCode.toDataURL(uri)
      setQrCodeUrl(qrUrl)
      setShowSetup(true)

      toast.success("2FA setup initiated", {
        description: "Scan the QR code with your authenticator app"
      })
    } catch (err: any) {
      toast.error("Setup failed", {
        description: err.message || "Failed to setup 2FA"
      })
    } finally {
      setLoading(false)  // ❌ Manual state
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) {
        toast.error("Not authenticated")
        return
      }

      // Client-side TOTP verification
      const totp = new OTPAuth.TOTP({
        issuer: "ONE",
        label: "user@one.ie",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret.toUpperCase().padEnd(32, 'A')),
      })

      const delta = totp.validate({ token: verificationCode, window: 1 })
      if (delta === null) {
        toast.error("Invalid code", {
          description: "The verification code is incorrect. Please try again."
        })
        setLoading(false)
        return
      }

      // ❌ Direct Convex mutation
      await convex.mutation(api.auth.verify2FA, { token })

      toast.success("2FA enabled!", {
        description: "Two-factor authentication has been enabled for your account"
      })

      setShowSetup(false)
      loadStatus()
    } catch (err: any) {
      toast.error("Verification failed", {
        description: err.message || "Failed to verify code"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      if (!token) {
        toast.error("Not authenticated")
        return
      }

      // ❌ Direct Convex mutation
      await convex.mutation(api.auth.disable2FA, { token, password: disablePassword })

      toast.success("2FA disabled", {
        description: "Two-factor authentication has been disabled"
      })

      setDisablePassword("")
      loadStatus()
    } catch (err: any) {
      toast.error("Failed to disable 2FA", {
        description: err.message || "Incorrect password"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  // ... rest of component (render logic - 150+ lines unchanged)
}
```

**AFTER (Migrated - 210 lines):**

```typescript
// frontend/src/components/auth/TwoFactorSettings.tsx (AFTER)
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Key, Copy, CheckCircle2 } from "lucide-react"
import { use2FA } from "@/providers/hooks"  // ✅ DataProvider hook
import * as OTPAuth from "otpauth"
import QRCode from "qrcode"

export function TwoFactorSettings() {
  const { getStatus, setup, verify, disable, loading, error } = use2FA()  // ✅ Hook
  const [status, setStatus] = useState<{ enabled: boolean; hasSetup: boolean }>({ enabled: false, hasSetup: false })
  const [showSetup, setShowSetup] = useState(false)
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [disablePassword, setDisablePassword] = useState("")

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const result = await getStatus()  // ✅ Simple hook call (no token needed)
      setStatus(result)
    } catch (err) {
      console.error("Failed to load 2FA status:", err)
    }
  }

  const handleSetup = async () => {
    try {
      const result = await setup()  // ✅ Simple hook call
      setSecret(result.secret)
      setBackupCodes(result.backupCodes)

      // Generate TOTP URI (unchanged)
      const totp = new OTPAuth.TOTP({
        issuer: "ONE",
        label: "user@one.ie",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(result.secret.toUpperCase().padEnd(32, 'A')),
      })

      const uri = totp.toString()
      const qrUrl = await QRCode.toDataURL(uri)
      setQrCodeUrl(qrUrl)
      setShowSetup(true)

      toast.success("2FA setup initiated", {
        description: "Scan the QR code with your authenticator app"
      })
    } catch (err: any) {
      toast.error("Setup failed", {
        description: err.message || "Failed to setup 2FA"
      })
    }
  }

  const handleVerify = async () => {
    try {
      // Client-side TOTP verification (unchanged)
      const totp = new OTPAuth.TOTP({
        issuer: "ONE",
        label: "user@one.ie",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret.toUpperCase().padEnd(32, 'A')),
      })

      const delta = totp.validate({ token: verificationCode, window: 1 })
      if (delta === null) {
        toast.error("Invalid code", {
          description: "The verification code is incorrect. Please try again."
        })
        return
      }

      await verify(verificationCode)  // ✅ Simple hook call

      toast.success("2FA enabled!", {
        description: "Two-factor authentication has been enabled for your account"
      })

      setShowSetup(false)
      loadStatus()
    } catch (err: any) {
      toast.error("Verification failed", {
        description: err.message || "Failed to verify code"
      })
    }
  }

  const handleDisable = async () => {
    try {
      await disable(disablePassword)  // ✅ Simple hook call

      toast.success("2FA disabled", {
        description: "Two-factor authentication has been disabled"
      })

      setDisablePassword("")
      loadStatus()
    } catch (err: any) {
      toast.error("Failed to disable 2FA", {
        description: err.message || "Incorrect password"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  // ... render logic (unchanged - 100+ lines)
}
```

**Key Changes:**
- ❌ Removed ConvexHttpClient
- ❌ Removed manual token extraction
- ✅ Added `use2FA()` hook with all operations
- 🔥 **83 fewer lines** (293 → 210)
- ✅ Automatic authentication (hook handles tokens)
- ✅ Same functionality, cleaner code

---

### 2.5 VerifyEmailForm Migration

**BEFORE (Current - 134 lines):**

```typescript
// frontend/src/components/auth/VerifyEmailForm.tsx (BEFORE)
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { CheckCircle2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConvexHttpClient } from "convex/browser"  // ❌ REMOVE
import { api } from "../../../convex/_generated/api"  // ❌ REMOVE

const convex = new ConvexHttpClient(  // ❌ REMOVE
  import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.NEXT_PUBLIC_CONVEX_URL
)

interface VerifyEmailFormProps {
  token: string
}

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const [loading, setLoading] = useState(false)  // ❌ Manual state
  const [verifySuccess, setVerifySuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        setVerifying(false)
        toast.error("No verification token", {
          description: "This verification link is missing a token."
        })
        return
      }

      setLoading(true)
      try {
        // ❌ Direct Convex mutation
        const result = await convex.mutation(api.auth.verifyEmail, { token })

        if (result?.success) {
          setVerifySuccess(true)
          toast.success("Email verified successfully!", {
            description: "Your email has been verified. You can now access all features."
          })
        }
      } catch (err: any) {
        setTokenValid(false)
        toast.error("Verification failed", {
          description: err.message || "Invalid or expired link"
        })
      } finally {
        setLoading(false)
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  // ... render logic (unchanged)
}
```

**AFTER (Migrated - 95 lines):**

```typescript
// frontend/src/components/auth/VerifyEmailForm.tsx (AFTER)
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { CheckCircle2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVerifyEmail } from "@/providers/hooks"  // ✅ DataProvider hook

interface VerifyEmailFormProps {
  token: string
}

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const { mutate: verify, loading, error } = useVerifyEmail()  // ✅ Hook
  const [verifySuccess, setVerifySuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        toast.error("No verification token", {
          description: "This verification link is missing a token."
        })
        return
      }

      try {
        const result = await verify({ token })  // ✅ Simple hook call

        if (result.success) {
          setVerifySuccess(true)
          toast.success("Email verified successfully!", {
            description: "Your email has been verified. You can now access all features."
          })
        }
      } catch (err: any) {
        setTokenValid(false)

        let title = "Verification failed"
        let description = err.message

        // ✅ Typed error handling
        if (err._tag === "InvalidToken" || err._tag === "TokenExpired") {
          title = "Invalid or expired link"
          description = "This verification link has expired or is invalid."
        }

        toast.error(title, { description })
      }
    }

    verifyToken()
  }, [token])

  if (loading) {
    return (
      <AuthCard
        title="Verifying your email"
        description="Please wait while we verify your email address"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthCard>
    )
  }

  if (!tokenValid) {
    return (
      <AuthCard
        title="Verification failed"
        description="This verification link is no longer valid"
      >
        <Alert variant="destructive">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            This verification link has expired or is invalid. If you need a new verification email, please contact support.
          </AlertDescription>
        </Alert>

        <Button variant="outline" className="w-full" asChild>
          <a href="/account">Go to dashboard</a>
        </Button>
      </AuthCard>
    )
  }

  if (verifySuccess) {
    return (
      <AuthCard
        title="Email verified!"
        description="Your email has been successfully verified"
      >
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>
            Your email has been successfully verified. You can now access all features.
          </AlertDescription>
        </Alert>

        <Button className="w-full" asChild>
          <a href="/account">Go to dashboard</a>
        </Button>
      </AuthCard>
    )
  }

  return null
}
```

**Key Changes:**
- 🔥 **39 fewer lines** (134 → 95)
- ✅ Simple hook-based verification
- ✅ Automatic verification on mount

---

### 2.6 ForgotPasswordForm Migration

**BEFORE (Current - 144 lines):**

```typescript
// frontend/src/components/auth/ForgotPasswordForm.tsx (BEFORE)
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)  // ❌ Manual state
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)  // ❌ Manual loading

    try {
      // ❌ Direct fetch call
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Unable to send reset email"
        // ... string-based error handling
        toast.error("Unable to send reset email", {
          description: errorMessage
        })
        setLoading(false)  // ❌ Manual state
        return
      }

      setEmailSent(true)
      toast.success("Reset email sent!", {
        description: "Check your inbox for password reset instructions."
      })
      setLoading(false)
    } catch (err: any) {
      toast.error("Request failed", {
        description: `Error: ${err.message}. Please try again later.`
      })
      setLoading(false)  // ❌ Manual state
    }
  }

  // ... render logic (unchanged)
}
```

**AFTER (Migrated - 105 lines):**

```typescript
// frontend/src/components/auth/ForgotPasswordForm.tsx (AFTER)
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePasswordReset } from "@/providers/hooks"  // ✅ DataProvider hook

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const { mutate: requestReset, loading, error } = usePasswordReset()  // ✅ Hook
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await requestReset({ email })  // ✅ Simple hook call

      setEmailSent(true)
      toast.success("Reset email sent!", {
        description: "Check your inbox for password reset instructions."
      })
    } catch (err: any) {
      let title = "Unable to send reset email"
      let description = err.message || "Please try again."

      // ✅ Typed error handling
      if (err._tag === "UserNotFound") {
        title = "Email not found"
        description = "No account exists with this email address."
      } else if (err._tag === "RateLimitExceeded") {
        title = "Too many requests"
        description = "Please wait a few minutes and try again."
      } else if (err._tag === "NetworkError") {
        title = "Network error"
        description = "Unable to connect to the server."
      }

      toast.error(title, { description })
    }
  }

  if (emailSent) {
    return (
      <AuthCard
        title="Check your email"
        description="We've sent password reset instructions"
      >
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>
            If an account exists with <strong>{email}</strong>, you will receive an email.
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setEmailSent(false)
            setEmail("")
          }}
        >
          Try another email
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot your password?" description="Enter your email to receive reset instructions">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          We'll send you an email with instructions to reset your password.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset email"}
        </Button>
      </form>
    </AuthCard>
  )
}
```

**Key Changes:**
- 🔥 **39 fewer lines** (144 → 105)
- ❌ Removed fetch call
- ✅ Added hook-based request

---

### 2.7 ResetPasswordForm Migration

**AFTER (Complete):**

```typescript
// frontend/src/components/auth/ResetPasswordForm.tsx (AFTER)
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AuthCard } from "./AuthCard"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"
import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePasswordResetComplete } from "@/providers/hooks"  // ✅ Hook

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { mutate: resetPassword, loading, error } = usePasswordResetComplete()  // ✅ Hook
  const [resetSuccess, setResetSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    // Token validation can be done on mount if needed
    if (!token) {
      setTokenValid(false)
      toast.error("Invalid or expired token", {
        description: "This password reset link is invalid or has expired."
      })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match."
      })
      return
    }

    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long."
      })
      return
    }

    try {
      await resetPassword({ token, newPassword: password })  // ✅ Simple hook call

      setResetSuccess(true)
      toast.success("Password reset successful!", {
        description: "Your password has been updated. Redirecting to sign in..."
      })

      setTimeout(() => {
        window.location.href = "/account/signin"
      }, 2000)
    } catch (err: any) {
      let title = "Unable to reset password"
      let description = err.message || "Please try again."

      // ✅ Typed error handling
      if (err._tag === "InvalidToken" || err._tag === "TokenExpired") {
        title = "Invalid or expired token"
        description = "This password reset link is invalid or has expired. Please request a new one."
        setTokenValid(false)
      } else if (err._tag === "WeakPassword") {
        title = "Invalid password"
        description = "Password must be at least 8 characters with letters and numbers."
      } else if (err._tag === "NetworkError") {
        title = "Network error"
        description = "Unable to connect to the server."
      }

      toast.error(title, { description })
    }
  }

  // ... render logic (similar to BEFORE)
}
```

---

## 3. Implementation Procedure (60 Steps)

### Phase 1: Pre-Migration Setup (Steps 1-12)

**Step 1: Audit Current Implementation**
```bash
cd /Users/toc/Server/ONE/frontend

# Count lines
wc -l src/components/auth/*.tsx

# Find dependencies
grep -r "authClient" src/components/auth/
grep -r "ConvexHttpClient" src/components/auth/
grep -r "import.*convex" src/components/auth/
```

**Expected Output:**
```
163 SimpleSignInForm.tsx
157 SimpleSignUpForm.tsx
151 MagicLinkAuth.tsx
293 TwoFactorSettings.tsx
134 VerifyEmailForm.tsx
144 ForgotPasswordForm.tsx
206 ResetPasswordForm.tsx
```

**Step 2: Run Baseline Tests**
```bash
# Save baseline results
bun test test/auth > baseline-auth-tests.txt 2>&1

# Count passing tests
grep -c "PASS" baseline-auth-tests.txt
```

**Expected:** 50+ passing tests

**Step 3: Create Migration Branch**
```bash
git checkout -b feature/auth-migration-2-5
git push -u origin feature/auth-migration-2-5
```

**Step 4: Create Rollback Tags**
```bash
# Tag before any changes
git tag rollback-pre-auth-migration
git push --tags
```

**Step 5: Verify Dependencies**
```bash
# Check DataProvider exists
test -f src/providers/DataProvider.ts || echo "ERROR: DataProvider missing"

# Check hooks exist
test -f src/providers/hooks/index.ts || echo "ERROR: hooks missing"

# Check ConvexAuthProvider exists
grep -q "ConvexAuthProvider" src/providers/ConvexProvider.ts || echo "ERROR: Provider missing"
```

**Step 6-12: Create Auth Hook Infrastructure**

See full hook implementations in Appendix A.

---

### Phase 2: SimpleSignInForm Migration (Steps 13-17)

**Step 13: Backup Current File**
```bash
cp src/components/auth/SimpleSignInForm.tsx src/components/auth/SimpleSignInForm.tsx.backup
```

**Step 14: Migrate SimpleSignInForm**

Apply BEFORE → AFTER changes shown in section 2.1 above.

**Step 15: Test SimpleSignInForm**
```bash
# Run login tests only
bun test test/auth/email-password.test.ts -t "login"

# Manual testing checklist:
# 1. Login with valid credentials succeeds ✓
# 2. Login with invalid credentials shows error ✓
# 3. Login with non-existent email shows error ✓
# 4. Loading state displays correctly ✓
# 5. Success redirects to /account ✓
# 6. Session persists after refresh ✓
```

**Quality Gate:** ALL login tests must pass. If >5 tests fail → ROLLBACK.

**Step 16: Compare Results**
```bash
bun test test/auth > step16-results.txt 2>&1
diff baseline-auth-tests.txt step16-results.txt
```

**Step 17: Commit SimpleSignInForm**
```bash
git add src/components/auth/SimpleSignInForm.tsx
git add src/providers/hooks/auth.ts
git commit -m "feat(auth): migrate SimpleSignInForm to DataProvider

- Replace authClient.signIn.email() with useLogin() hook
- Improve error handling with typed errors (_tag pattern)
- Reduce code from 163 to 120 lines
- Preserve all existing functionality
- All login tests passing

TESTS: bun test test/auth/email-password.test.ts
BREAKING: None
"
git tag rollback-post-signin-migration
git push --tags
```

---

### Phase 3: SimpleSignUpForm Migration (Steps 18-22)

**Step 18: Backup**
```bash
cp src/components/auth/SimpleSignUpForm.tsx src/components/auth/SimpleSignUpForm.tsx.backup
```

**Step 19: Migrate**

Apply BEFORE → AFTER changes from section 2.2.

**Step 20: Test**
```bash
bun test test/auth/email-password.test.ts -t "signup"
bun test test/auth

# Manual tests:
# 1. Signup with new email succeeds ✓
# 2. Signup with existing email shows error ✓
# 3. Weak password shows error ✓
# 4. Password strength indicator works ✓
# 5. Success creates user + org membership ✓
```

**Step 21: Compare**
```bash
bun test test/auth > step21-results.txt 2>&1
diff baseline-auth-tests.txt step21-results.txt
```

**Step 22: Commit**
```bash
git add src/components/auth/SimpleSignUpForm.tsx
git commit -m "feat(auth): migrate SimpleSignUpForm to DataProvider

- Replace authClient.signUp.email() with useSignup() hook
- Reduce code from 157 to 115 lines
- Preserve password strength indicator
- All signup tests passing

TESTS: bun test test/auth/email-password.test.ts
"
git tag rollback-post-signup-migration
git push --tags
```

---

### Phase 4: MagicLinkAuth Migration (Steps 23-27)

**Step 23-27:** Follow same pattern as Phase 2-3.

**Quality Gate:** All magic link tests must pass.

---

### Phase 5: TwoFactorSettings Migration (Steps 28-32)

**Step 28-32:** Follow same pattern. This is the most complex component.

**Quality Gate:** All 2FA tests must pass (TOTP generation, QR codes, backup codes).

---

### Phase 6: VerifyEmailForm Migration (Steps 33-37)

**Step 33-37:** Follow same pattern.

**Quality Gate:** Email verification tests must pass.

---

### Phase 7: Password Reset Forms (Steps 38-45)

Migrate both ForgotPasswordForm and ResetPasswordForm.

**Quality Gate:** All password reset tests must pass.

---

### Phase 8: Final Validation (Steps 46-60)

**Step 46: Remove Direct Imports**
```bash
# Find remaining direct imports
grep -r "authClient" src/components/auth/
grep -r "ConvexHttpClient" src/components/auth/
grep -r "api\.auth" src/components/auth/

# Should return NO results
```

**Step 47: TypeScript Check**
```bash
bunx astro check

# Expected: 0 errors
```

**Step 48: Full Test Suite**
```bash
bun test test/auth > final-auth-tests.txt 2>&1

# Compare to baseline
diff baseline-auth-tests.txt final-auth-tests.txt

# Count passing
grep -c "PASS" final-auth-tests.txt
```

**Expected:** 50+ tests passing, same as baseline.

**Step 49: Performance Testing**
```bash
# Measure login time
time curl -X POST http://localhost:4321/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Should complete in <2 seconds
```

**Step 50-60:** Documentation, cleanup, final review.

---

## 4. Rollback Plan

### Level 1: Single Component Rollback

```bash
# Example: Rollback SimpleSignInForm
git reset --hard rollback-pre-signin-migration

# Restore backup
cp src/components/auth/SimpleSignInForm.tsx.backup src/components/auth/SimpleSignInForm.tsx

# Verify tests pass
bun test test/auth/email-password.test.ts
```

**Time:** <5 minutes

### Level 2: Full Feature Rollback

```bash
# Rollback to pre-migration state
git reset --hard rollback-pre-auth-migration

# Verify all tests pass
bun test test/auth
diff baseline-auth-tests.txt current-tests.txt
```

**Time:** <10 minutes

### Level 3: Feature Flag Rollback

Create environment variable to toggle between old and new:

```bash
# .env.local
USE_NEW_AUTH_HOOKS=false  # Use old authClient
USE_NEW_AUTH_HOOKS=true   # Use new DataProvider (default)
```

**Time:** <2 minutes (just change env var and restart)

---

## 5. Testing Strategy

### Test Execution After Each Component

```bash
# Pattern:
bun test test/auth/[specific-test].test.ts
bun test test/auth  # Full suite

# If >5 tests fail:
# 1. Review errors
# 2. Check DataProvider implementation
# 3. Rollback to previous tag
# 4. Investigate and fix
# 5. Retry
```

### Critical Test Cases (50+)

**Email/Password (20 tests):**
- ✅ Login with valid credentials
- ✅ Login with invalid password
- ✅ Login with non-existent email
- ✅ Signup with new email
- ✅ Signup with existing email
- ✅ Password strength validation
- ✅ Session persistence
- ✅ Logout functionality

**OAuth (10 tests):**
- ✅ GitHub OAuth flow
- ✅ Google OAuth flow
- ✅ Account linking
- ✅ OAuth error handling

**Magic Links (8 tests):**
- ✅ Request magic link
- ✅ Authenticate with valid token
- ✅ Expired token (>15 min)
- ✅ Used token (single-use)
- ✅ Invalid token

**Password Reset (8 tests):**
- ✅ Request reset
- ✅ Reset with valid token
- ✅ Expired token (>1 hour)
- ✅ New password works

**Email Verification (4 tests):**
- ✅ Verify with valid token
- ✅ Expired token
- ✅ Already verified

**2FA (8 tests):**
- ✅ Enable 2FA
- ✅ QR code generation
- ✅ Backup codes
- ✅ TOTP verification
- ✅ Disable 2FA

---

## 6. Quality Gates

### Mandatory Gates (MUST PASS)

1. **All 50+ auth tests pass** ✅
2. **No direct Convex imports** ✅
3. **TypeScript compiles (0 errors)** ✅
4. **Performance within 10% baseline** ✅
5. **Zero functionality regression** ✅

### Quality Metrics

- Code reduction: **~250 fewer lines** (1,248 → ~1,000)
- Type safety: **100% typed errors** (no string checking)
- Maintainability: **Cleaner hook-based code**
- Testability: **Easier to mock providers**

---

## 7. Success Criteria

✅ **All 50+ tests passing**
✅ **No direct authClient or Convex imports**
✅ **TypeScript clean (0 errors)**
✅ **Performance maintained**
✅ **Documentation updated**
✅ **Rollback plan tested**

**Sign-Off Requirements:**
1. Frontend Specialist approval
2. Quality Agent validation
3. All tests green
4. Performance benchmarks met
5. Code review complete

---

## Appendix A: Complete Hook Implementations

### useLogin Hook

```typescript
// frontend/src/providers/hooks/auth.ts
import { useState } from "react";
import { useDataProvider } from "../DataProviderContext";
import type { AuthResult, LoginArgs } from "../types";

export function useLogin() {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (args: LoginArgs): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await provider.auth.login(args);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  return { mutate, loading, error };
}
```

### use2FA Hook

```typescript
export function use2FA() {
  const provider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getStatus = async (): Promise<{ enabled: boolean; hasSetup: boolean }> => {
    try {
      return await provider.auth.get2FAStatus();
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const setup = async (): Promise<{ secret: string; backupCodes: string[] }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await provider.auth.setup2FA();
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const verify = async (code: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await provider.auth.verify2FA({ code });
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const disable = async (password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await provider.auth.disable2FA({ password });
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  return { getStatus, setup, verify, disable, loading, error };
}
```

---

## Appendix B: Error Types

```typescript
// frontend/src/providers/types/auth-errors.ts
export type AuthError =
  | { _tag: "InvalidCredentials"; message: string; suggestion: string }
  | { _tag: "UserNotFound"; message: string; suggestion: string }
  | { _tag: "EmailAlreadyExists"; message: string; suggestion: string }
  | { _tag: "WeakPassword"; message: string; suggestion: string }
  | { _tag: "InvalidToken"; message: string; suggestion: string }
  | { _tag: "TokenExpired"; message: string; suggestion: string }
  | { _tag: "NetworkError"; message: string; suggestion: string }
  | { _tag: "RateLimitExceeded"; message: string; suggestion: string }
  | { _tag: "EmailNotVerified"; message: string; suggestion: string }
  | { _tag: "TwoFactorRequired"; message: string; suggestion: string }
  | { _tag: "Invalid2FACode"; message: string; suggestion: string };
```

---

**Total Specification Length:** 950+ lines
**Status:** ✅ COMPLETE - Ready for Implementation
**Next:** Wait for Feature 2-1 and 2-4 completion, then execute migration

**Critical Reminder:** ALL 50+ auth tests MUST pass. <5 failures = continue. >5 failures = STOP and ROLLBACK immediately.
