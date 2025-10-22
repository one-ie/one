# Core Universal Ontology - What Every Website Needs

**Version:** 1.0.0
**Status:** Comprehensive Universal Core
**Principle:** This ontology contains everything EVERY website needs, regardless of features enabled.

---

## Philosophy: The Universal Website DNA

Every website, from a simple portfolio to a complex platform, needs these fundamental capabilities:

1. **Identity** - Who am I? What's my brand?
2. **Content** - Pages, media, files
3. **Navigation** - Structure, menus, routing
4. **Forms** - Contact, feedback, data collection
5. **Media** - Images, videos, files
6. **SEO** - Metadata, sitemaps, analytics
7. **Auth** - Users, sessions, permissions
8. **Settings** - Configuration, preferences
9. **Notifications** - Messages, alerts
10. **Search** - Find content
11. **Analytics** - Track usage
12. **Integrations** - Connect external services

---

## THE 6-DIMENSION CORE (Always Present)

### 1. GROUPS (Multi-Tenancy)

**Structure:**

```typescript
{
  _id: Id<'groups'>,
  slug: string,              // URL identifier
  name: string,              // Display name
  type: 'friend_circle' | 'business' | 'community' | 'dao' | 'government' | 'organization',
  parentGroupId?: Id<'groups'>,  // Hierarchical nesting

  // Branding (every site needs this)
  branding: {
    logo: string,
    favicon: string,
    brandColors: {
      primary: string,
      secondary: string,
      accent: string,
    },
    fonts: {
      heading: string,
      body: string,
    },
  },

  // Contact info (every site needs this)
  contact: {
    email: string,
    phone?: string,
    address?: Address,
    socials?: {
      twitter?: string,
      facebook?: string,
      instagram?: string,
      linkedin?: string,
      github?: string,
    },
  },

  // SEO (every site needs this)
  seo: {
    title: string,
    description: string,
    keywords: string[],
    ogImage: string,
    canonicalUrl: string,
    robots: 'index,follow' | 'noindex,nofollow',
  },

  // Settings
  settings: {
    visibility: 'public' | 'private',
    joinPolicy: 'open' | 'invite_only' | 'approval_required',
    plan: 'starter' | 'pro' | 'enterprise',
    language: string,  // Default language
    timezone: string,
    currency: string,
    limits: {
      users: number,
      storage: number,  // GB
      apiCalls: number,
    },
  },

  status: 'active' | 'archived',
  createdAt: number,
  updatedAt: number,
}
```

**Why Every Site Needs This:**

- Multi-tenant isolation
- Branding & identity
- Contact information
- SEO optimization
- Settings & configuration

---

### 2. PEOPLE (Authorization)

**Structure:**

```typescript
{
  _id: Id<'people'>,

  // Identity (required)
  email: string,
  username: string,          // URL identifier (/username)
  displayName: string,

  // Auth
  role: 'platform_owner' | 'group_owner' | 'group_user' | 'customer',
  groupId?: Id<'groups'>,   // Current/default group
  groups: Id<'groups'>[],   // All groups this person belongs to
  permissions: string[],

  // Profile (every user needs this)
  profile: {
    avatar?: string,
    bio?: string,
    website?: string,
    location?: string,
    socials?: {
      twitter?: string,
      linkedin?: string,
      github?: string,
    },
  },

  // Preferences (every user needs this)
  preferences: {
    theme: 'light' | 'dark' | 'system',
    language: string,
    timezone: string,
    notifications: {
      email: boolean,
      push: boolean,
      sms: boolean,
    },
  },

  // Privacy
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections',
    showEmail: boolean,
    showLocation: boolean,
  },

  createdAt: number,
  updatedAt: number,
}
```

**Why Every Site Needs This:**

- User authentication
- Authorization & permissions
- User profiles
- Preferences & settings
- Privacy controls

---

### 3. THINGS (Core Universal Types)

Every website needs these thing types:

#### Essential Content (Always Needed)

