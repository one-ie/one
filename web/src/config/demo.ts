/**
 * Demo Configuration
 *
 * Centralized configuration for all demo pages
 * Provides environment-aware defaults and shared constants
 */

// Backend URL - defaults to public Convex URL, can be overridden
export const DEMO_BACKEND_URL =
  (typeof import.meta !== 'undefined' &&
    // @ts-ignore
    import.meta.env.PUBLIC_CONVEX_URL) ||
  'https://shocking-falcon-870.convex.cloud';

// Demo group ID - shared across all demo examples
export const DEMO_GROUP_ID = 'kh77jymsq3tmk1gmrwrpp94r7x7spkhw';

// HTTP API endpoints for demo
export const DEMO_ENDPOINTS = {
  groups: '/http/groups',
  people: '/http/people',
  things: '/http/things',
  connections: '/http/connections',
  events: '/http/events',
  knowledge: '/http/knowledge',
} as const;

// Feature flags for demo functionality
export const DEMO_FEATURES = {
  liveBackend: true,
  liveSearch: true,
  liveConnections: true,
  liveEvents: true,
  liveKnowledge: true,
  liveHealth: true,
  errorRecovery: true,
} as const;

// Entity examples for demo
export const DEMO_ENTITIES = {
  things: [
    { type: 'user', label: 'Users' },
    { type: 'creator', label: 'Creators' },
    { type: 'page', label: 'Pages' },
    { type: 'blog_post', label: 'Blog Posts' },
    { type: 'project', label: 'Projects' },
    { type: 'product', label: 'Products' },
    { type: 'course', label: 'Courses' },
    { type: 'token', label: 'Tokens' },
  ],
  connectionTypes: [
    { type: 'owns', label: 'Owns' },
    { type: 'created_by', label: 'Created By' },
    { type: 'viewed_by', label: 'Viewed By' },
    { type: 'purchased', label: 'Purchased' },
    { type: 'follows', label: 'Follows' },
    { type: 'teaches', label: 'Teaches' },
    { type: 'enrolled_in', label: 'Enrolled In' },
  ],
  eventTypes: [
    { type: 'thing_created', label: 'Thing Created' },
    { type: 'thing_updated', label: 'Thing Updated' },
    { type: 'product_viewed', label: 'Product Viewed' },
    { type: 'order_placed', label: 'Order Placed' },
    { type: 'course_enrolled', label: 'Course Enrolled' },
    { type: 'payment_completed', label: 'Payment Completed' },
  ],
} as const;

// Pagination defaults
export const DEMO_PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultOffset: 0,
} as const;

// Request configuration
export const DEMO_REQUEST_CONFIG = {
  timeout: 5000, // 5 second timeout
  retries: 3,
  retryDelay: 1000, // 1 second initial delay
  maxRetryDelay: 10000, // 10 second max delay
} as const;

// Demo navigation structure
export const DEMO_NAVIGATION = [
  {
    title: 'Groups',
    path: '/demo/groups',
    description: 'Multi-tenant isolation',
    dimension: 'organizations',
  },
  {
    title: 'People',
    path: '/demo/people',
    description: 'Authorization & roles',
    dimension: 'people',
  },
  {
    title: 'Things',
    path: '/demo/things',
    description: 'Entities & objects',
    dimension: 'things',
  },
  {
    title: 'Connections',
    path: '/demo/connections',
    description: 'Relationships',
    dimension: 'connections',
  },
  {
    title: 'Events',
    path: '/demo/events',
    description: 'Audit trail',
    dimension: 'events',
  },
  {
    title: 'Knowledge',
    path: '/demo/knowledge',
    description: 'Search & semantics',
    dimension: 'knowledge',
  },
] as const;

// Statistics displayed on demo index
export const DEMO_STATISTICS = {
  linesOfCode: 11500,
  reactHooks: 43,
  apiEndpoints: 13,
  thingTypes: 66,
  connectionTypes: 25,
  eventTypes: 67,
  typeСoverage: 100,
} as const;

// Health check configuration
export const HEALTH_CHECK_CONFIG = {
  enabled: true,
  interval: 30000, // Check every 30 seconds
  timeout: 3000,
  retries: 2,
} as const;

// Error messages
export const DEMO_ERROR_MESSAGES = {
  backendUnavailable:
    'Backend is unavailable. This is expected in standalone mode.',
  networkError: 'Network error occurred. Please check your connection.',
  timeout: 'Request timed out. Please try again.',
  invalidResponse: 'Invalid response from backend. Please try again.',
  notFound: 'Resource not found.',
  unauthorized: 'You do not have permission to access this resource.',
  serverError: 'Server error occurred. Please try again later.',
} as const;

// Success messages
export const DEMO_SUCCESS_MESSAGES = {
  backendConnected: 'Backend is connected and operational.',
  dataLoaded: 'Data loaded successfully.',
  operationCompleted: 'Operation completed successfully.',
} as const;
