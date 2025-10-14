# Better Auth + ONE Ontology: Universal Authentication

**Integrating Better Auth with the ONE 6-dimension ontology using Effect.ts**

---

## Executive Summary

Better Auth is already integrated in our `/frontend` with 6 authentication methods. This plan shows how to make it work with **the ONE 6-dimension ontology** and **ANY backend** (Convex, Supabase, Neon, WordPress) using Effect.ts and the DataProvider pattern.

**Key Insight:** Auth maps perfectly to the 6 dimensions: organizations partition auth data, people are the authorized users, sessions are connections, auth actions are events, and all operations use Effect.ts for type-safety.

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│         Frontend (Astro + React)                        │
│  - Better Auth UI (6 auth methods)                     │
│  - Effect.ts AuthService (type-safe)                   │
│  - useEffectRunner hook                                │
│  - Backend-agnostic via DataProvider                   │
└────────────────┬────────────────────────────────────────┘
                 │ Effect.ts + DataProvider
                 ↓
┌─────────────────────────────────────────────────────────┐
│         AuthService (Effect.ts)                         │
│  - signUp → creates person (dimension 2) + event       │
│  - signIn → creates session connection + event         │
│  - signOut → deletes session connection + event        │
│  - All operations org-scoped & backend-agnostic        │
└────────────────┬────────────────────────────────────────┘
                 │ DataProvider Interface
                 ↓
┌─────────────────────────────────────────────────────────┐
│         ONE 6-Dimension Ontology                        │
│                                                         │
│  1. Organizations: Multi-tenant partitioning            │
│     - Each auth operation scoped to organizationId     │
│     - Perfect data isolation                           │
│                                                         │
│  2. People: Users & authorization                       │
│     - type: "creator" thing with role property         │
│     - properties: { email, emailVerified, role }       │
│     - roles: platform_owner, org_owner, org_user       │
│                                                         │
│  3. Things: Session devices (optional)                  │
│     - type: "device" for session tracking              │
│                                                         │
│  4. Connections: Sessions & OAuth links                 │
│     - type: "session" → Active user sessions           │
│     - type: "oauth_account" → OAuth providers          │
│     - metadata: { token, expiresAt, provider }         │
│                                                         │
│  5. Events: Complete auth audit trail                   │
│     - type: "sign_up", "sign_in", "sign_out"          │
│     - actorId: userId (always required)                │
│     - organizationId: which org (always required)      │
│                                                         │
│  6. Knowledge: Auth patterns for AI                     │
│     - Login behavior patterns                          │
│     - Security anomaly detection                       │
│     - User preference learning                         │
└────────────────┬────────────────────────────────────────┘
                 │
     ┌───────────┼───────────┬───────────┬───────────┐
     ↓           ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Convex  │ │Supabase │ │   Neon   │ │WordPress │ │ Notion   │
