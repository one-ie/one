# Creator Ontology

**Version:** 1.0.0
**Extends:** Core Universal Ontology
**Purpose:** Models the creator economy across all platforms, content types, and monetization methods.

## Philosophy

Creators are **multi-platform businesses** that:
1. **Create** content across platforms
2. **Monetize** through multiple revenue streams
3. **Build** community and audience
4. **Own** direct relationships (email, SMS)
5. **Analyze** performance metrics
6. **Scale** with automation and AI

**Supports:** Video creators, podcasters, writers, educators, artists, entrepreneurs, gamers.

---

## GROUPS: Creator Brands

```typescript
{
  _id: Id<'groups'>,
  type: 'business',
  slug: string,
  name: string,

  branding: {
    logo: string,
    coverImage: string,
    brandColors: { primary, secondary, accent },
    fonts: { heading, body },
    tagline: string,
  },

  metadata: {
    creatorType: 'individual' | 'team' | 'brand',
    niche: string[],
    primaryPlatform: string,
    targetAudience: string,
    launchedAt: number,
    revenueStreams: ('ads' | 'sponsorships' | 'memberships' | 'courses' | 'products' | 'consulting' | 'donations' | 'affiliate' | 'merch')[],
  },

  // Platform connections (extensible)
  platforms: {
    [platform: string]: {
      handle: string,
      followers: number,
      verified: boolean,
      monetization: Record<string, any>,
      metrics: Record<string, number>,
      features: Record<string, boolean>,
    }
  },

  metrics: {
    totalFollowers: number,
    totalViews: number,
    totalRevenue: number,
    monthlyRevenue: number,
    avgEngagementRate: number,
  },
}
```

**Key Platforms:** YouTube, TikTok, Instagram, Twitter/X, Twitch, Podcast, Newsletter, Blog, Discord, Patreon

**Extensibility:** Add new platforms by extending `platforms` object with platform-specific schema.

---

## PEOPLE: Creator Roles

```typescript
{
  _id: Id<'people'>,
  role: 'platform_owner' | 'group_owner' | 'group_user' | 'customer',

  // Mapped roles:
  // group_owner → Creator/Founder
  // group_user → Team Member
  // customer → Fan/Member

  permissions: string[],  // publish_content, manage_sponsorships, access_analytics, etc.

  profile: {
    creatorProfile?: {
      expertise: string[],
      yearsCreating: number,
      fullTime: boolean,
      revenueSharePercent?: number,  // For team
      memberSince?: number,          // For fans
      membershipTier?: string,       // For fans
      lifetimeValue?: number,        // For fans
    },
  },

  preferences: {
    notifications: Record<string, boolean>,
    communication: Record<string, boolean>,
  },
}
```

---

## THINGS: Creator Economy Types

**70+ entity types across 10 categories:**

```typescript
type CreatorThingType =
  // Content (20+ types)
  | "youtube_video" | "tiktok_video" | "instagram_post" | "podcast_episode"
  | "blog_post" | "newsletter_issue" | "thread" | "livestream"
  | "{platform}_{content_type}"  // Extensible pattern

  // Education (8 types)
  | "course" | "course_module" | "course_lesson" | "workshop"
  | "webinar" | "masterclass" | "template" | "resource_pack"

  // Community (7 types)
  | "community" | "discord_server" | "community_post" | "discussion_thread"
  | "poll" | "qa_session" | "exclusive_content"

  // Monetization (12 types)
  | "membership_tier" | "subscription" | "sponsorship" | "brand_partnership"
  | "affiliate_link" | "product" | "merch_item" | "consultation"
  | "{platform}_shop_item"  // Extensible pattern

  // Finance (6 types)
  | "revenue_stream" | "payment" | "payout" | "invoice" | "expense" | "tax_document"

  // Marketing (6 types)
  | "email_campaign" | "funnel" | "lead_magnet" | "landing_page" | "sales_page" | "waitlist"

  // Analytics (5 types)
  | "analytics_report" | "milestone" | "goal" | "metric" | "insight"

  // Collaboration (3 types)
  | "collaboration" | "guest_appearance" | "interview"

  // Events (4 types)
  | "event" | "meetup" | "conference" | "tour"

  // IP & Assets (4 types)
  | "brand_asset" | "content_library" | "intellectual_property" | "trademark";
```

**Extensibility:** Use `{platform}_{type}` pattern for platform-specific content (e.g., `youtube_short`, `instagram_reel`).

---

## CONNECTIONS: Creator Relationships

**30+ connection types across 7 categories:**

```typescript
type CreatorConnectionType =
  // Content (6 types)
  | "created_by" | "featured_in" | "collaborated_on" | "appeared_in" | "part_of_series" | "sequel_to"

  // Audience (5 types)
  | "subscribed_to" | "following" | "member_of" | "member_tier" | "purchased"

  // Engagement (7 types)
  | "watched" | "listened_to" | "read" | "liked" | "commented_on" | "shared" | "bookmarked"

  // Monetization (4 types)
  | "sponsored" | "affiliate_for" | "promoted_in" | "donated_to"

  // Collaboration (3 types)
  | "collaborates_with" | "mentors" | "guest_on"

  // Community (2 types)
  | "moderates" | "top_contributor"

  // Business (4 types)
  | "managed_by" | "represented_by" | "sponsored_by" | "partnered_with";
```

---

## EVENTS: Creator Actions

**50+ event types across 9 categories:**

