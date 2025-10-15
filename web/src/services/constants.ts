/**
 * Service Layer Constants
 *
 * Ontology types and configuration constants for the 6-dimension architecture.
 * - 66 Thing Types
 * - 25 Connection Types
 * - 67 Event Types
 * - Status Transitions
 */

// ============================================================================
// THING TYPES (66 total)
// ============================================================================

export const THING_TYPES = [
  // CORE (4)
  "creator",
  "ai_clone",
  "audience_member",
  "organization",

  // BUSINESS AGENTS (10)
  "strategy_agent",
  "research_agent",
  "marketing_agent",
  "sales_agent",
  "service_agent",
  "design_agent",
  "engineering_agent",
  "finance_agent",
  "legal_agent",
  "intelligence_agent",

  // CONTENT (7)
  "blog_post",
  "video",
  "podcast",
  "social_post",
  "email",
  "course",
  "lesson",

  // PRODUCTS (4)
  "digital_product",
  "membership",
  "consultation",
  "nft",

  // COMMUNITY (3)
  "community",
  "conversation",
  "message",

  // TOKEN (2)
  "token",
  "token_contract",

  // PLATFORM (6)
  "website",
  "landing_page",
  "template",
  "livestream",
  "recording",
  "media_asset",

  // BUSINESS (7)
  "payment",
  "subscription",
  "invoice",
  "metric",
  "insight",
  "prediction",
  "report",

  // AUTHENTICATION & SESSION (5)
  "session",
  "oauth_account",
  "verification_token",
  "password_reset_token",
  "ui_preferences",

  // MARKETING (6)
  "notification",
  "email_campaign",
  "announcement",
  "referral",
  "campaign",
  "lead",

  // EXTERNAL (3)
  "external_agent",
  "external_workflow",
  "external_connection",

  // PROTOCOL (2)
  "mandate",
  "product",
] as const;

export type ThingType = (typeof THING_TYPES)[number];

// ============================================================================
// CONNECTION TYPES (25 total)
// ============================================================================

export const CONNECTION_TYPES = [
  // OWNERSHIP (2)
  "owns",
  "created_by",

  // AI RELATIONSHIPS (3)
  "clone_of",
  "trained_on",
  "powers",

  // CONTENT RELATIONSHIPS (5)
  "authored",
  "generated_by",
  "published_to",
  "part_of",
  "references",

  // COMMUNITY RELATIONSHIPS (4)
  "member_of",
  "following",
  "moderates",
  "participated_in",

  // BUSINESS RELATIONSHIPS (3)
  "manages",
  "reports_to",
  "collaborates_with",

  // TOKEN RELATIONSHIPS (3)
  "holds_tokens",
  "staked_in",
  "earned_from",

  // PRODUCT RELATIONSHIPS (4)
  "purchased",
  "enrolled_in",
  "completed",
  "teaching",

  // CONSOLIDATED TYPES (7) - use metadata for variants
  "transacted",
  "notified",
  "referred",
  "communicated",
  "delegated",
  "approved",
  "fulfilled",
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];

// ============================================================================
// EVENT TYPES (67 total)
// ============================================================================

export const EVENT_TYPES = [
  // ENTITY LIFECYCLE (4)
  "entity_created",
  "entity_updated",
  "entity_deleted",
  "entity_archived",

  // USER EVENTS (5)
  "user_registered",
  "user_verified",
  "user_login",
  "user_logout",
  "profile_updated",

  // AUTHENTICATION EVENTS (6)
  "password_reset_requested",
  "password_reset_completed",
  "email_verification_sent",
  "email_verified",
  "two_factor_enabled",
  "two_factor_disabled",

  // ORGANIZATION EVENTS (5)
  "organization_created",
  "organization_updated",
  "user_invited_to_org",
  "user_joined_org",
  "user_removed_from_org",

  // DASHBOARD & UI EVENTS (4)
  "dashboard_viewed",
  "settings_updated",
  "theme_changed",
  "preferences_updated",

  // AI/CLONE EVENTS (4)
  "clone_created",
  "clone_updated",
  "voice_cloned",
  "appearance_cloned",

  // AGENT EVENTS (4)
  "agent_created",
  "agent_executed",
  "agent_completed",
  "agent_failed",

  // TOKEN EVENTS (7)
  "token_created",
  "token_minted",
  "token_burned",
  "tokens_purchased",
  "tokens_staked",
  "tokens_unstaked",
  "tokens_transferred",

  // COURSE EVENTS (5)
  "course_created",
  "course_enrolled",
  "lesson_completed",
  "course_completed",
  "certificate_earned",

  // ANALYTICS EVENTS (5)
  "metric_calculated",
  "insight_generated",
  "prediction_made",
  "optimization_applied",
  "report_generated",

  // INFERENCE EVENTS (7)
  "inference_request",
  "inference_completed",
  "inference_failed",
  "inference_quota_exceeded",
  "inference_revenue_collected",
  "org_revenue_generated",
  "revenue_share_distributed",

  // BLOCKCHAIN EVENTS (5)
  "nft_minted",
  "nft_transferred",
  "tokens_bridged",
  "contract_deployed",
  "treasury_withdrawal",

  // CONSOLIDATED EVENTS (11) - use metadata for variants
  "content_event",
  "payment_event",
  "subscription_event",
  "commerce_event",
  "livestream_event",
  "notification_event",
  "referral_event",
  "communication_event",
  "task_event",
  "mandate_event",
  "price_event",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// ============================================================================
// STATUS TRANSITIONS
// ============================================================================

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["active", "archived"],
  active: ["published", "inactive", "archived"],
  published: ["active", "archived"],
  inactive: ["active", "archived"],
  archived: [], // Terminal state
};

// ============================================================================
// ORGANIZATION PLANS
// ============================================================================

export const ORGANIZATION_PLANS = ["starter", "pro", "enterprise"] as const;
export type OrganizationPlan = (typeof ORGANIZATION_PLANS)[number];

// ============================================================================
// ROLES
// ============================================================================

export const ROLES = [
  "platform_owner",
  "org_owner",
  "org_user",
  "customer",
] as const;
export type Role = (typeof ROLES)[number];

// ============================================================================
// DEFAULT ORGANIZATION LIMITS
// ============================================================================

export const DEFAULT_LIMITS: Record<
  OrganizationPlan,
  {
    users: number;
    storage: number; // GB
    apiCalls: number;
    inference: number;
    courses: number;
    clones: number;
  }
> = {
  starter: {
    users: 3,
    storage: 5,
    apiCalls: 10000,
    inference: 1000,
    courses: 5,
    clones: 1,
  },
  pro: {
    users: 25,
    storage: 100,
    apiCalls: 100000,
    inference: 10000,
    courses: 50,
    clones: 5,
  },
  enterprise: {
    users: 1000,
    storage: 1000,
    apiCalls: 1000000,
    inference: 100000,
    courses: 1000,
    clones: 50,
  },
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function isValidThingType(type: string): type is ThingType {
  return THING_TYPES.includes(type as ThingType);
}

export function isValidConnectionType(type: string): type is ConnectionType {
  return CONNECTION_TYPES.includes(type as ConnectionType);
}

export function isValidEventType(type: string): type is EventType {
  return EVENT_TYPES.includes(type as EventType);
}

export function isValidStatusTransition(from: string, to: string): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}

export function isValidPlan(plan: string): plan is OrganizationPlan {
  return ORGANIZATION_PLANS.includes(plan as OrganizationPlan);
}