│Provider │ │Provider │ │ Provider │ │ Provider │ │ Provider │
└─────────┘ └─────────┘ └──────────┘ └──────────┘ └──────────┘
```

**What This Achieves:**
- ✅ Organizations → multi-tenant auth (perfect isolation)
- ✅ People → users with roles (authorization built-in)
- ✅ Things → optional device tracking
- ✅ Connections → sessions & OAuth (automatic cleanup)
- ✅ Events → complete audit trail (security & analytics)
- ✅ Knowledge → AI learns auth patterns
- ✅ Effect.ts → type-safe, composable operations
- ✅ Backend-agnostic → swap providers with one line

---

## Table of Contents

1. [ONE Ontology Mapping](#one-ontology-mapping)
2. [Effect.ts AuthService](#effectts-authservice)
3. [DataProvider Integration](#dataprovider-integration)
4. [Backend Implementations](#backend-implementations)
5. [React Components](#react-components)
6. [Session Management](#session-management)
7. [Multi-Tenancy](#multi-tenancy)
8. [Better Auth Compatibility Layer](#better-auth-compatibility-layer)
9. [Testing](#testing)
10. [Migration Strategy](#migration-strategy)

---

## ONE 6-Dimension Mapping

**Better Auth traditionally uses 4 separate tables. In ONE, we map these to the 6-dimension ontology.**

### 1. Organizations → Multi-Tenant Isolation

```typescript
// Dimension 1: Organizations
// Every auth operation belongs to an organization
{
  _id: Id<'organizations'>,
  name: string,
  slug: string,                       // URL-friendly (e.g., "fitnesspro")
  status: 'active' | 'suspended',
  plan: 'starter' | 'pro' | 'enterprise',
  limits: {
    users: number,                    // Max users in this org
    storage: number,
    apiCalls: number,
    inference: number
  },
  settings: {
    allowSignups: boolean,            // Can users self-register?
    requireEmailVerification: boolean,
    enableTwoFactor: boolean,
    allowedDomains?: string[]        // Email domain restrictions
  },
  createdAt: number,
  updatedAt: number
}
```

**Benefits:**
- ✅ Perfect multi-tenant isolation → users in Org A can't see Org B
- ✅ Per-org auth settings → different signup rules per org
- ✅ Per-org quotas → user limits, rate limits
- ✅ Per-org billing → track auth costs per organization

### 2. People → Separate Table (Dimension 2)

```typescript
// Dimension 2: People (SEPARATE TABLE)
// Better Auth "user" → ONE "people" table
{
  _id: Id<'people'>,                    // NOT Id<'things'>!
  email: string,                        // Better Auth: email
  username: string,                     // Unique username
  displayName: string,                  // Display name
  emailVerified: boolean,               // Better Auth: emailVerified
  password?: string,                    // Hashed (if email/password auth)
  image?: string,                       // Avatar URL

  // CRITICAL: Role determines access level
  role: "platform_owner" | "org_owner" | "org_user" | "customer",

  // Organization context
  organizationId: Id<'organizations'>,  // Primary organization
  organizations: Id<'organizations'>[],  // All orgs this person belongs to
  permissions?: string[],               // Fine-grained permissions

  // 2FA
  twoFactorEnabled?: boolean,
  twoFactorSecret?: string,
  backupCodes?: string[],

  // OAuth (stored in connections, but basic info here)
  oauthProviders?: Array<{
    provider: "google" | "github" | "apple",
    providerId: string
  }>,

  // Profile
  bio?: string,
  location?: string,
  website?: string,

  createdAt: number,
  updatedAt: number
}
```

**Why People Are NOT Things:**

1. **Different Purpose:**
   - **People** → Authorization & governance (who can do what)
   - **Things** → Domain entities (what exists in the system)

2. **Different Relationships:**
   - **People** → Own things, act on things, authorize actions
   - **Things** → Owned by people, acted upon by people

3. **Different Lifecycle:**
   - **People** → Permanent identity, cross-org membership
   - **Things** → Created/deleted within org context

**Benefits:**
- ✅ People are first-class dimension → clear authorization model
- ✅ Role-based access → platform_owner can access all orgs
- ✅ Multi-org membership → same person, multiple organizations
- ✅ People act on things → actorId in events always references people
- ✅ Clean separation → auth logic vs domain logic

### 3. Things → Optional Device Tracking

```typescript
// Dimension 3: Things
// Optional: Track devices/browsers for session management
{
  _id: Id<'things'>,
  thingType: "device",
  name: string,                         // E.g., "iPhone 15 Pro - Safari"
  organizationId: Id<'organizations'>,
  status: "active",
  properties: {
    userAgent: string,
    deviceType: "mobile" | "desktop" | "tablet",
    os: string,                         // "iOS 17.5"
    browser: string,                    // "Safari 17"
    ipAddress?: string,
    lastSeen: number
  },
  createdAt: number,
  updatedAt: number
}
```

**Benefits:**
- ✅ Track which devices user is logged in from
- ✅ Security: Detect suspicious login locations
- ✅ UX: "Sign out from all devices except this one"

### 4. Connections → Sessions & OAuth Links

```typescript
// Dimension 4: Connections
// Better Auth "session" → ONE connection (type: "session")
{
  _id: Id<'connections'>,
  fromPersonId: Id<'people'>,           // Dimension 2: Person (NOT thing!)
  toThingId: Id<'things'> | null,       // Dimension 3: Device (optional)
  relationshipType: "session",          // Dimension 4: Connection type
  organizationId: Id<'organizations'>,  // Dimension 1: Org scope
  status: "active" | "expired" | "revoked",
  metadata: {
    token: string,                      // Session token (hashed)
    expiresAt: number,                  // Unix timestamp
    ipAddress?: string,
    userAgent?: string,
    method: "email" | "google" | "github" | "magic_link",
    lastActivity: number,               // Track session activity
    revokedAt?: number,
    revokedReason?: string
  },
  createdAt: number,
  updatedAt: number
}
```

**Benefits:**
- ✅ Sessions connect people to devices → clear actor model
- ✅ Automatic cleanup → delete expired connections
- ✅ Real-time sync → revoke session = instant logout everywhere
- ✅ Analytics → count active sessions per person
- ✅ Security → detect concurrent sessions from different locations

**OAuth Account Connection:**

```typescript
// Better Auth "account" → ONE connection (type: "oauth_account")
{
  _id: Id<'connections'>,
  fromPersonId: Id<'people'>,           // Dimension 2: Person (NOT thing!)
  toThingId: Id<'things'>,              // OAuth provider thing
  relationshipType: "oauth_account",    // Dimension 4
  organizationId: Id<'organizations'>,  // Dimension 1
  status: "active" | "revoked",
  metadata: {
    provider: "google" | "github" | "apple",
    providerAccountId: string,          // External user ID
    accessToken?: string,               // Encrypted
    refreshToken?: string,              // Encrypted
    idToken?: string,                   // JWT from provider
    tokenExpiresAt?: number,
    scope?: string,                     // OAuth scopes granted
    lastSync: number                    // Last token refresh
  },
  createdAt: number,
  updatedAt: number
}
```

**Benefits:**
- ✅ OAuth accounts connect people to OAuth providers
- ✅ Multiple providers → person can have Google + GitHub + Apple
- ✅ Token refresh → update connection metadata
- ✅ Revocation → disconnect OAuth provider

**Note on Schema Design:**
The connection schema may need to support both:
- `fromPersonId: Id<'people'>` for people → thing connections
- `fromThingId: Id<'things'>` for thing → thing connections

Or use a union type with discriminator for flexibility.

### 5. Events → Complete Auth Audit Trail

**Verification Tokens as Events:**

```typescript
// Dimension 5: Events
// Better Auth "verification" → ONE event (type: "verification_token_created")
{
  _id: Id<'events'>,
  eventType: "verification_token_created",
  actorId: Id<'people'>,                  // Dimension 2: Person who requested it
  targetId?: Id<'people'>,                // Dimension 2: Person being verified
  organizationId: Id<'organizations'>,    // Dimension 1: Org scope
  metadata: {
    identifier: string,                   // Email or phone
    token: string,                        // Verification token (hashed)
    verificationType: "email_verification" | "password_reset" | "magic_link",
    expiresAt: number,
    used: boolean,                        // Consumed?
    usedAt?: number,
    ipAddress?: string,
    userAgent?: string
  },
  timestamp: number,
  createdAt: number
}
```

**All Auth Actions as Events:**

```typescript
// Log ALL auth actions for complete audit trail
{
  _id: Id<'events'>,
  eventType: "sign_up" | "sign_in" | "sign_out" | "password_reset" | "email_verified" | "oauth_linked",
  actorId: Id<'people'>,                  // Dimension 2: Person who did it (REQUIRED)
  targetId?: Id<'things'>,                // Dimension 3: Target (session connection, device)
  organizationId: Id<'organizations'>,    // Dimension 1: Org scope (REQUIRED)
  metadata: {
    method: "email" | "google" | "github" | "magic_link",
    ipAddress: string,
    userAgent: string,
    success: boolean,
    errorReason?: string,                 // If failed
    sessionId?: Id<'connections'>,        // Reference to session connection
    deviceId?: Id<'things'>,              // Reference to device thing
    location?: {                          // Geo data
      country: string,
      city: string,
      coordinates?: [number, number]
    },
    riskScore?: number                    // Security risk assessment (0-100)
  },
  timestamp: number,
  createdAt: number
}
```

**Benefits:**
- ✅ Complete audit trail → every auth action logged with actorId
- ✅ Security analytics → detect suspicious patterns (impossible travel, brute force)
- ✅ User timeline → see complete login history
- ✅ Compliance → GDPR, SOC2 audit requirements
- ✅ Debugging → trace auth issues with full context
- ✅ Real-time monitoring → stream events to security tools

### 6. Knowledge → Auth Pattern Intelligence

```typescript
// Dimension 6: Knowledge
// Embed auth events & user behavior for AI-powered security
{
  _id: Id<'knowledge'>,
  knowledgeType: "auth_behavior_pattern",
  text: string,                           // Human-readable description
  embedding: number[],                    // Vector embedding (768-dim)
  embeddingModel: "text-embedding-3-small",
  sourcePersonId: Id<'people'>,           // Dimension 2: Person this pattern belongs to
  organizationId: Id<'organizations'>,    // Dimension 1: Org scope
  chunk: {
    personId: Id<'people'>,               // Person ID
    eventType: string,
    timestamp: number,
    ipAddress: string,
    location: { country: string, city: string },
    deviceType: string,
    success: boolean
  },
  labels: [
    "auth:login_pattern",
    "security:normal_behavior",
    "time:weekday_morning"
  ],
  metadata: {
    behaviorType: "normal" | "suspicious" | "anomalous",
    confidence: number,                   // 0-1
    riskFactors?: string[],               // ["new_device", "new_location"]
    relatedEvents: Id<'events'>[]         // Related auth events
  },
  createdAt: number,
  updatedAt: number
}
```

**Benefits:**
- ✅ AI learns normal auth patterns per user/org
- ✅ Detect anomalies: "User always logs in from NYC, now trying from Russia"
- ✅ Behavioral analysis: "User logs in Mon-Fri 9am-5pm, now 3am Sunday is suspicious"
- ✅ RAG for security: "Show me similar suspicious login patterns"
- ✅ Proactive alerts: "Unusual login activity detected"

**Example Use Cases:**

1. **Security Anomaly Detection:**
   ```typescript
   // Query knowledge for similar auth patterns
   const similarPatterns = await queryKnowledge({
     organizationId,
     query: "user login from new location",
     filters: {
       behaviorType: "suspicious",
       labels: ["security:anomaly"]
     },
     k: 5
   })

   // If similar patterns were flagged before → increase risk score
   if (similarPatterns.length > 3) {
     riskScore += 30
   }
   ```

2. **Person Preference Learning:**
   ```typescript
   // AI learns: "This person prefers Google OAuth, dislikes email/password"
   const personPreferences = await queryKnowledge({
     sourcePersonId: personId,
     labels: ["auth:preference"]
   })

   // Suggest preferred auth method in UI
   suggestedMethod = personPreferences[0]?.chunk.preferredMethod || "email"
   ```

3. **Compliance & Audit:**
   ```typescript
   // Vector search for all auth events matching audit criteria
   const auditEvents = await queryKnowledge({
     organizationId,
     query: "admin login from outside US",
     labels: ["compliance:geographic_restriction"],
     timeRange: { start: lastQuarter, end: now }
   })
   ```

---

## The Complete 6-Dimension Picture

**How all 6 dimensions work together for auth:**

```
1. Organization → "fitnesspro" (Id<'organizations'>)
   └─ Multi-tenant isolation boundary
   └─ Settings: allowSignups=true, requireEmailVerification=true