```typescript
type CreatorEventType =
  // Publishing (7 types)
  | "video_uploaded" | "video_premiered" | "livestream_started" | "livestream_ended"
  | "podcast_published" | "blog_post_published" | "newsletter_sent"

  // Growth (5 types)
  | "subscriber_gained" | "follower_gained" | "member_joined" | "member_upgraded" | "member_churned"

  // Engagement (7 types)
  | "video_viewed" | "video_watched_fully" | "comment_received" | "like_received"
  | "share_occurred" | "email_opened" | "email_clicked"

  // Monetization (7 types)
  | "revenue_earned" | "sponsorship_secured" | "product_sold" | "course_enrolled"
  | "donation_received" | "affiliate_commission" | "ad_revenue_generated"

  // Milestones (4 types)
  | "milestone_reached" | "verification_achieved" | "award_won" | "viral_hit"

  // Community (4 types)
  | "community_created" | "event_hosted" | "meetup_organized" | "collaboration_announced"

  // Business (4 types)
  | "brand_deal_signed" | "product_launched" | "course_launched" | "merch_drop"

  // Platform (5 types)
  | "platform_joined" | "channel_migrated" | "copyright_strike" | "demonetized" | "remonetized"

  // Analytics (3 types)
  | "analytics_generated" | "insight_discovered" | "trend_identified";
```

---

## Property Schemas (Examples)

### Content: YouTube Video

```typescript
{
  type: 'youtube_video',
  properties: {
    videoId, url, channelId,
    description, thumbnail, duration, publishedAt,
    category, tags, hashtags,
    views, likes, comments, shares, watchTime, engagementRate,
    adRevenue, cpm, rpm, sponsorshipRevenue,
    visibility, monetized, ageRestricted,
  }
}
```

### Monetization: Membership Tier

```typescript
{
  type: 'membership_tier',
  properties: {
    price, currency, billingCycle,
    benefits: string[],
    perks: { exclusiveContent, earlyAccess, discordRole, ... },
    memberLimit, currentMembers,
    exclusiveContentIds: Id<'things'>[],
    trialPeriod, color, badge, priority,
  }
}
```

### Business: Sponsorship

```typescript
{
  type: 'sponsorship',
  properties: {
    brandName, dealValue, dealType,
    contractStart, contractEnd,
    requirements: { platform, minViews, placement, exclusivity },
    adScript, trackingLink, promoCode,
    impressions, clicks, conversions, revenue,
    paid, paidAt,
  }
}
```

### Community

```typescript
{
  type: 'community',
  properties: {
    platform: 'discord' | 'circle' | 'slack' | 'custom',
    memberCount, activeMembers, growthRate,
    channels: [{ name, type, memberCount }],
    moderators: Id<'people'>[],
    messagesPerDay, avgSessionTime,
    public, requiresMembership, allowedTiers,
  }
}
```

---

## Revenue Models

**6 primary revenue streams:**

1. **Advertising** - Platform ad revenue (YouTube, podcast, blog) - CPM-based
2. **Sponsorships** - Brand deals and partnerships - Flat fee, CPM, CPA, or revenue share
3. **Memberships** - Recurring subscriptions (Patreon, YouTube, custom) - Monthly/yearly tiers
4. **Products** - Digital products, courses, ebooks, templates - One-time or subscription
5. **Services** - Consulting, coaching, workshops - Hourly or package pricing
6. **Affiliate** - Commission-based product promotion - % of sales

**Track via:** `revenue_stream` things and `revenue_earned` events

---

## Use Cases

| Creator Type | Setup | Content | Revenue Streams |
|-------------|-------|---------|----------------|
| **Solo YouTuber** | 1 group, 1 creator | 200+ videos, weekly uploads | Ads ($5K), Sponsorships ($10K), Affiliate ($2K) |
| **Podcaster** | 1 group, 2 co-hosts, 5K Discord | 150+ episodes, 20K newsletter | Sponsorships ($8K), Memberships ($3K), Donations ($1K) |
| **Course Creator** | 1 group, 5 team | 3 courses, 50+ posts, newsletter | Courses ($30K), Coaching ($10K), Affiliate ($5K) |

---

## Routes

**Public:**
- `/videos`, `/podcast`, `/blog`, `/newsletter` - Content
- `/community`, `/community/discussions`, `/community/events` - Community
- `/membership`, `/shop`, `/courses`, `/book` - Monetization

**Dashboard:**
- `/dashboard/analytics`, `/dashboard/revenue`, `/dashboard/content`, `/dashboard/community`, `/dashboard/sponsorships`

---

## Integrations

**Content:** YouTube, Spotify, Substack, Medium
**Community:** Discord, Circle, Slack
**Monetization:** Patreon, Gumroad, Stripe, Buy Me a Coffee
**Email:** ConvertKit, Beehiiv, Mailchimp
**Analytics:** Google Analytics, YouTube Analytics, Chartable, Social Blade

---

## Implementation Checklist

- [ ] Multi-platform content publishing
- [ ] Revenue tracking (all streams)
- [ ] Membership system (tiers, subscriptions)
- [ ] Sponsorship management (deals, performance)
- [ ] Community hub (Discord, forums)
- [ ] Creator dashboard (analytics, insights)
- [ ] Email marketing (campaigns)
- [ ] AI agents (repurposing, analytics)

---

## Extensibility Guide

**Add New Platform:**
1. Extend `platforms` object in groups schema
2. Add platform-specific properties (followers, metrics, features)
3. Create `{platform}_{type}` thing types
4. Add platform events

**Add New Content Type:**
1. Add to thing types: `{platform}_{content_type}`
2. Define properties schema
3. Add relevant connections (created_by, featured_in)
4. Add publishing events

**Add New Revenue Stream:**
1. Add to `revenueStreams` enum
2. Create thing type (e.g., `nft_collection`)
3. Track via `revenue_stream` things
4. Log via `revenue_earned` events

---

**Complete creator economy in one ontology.** From individual YouTubers to multi-platform creator businesses.
