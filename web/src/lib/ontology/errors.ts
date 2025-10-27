/**
 * Ontology Error Types
 *
 * Typed error definitions following Effect-TS patterns with tagged unions.
 * All errors include context for debugging and user-facing messages.
 */

export interface EntityNotFoundError {
  readonly _tag: "EntityNotFound";
  readonly entityId: string;
  readonly entityType?: string;
  readonly message: string;
}

export interface ValidationError {
  readonly _tag: "ValidationError";
  readonly field: string;
  readonly value: unknown;
  readonly reason: string;
  readonly message: string;
}

export interface UnauthorizedError {
  readonly _tag: "Unauthorized";
  readonly reason: "not_authenticated" | "insufficient_permissions" | "resource_forbidden";
  readonly message: string;
}

export interface PermissionDeniedError {
  readonly _tag: "PermissionDenied";
  readonly action: string;
  readonly resource: string;
  readonly requiredRole?: string;
  readonly message: string;
}

export interface GroupNotFoundError {
  readonly _tag: "GroupNotFound";
  readonly groupId: string;
  readonly message: string;
}

export interface PersonNotFoundError {
  readonly _tag: "PersonNotFound";
  readonly personId: string;
  readonly email?: string;
  readonly message: string;
}

export interface ThingNotFoundError {
  readonly _tag: "ThingNotFound";
  readonly thingId: string;
  readonly thingType?: string;
  readonly message: string;
}

export interface ConnectionNotFoundError {
  readonly _tag: "ConnectionNotFound";
  readonly connectionId: string;
  readonly sourceId?: string;
  readonly targetId?: string;
  readonly message: string;
}

export interface EventNotFoundError {
  readonly _tag: "EventNotFound";
  readonly eventId: string;
  readonly message: string;
}

export interface KnowledgeNotFoundError {
  readonly _tag: "KnowledgeNotFound";
  readonly knowledgeId: string;
  readonly message: string;
}

export interface OperationFailedError {
  readonly _tag: "OperationFailed";
  readonly operation: string;
  readonly reason: string;
  readonly details?: Record<string, unknown>;
  readonly message: string;
}

export interface ProviderError {
  readonly _tag: "ProviderError";
  readonly providerName: string;
  readonly operation: string;
  readonly originalError: Error;
  readonly message: string;
}

export interface QuotaExceededError {
  readonly _tag: "QuotaExceeded";
  readonly resourceType: string;
  readonly currentUsage: number;
  readonly limit: number;
  readonly message: string;
}

export interface ConflictError {
  readonly _tag: "Conflict";
  readonly resource: string;
  readonly conflictingField: string;
  readonly existingValue: unknown;
  readonly message: string;
}

export interface NotImplementedError {
  readonly _tag: "NotImplemented";
  readonly feature: string;
  readonly message: string;
}

export interface ConfigurationError {
  readonly _tag: "ConfigurationError";
  readonly setting: string;
  readonly reason: string;
  readonly message: string;
}

/**
 * Union of all error types
 */
export type OntologyError =
  | EntityNotFoundError
  | ValidationError
  | UnauthorizedError
  | PermissionDeniedError
  | GroupNotFoundError
  | PersonNotFoundError
  | ThingNotFoundError
  | ConnectionNotFoundError
  | EventNotFoundError
  | KnowledgeNotFoundError
  | OperationFailedError
  | ProviderError
  | QuotaExceededError
  | ConflictError
  | NotImplementedError
  | ConfigurationError;

/**
 * Error constructors
 */
export const OntologyErrors = {
  entityNotFound: (entityId: string, entityType?: string): EntityNotFoundError => ({
    _tag: "EntityNotFound",
    entityId,
    entityType,
    message: `Entity not found: ${entityType ? `${entityType} ` : ""}${entityId}`,
  }),

  validation: (field: string, value: unknown, reason: string): ValidationError => ({
    _tag: "ValidationError",
    field,
    value,
    reason,
    message: `Validation failed for ${field}: ${reason}`,
  }),

  unauthorized: (reason: "not_authenticated" | "insufficient_permissions" | "resource_forbidden" = "not_authenticated"): UnauthorizedError => ({
    _tag: "Unauthorized",
    reason,
    message: {
      not_authenticated: "Authentication required",
      insufficient_permissions: "Insufficient permissions",
      resource_forbidden: "Resource access forbidden",
    }[reason],
  }),

  permissionDenied: (action: string, resource: string, requiredRole?: string): PermissionDeniedError => ({
    _tag: "PermissionDenied",
    action,
    resource,
    requiredRole,
    message: `Permission denied: cannot ${action} on ${resource}${requiredRole ? ` (requires ${requiredRole})` : ""}`,
  }),

  groupNotFound: (groupId: string): GroupNotFoundError => ({
    _tag: "GroupNotFound",
    groupId,
    message: `Group not found: ${groupId}`,
  }),

  personNotFound: (personId: string, email?: string): PersonNotFoundError => ({
    _tag: "PersonNotFound",
    personId,
    email,
    message: `Person not found: ${email || personId}`,
  }),

  thingNotFound: (thingId: string, thingType?: string): ThingNotFoundError => ({
    _tag: "ThingNotFound",
    thingId,
    thingType,
    message: `Thing not found: ${thingType ? `${thingType} ` : ""}${thingId}`,
  }),

  connectionNotFound: (connectionId: string, sourceId?: string, targetId?: string): ConnectionNotFoundError => ({
    _tag: "ConnectionNotFound",
    connectionId,
    sourceId,
    targetId,
    message: `Connection not found: ${connectionId}`,
  }),

  eventNotFound: (eventId: string): EventNotFoundError => ({
    _tag: "EventNotFound",
    eventId,
    message: `Event not found: ${eventId}`,
  }),

  knowledgeNotFound: (knowledgeId: string): KnowledgeNotFoundError => ({
    _tag: "KnowledgeNotFound",
    knowledgeId,
    message: `Knowledge not found: ${knowledgeId}`,
  }),

  operationFailed: (operation: string, reason: string, details?: Record<string, unknown>): OperationFailedError => ({
    _tag: "OperationFailed",
    operation,
    reason,
    details,
    message: `Operation failed: ${operation} - ${reason}`,
  }),

  providerError: (providerName: string, operation: string, originalError: Error): ProviderError => ({
    _tag: "ProviderError",
    providerName,
    operation,
    originalError,
    message: `Provider error: ${providerName}.${operation} - ${originalError.message}`,
  }),

  quotaExceeded: (resourceType: string, currentUsage: number, limit: number): QuotaExceededError => ({
    _tag: "QuotaExceeded",
    resourceType,
    currentUsage,
    limit,
    message: `Quota exceeded for ${resourceType}: ${currentUsage}/${limit}`,
  }),

  conflict: (resource: string, conflictingField: string, existingValue: unknown): ConflictError => ({
    _tag: "Conflict",
    resource,
    conflictingField,
    existingValue,
    message: `Conflict: ${resource} already has ${conflictingField} = ${existingValue}`,
  }),

  notImplemented: (feature: string): NotImplementedError => ({
    _tag: "NotImplemented",
    feature,
    message: `Feature not implemented: ${feature}`,
  }),

  configurationError: (setting: string, reason: string): ConfigurationError => ({
    _tag: "ConfigurationError",
    setting,
    reason,
    message: `Configuration error: ${setting} - ${reason}`,
  }),
};