2. Person → "john@fitnesspro.com" (Id<'people'>)
   └─ Separate people table (NOT a thing!)
   └─ role: "org_user"
   └─ organizationId: fitnesspro_id

3. Thing → "John's iPhone" (Id<'things'>, type: "device")
   └─ Optional device tracking
   └─ properties: { os: "iOS 17", browser: "Safari" }

4. Connection → Session (Id<'connections'>)
   └─ fromPersonId: john_person_id (NOT thingId!)
   └─ toThingId: iphone_thing_id
   └─ type: "session", expiresAt: 7 days

5. Event → "sign_in" (Id<'events'>)
   └─ actorId: john_person_id (references people table)
   └─ method: "google", success: true
   └─ organizationId: fitnesspro_id

6. Knowledge → Auth pattern (Id<'knowledge'>)
   └─ sourcePersonId: john_person_id
   └─ AI learns: John always logs in from iPhone, weekdays, SF
```

**When John logs in from a new Android device in Moscow:**

1. **Organization**: Still "fitnesspro" ✅
2. **Person**: John (`Id<'people'>`) ✅
3. **Thing**: New "John's Android" device created (`Id<'things'>`, type: "device")
4. **Connection**: New session created
   - fromPersonId: john_person_id
   - toThingId: android_device_id
   - type: "session"
5. **Event**: "sign_in" logged
   - actorId: john_person_id (Person ID!)
   - targetId: android_device_id
   - metadata: { location: "Moscow, Russia" }
6. **Knowledge**: Vector search finds no similar patterns
   - AI flags as suspicious
   - Risk score: 85/100
   - 2FA required ⚠️

**Benefits of 6 Dimensions:**
- ✅ Perfect multi-tenant isolation (organizations)
- ✅ Clear authorization model (people with roles, NOT things)
- ✅ Device tracking (things)
- ✅ Session management (connections link people → devices)
- ✅ Complete audit trail (events with people as actors)
- ✅ AI-powered security (knowledge learns per person)

---

## Effect.ts AuthService

**Wrap all auth operations in Effect.ts for type-safety and composability.**

### AuthService Interface

```typescript
// frontend/src/services/AuthService.ts
import { Effect, Context } from 'effect'
import { DataProvider, ThingNotFoundError } from '@/providers/DataProvider'

// Auth-specific errors
export class AuthenticationError {
  readonly _tag = 'AuthenticationError'
  constructor(readonly reason: string) {}
}