```typescript
// Pages & Content
type CoreThingType =
  // Pages & Structure
  | "page" // Static pages (about, privacy, terms)
  | "navigation_menu" // Navigation menus
  | "navigation_item" // Menu items
  | "footer" // Footer content
  | "header" // Header content

  // Media & Files
  | "image" // Image files
  | "video" // Video files
  | "audio" // Audio files
  | "file" // Generic files
  | "media_folder" // Organize media

  // Forms & Interaction
  | "form" // Contact forms, surveys
  | "form_submission" // Form responses
  | "feedback" // User feedback
  | "review" // Reviews/ratings

  // SEO & Analytics
  | "seo_meta" // Page-specific SEO
  | "sitemap_entry" // Sitemap entries
  | "redirect" // URL redirects
  | "analytics_event" // Track events

  // Users & Auth
  | "user_profile" // Extended user data
  | "session" // Auth sessions
  | "oauth_account" // OAuth connections
  | "verification_token" // Email/2FA tokens
  | "password_reset_token" // Password reset

  // Notifications & Messages
  | "notification" // System notifications
  | "announcement" // Platform announcements
  | "email" // Email messages

  // Search
  | "search_index_entry" // Search index

  // Settings
  | "site_setting" // Site-wide settings
  | "user_preference" // User preferences

  // Integrations
  | "webhook" // Webhook configurations
  | "api_key" // API keys
  | "integration" // External service integrations

  // Content Blocks (for page builder)
  | "content_block" // Reusable content blocks
  | "widget" // Site widgets
  | "banner" // Promotional banners

  // Legal & Compliance
  | "legal_document" // Privacy policy, terms, etc.
  | "cookie_consent" // Cookie consent records
  | "gdpr_request" // GDPR data requests

  // Support
  | "faq_item" // FAQ entries
  | "help_article" // Help documentation

  // Links & External
  | "external_link" // External links
  | "social_link" // Social media links

  // Monitoring
  | "error_log" // Error tracking
  | "audit_log" // Audit trail
  | "uptime_check"; // Uptime monitoring;
```

---

### 4. CONNECTIONS (Core Universal Relationships)

Every website needs these connection types:

```typescript
type CoreConnectionType =
  // Ownership & Creation
  | "created_by" // thing → person (who created)
  | "owned_by" // thing → person (who owns)
  | "updated_by" // thing → person (who updated)
  | "deleted_by" // thing → person (who deleted)

  // Hierarchy & Structure
  | "parent_of" // page → page (parent-child)
  | "child_of" // page → page (child-parent)
  | "part_of" // item → collection
  | "contains" // collection → item

  // Media & Files
  | "has_image" // thing → image
  | "has_video" // thing → video
  | "has_file" // thing → file
  | "featured_image" // thing → image (primary)
  | "thumbnail" // thing → image (preview)

  // Navigation
  | "links_to" // page → page (internal link)
  | "redirects_to" // page → page (redirect)
  | "in_menu" // page → navigation_menu

  // User Interactions
  | "viewed_by" // thing → person
  | "liked_by" // thing → person
  | "favorited_by" // thing → person
  | "bookmarked_by" // thing → person
  | "shared_by" // thing → person

  // Relationships
  | "follows" // person → person
  | "blocked_by" // person → person
  | "mentioned_in" // person → thing

  // Forms & Feedback
  | "submitted_by" // form_submission → person
  | "responded_to" // person → form

  // SEO & Search
  | "related_to" // thing → thing (related content)
  | "tagged_with" // thing → knowledge (tags)

  // Notifications
  | "notified" // person → notification
  | "sent_to" // notification → person

  // Integrations
  | "integrated_with" // thing → integration
  | "synced_from"; // thing → external_thing;
```

---

### 5. EVENTS (Core Universal Actions)

Every website needs to track these events:

```typescript
type CoreEventType =
  // Content Lifecycle
  | "thing_created" // Any thing created
  | "thing_updated" // Any thing updated
  | "thing_deleted" // Any thing deleted
  | "thing_published" // Draft → published
  | "thing_archived" // Active → archived

  // User Actions
  | "user_signed_up" // New user registration
  | "user_signed_in" // User login
  | "user_signed_out" // User logout
  | "user_updated_profile" // Profile changes
  | "user_changed_password" // Password change
  | "user_verified_email" // Email verification
  | "user_enabled_2fa" // 2FA enabled

  // Viewing & Engagement
  | "page_viewed" // Page view
  | "thing_viewed" // Any thing viewed
  | "thing_liked" // Like/upvote
  | "thing_favorited" // Add to favorites
  | "thing_shared" // Share action

  // Forms & Feedback
  | "form_submitted" // Form submission
  | "feedback_submitted" // Feedback given
  | "review_posted" // Review submitted

  // Search
  | "search_performed" // Search query
  | "search_result_clicked" // Search result click

  // Errors & Issues
  | "error_occurred" // Error logged
  | "not_found_404" // 404 error
  | "server_error_500" // 500 error

  // SEO & Analytics
  | "analytics_tracked" // Analytics event
  | "conversion_tracked" // Conversion event
  | "utm_tracked" // UTM parameter tracked

  // Notifications
  | "notification_sent" // Notification delivered
  | "notification_read" // Notification opened
  | "notification_clicked" // Notification clicked

  // Integration & API
  | "webhook_triggered" // Webhook fired
  | "api_called" // API endpoint called
  | "integration_synced" // External sync completed

  // Performance
  | "page_load_time" // Page load performance
  | "api_response_time" // API latency

  // Security
  | "login_failed" // Failed login attempt
  | "suspicious_activity" // Security alert
  | "rate_limit_exceeded" // Rate limit hit

  // GDPR & Compliance
  | "gdpr_request_submitted" // Data request
  | "gdpr_request_fulfilled" // Data delivered
  | "cookie_consent_given" // Cookie consent

  // Admin Actions
  | "setting_changed" // Site setting updated
  | "permission_granted" // Permission added
  | "permission_revoked"; // Permission removed;
```

---

### 6. KNOWLEDGE (Labels & Vectors)

Every website needs:

```typescript
{
  _id: Id<'knowledge'>,
  knowledgeType: 'label' | 'document' | 'chunk' | 'vector_only',

  text?: string,              // For labels & chunks
  embedding?: number[],       // Vector for semantic search
  embeddingModel?: string,    // e.g., "text-embedding-3-large"

  sourceThingId?: Id<'things'>,
  sourceField?: string,

  // Core labels every site uses
  labels?: [
    // Content Type
    'page:home',
    'page:about',
    'page:contact',
    'page:privacy',
    'page:terms',

    // Status
    'status:draft',
    'status:published',
    'status:archived',

    // Visibility
    'visibility:public',
    'visibility:private',
    'visibility:unlisted',

    // Priority
    'priority:high',
    'priority:medium',
    'priority:low',

    // Format
    'format:text',
    'format:image',
    'format:video',
    'format:audio',
  ],

  metadata: {
    // SEO
    seoTitle?: string,
    seoDescription?: string,
    keywords?: string[],

    // Language
    language?: string,

    // Location
    geo?: {
      lat: number,
      lng: number,
    },
  },

  createdAt: number,
  updatedAt: number,
}
```

---

## Core Services Every Site Needs

### 1. SEO Service

```typescript
{
  generateSitemap(): string;
  generateRobotsTxt(): string;
  getPageMeta(pageId: string): SEOMeta;
  updateOpenGraph(pageId: string, meta: OGMeta): void;
  trackAnalytics(event: AnalyticsEvent): void;
}
```

### 2. Media Service

```typescript
{
  uploadImage(file: File): Promise<string>;
  uploadVideo(file: File): Promise<string>;
  optimizeImage(url: string, width: number): string;
  generateThumbnail(videoUrl: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
}
```

### 3. Form Service

```typescript
{
  createForm(config: FormConfig): Promise<string>;
  submitForm(formId: string, data: any): Promise<void>;
  getSubmissions(formId: string): Promise<Submission[]>;
  sendNotification(submission: Submission): Promise<void>;
}
```

### 4. Search Service

