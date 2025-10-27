/**
 * Demo API Client
 *
 * Centralized HTTP client for all demo endpoints
 * Handles errors, retries, logging, and type-safe requests
 */

import {
  DEMO_BACKEND_URL,
  DEMO_ENDPOINTS,
  DEMO_REQUEST_CONFIG,
} from '@/config/demo';
import type {
  DemoApiResponse,
  PaginatedResponse,
  DemoApiClientConfig,
  DemoApiClientOptions,
  DemoRequestLog,
  DemoError,
  DemoListQuery,
} from '@/types/demo';
import { DemoErrorWithCode } from '@/types/demo';

export class DemoApiClient {
  private config: DemoApiClientConfig;
  private requestLogs: DemoRequestLog[] = [];

  constructor(config?: Partial<DemoApiClientConfig>) {
    this.config = {
      baseUrl: DEMO_BACKEND_URL,
      timeout: DEMO_REQUEST_CONFIG.timeout,
      retries: DEMO_REQUEST_CONFIG.retries,
      retryDelay: DEMO_REQUEST_CONFIG.retryDelay,
      maxRetryDelay: DEMO_REQUEST_CONFIG.maxRetryDelay,
      ...config,
    };
  }

  /**
   * Make HTTP request with automatic retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit & { retryCount?: number } = {}
  ): Promise<Response> {
    const retryCount = options.retryCount || 0;
    const maxRetries = this.config.retries;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log successful request
      this.logRequest('GET', url, response.status);

      return response;
    } catch (error) {
      // Log failed request
      this.logRequest('GET', url, undefined, String(error));

      // Retry on network errors, but not on 4xx errors
      const isNetworkError =
        error instanceof TypeError || (error as any)?.name === 'AbortError';

      if (isNetworkError && retryCount < maxRetries) {
        const delay = Math.min(
          this.config.retryDelay * Math.pow(2, retryCount),
          this.config.maxRetryDelay
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.fetchWithRetry(url, {
          ...options,
          retryCount: retryCount + 1,
        });
      }

      throw error;
    }
  }

  /**
   * Log request details for debugging
   */
  private logRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    status?: number,
    error?: string
  ): void {
    const log: DemoRequestLog = {
      method,
      url,
      status,
      duration: 0,
      timestamp: Date.now(),
      error,
    };

    this.requestLogs.push(log);

    // Keep only last 50 requests
    if (this.requestLogs.length > 50) {
      this.requestLogs.shift();
    }

    // Log to console in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.debug(`[DemoAPI] ${method} ${url}`, {
        status,
        error,
        timestamp: new Date(log.timestamp).toISOString(),
      });
    }
  }

  /**
   * Get request logs
   */
  getRequestLogs(): DemoRequestLog[] {
    return [...this.requestLogs];
  }

  /**
   * Clear request logs
   */
  clearRequestLogs(): void {
    this.requestLogs = [];
  }

  /**
   * Generic GET request
   */
  async get<T>(
    endpoint: string,
    options?: DemoApiClientOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);

    try {
      const response = await this.fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      throw this.handleError(error, 'GET', endpoint);
    }
  }

  /**
   * GET request for paginated data
   */
  async getPaginated<T>(
    endpoint: string,
    query?: DemoListQuery,
    options?: DemoApiClientOptions
  ): Promise<PaginatedResponse<T>> {
    const params = {
      ...query,
      ...options?.params,
    };

    return this.get<PaginatedResponse<T>>(endpoint, {
      ...options,
      params,
    });
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Parse error response
   */
  private async parseError(response: Response): Promise<DemoError> {
    try {
      const data = await response.json();
      return {
        code: data.code || `HTTP_${response.status}`,
        message: data.message || response.statusText,
        details: data.details,
        timestamp: Date.now(),
        recoverable: response.status >= 500 || response.status === 408,
      };
    } catch {
      return {
        code: `HTTP_${response.status}`,
        message: response.statusText,
        timestamp: Date.now(),
        recoverable: response.status >= 500 || response.status === 408,
      };
    }
  }

  /**
   * Handle errors with logging and recovery suggestions
   */
  private handleError(
    error: unknown,
    method: string,
    endpoint: string
  ): DemoError {
    if (error instanceof DemoErrorWithCode) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: Date.now(),
        recoverable: true,
      };
    }

    if (error instanceof TypeError) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed. Backend may be unavailable.',
        details: {
          method,
          endpoint,
          originalError: error.message,
        },
        timestamp: Date.now(),
        recoverable: true,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: { method, endpoint },
      timestamp: Date.now(),
      recoverable: false,
    };
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<{
    status: 'online' | 'offline';
    latency?: number;
  }> {
    const startTime = Date.now();

    try {
      const response = await this.fetchWithRetry(`${this.config.baseUrl}/http/health`, {
        method: 'GET',
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        return { status: 'online', latency };
      }

      return { status: 'offline' };
    } catch {
      return { status: 'offline' };
    }
  }

  /**
   * Get available endpoints
   */
  getAvailableEndpoints(): Record<string, string> {
    return DEMO_ENDPOINTS;
  }

  /**
   * Get current configuration
   */
  getConfig(): DemoApiClientConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DemoApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Create singleton instance
 */
let instance: DemoApiClient | null = null;

export function getDemoApiClient(): DemoApiClient {
  if (!instance) {
    instance = new DemoApiClient();
  }
  return instance;
}

/**
 * Get data from a specific dimension
 */
export async function getDimensionData<T>(
  dimension: keyof typeof DEMO_ENDPOINTS,
  query?: DemoListQuery
): Promise<T[]> {
  const client = getDemoApiClient();
  const endpoint = DEMO_ENDPOINTS[dimension];

  try {
    const response = await client.getPaginated<T>(endpoint, query);
    return response.items;
  } catch (error) {
    console.error(`Failed to fetch ${dimension}:`, error);
    return [];
  }
}

/**
 * Get statistics across all dimensions
 */
export async function getDemoStatistics() {
  const client = getDemoApiClient();

  const stats = {
    groups: { count: 0, error: null as string | null },
    things: { count: 0, error: null as string | null },
    connections: { count: 0, error: null as string | null },
    events: { count: 0, error: null as string | null },
    people: { count: 0, error: null as string | null },
    knowledge: { count: 0, error: null as string | null },
  };

  // Import DEMO_GROUP_ID for endpoints that need groupId
  const { DEMO_GROUP_ID } = await import('@/config/demo');

  // Fetch all dimensions in parallel
  // Note: Things, Connections, Events, People, Knowledge require groupId parameter
  const results = await Promise.allSettled([
    client.get<DemoApiResponse<any[]>>(DEMO_ENDPOINTS.groups),
    client.get<DemoApiResponse<any[]>>(`${DEMO_ENDPOINTS.things}?groupId=${DEMO_GROUP_ID}`),
    client.get<DemoApiResponse<any[]>>(`${DEMO_ENDPOINTS.connections}?groupId=${DEMO_GROUP_ID}`),
    client.get<DemoApiResponse<any[]>>(`${DEMO_ENDPOINTS.events}?groupId=${DEMO_GROUP_ID}`),
    client.get<DemoApiResponse<any[]>>(`${DEMO_ENDPOINTS.people}?groupId=${DEMO_GROUP_ID}`),
    client.get<DemoApiResponse<any[]>>(`${DEMO_ENDPOINTS.knowledge}?groupId=${DEMO_GROUP_ID}`),
  ]);

  const dimensions = ['groups', 'things', 'connections', 'events', 'people', 'knowledge'] as const;

  dimensions.forEach((dimension, index) => {
    const result = results[index];
    if (result.status === 'fulfilled') {
      const response = result.value as any;
      const data = response.data || [];
      // data is an array, count the items
      stats[dimension].count = Array.isArray(data) ? data.length : 0;
    } else {
      stats[dimension].error = result.reason?.message || 'Unknown error occurred';
    }
  });

  return stats;
}
