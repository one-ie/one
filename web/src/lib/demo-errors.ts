/**
 * Demo Error Handling System
 *
 * Custom error classes, user-friendly messages, and recovery suggestions
 */

import { DEMO_ERROR_MESSAGES, DEMO_SUCCESS_MESSAGES } from '@/config/demo';
import type { DemoError } from '@/types/demo';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  MANUAL = 'manual',
  NONE = 'none',
}

/**
 * Extended error information
 */
export interface ErrorContext {
  severity: ErrorSeverity;
  recoveryStrategy: RecoveryStrategy;
  suggestions: string[];
  retryable: boolean;
  userFriendlyMessage: string;
  documentation?: string;
  contactSupport?: boolean;
}

/**
 * Map error codes to user-friendly messages and recovery actions
 */
const errorRegistry = new Map<string, ErrorContext>([
  [
    'NETWORK_ERROR',
    {
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: RecoveryStrategy.RETRY,
      suggestions: [
        'Check your internet connection',
        'Try again in a few seconds',
        'Contact support if the issue persists',
      ],
      retryable: true,
      userFriendlyMessage: DEMO_ERROR_MESSAGES.networkError,
      documentation: 'https://one.ie/docs/troubleshooting#network-errors',
      contactSupport: true,
    },
  ],
  [
    'TIMEOUT_ERROR',
    {
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.RETRY,
      suggestions: [
        'The request took too long to complete',
        'Try again with smaller data limits',
        'Check backend availability',
      ],
      retryable: true,
      userFriendlyMessage: DEMO_ERROR_MESSAGES.timeout,
      documentation: 'https://one.ie/docs/troubleshooting#timeouts',
    },
  ],
  [
    'BACKEND_UNAVAILABLE',
    {
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: RecoveryStrategy.FALLBACK,
      suggestions: [
        'Backend is not responding',
        'You can still explore demo in standalone mode',
        'Try again in a few moments',
      ],
      retryable: false,
      userFriendlyMessage: DEMO_ERROR_MESSAGES.backendUnavailable,
      documentation: 'https://one.ie/docs/modes#standalone-mode',
    },
  ],
  [
    'INVALID_RESPONSE',
    {
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.RETRY,
      suggestions: [
        'Backend returned unexpected data format',
        'This might be a temporary issue',
        'Try refreshing the page',
      ],
      retryable: true,
      userFriendlyMessage: DEMO_ERROR_MESSAGES.invalidResponse,
      documentation: 'https://one.ie/docs/api/response-format',
    },
  ],
  [
    'NOT_FOUND',
    {
      severity: ErrorSeverity.LOW,
      recoveryStrategy: RecoveryStrategy.MANUAL,
      suggestions: [
        'The requested resource does not exist',
        'Check the resource ID',
        'Browse available resources',
      ],
      retryable: false,
      userFriendlyMessage: DEMO_ERROR_MESSAGES.notFound,
      documentation: 'https://one.ie/docs/api/endpoints',
    },
  ],
  [
    'UNAUTHORIZED',
    {
      severity: ErrorSeverity.HIGH,
      recoveryStrategy: RecoveryStrategy.MANUAL,
      suggestions: [
        'You do not have permission to access this resource',
        'Check your authentication status',
        'Contact support for access',
      ],
      retryable: false,
      userFriendlyMessage: DEMO_ERROR_MESSAGES.unauthorized,
      documentation: 'https://one.ie/docs/auth',
      contactSupport: true,
    },
  ],
  [
    'SERVER_ERROR',
    {
      severity: ErrorSeverity.CRITICAL,
      recoveryStrategy: RecoveryStrategy.RETRY,
      suggestions: [
        'Server encountered an error',
        'Try again in a moment',
        'Contact support if this persists',
      ],
      retryable: true,
      userFriendlyMessage: DEMO_ERROR_MESSAGES.serverError,
      documentation: 'https://one.ie/docs/troubleshooting#server-errors',
      contactSupport: true,
    },
  ],
]);

/**
 * Custom error class for demo errors
 */
export class DemoErrorHandler extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly recoveryStrategy: RecoveryStrategy;
  public readonly suggestions: string[];
  public readonly retryable: boolean;
  public readonly userFriendlyMessage: string;
  public readonly documentation?: string;
  public readonly contactSupport?: boolean;
  public readonly originalError?: Error;
  public readonly timestamp: number;

  constructor(
    code: string,
    message: string,
    context?: Partial<ErrorContext>,
    originalError?: Error
  ) {
    const errorContext = errorRegistry.get(code) || {
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.RETRY,
      suggestions: [message],
      retryable: true,
      userFriendlyMessage: message,
    };

    const finalContext = { ...errorContext, ...context };

    super(message);
    this.name = 'DemoError';
    this.code = code;
    this.severity = finalContext.severity;
    this.recoveryStrategy = finalContext.recoveryStrategy;
    this.suggestions = finalContext.suggestions;
    this.retryable = finalContext.retryable;
    this.userFriendlyMessage = finalContext.userFriendlyMessage;
    this.documentation = finalContext.documentation;
    this.contactSupport = finalContext.contactSupport;
    this.originalError = originalError;
    this.timestamp = Date.now();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, DemoErrorHandler.prototype);
  }

  /**
   * Convert to serializable format for logging/display
   */
  toJSON(): DemoError {
    return {
      code: this.code,
      message: this.message,
      details: {
        severity: this.severity,
        recoveryStrategy: this.recoveryStrategy,
        suggestions: this.suggestions,
        retryable: this.retryable,
        documentation: this.documentation,
        contactSupport: this.contactSupport,
      },
      timestamp: this.timestamp,
      recoverable: this.retryable,
    };
  }
}

