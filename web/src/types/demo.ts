/**
 * Demo Type Definitions
 *
 * Complete TypeScript interfaces for demo infrastructure
 * Type-safe props, API responses, and state management
 */

// API Response Types

export interface DemoApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Entity Types

export interface DemoGroup {
  _id: string;
  name: string;
  type: 'friend_circle' | 'business' | 'community' | 'dao' | 'government' | 'organization';
  parentGroupId?: string;
  properties: Record<string, unknown>;
  status: 'draft' | 'active' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface DemoPerson {
  _id: string;
  name: string;
  email: string;
  role: 'platform_owner' | 'org_owner' | 'org_user' | 'customer';
  properties: Record<string, unknown>;
  status: 'draft' | 'active' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface DemoThing {
  _id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  status: 'draft' | 'active' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface DemoConnection {
  _id: string;
  fromThingId: string;
  toThingId: string;
  relationshipType: string;
  metadata?: Record<string, unknown>;
  validFrom?: number;
  validTo?: number;
  createdAt: number;
  updatedAt: number;
}

export interface DemoEvent {
  _id: string;
  type: string;
  actorId?: string;
  targetId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export interface DemoKnowledge {
  _id: string;
  knowledgeType: string;
  text: string;
  embedding?: number[];
  labels?: string[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

// Request/Query Types

export interface DemoListQuery {
  limit?: number;
  offset?: number;
  type?: string;
  sort?: 'created' | 'updated' | 'name';
  order?: 'asc' | 'desc';
}

export interface DemoSearchQuery extends DemoListQuery {
  search?: string;
  filters?: Record<string, unknown>;
}

export interface DemoStatistics {
  totalGroups: number;
  totalThings: number;
  totalConnections: number;
  totalEvents: number;
  totalPeople: number;
  thingsByType: Record<string, number>;
  connectionsByType: Record<string, number>;
  eventsByType: Record<string, number>;
  lastUpdated: number;
}

// System Health Types

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  backend: {
    status: 'online' | 'offline';
    latency?: number;
    lastChecked: number;
  };
  database: {
    status: 'online' | 'offline';
    latency?: number;
    lastChecked: number;
  };
  api: {
    status: 'online' | 'offline';
    endpoints: Record<string, boolean>;
    lastChecked: number;
  };
  message?: string;
}

// Error Types

export interface DemoError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  recoverable: boolean;
}

export class DemoErrorWithCode extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DemoError';
  }
}

// Loading States

export interface LoadingState<T = unknown> {
  isLoading: boolean;
  isError: boolean;
  error?: DemoError;
  data?: T;
  dataUpdatedAt?: number;
}

export interface DemoLoadingState {
  groups: LoadingState<DemoGroup[]>;
  things: LoadingState<DemoThing[]>;
  connections: LoadingState<DemoConnection[]>;
  events: LoadingState<DemoEvent[]>;
  people: LoadingState<DemoPerson[]>;
  knowledge: LoadingState<DemoKnowledge[]>;
  health: LoadingState<HealthCheckResult>;
}

// Navigation Types

export interface DemoNavItem {
  title: string;
  path: string;
  description?: string;
  dimension?: 'organizations' | 'people' | 'things' | 'connections' | 'events' | 'knowledge';
  icon?: string;
  active?: boolean;
}

// Component Props

export interface DemoDimensionDisplayProps {
  title: string;
  dimension: 'groups' | 'people' | 'things' | 'connections' | 'events' | 'knowledge';
  data?: unknown[];
  isLoading: boolean;
  error?: DemoError;
  limit?: number;
}

export interface DemoStatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
}

export interface DemoBreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;
    current?: boolean;
  }>;
}

export interface DemoConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected';
  latency?: number;
  message?: string;
}

// Filter Types

export interface DemoFilter {
  type?: string;
  status?: 'draft' | 'active' | 'published' | 'archived';
  dateRange?: {
    from: number;
    to: number;
  };
  search?: string;
}

export interface DemoFilterOptions {
  types: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
  dateRanges: Array<{ value: string; label: string }>;
}

// API Client Types

export interface DemoApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  maxRetryDelay: number;
}

export interface DemoApiClientOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

// Request Logging

export interface DemoRequestLog {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  status?: number;
  duration: number;
  timestamp: number;
  error?: string;
}

export interface DemoRequestStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastRequest?: DemoRequestLog;
}

// Dimension Statistics

export interface DimensionStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  createdToday: number;
  updatedToday: number;
  lastUpdated: number;
}

// Summary Card

export interface DemoSummaryCard {
  title: string;
  value: number;
  label: string;
  trend?: number;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}
