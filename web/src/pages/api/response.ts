/**
 * Standardized API Response Format
 *
 * All API endpoints follow this response format for consistency.
 * This enables predictable error handling and response processing.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

/**
 * Create a successful response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string
): ApiResponse {
  return {
    success: false,
    data: null,
    error: { code, message },
    timestamp: Date.now(),
  };
}

/**
 * Map status code to HTTP response
 */
export function getStatusCode(error?: { code: string }): number {
  if (!error) return 200;

  const statusMap: Record<string, number> = {
    VALIDATION_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  };

  return statusMap[error.code] || 500;
}