export class InvalidCredentialsError {
  readonly _tag = 'InvalidCredentialsError'
}

export class EmailAlreadyExistsError {
  readonly _tag = 'EmailAlreadyExistsError'
  constructor(readonly email: string) {}
}

// User type (thing with type: "person")
export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image?: string
}

// Session type (connection with type: "session")
export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: number
  method: "email" | "google" | "github"
}

// AuthService interface
export interface AuthServiceInterface {
  // Sign up → creates thing (type: person) + logs event
  signUp: (params: {
    email: string
    password: string
    name: string
    organizationId?: string
  }) => Effect.Effect<User, EmailAlreadyExistsError | Error>

  // Sign in → creates connection (type: session) + logs event
  signIn: (params: {
    email: string
    password: string
    organizationId?: string
  }) => Effect.Effect<
    { user: User; session: Session },
    InvalidCredentialsError | Error
  >

  // OAuth sign in → creates thing + connection (oauth_account) + connection (session)
  signInWithOAuth: (params: {
    provider: "google" | "github" | "apple"
    code: string
    organizationId?: string
  }) => Effect.Effect<
    { user: User; session: Session },
    AuthenticationError | Error
  >

  // Sign out → deletes connection (session) + logs event
  signOut: (sessionToken: string) => Effect.Effect<void, Error>

  // Get current session → queries connection (type: session)
  getSession: (sessionToken: string) => Effect.Effect<
    { user: User; session: Session } | null,
    Error
  >

  // Verify email → updates thing properties.emailVerified + logs event
  verifyEmail: (token: string) => Effect.Effect<void, Error>

  // Reset password → creates event (verification_token) → updates thing password
  requestPasswordReset: (email: string) => Effect.Effect<void, Error>
  resetPassword: (params: {
    token: string
    newPassword: string
  }) => Effect.Effect<void, Error>
}

// AuthService implementation (backend-agnostic via DataProvider)
export class AuthService extends Effect.Service<AuthService>()(
  'AuthService',
  {
    effect: Effect.gen(function* () {
      const provider = yield* DataProvider

      return {
        // Sign up: create user thing + log event
        signUp: (params) =>
          Effect.gen(function* () {
            // 1. Check if email exists
            const existing = yield* provider.things.list({
              type: 'person',
              organizationId: params.organizationId,
              filters: { 'properties.email': params.email }
            }).pipe(
              Effect.catchAll(() => Effect.succeed([]))
            )

            if (existing.length > 0) {
              return yield* Effect.fail(
                new EmailAlreadyExistsError(params.email)
              )
            }

            // 2. Hash password (use bcrypt in real app)
            const hashedPassword = yield* hashPassword(params.password)

            // 3. Create user thing
            const userId = yield* provider.things.create({
              type: 'person',
              name: params.name,
              organizationId: params.organizationId,
              properties: {
                email: params.email,
                emailVerified: false,
                password: hashedPassword
              }
            })

            // 4. Log sign_up event
            yield* provider.events.log({
              type: 'sign_up',
              actorId: userId,
              organizationId: params.organizationId,
              metadata: {
                method: 'email',
                success: true
              }
            })

            // 5. Return user
            return {
              id: userId,
              email: params.email,
              name: params.name,
              emailVerified: false
            }
          }),

        // Sign in: verify credentials + create session connection
        signIn: (params) =>
          Effect.gen(function* () {
            // 1. Find user by email
            const users = yield* provider.things.list({
              type: 'person',
              organizationId: params.organizationId,
              filters: { 'properties.email': params.email }
            })

            if (users.length === 0) {
              return yield* Effect.fail(new InvalidCredentialsError())
            }

            const user = users[0]

            // 2. Verify password
            const valid = yield* verifyPassword(
              params.password,
              user.properties.password
            )

            if (!valid) {
              // Log failed attempt
              yield* provider.events.log({
                type: 'sign_in',
                actorId: user._id,
                organizationId: params.organizationId,
                metadata: {
                  method: 'email',
                  success: false,
                  errorReason: 'invalid_credentials'
                }
              })

              return yield* Effect.fail(new InvalidCredentialsError())
            }

            // 3. Generate session token
            const token = yield* generateSecureToken()

            // 4. Create session connection
            const sessionId = yield* provider.connections.create({
              fromThingId: user._id,
              toThingId: null, // No device tracking yet
              relationshipType: 'session',
              organizationId: params.organizationId,
              metadata: {
                token,
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
                method: 'email'
              }
            })

            // 5. Log successful sign_in event
            yield* provider.events.log({
              type: 'sign_in',
              actorId: user._id,
              targetId: sessionId,
              organizationId: params.organizationId,
              metadata: {
                method: 'email',
                success: true
              }
            })

            return {
              user: {
                id: user._id,
                email: user.properties.email,
                name: user.name,
                emailVerified: user.properties.emailVerified,
                image: user.properties.image
              },
              session: {
                id: sessionId,
                userId: user._id,
                token,
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
                method: 'email'
              }
            }
          }),

        // Sign out: delete session connection + log event
        signOut: (sessionToken) =>
          Effect.gen(function* () {
            // 1. Find session connection by token
            const sessions = yield* provider.connections.list({
              relationshipType: 'session',
              filters: { 'metadata.token': sessionToken }
            })

            if (sessions.length === 0) {
              return // Session already gone
            }

            const session = sessions[0]

            // 2. Delete session connection
            yield* provider.connections.delete(session._id)

            // 3. Log sign_out event
            yield* provider.events.log({
              type: 'sign_out',
              actorId: session.fromThingId,
              targetId: session._id,
              metadata: {
                method: session.metadata.method,
                success: true
              }
            })
          }),

        // Get session: query active session connection
        getSession: (sessionToken) =>
          Effect.gen(function* () {
            // 1. Find session connection by token
            const sessions = yield* provider.connections.list({
              relationshipType: 'session',
              filters: { 'metadata.token': sessionToken }
            }).pipe(
              Effect.catchAll(() => Effect.succeed([]))
            )

            if (sessions.length === 0) {
              return null
            }

            const session = sessions[0]

            // 2. Check expiration
            if (session.metadata.expiresAt < Date.now()) {
              // Session expired - delete it
              yield* provider.connections.delete(session._id)
              return null
            }

            // 3. Get user thing
            const user = yield* provider.things.get(session.fromThingId)

            return {
              user: {
                id: user._id,
                email: user.properties.email,
                name: user.name,
                emailVerified: user.properties.emailVerified,
                image: user.properties.image
              },
              session: {
                id: session._id,
                userId: user._id,
                token: session.metadata.token,
                expiresAt: session.metadata.expiresAt,
                method: session.metadata.method
              }
            }
          }),

        // Additional methods: verifyEmail, requestPasswordReset, etc.
        // ... (similar pattern using provider.things, provider.events)
      }
    }),
    dependencies: [DataProvider]
  }
) {}

