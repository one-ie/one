/**
 * Validation Utilities
 *
 * Comprehensive validation functions for all ontology types and business rules.
 * Used by services to enforce data integrity and compliance.
 */

import { Effect } from "effect";
import {
  THING_TYPES,
  CONNECTION_TYPES,
  EVENT_TYPES,
  isValidThingType,
  isValidConnectionType,
  isValidEventType,
  isValidStatusTransition,
  type ThingType,
} from "../constants";
import type { ThingError, ConnectionError, EventError } from "../types";

// ============================================================================
// THING VALIDATION
// ============================================================================

/**
 * Validate thing type is one of 66 defined types
 */
export function validateThingType(type: string): Effect.Effect<void, ThingError> {
  if (!isValidThingType(type)) {
    return Effect.fail({
      _tag: "InvalidTypeError",
      type,
      validTypes: [...THING_TYPES],
    });
  }
  return Effect.succeed(undefined);
}

/**
 * Validate required field is present and non-empty
 */
export function validateRequired(
  value: any,
  fieldName: string
): Effect.Effect<void, ThingError> {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return Effect.fail({
      _tag: "ValidationError",
      message: `${fieldName} is required`,
      field: fieldName,
    });
  }
  return Effect.succeed(undefined);
}

/**
 * Validate status transition is allowed
 */
export function validateStatusTransition(
  fromStatus: string,
  toStatus: string
): Effect.Effect<void, ThingError> {
  if (!isValidStatusTransition(fromStatus, toStatus)) {
    return Effect.fail({
      _tag: "InvalidStatusTransitionError",
      from: fromStatus,
      to: toStatus,
    });
  }
  return Effect.succeed(undefined);
}

/**
 * Validate course properties
 */
export function validateCourseProperties(
  properties: any
): Effect.Effect<void, ThingError> {
  if (!properties.title) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Course must have a title",
      field: "properties.title",
    });
  }

  if (!properties.creatorId) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Course must have a creatorId",
      field: "properties.creatorId",
    });
  }

  if (properties.modules !== undefined && properties.modules <= 0) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Course must have at least one module",
      field: "properties.modules",
    });
  }

  return Effect.succeed(undefined);
}

/**
 * Validate lesson properties
 */
export function validateLessonProperties(
  properties: any
): Effect.Effect<void, ThingError> {
  if (!properties.courseId) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Lesson must belong to a course",
      field: "properties.courseId",
    });
  }

  if (properties.order === undefined || properties.order < 0) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Lesson must have a valid order",
      field: "properties.order",
    });
  }

  return Effect.succeed(undefined);
}

/**
 * Validate token properties
 */
export function validateTokenProperties(
  properties: any
): Effect.Effect<void, ThingError> {
  if (!properties.symbol) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Token must have a symbol",
      field: "properties.symbol",
    });
  }

  if (!properties.network) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Token must specify network",
      field: "properties.network",
    });
  }

  if (properties.totalSupply !== undefined && properties.totalSupply <= 0) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Token totalSupply must be positive",
      field: "properties.totalSupply",
    });
  }

  return Effect.succeed(undefined);
}

/**
 * Validate payment properties
 */
export function validatePaymentProperties(
  properties: any
): Effect.Effect<void, ThingError> {
  if (!properties.amount || properties.amount <= 0) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Payment must have a positive amount",
      field: "properties.amount",
    });
  }

  if (!properties.currency) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Payment must specify currency",
      field: "properties.currency",
    });
  }

  if (!properties.paymentMethod) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Payment must specify method",
      field: "properties.paymentMethod",
    });
  }

  return Effect.succeed(undefined);
}

/**
 * Validate AI clone properties
 */
export function validateAICloneProperties(
  properties: any
): Effect.Effect<void, ThingError> {
  if (!properties.systemPrompt) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "AI clone must have system prompt",
      field: "properties.systemPrompt",
    });
  }

  if (
    properties.temperature !== undefined &&
    (properties.temperature < 0 || properties.temperature > 1)
  ) {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Temperature must be between 0 and 1",
      field: "properties.temperature",
    });
  }

  return Effect.succeed(undefined);
}

/**
 * Validate type-specific properties (dispatcher for all 66 types)
 */
export function validateTypeSpecificProperties(
  type: ThingType,
  properties: any
): Effect.Effect<void, ThingError> {
  switch (type) {
    case "course":
      return validateCourseProperties(properties);
    case "lesson":
      return validateLessonProperties(properties);
    case "token":
      return validateTokenProperties(properties);
    case "payment":
      return validatePaymentProperties(properties);
    case "ai_clone":
      return validateAICloneProperties(properties);
    // Add more type-specific validators as needed
    default:
      return Effect.succeed(undefined);
  }
}

// ============================================================================
// CONNECTION VALIDATION
// ============================================================================

/**
 * Validate connection type is one of 25 defined types
 */
export function validateConnectionType(
  type: string
): Effect.Effect<void, ConnectionError> {
  if (!isValidConnectionType(type)) {
    return Effect.fail({
      _tag: "InvalidRelationshipTypeError",
      type,
      validTypes: [...CONNECTION_TYPES],
    });
  }
  return Effect.succeed(undefined);
}

/**
 * Validate connection does not already exist
 */
export function validateNoDuplicateConnection(
  exists: boolean,
  fromId: string,
  toId: string,
  type: string
): Effect.Effect<void, ConnectionError> {
  if (exists) {
    return Effect.fail({
      _tag: "DuplicateConnectionError",
      fromId,
      toId,
      type,
    });
  }
  return Effect.succeed(undefined);
}

// ============================================================================
// EVENT VALIDATION
// ============================================================================

/**
 * Validate event type is one of 67 defined types
 */
export function validateEventType(type: string): Effect.Effect<void, EventError> {
  if (!isValidEventType(type)) {
    return Effect.fail({
      _tag: "InvalidEventTypeError",
      type,
      validTypes: [...EVENT_TYPES],
    });
  }
  return Effect.succeed(undefined);
}

/**
 * Validate event has required fields
 */
export function validateEventFields(
  type: string,
  actorId: string
): Effect.Effect<void, EventError> {
  if (!type || type.trim() === "") {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Event type is required",
    });
  }

  if (!actorId || actorId.trim() === "") {
    return Effect.fail({
      _tag: "ValidationError",
      message: "Actor ID is required",
    });
  }

  return Effect.succeed(undefined);
}

// ============================================================================
// BUSINESS RULE VALIDATION
// ============================================================================

/**
 * Validate organization is active
 */
export function validateOrganizationActive(
  status: string
): Effect.Effect<void, ThingError> {
  if (status !== "active") {
    return Effect.fail({
      _tag: "BusinessRuleError",
      message: "Organization is not active",
      rule: "org_must_be_active",
    });
  }
  return Effect.succeed(undefined);
}

/**
 * Validate resource limit not exceeded
 */
export function validateResourceLimit(
  usage: number,
  limit: number,
  resource: string
): Effect.Effect<void, ThingError> {
  if (usage >= limit) {
    return Effect.fail({
      _tag: "LimitExceededError",
      resource,
      limit,
      usage,
    });
  }
  return Effect.succeed(undefined);
}

/**
 * Validate user has permission
 */
export function validatePermission(
  hasPermission: boolean,
  userId: string,
  action: string
): Effect.Effect<void, ThingError> {
  if (!hasPermission) {
    return Effect.fail({
      _tag: "UnauthorizedError",
      userId,
      action,
    });
  }
  return Effect.succeed(undefined);
}
