/**
 * Service Layer Exports
 *
 * Backend-agnostic business logic services for the ONE Platform.
 * Complete 6-dimension architecture with validation and error handling.
 */

// Core Services
export { ThingService } from "./ThingService";
export { ConnectionService } from "./ConnectionService";
export { EventService } from "./EventService";
export { KnowledgeService } from "./KnowledgeService";
export { OrganizationService } from "./OrganizationService";
export { PeopleService } from "./PeopleService";

// Types
export * from "./types";
export * from "./constants";