// Helper functions (use crypto libraries in production)
const hashPassword = (password: string) =>
  Effect.tryPromise({
    try: async () => {
      // Use bcrypt or argon2 in production
      return `hashed_${password}`
    },
    catch: (error) => new Error(String(error))
  })

const verifyPassword = (password: string, hash: string) =>
  Effect.tryPromise({
    try: async () => {
      // Use bcrypt.compare or argon2.verify in production
      return hash === `hashed_${password}`
    },
    catch: (error) => new Error(String(error))
  })

const generateSecureToken = () =>
  Effect.sync(() => {
    // Use crypto.randomBytes in production
    return Math.random().toString(36).substring(2, 15)
  })
```

**Key Points:**
- ✅ Uses `DataProvider` → backend-agnostic (works with Convex, Supabase, WordPress)
- ✅ All operations wrapped in `Effect.gen` → type-safe, composable
- ✅ Users stored as things (type: person)
- ✅ Sessions stored as connections (type: session)
- ✅ All actions logged as events
- ✅ Multi-tenant by default (organizationId)

---

## DataProvider Integration

**AuthService depends on DataProvider → works with ANY backend**

```typescript
// frontend/src/providers/DataProvider.ts
export interface DataProvider {
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>
    list: (params: { type: ThingType; organizationId?: string; filters?: any })
      => Effect.Effect<Thing[], Error>
    create: (input: { type: ThingType; name: string; properties: any })
      => Effect.Effect<string, Error>
    update: (id: string, updates: Partial<Thing>) => Effect.Effect<void, Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  connections: {
    create: (input: {
      fromThingId: string
      toThingId: string | null
      relationshipType: ConnectionType
      metadata?: any
    }) => Effect.Effect<string, Error>
    list: (params: { relationshipType: ConnectionType; filters?: any })
      => Effect.Effect<Connection[], Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  events: {
    log: (event: {
      type: EventType
      actorId: string
      targetId?: string
      metadata?: any
    }) => Effect.Effect<void, Error>
  }
}
```

**Backend Providers implement this interface:**

### Convex Provider (Example)

```typescript
// frontend/src/providers/convex/ConvexProvider.ts
import { Effect, Layer } from 'effect'
import { ConvexHttpClient } from 'convex/browser'
import { DataProvider } from '../DataProvider'
import { api } from './api'

export class ConvexProvider implements DataProvider {
  constructor(private client: ConvexHttpClient) {}

  things = {
    create: (input) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.things.create, input),
        catch: (error) => new Error(String(error))
      }),

    list: (params) =>
      Effect.tryPromise({
        try: () => this.client.query(api.things.list, params),
        catch: (error) => new Error(String(error))
      }),

    // ... other methods
  }

  connections = {
    create: (input) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.connections.create, input),
        catch: (error) => new Error(String(error))
      }),

    // ... other methods
  }

  events = {
    log: (event) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.events.log, event),
        catch: (error) => new Error(String(error))
      })
  }
}

// Factory function
export const convexProvider = (config: { url: string }) =>
  Layer.succeed(
    DataProvider,
    new ConvexProvider(new ConvexHttpClient(config.url))
  )
```

**Result:**
- AuthService calls `provider.things.create()` → works with Convex
- Change to `supabaseProvider()` → works with Supabase
- Change to `wordpressProvider()` → works with WordPress
- **Same AuthService code, different backend**

---

## React Components

**Use AuthService in components via `useEffectRunner` hook**

### Sign Up Component

```tsx
// frontend/src/components/auth/SignUpForm.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { AuthService } from '@/services/AuthService'
import { Effect } from 'effect'
import { useState } from 'react'