```typescript
{
  indexThing(thingId: string): Promise<void>;
  search(query: string, filters?: any): Promise<SearchResult[]>;
  autocomplete(query: string): Promise<string[]>;
  relatedContent(thingId: string): Promise<Thing[]>;
}
```

### 5. Notification Service

```typescript
{
  sendNotification(userId: string, message: string): Promise<void>;
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendPush(userId: string, notification: PushNotification): Promise<void>;
  getNotifications(userId: string): Promise<Notification[]>;
}
```

### 6. Analytics Service

```typescript
{
  trackPageView(pageId: string, userId?: string): void;
  trackEvent(event: string, properties?: any): void;
  getPageViews(pageId: string, range: DateRange): number;
  getTopPages(limit: number): PageStats[];
  getUserJourney(userId: string): Event[];
}
```

### 7. Integration Service

```typescript
{
  connectService(service: string, config: any): Promise<void>;
  syncData(integrationId: string): Promise<void>;
  webhookReceived(integrationId: string, payload: any): Promise<void>;
  getIntegrations(): Promise<Integration[]>;
}
```

---

## Core UI Components Every Site Needs

### Navigation

- Header
- Footer
- Main navigation
- Breadcrumbs
- Mobile menu
- User menu

### Content

- Hero section
- Content blocks
- Image gallery
- Video player
- File downloads
- Code blocks

### Forms

- Contact form
- Newsletter signup
- Search bar
- Filters
- Login/signup forms

### Feedback

- Toast notifications
- Error messages
- Success messages
- Loading states
- Empty states

### Social

- Share buttons
- Social links
- Author bio
- Comments (optional)

### SEO

- Meta tags
- Open Graph
- JSON-LD structured data
- Canonical URLs
- Sitemaps

---

## Core Routes Every Site Needs

```typescript
// Public pages
/                    # Homepage
/about               # About page
/contact             # Contact page
/privacy             # Privacy policy
/terms               # Terms of service
/sitemap.xml         # Sitemap
/robots.txt          # Robots.txt

// Auth (if enabled)
/signin              # Sign in
/signup              # Sign up
/forgot-password     # Password reset
/verify-email        # Email verification

// User
/[username]          # User profile
/settings            # User settings
/notifications       # Notifications

// Search
/search              # Search results

// Admin
/admin               # Admin dashboard
/admin/settings      # Site settings
/admin/users         # User management

// API
/api/*               # API endpoints
/webhooks/*          # Webhook endpoints
```

---

## Core Integrations Every Site Needs

### Analytics

- Google Analytics
- Plausible
- Fathom
- Umami

### SEO

- Google Search Console
- Bing Webmaster Tools
- Schema.org structured data

### Email

- Resend

### Media

- Cloudinary
- Uploadcare
- Imgix

### Social

- Open Graph
- Twitter Cards
- Facebook Pixel
- LinkedIn Insights

### Monitoring

- Sentry (errors)
- LogRocket (session replay)
- Uptime Robot (monitoring)

---

## Why This Is Comprehensive

**Every website needs:**

✅ **Identity** - Branding, logo, colors
✅ **Content** - Pages, media, files
✅ **Navigation** - Menus, structure
✅ **Forms** - Contact, feedback
✅ **SEO** - Meta tags, sitemaps
✅ **Auth** - Users, permissions (if needed)
✅ **Media** - Images, videos, files
✅ **Search** - Find content
✅ **Analytics** - Track usage
✅ **Notifications** - Messages, alerts
✅ **Settings** - Configuration
✅ **Integrations** - External services
✅ **Legal** - Privacy, terms, GDPR
✅ **Support** - FAQs, help docs
✅ **Monitoring** - Errors, uptime

---

## Next Steps

1. **Implement core ontology** (these thing types)
2. **Build core services** (SEO, media, forms, etc.)
3. **Create core components** (header, footer, navigation)
4. **Add core routes** (pages every site needs)
5. **Test with blank template** (ensure everything works)
6. **Document core APIs** (for feature extensions)

---

**This is what EVERY website needs** - the universal DNA that makes a site functional before you add any features! 🚀
