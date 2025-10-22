/**
 * Template-Ontology Bridge
 *
 * This module provides type-safe transformations between template-specific
 * types and the 6-dimension ontology types from the backend.
 *
 * Pattern:
 * - Template types (Product, CartItem) → Ontology types (Thing with type: 'product')
 * - Ontology types → Template types
 * - Type-safe conversions with validation
 *
 * Usage:
 * ```ts
 * // Convert template type to ontology thing
 * const thing = productToThing(product);
 *
 * // Convert ontology thing to template type
 * const product = thingToProduct(thing);
 * ```
 */

import type { Id } from '@/types/convex';

// ============================================================================
// Core Ontology Types
// ============================================================================

/**
 * Base Thing entity from 6-dimension ontology
 * Represents ANY entity in the system (products, users, content, etc.)
 */
export interface Thing {
  _id: Id<'entities'>;
  _creationTime: number;
  groupId: Id<'groups'>;
  type: string; // Will be specific like 'product', 'user', 'blog_post', etc.
  name: string;
  properties: Record<string, any>;
  status?: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

/**
 * Connection entity from 6-dimension ontology
 * Represents relationships between things
 */
export interface Connection {
  _id: Id<'connections'>;
  _creationTime: number;
  groupId: Id<'groups'>;
  fromEntityId: Id<'entities'>;
  toEntityId: Id<'entities'>;
  relationshipType: string; // e.g., 'purchased', 'in_cart', 'variant_of'
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

/**
 * Event entity from 6-dimension ontology
 * Represents actions/state changes over time
 */
export interface Event {
  _id: Id<'events'>;
  _creationTime: number;
  groupId: Id<'groups'>;
  type: string; // e.g., 'product_added_to_cart', 'order_placed'
  actorId: Id<'entities'>;
  targetId?: Id<'entities'>;
  timestamp: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Template Interface Types
// ============================================================================

/**
 * Generic template entity
 * Base type that all template types should extend
 */
export interface TemplateEntity {
  id: string;
  [key: string]: any;
}

/**
 * Input type for creating a new Thing in the ontology
 */
export interface CreateThingInput {
  groupId: Id<'groups'>;
  type: string;
  name: string;
  properties: Record<string, any>;
  status?: 'active' | 'inactive' | 'draft' | 'published' | 'archived';
}

/**
 * Input type for creating a new Connection in the ontology
 */
export interface CreateConnectionInput {
  groupId: Id<'groups'>;
  fromEntityId: Id<'entities'>;
  toEntityId: Id<'entities'>;
  relationshipType: string;
  metadata?: Record<string, any>;
}

/**
 * Input type for creating a new Event in the ontology
 */
export interface CreateEventInput {
  groupId: Id<'groups'>;
  type: string;
  actorId: Id<'entities'>;
  targetId?: Id<'entities'>;
  metadata?: Record<string, any>;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a Thing has a specific type
 */
export function isThingOfType<T extends string>(
  thing: Thing,
  type: T
): thing is Thing & { type: T } {
  return thing.type === type;
}

/**
 * Check if a Connection has a specific relationship type
 */
export function isConnectionOfType<T extends string>(
  connection: Connection,
  relationshipType: T
): connection is Connection & { relationshipType: T } {
  return connection.relationshipType === relationshipType;
}

/**
 * Check if an Event has a specific type
 */
export function isEventOfType<T extends string>(
  event: Event,
  type: T
): event is Event & { type: T } {
  return event.type === type;
}

// ============================================================================
// Generic Conversion Utilities
// ============================================================================

/**
 * Convert a template entity to a Thing
 *
 * This is a generic converter that works for any template type.
 * Template-specific adapters should use this as a base.
 *
 * @param entity - Template entity (Product, BlogPost, etc.)
 * @param type - Ontology thing type ('product', 'blog_post', etc.)
 * @param groupId - Group ID for multi-tenant isolation
 * @param propertyMapper - Function to map entity fields to properties
 */
export function templateToThing<T extends TemplateEntity>(
  entity: T,
  type: string,
  groupId: Id<'groups'>,
  propertyMapper: (entity: T) => Record<string, any>
): CreateThingInput {
  return {
    groupId,
    type,
    name: entity.name || entity.title || entity.id,
    properties: propertyMapper(entity),
    status: entity.status || 'active',
  };
}

/**
 * Convert a Thing to a template entity
 *
 * This is a generic converter that works for any template type.
 * Template-specific adapters should use this as a base.
 *
 * @param thing - Ontology thing
 * @param entityMapper - Function to map thing to template entity
 */
export function thingToTemplate<T extends TemplateEntity>(
  thing: Thing,
  entityMapper: (thing: Thing) => T
): T {
  return entityMapper(thing);
}

// ============================================================================
// Property Helpers
// ============================================================================

/**
 * Extract specific properties from a Thing
 * Type-safe property extraction with validation
 */
export function getProperty<T>(
  thing: Thing,
  key: string,
  defaultValue?: T
): T | undefined {
  const value = thing.properties[key];
  return value !== undefined ? (value as T) : defaultValue;
}

/**
 * Get required property or throw error
 */
export function getRequiredProperty<T>(thing: Thing, key: string): T {
  const value = thing.properties[key];
  if (value === undefined) {
    throw new Error(
      `Required property '${key}' not found on thing ${thing._id}`
    );
  }
  return value as T;
}

/**
 * Map multiple properties at once
 */
export function mapProperties<T extends Record<string, any>>(
  thing: Thing,
  propertyMap: Record<keyof T, string>
): T {
  const result: any = {};
  for (const [targetKey, sourceKey] of Object.entries(propertyMap)) {
    result[targetKey] = thing.properties[sourceKey];
  }
  return result;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate that a Thing has required properties
 */
export function validateThingProperties(
  thing: Thing,
  requiredProperties: string[]
): void {
  const missing = requiredProperties.filter(
    (prop) => thing.properties[prop] === undefined
  );

  if (missing.length > 0) {
    throw new Error(
      `Thing ${thing._id} is missing required properties: ${missing.join(', ')}`
    );
  }
}

/**
 * Validate thing type matches expected type
 */
export function validateThingType(
  thing: Thing,
  expectedType: string
): void {
  if (thing.type !== expectedType) {
    throw new Error(
      `Expected thing type '${expectedType}', got '${thing.type}'`
    );
  }
}

// ============================================================================
// Batch Conversion Utilities
// ============================================================================

/**
 * Convert array of template entities to Things
 */
export function batchTemplateToThing<T extends TemplateEntity>(
  entities: T[],
  type: string,
  groupId: Id<'groups'>,
  propertyMapper: (entity: T) => Record<string, any>
): CreateThingInput[] {
  return entities.map((entity) =>
    templateToThing(entity, type, groupId, propertyMapper)
  );
}

/**
 * Convert array of Things to template entities
 */
export function batchThingToTemplate<T extends TemplateEntity>(
  things: Thing[],
  entityMapper: (thing: Thing) => T
): T[] {
  return things.map((thing) => thingToTemplate(thing, entityMapper));
}

// ============================================================================
// Status Helpers
// ============================================================================

/**
 * Map template status to ontology status
 */
export function mapStatus(
  templateStatus: string
): 'active' | 'inactive' | 'draft' | 'published' | 'archived' {
  const statusMap: Record<string, Thing['status']> = {
    available: 'active',
    unavailable: 'inactive',
    draft: 'draft',
    published: 'published',
    archived: 'archived',
    active: 'active',
    inactive: 'inactive',
  };

  return statusMap[templateStatus.toLowerCase()] || 'active';
}

/**
 * Map ontology status to template-specific status
 */
export function mapStatusToTemplate(
  ontologyStatus: Thing['status'],
  templateStatusMap?: Record<string, string>
): string {
  if (!ontologyStatus) return 'active';

  if (templateStatusMap) {
    return templateStatusMap[ontologyStatus] || ontologyStatus;
  }

  return ontologyStatus;
}

// ============================================================================
// Type Export
// ============================================================================
// All types and functions are exported individually above