export function SignUpForm({ organizationId }: { organizationId: string }) {
  const { run, loading, error } = useEffectRunner()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Define Effect program using AuthService
    const program = Effect.gen(function* () {
      const auth = yield* AuthService

      // Sign up → creates thing (type: person) + logs event
      const user = yield* auth.signUp({
        ...formData,
        organizationId
      })

      return user
    }).pipe(
      // Handle specific errors
      Effect.catchTag('EmailAlreadyExistsError', (err) =>
        Effect.fail(new Error(`Email ${err.email} is already registered`))
      )
    )

    // Run Effect program
    const user = await run(program, {
      onSuccess: (user) => {
        // Redirect to verify email page
        window.location.href = '/verify-email'
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full Name"
        required
      />

      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />

      {error && (
        <div className="text-red-600">{error}</div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

### Sign In Component

```tsx
// frontend/src/components/auth/SignInForm.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { AuthService } from '@/services/AuthService'
import { Effect } from 'effect'
import { useState } from 'react'

export function SignInForm({ organizationId }: { organizationId: string }) {
  const { run, loading, error } = useEffectRunner()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Define Effect program
    const program = Effect.gen(function* () {
      const auth = yield* AuthService

      // Sign in → creates connection (type: session) + logs event
      const result = yield* auth.signIn({
        ...formData,
        organizationId
      })

      return result
    }).pipe(
      // Handle invalid credentials
      Effect.catchTag('InvalidCredentialsError', () =>
        Effect.fail(new Error('Invalid email or password'))
      )
    )

    // Run Effect program
    await run(program, {
      onSuccess: ({ user, session }) => {
        // Store session token in cookie/localStorage
        document.cookie = `session=${session.token}; path=/; max-age=${7 * 24 * 60 * 60}`

        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />

      {error && (
        <div className="text-red-600">{error}</div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <a href="/forgot-password" className="text-sm text-blue-600">
        Forgot password?
      </a>
    </form>
  )
}
```

### OAuth Sign In Button

```tsx
// frontend/src/components/auth/OAuthButton.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { AuthService } from '@/services/AuthService'
import { Effect } from 'effect'

interface Props {
  provider: 'google' | 'github' | 'apple'
  organizationId: string
}

export function OAuthButton({ provider, organizationId }: Props) {
  const { run, loading } = useEffectRunner()

  const handleOAuth = async () => {
    // 1. Redirect to OAuth provider
    const redirectUrl = `${window.location.origin}/auth/callback/${provider}`
    const authUrl = getOAuthUrl(provider, redirectUrl)

    window.location.href = authUrl
  }

  return (
    <button onClick={handleOAuth} disabled={loading}>
      {loading ? 'Redirecting...' : `Continue with ${capitalize(provider)}`}
    </button>
  )
}

// OAuth callback page
// frontend/src/pages/auth/callback/[provider].astro
---
import { AuthService } from '@/services/AuthService'
import { Effect } from 'effect'
import { ClientLayer } from '@/services/ClientLayer'

const { provider } = Astro.params
const code = Astro.url.searchParams.get('code')

if (!code) {
  return Astro.redirect('/signin?error=no_code')
}

// Sign in with OAuth
const program = Effect.gen(function* () {
  const auth = yield* AuthService

  return yield* auth.signInWithOAuth({
    provider: provider as 'google' | 'github',
    code,
    organizationId: Astro.locals.organizationId
  })
})

try {
  const { user, session } = await Effect.runPromise(
    program.pipe(Effect.provide(ClientLayer))
  )

  // Set session cookie
  Astro.cookies.set('session', session.token, {
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    httpOnly: true,
    secure: true
  })

  return Astro.redirect('/dashboard')
} catch (error) {
  return Astro.redirect(`/signin?error=${error.message}`)
}
---
```

**Key Points:**
- ✅ Components use `useEffectRunner` hook
- ✅ All auth operations wrapped in `Effect.gen`
- ✅ Typed error handling with `catchTag`
- ✅ Backend-agnostic → AuthService uses DataProvider
- ✅ Sessions stored as connections → automatic real-time sync

---

## Backend Implementations

**Each backend implements the ontology differently, but AuthService stays the same**

### Convex Backend

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // Users = things with type: "person"
  things: defineTable({
    type: v.string(),              // "person", "course", "product", etc.
    name: v.string(),
    organizationId: v.string(),
    status: v.string(),
    properties: v.any(),           // { email, emailVerified, password, ... }
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_type", ["type"])
    .index("by_organization", ["organizationId"])
    .index("by_email", ["properties.email"]), // For fast user lookup

  // Sessions = connections with relationshipType: "session"
  connections: defineTable({
    fromThingId: v.string(),       // User ID
    toThingId: v.union(v.string(), v.null()),  // Device ID (optional)
    relationshipType: v.string(),  // "session", "oauth_account", etc.
    organizationId: v.string(),
    status: v.string(),
    metadata: v.any(),             // { token, expiresAt, method, ... }
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_type", ["relationshipType"])
    .index("by_from", ["fromThingId"])
    .index("by_token", ["metadata.token"]), // For fast session lookup

  // Auth events = events with type: "sign_up", "sign_in", etc.
  events: defineTable({
    type: v.string(),              // "sign_up", "sign_in", "sign_out", etc.
    actorId: v.string(),
    targetId: v.optional(v.string()),
    organizationId: v.string(),
    metadata: v.any(),
    timestamp: v.number(),
    createdAt: v.number()
  })
    .index("by_type", ["type"])
    .index("by_actor", ["actorId"])
    .index("by_timestamp", ["timestamp"])
})
```

**Result:** Users, sessions, OAuth accounts all stored in the ontology!

### Supabase Backend

```sql
-- Users = things with type: "person"
CREATE TABLE things (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  status TEXT NOT NULL,
  properties JSONB NOT NULL,  -- { email, emailVerified, password, ... }
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL
);

CREATE INDEX idx_things_type ON things(type);
CREATE INDEX idx_things_email ON things((properties->>'email'));

-- Sessions = connections with relationshipType: "session"
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fromThingId" TEXT NOT NULL,
  "toThingId" TEXT,
  "relationshipType" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB NOT NULL,  -- { token, expiresAt, method, ... }
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL
);

CREATE INDEX idx_connections_type ON connections("relationshipType");
CREATE INDEX idx_connections_token ON connections((metadata->>'token'));

-- Auth events = events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "targetId" TEXT,
  "organizationId" TEXT NOT NULL,
  metadata JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  "createdAt" BIGINT NOT NULL
);

CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_actor ON events("actorId");
```

**Result:** Same ontology, different database (PostgreSQL instead of Convex)

---

## Session Management

**Sessions are connections → automatic lifecycle management**

### Session Middleware

```typescript
// frontend/src/middleware.ts
import { defineMiddleware } from 'astro:middleware'
import { AuthService } from '@/services/AuthService'
import { Effect } from 'effect'
import { ClientLayer } from '@/services/ClientLayer'

export const onRequest = defineMiddleware(async (context, next) => {
  // Get session token from cookie
  const sessionToken = context.cookies.get('session')?.value

  if (!sessionToken) {
    context.locals.user = null
    context.locals.session = null
    return next()
  }

  // Verify session using AuthService
  const program = Effect.gen(function* () {
    const auth = yield* AuthService
    return yield* auth.getSession(sessionToken)
  })

  try {
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(ClientLayer))
    )

    if (result) {
      context.locals.user = result.user
      context.locals.session = result.session
    }
  } catch (error) {
    // Session invalid - clear cookie
    context.cookies.delete('session')
  }

  return next()
})
```

### Protected Routes

```astro
---
// frontend/src/pages/dashboard.astro
const user = Astro.locals.user

if (!user) {
  return Astro.redirect('/signin')
}
---

<Layout title="Dashboard">
  <h1>Welcome, {user.name}!</h1>
  <p>Email: {user.email}</p>
</Layout>
```

**Session Benefits:**
- ✅ Stored as connections → query active sessions
- ✅ Automatic expiration → status="expired" when expiresAt passed
- ✅ Real-time revocation → delete connection = logged out everywhere
- ✅ Analytics → count sessions per user, track login patterns

---

## Multi-Tenancy

**Users and sessions are automatically scoped to organizations**

### Organization-Based Sign Up

```typescript
// frontend/src/pages/[orgSlug]/signup.astro
---
import { SignUpForm } from '@/components/auth/SignUpForm'

// Get org from subdomain via middleware
const org = Astro.locals.organization

if (!org) {
  return Astro.redirect('/404')
}
---

<Layout title={`Sign up for ${org.name}`}>
  <h1>Create your {org.name} account</h1>

  <!-- SignUpForm automatically uses org.id -->
  <SignUpForm client:load organizationId={org._id} />
</Layout>
```

**How It Works:**
1. User visits `fitnesspro.one.ie/signup`
2. Middleware extracts `fitnesspro` → queries organization thing
3. Sign up form passes `organizationId` to AuthService
4. User thing created with `organizationId: fitnesspro_id`
5. Session connection created with `organizationId: fitnesspro_id`
6. All queries automatically filtered by `organizationId`

**Benefits:**
- ✅ Data isolation → users can't access other orgs
- ✅ Automatic scoping → all auth operations org-scoped
- ✅ Multi-org users → same email, different orgs
- ✅ Session tracking → see which org user is logged into

---

## Better Auth Compatibility Layer

**Optional: Wrap ONE's AuthService to match Better Auth API**

If you have existing Better Auth code and want to migrate gradually:

```typescript
// frontend/src/auth/better-auth-compat.ts
import { AuthService } from '@/services/AuthService'
import { Effect } from 'effect'
import { ClientLayer } from '@/services/ClientLayer'

// Better Auth API compatibility layer
export const betterAuth = {
  api: {
    signUp: {
      email: async (params: { email: string; password: string; name: string }) => {
        const program = Effect.gen(function* () {
          const auth = yield* AuthService
          return yield* auth.signUp({
            ...params,
            organizationId: getCurrentOrgId()
          })
        })

        return Effect.runPromise(program.pipe(Effect.provide(ClientLayer)))
      }
    },

    signIn: {
      email: async (params: { email: string; password: string }) => {
        const program = Effect.gen(function* () {
          const auth = yield* AuthService
          return yield* auth.signIn({
            ...params,
            organizationId: getCurrentOrgId()
          })
        })

        return Effect.runPromise(program.pipe(Effect.provide(ClientLayer)))
      }
    },

    signOut: async () => {
      const sessionToken = getSessionToken()
      if (!sessionToken) return

      const program = Effect.gen(function* () {
        const auth = yield* AuthService
        return yield* auth.signOut(sessionToken)
      })

      return Effect.runPromise(program.pipe(Effect.provide(ClientLayer)))
    },

    getSession: async () => {
      const sessionToken = getSessionToken()
      if (!sessionToken) return null

      const program = Effect.gen(function* () {
        const auth = yield* AuthService
        return yield* auth.getSession(sessionToken)
      })

      return Effect.runPromise(program.pipe(Effect.provide(ClientLayer)))
    }
  }
}

// Helper functions
function getCurrentOrgId(): string {
  // Extract from subdomain or context
  return globalThis.currentOrgId || ''
}

function getSessionToken(): string | null {
  // Read from cookie
  const match = document.cookie.match(/session=([^;]+)/)
  return match ? match[1] : null
}
```

**Result:** Existing Better Auth UI components work with ONE ontology!

---

## Testing

**Effect.ts test layers make testing easy**

```typescript
// frontend/src/services/__tests__/AuthService.test.ts
import { describe, it, expect } from 'vitest'
import { Effect, Layer } from 'effect'
import { AuthService } from '../AuthService'
import { DataProvider } from '@/providers/DataProvider'

// Mock DataProvider
const mockThings: any[] = []
const mockConnections: any[] = []
const mockEvents: any[] = []

const MockDataProvider = Layer.succeed(DataProvider, {
  things: {
    list: (params) =>
      Effect.succeed(
        mockThings.filter(t => t.type === params.type)
      ),

    create: (input) =>
      Effect.sync(() => {
        const id = `thing_${Date.now()}`
        mockThings.push({ _id: id, ...input })
        return id
      }),

    get: (id) =>
      Effect.succeed(mockThings.find(t => t._id === id)!)
  },

  connections: {
    create: (input) =>
      Effect.sync(() => {
        const id = `conn_${Date.now()}`
        mockConnections.push({ _id: id, ...input })
        return id
      }),

    list: (params) =>
      Effect.succeed(
        mockConnections.filter(c =>
          c.relationshipType === params.relationshipType
        )
      ),

    delete: (id) =>
      Effect.sync(() => {
        const index = mockConnections.findIndex(c => c._id === id)
        mockConnections.splice(index, 1)
      })
  },

  events: {
    log: (event) =>
      Effect.sync(() => {
        mockEvents.push(event)
      })
  }
})

describe('AuthService', () => {
  it('signs up a new user', async () => {
    const program = Effect.gen(function* () {
      const auth = yield* AuthService

      const user = yield* auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        organizationId: 'org_123'
      })

      return user
    })

    const user = await Effect.runPromise(
      program.pipe(
        Effect.provide(AuthService.Default),
        Effect.provide(MockDataProvider)
      )
    )

    expect(user.email).toBe('test@example.com')
    expect(user.name).toBe('Test User')
    expect(mockThings.length).toBe(1)
    expect(mockEvents.length).toBe(1) // sign_up event logged
  })

  it('signs in existing user', async () => {
    // Pre-populate mock user
    mockThings.push({
      _id: 'user_1',
      type: 'person',
      name: 'Test User',
      properties: {
        email: 'test@example.com',
        password: 'hashed_password123',
        emailVerified: true
      }
    })

    const program = Effect.gen(function* () {
      const auth = yield* AuthService

      const result = yield* auth.signIn({
        email: 'test@example.com',
        password: 'password123',
        organizationId: 'org_123'
      })

      return result
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(AuthService.Default),
        Effect.provide(MockDataProvider)
      )
    )

    expect(result.user.email).toBe('test@example.com')
    expect(result.session.userId).toBe('user_1')
    expect(mockConnections.length).toBe(1) // session connection created
    expect(mockEvents.length).toBe(1) // sign_in event logged
  })
})
```

**Key Point:** No mocking libraries needed! Effect.ts test layers provide real implementations.

---

## Migration Strategy

### Phase 1: Add AuthService Alongside Better Auth

Keep existing Better Auth, add AuthService:

```typescript
// frontend/src/auth/config.ts

// OLD: Better Auth (keep for now)
export const betterAuth = betterAuth({
  database: drizzleAdapter(db)
})

// NEW: AuthService (add alongside)
import { AuthService } from '@/services/AuthService'
import { ClientLayer } from '@/services/ClientLayer'

// Use both in parallel during migration
```

### Phase 2: Migrate Components One at a Time

```tsx
// OLD: Better Auth
import { useSession } from '@/auth/client'
const session = useSession()

// NEW: AuthService + Effect.ts
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { AuthService } from '@/services/AuthService'
const { run } = useEffectRunner()
const program = Effect.gen(function* () {
  const auth = yield* AuthService
  return yield* auth.getSession(token)
})
const session = await run(program)
```

### Phase 3: Remove Better Auth

Once all components migrated, remove Better Auth dependencies.

---

## Summary

### What We Achieve

✅ **Users = Things (type: person)**
- Works with all thing operations
- Can have connections (relationships, org membership)
- Can be actors in events (audit trail)
- Can be embedded in knowledge (AI context)

✅ **Sessions = Connections (type: session)**
- Real-time sync → revoke everywhere instantly
- Automatic expiration → query only active
- Analytics → count sessions, track patterns

✅ **Auth Events Logged**
- Complete audit trail
- Security analytics
- User timeline

✅ **Effect.ts Integration**
- Type-safe auth operations
- Composable workflows
- Consistent error handling
- Easy testing with test layers

✅ **Backend-Agnostic**
- AuthService uses DataProvider
- Works with Convex, Supabase, WordPress, Notion
- Swap backends by changing ONE line
- Same auth code, different backend

✅ **Multi-Tenant by Default**
- Users scoped to organizations
- Sessions scoped to organizations
- Data isolation automatic

### File Structure

```
frontend/src/
├── services/
│   ├── AuthService.ts             # Effect.ts auth service (uses DataProvider)
│   ├── ThingService.ts            # Generic thing operations
│   ├── ConnectionService.ts       # Generic connection operations
│   └── ClientLayer.ts             # Dependency injection
├── providers/
│   ├── DataProvider.ts            # Universal interface
│   ├── convex/
│   │   └── ConvexProvider.ts      # Convex implementation
│   ├── supabase/
│   │   └── SupabaseProvider.ts    # Supabase implementation
│   └── wordpress/
│       └── WordPressProvider.ts   # WordPress implementation
├── components/
│   └── auth/
│       ├── SignUpForm.tsx         # Uses AuthService + useEffectRunner
│       ├── SignInForm.tsx         # Uses AuthService + useEffectRunner
│       └── OAuthButton.tsx        # Uses AuthService + useEffectRunner
├── hooks/
│   └── useEffectRunner.ts         # Run Effect programs in React
└── middleware.ts                  # Session verification
```

### Key Principles

1. **6-Dimension Ontology:** All auth data fits the complete reality model
   - Organizations → multi-tenant isolation
   - People → users with roles and authorization
   - Things → optional device tracking
   - Connections → sessions & OAuth links
   - Events → complete audit trail
   - Knowledge → AI-powered security

2. **Effect.ts Everywhere:** Type-safe, composable auth operations

3. **Backend-Agnostic:** DataProvider pattern works with any backend

4. **Multi-Tenant by Design:** Every operation scoped to organizationId

5. **Event-Driven:** All auth actions logged with actorId

6. **Real-Time:** Sessions as connections → instant updates everywhere

### Comparison

| Aspect | Better Auth (Traditional) | ONE 6-Dimension |
|--------|---------------------------|------------------|
| **Architecture** | 4 separate tables | 6 dimensions |
| **Multi-Tenancy** | Manual implementation | Organizations (dimension 1) |
| **Authorization** | Basic roles | People with roles (dimension 2) |
| **Users** | Separate `user` table | Things (type: creator) |
| **Devices** | Not tracked | Things (type: device) - optional |
| **Sessions** | Separate `session` table | Connections (type: session) |
| **OAuth** | Separate `account` table | Connections (type: oauth_account) |
| **Audit Trail** | Not logged | Events (dimension 5) - complete |
| **Security AI** | None | Knowledge (dimension 6) - patterns |
| **Backend** | Database-specific adapters | Universal DataProvider |
| **Error Handling** | Try/catch | Typed Effect errors |
| **Testing** | Mock database | Effect test layers |
| **Data Isolation** | Manual queries | Automatic (organizationId) |
| **Analytics** | External tool | Built-in (events + knowledge) |

### Next Steps

1. **Implement AuthService** with Effect.ts + DataProvider
2. **Create auth components** using useEffectRunner
3. **Add session middleware** for protected routes
4. **Test with mock DataProvider** (no database needed!)
5. **Deploy** with chosen backend (Convex, Supabase, etc.)

---

**Better Auth + ONE 6-Dimension Ontology = Universal, Type-Safe, Multi-Tenant Authentication**

Organizations partition. People authorize. Things exist. Connections relate. Events record. Knowledge understands. Effect.ts everywhere. Works with any backend.
