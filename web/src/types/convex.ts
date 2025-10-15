/**
 * Convex type definitions for frontend
 * These types allow the frontend to be independent of backend generated types
 */

/**
 * Convex Id type - matches the structure from convex/_generated/dataModel
 * but defined locally so frontend doesn't depend on backend
 */
export type Id<TableName extends string> = string & { __tableName: TableName };

/**
 * Table names in the backend schema
 */
export type TableNames = 
  | "entities"
  | "connections" 
  | "events"
  | "knowledge"
  | "thingTags"
  | "organizations"
  | "people";
