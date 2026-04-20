export class SubstrateError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "SubstrateError";
  }
}

export class AuthError extends SubstrateError {
  constructor(message: string, status?: number) {
    super(message, status, "auth_error");
    this.name = "AuthError";
  }
}

export class ValidationError extends SubstrateError {
  constructor(message: string, status?: number, body?: unknown) {
    super(message, status, "validation_error", body);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends SubstrateError {
  constructor(message: string, readonly retryAfterMs?: number) {
    super(message, 429, "rate_limit_error");
    this.name = "RateLimitError";
  }
}

export class TimeoutError extends SubstrateError {
  constructor(message: string, status?: number) {
    super(message, status ?? 408, "timeout_error");
    this.name = "TimeoutError";
  }
}

export class DissolvedError extends SubstrateError {
  constructor(message: string) {
    super(message, undefined, "dissolved_error");
    this.name = "DissolvedError";
  }
}
