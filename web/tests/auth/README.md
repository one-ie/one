# Auth System Tests

This directory contains comprehensive tests for the ONE platform authentication system.

## Authentication Methods Tested

1. **Email & Password** - Traditional signup/signin
2. **OAuth** - GitHub and Google OAuth
3. **Magic Links** - Passwordless email authentication
4. **Password Reset** - Secure password recovery
5. **Email Verification** - Email confirmation flow
6. **2FA (TOTP)** - Two-factor authentication

## Test Structure

```
test/auth/
├── README.md                 # This file
├── auth.test.ts             # Main auth test suite
├── email-password.test.ts   # Email/password auth tests
├── oauth.test.ts            # OAuth provider tests
├── magic-link.test.ts       # Magic link tests
├── password-reset.test.ts   # Password reset flow tests
├── email-verification.test.ts # Email verification tests
├── 2fa.test.ts              # Two-factor auth tests
└── utils.ts                 # Test utilities and helpers
```

## Running Tests

### All Auth Tests
```bash
bun test test/auth
```

### Specific Test File
```bash
bun test test/auth/email-password.test.ts
bun test test/auth/oauth.test.ts
bun test test/auth/magic-link.test.ts
```

### Watch Mode
```bash
bun test --watch test/auth
```

## Backend Connection

Tests connect to the backend Convex deployment at:
- **Backend URL**: `https://shocking-falcon-870.convex.cloud`
- **Deployment**: `prod:shocking-falcon-870`

Tests use the Convex mutations and queries defined in:
- `backend/convex/auth.ts` - Auth functions
- `backend/convex/schema.ts` - Database schema

## Environment Variables

Required environment variables (in `frontend/.env.local`):
```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
BETTER_AUTH_URL=http://localhost:4321
BETTER_AUTH_SECRET=your-secret-key-here

# OAuth (optional for OAuth tests)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (optional for email tests)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=tony@one.ie
```

## Test Data

Tests create test users with predictable email patterns:
- `test-user-{timestamp}@test.com` - For email/password tests
- `oauth-test-{timestamp}@test.com` - For OAuth tests
- `magic-link-{timestamp}@test.com` - For magic link tests

All test data is isolated and cleaned up after tests complete.

## Test Coverage

### ✅ Sign Up (Email & Password)
- [x] Create new user with email and password
- [x] Hash password securely (SHA-256)
- [x] Create session token
- [x] Validate email format
- [x] Prevent duplicate email registration
- [x] Rate limiting (3 per hour)

### ✅ Sign In (Email & Password)
- [x] Authenticate with valid credentials
- [x] Reject invalid email
- [x] Reject invalid password
- [x] Create session on success
- [x] Rate limiting (5 per 15 minutes)

### ✅ OAuth (GitHub & Google)
- [x] Sign in with OAuth provider
- [x] Create user if doesn't exist
- [x] Link to existing user by email
- [x] Create session on success
- [x] No password required for OAuth users

### ✅ Magic Links
- [x] Request magic link via email
- [x] Generate secure token (15 min expiry)
- [x] Send email with magic link
- [x] Authenticate with valid token
- [x] Reject expired tokens
- [x] Reject used tokens (one-time use)
- [x] Rate limiting (3 per hour)

### ✅ Password Reset
- [x] Request password reset via email
- [x] Generate secure reset token (1 hour expiry)
- [x] Send reset email with link
- [x] Validate reset token
- [x] Update password with valid token
- [x] Invalidate all sessions after reset
- [x] Reject expired tokens
- [x] Rate limiting (3 per hour)

### ✅ Email Verification
- [x] Send verification email on signup
- [x] Generate verification token (24 hour expiry)
- [x] Verify email with valid token
- [x] Mark user as verified
- [x] Reject expired tokens
- [x] Check verification status

### ✅ 2FA (TOTP)
- [x] Setup 2FA with secret
- [x] Generate backup codes (10 codes)
- [x] Verify and enable 2FA
- [x] Check 2FA status
- [x] Disable 2FA with password
- [x] Require password to disable

### ✅ Sessions
- [x] Create session on authentication
- [x] Validate session token
- [x] Get current user from session
- [x] Sign out (delete session)
- [x] Session expiry (30 days)

## Backend Implementation

The auth system is implemented in the backend using:

**Database Tables** (Convex schema):
- `users` - User accounts (email, passwordHash, name, emailVerified)
- `sessions` - Active user sessions (token, userId, expiresAt)
- `passwordResets` - Password reset tokens
- `emailVerifications` - Email verification tokens
- `magicLinks` - Magic link tokens
- `twoFactorAuth` - 2FA settings (secret, backupCodes, enabled)

**Auth Functions** (backend/convex/auth.ts):
- `signUp` - Create new user account
- `signIn` - Authenticate user
- `signOut` - End session
- `signInWithOAuth` - OAuth authentication
- `signInWithMagicLink` - Magic link authentication
- `requestPasswordReset` - Request password reset
- `resetPassword` - Update password with token
- `verifyEmail` - Confirm email address
- `setup2FA` - Initialize 2FA
- `verify2FA` - Enable 2FA
- `disable2FA` - Disable 2FA
- `getCurrentUser` - Get authenticated user
- `get2FAStatus` - Check 2FA status

**Security Features**:
- Password hashing with SHA-256 (use bcrypt in production)
- Secure token generation (32-byte random)
- Rate limiting via @convex-dev/rate-limiter
- Session expiry (30 days)
- Token expiry (15 min - 24 hours depending on type)
- One-time use tokens (magic links, reset tokens)
- Email verification flow
- 2FA with backup codes

**Email Delivery**:
- Resend integration via @convex-dev/resend
- Transactional emails for:
  - Email verification
  - Password reset
  - Magic links
- Async email sending (non-blocking)

## Next Steps

After verifying auth works:
1. Implement API key authentication (see `one/things/plans/separate.md`)
2. Create Hono API layer for REST endpoints
3. Migrate frontend to use API client instead of direct Convex
4. Add API versioning (/api/v1)
5. Implement rate limiting at API layer
6. Add monitoring and logging

## Related Documentation

- [Backend Auth Implementation](../../../backend/convex/auth.ts)
- [Frontend Auth Client](../../src/lib/auth-client.ts)
- [Migration Plan](../../../one/things/plans/separate.md)
- [Convex Schema](../../../backend/convex/schema.ts)