/**
 * Parse HTTP error response and create appropriate error
 */
export function parseHttpError(
  status: number,
  statusText: string,
  body?: unknown
): DemoErrorHandler {
  let code: string;
  let context: Partial<ErrorContext> | undefined;

  switch (status) {
    case 400:
      code = 'BAD_REQUEST';
      context = {
        severity: ErrorSeverity.LOW,
        recoveryStrategy: RecoveryStrategy.MANUAL,
        suggestions: ['Check your request parameters', 'Review the API documentation'],
        retryable: false,
        userFriendlyMessage: 'Invalid request. Please check your input.',
      };
      break;
    case 401:
      code = 'UNAUTHORIZED';
      context = {
        severity: ErrorSeverity.HIGH,
        recoveryStrategy: RecoveryStrategy.MANUAL,
      };
      break;
    case 403:
      code = 'FORBIDDEN';
      context = {
        severity: ErrorSeverity.HIGH,
        recoveryStrategy: RecoveryStrategy.MANUAL,
        suggestions: ['You do not have access to this resource', 'Contact administrator'],
        retryable: false,
        userFriendlyMessage: 'Access denied.',
      };
      break;
    case 404:
      code = 'NOT_FOUND';
      break;
    case 408:
    case 504:
      code = 'TIMEOUT_ERROR';
      break;
    case 500:
    case 502:
    case 503:
      code = 'SERVER_ERROR';
      break;
    default:
      code = `HTTP_${status}`;
      context = {
        severity: status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        recoveryStrategy: status >= 500 ? RecoveryStrategy.RETRY : RecoveryStrategy.MANUAL,
        suggestions: [statusText || 'An error occurred'],
        retryable: status >= 500,
        userFriendlyMessage: `HTTP ${status}: ${statusText}`,
      };
  }

  return new DemoErrorHandler(code, statusText, context);
}

/**
 * Parse network error and create appropriate error
 */
export function parseNetworkError(error: unknown): DemoErrorHandler {
  if (error instanceof TypeError) {
    const message = error.message;

    if (message.includes('fetch') || message.includes('network')) {
      return new DemoErrorHandler(
        'NETWORK_ERROR',
        'Failed to connect to backend',
        undefined,
        error as Error
      );
    }

    if (message.includes('abort') || message.includes('timeout')) {
      return new DemoErrorHandler(
        'TIMEOUT_ERROR',
        'Request timed out',
        undefined,
        error as Error
      );
    }
  }

  return new DemoErrorHandler(
    'UNKNOWN_ERROR',
    'An unexpected error occurred',
    {
      severity: ErrorSeverity.MEDIUM,
      recoveryStrategy: RecoveryStrategy.RETRY,
      retryable: true,
      userFriendlyMessage: 'Something went wrong. Please try again.',
    },
    error instanceof Error ? error : new Error(String(error))
  );
}

/**
 * Get recovery action based on error
 */
export function getRecoveryAction(error: DemoErrorHandler): {
  action: RecoveryStrategy;
  message: string;
  nextSteps: string[];
} {
  return {
    action: error.recoveryStrategy,
    message: error.userFriendlyMessage,
    nextSteps: error.suggestions,
  };
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: unknown): boolean {
  if (error instanceof DemoErrorHandler) {
    return error.retryable;
  }
  return false;
}

/**
 * Check if error is critical (requires support)
 */
export function isCritical(error: unknown): boolean {
  if (error instanceof DemoErrorHandler) {
    return error.severity === ErrorSeverity.CRITICAL || error.contactSupport === true;
  }
  return false;
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.error('[DemoError]', {
      error: error instanceof Error ? error.message : String(error),
      ...(error instanceof DemoErrorHandler && {
        code: error.code,
        severity: error.severity,
        recoveryStrategy: error.recoveryStrategy,
      }),
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // In production, you might want to send to error tracking service
  // Example: Sentry.captureException(error, { context });
}

/**
 * Create error message for UI display
 */
export function createErrorMessage(
  error: unknown,
  includeSupport: boolean = true
): string {
  if (error instanceof DemoErrorHandler) {
    let message = error.userFriendlyMessage;

    if (includeSupport && error.contactSupport) {
      message += ' Contact support if you need help.';
    }

    if (error.documentation) {
      message += ` Learn more: ${error.documentation}`;
    }

    return message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Create recovery suggestions for UI display
 */
export function createRecoverySuggestions(error: unknown): string[] {
  if (error instanceof DemoErrorHandler) {
    return error.suggestions;
  }

  return ['Try refreshing the page', 'Contact support if the problem persists'];
}
