/**
 * PeopleService - Authorization & Governance Operations
 *
 * Handles user roles, permissions, organization membership, and access control.
 * Enforces role-based authorization (platform_owner, org_owner, org_user, customer).
 */

import { Effect } from "effect";
import {
  DataProviderService,
} from "../providers/DataProvider";
import { isValidRole, type Role } from "./constants";
import type { PeopleError } from "./types";

// ============================================================================
// PEOPLE SERVICE
// ============================================================================

export class PeopleService {
  /**
   * Get person by ID
   */
  static get = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const person = yield* provider.things.get(id);

      // Validate is person (creator or audience_member)
      if (person.type !== "creator" && person.type !== "audience_member") {
        return yield* Effect.fail<PeopleError>({
          _tag: "NotFoundError",
          id,
        });
      }

      return person;
    });

  /**
   * Get person by email
   */
  static getByEmail = (email: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // List all creators and audience_members
      const creators = yield* provider.things.list({ type: "creator" });
      const audienceMembers = yield* provider.things.list({
        type: "audience_member",
      });

      const allPeople = [...creators, ...audienceMembers];

      // Find by email
      const person = allPeople.find((p) => p.properties.email === email);

      if (!person) {
        return yield* Effect.fail<PeopleError>({
          _tag: "NotFoundError",
          id: email,
        });
      }

      return person;
    });

  /**
   * Check if person has permission to perform action
   */
  static checkPermission = (
    personId: string,
    action: string,
    resourceId?: string
  ) =>
    Effect.gen(function* () {
      const person = yield* PeopleService.get(personId);
      const role = person.properties.role as Role;

      // Platform owner has all permissions
      if (role === "platform_owner") {
        return true;
      }

      // Org owner has all permissions within their organization
      if (role === "org_owner") {
        // If resource provided, check if they own it
        if (resourceId) {
          const provider = yield* DataProviderService;
          const resource = yield* provider.things.get(resourceId);

          // Check if person's org matches resource's org
          return (
            person.properties.organizationId === resource.properties.organizationId
          );
        }
        return true;
      }

      // Org user has limited permissions
      if (role === "org_user") {
        // Check custom permissions array
        const permissions = person.properties.permissions || [];
        return permissions.includes(action);
      }

      // Customer has no admin permissions
      if (role === "customer") {
        return false;
      }

      return false;
    });

  /**
   * Get all organizations a person belongs to
   */
  static getOrganizations = (personId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get member_of connections FROM this person
      const connections = yield* provider.connections.list({
        fromEntityId: personId,
        relationshipType: "member_of",
      });

      // Get organization things
      const organizations = [];
      for (const conn of connections) {
        const org = yield* provider.things.get(conn.toEntityId);
        organizations.push({
          ...org,
          role: conn.metadata?.role || "org_user",
          joinedAt: conn.metadata?.joinedAt || conn.createdAt,
        });
      }

      return organizations;
    });

  /**
   * Switch person's active organization
   */
  static switchOrganization = (personId: string, orgId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const person = yield* PeopleService.get(personId);

      // Verify person is member of target organization
      const orgs = yield* PeopleService.getOrganizations(personId);
      const isMember = orgs.some((o) => o._id === orgId);

      if (!isMember) {
        return yield* Effect.fail<PeopleError>({
          _tag: "UnauthorizedError",
          userId: personId,
          action: "switch_organization",
        });
      }

      // Update person's current organizationId
      yield* provider.things.update(personId, {
        properties: {
          ...person.properties,
          organizationId: orgId,
          updatedAt: Date.now(),
        },
      });

      // Log switch event
      yield* provider.events.create({
        type: "profile_updated",
        actorId: personId,
        targetId: personId,
        metadata: {
          action: "switched_organization",
          organizationId: orgId,
        },
      });

      return yield* PeopleService.get(personId);
    });

  /**
   * Add person to organization with role
   */
  static addToOrganization = (
    personId: string,
    orgId: string,
    role: Role,
    invitedBy?: string
  ) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate role
      if (!isValidRole(role)) {
        return yield* Effect.fail<PeopleError>({
          _tag: "InvalidRoleError",
          role,
        });
      }

      // Check if already member
      const orgs = yield* PeopleService.getOrganizations(personId);
      const isMember = orgs.some((o) => o._id === orgId);

      if (isMember) {
        return yield* Effect.fail<PeopleError>({
          _tag: "ValidationError" as any,
          userId: personId,
          action: "add_to_organization",
        });
      }

      // Create member_of connection
      const connectionId = yield* provider.connections.create({
        fromEntityId: personId,
        toEntityId: orgId,
        relationshipType: "member_of",
        metadata: {
          role,
          joinedAt: Date.now(),
          invitedBy,
        },
      });

      // If first organization, set as active
      const person = yield* PeopleService.get(personId);
      if (!person.properties.organizationId) {
        yield* provider.things.update(personId, {
          properties: {
            ...person.properties,
            organizationId: orgId,
            updatedAt: Date.now(),
          },
        });
      }

      // Log join event
      yield* provider.events.create({
        type: "user_joined_org",
        actorId: personId,
        targetId: orgId,
        metadata: {
          role,
          invitedBy,
        },
      });

      return connectionId;
    });

  /**
   * Remove person from organization
   */
  static removeFromOrganization = (
    personId: string,
    orgId: string,
    removedBy: string
  ) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get member_of connection
      const connections = yield* provider.connections.list({
        fromEntityId: personId,
        toEntityId: orgId,
        relationshipType: "member_of",
      });

      if (connections.length === 0) {
        return yield* Effect.fail<PeopleError>({
          _tag: "NotFoundError",
          id: `${personId}-${orgId}`,
        });
      }

      // Delete connection
      yield* provider.connections.delete(connections[0]._id);

      // If this was active organization, switch to first available
      const person = yield* PeopleService.get(personId);
      if (person.properties.organizationId === orgId) {
        const remainingOrgs = yield* PeopleService.getOrganizations(personId);

        yield* provider.things.update(personId, {
          properties: {
            ...person.properties,
            organizationId: remainingOrgs[0]?._id,
            updatedAt: Date.now(),
          },
        });
      }

      // Log removal event
      yield* provider.events.create({
        type: "user_removed_from_org",
        actorId: removedBy,
        targetId: orgId,
        metadata: {
          removedUserId: personId,
        },
      });
    });

  /**
   * Update person role in organization
   */
  static updateRole = (
    personId: string,
    orgId: string,
    newRole: Role,
    updatedBy: string
  ) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate role
      if (!isValidRole(newRole)) {
        return yield* Effect.fail<PeopleError>({
          _tag: "InvalidRoleError",
          role: newRole,
        });
      }

      // Get member_of connection
      const connections = yield* provider.connections.list({
        fromEntityId: personId,
        toEntityId: orgId,
        relationshipType: "member_of",
      });

      if (connections.length === 0) {
        return yield* Effect.fail<PeopleError>({
          _tag: "NotFoundError",
          id: `${personId}-${orgId}`,
        });
      }

      const oldConnection = connections[0];
      const oldRole = oldConnection.metadata?.role;

      // Delete old connection and create new one with updated role
      yield* provider.connections.delete(oldConnection._id);

      const newConnectionId = yield* provider.connections.create({
        fromEntityId: personId,
        toEntityId: orgId,
        relationshipType: "member_of",
        metadata: {
          ...oldConnection.metadata,
          role: newRole,
          roleUpdatedAt: Date.now(),
          roleUpdatedBy: updatedBy,
        },
      });

      // Log role change
      yield* provider.events.create({
        type: "profile_updated",
        actorId: updatedBy,
        targetId: personId,
        metadata: {
          action: "role_updated",
          organizationId: orgId,
          oldRole,
          newRole,
        },
      });

      return newConnectionId;
    });

  /**
   * Get person's role in organization
   */
  static getRoleInOrganization = (personId: string, orgId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get member_of connection
      const connections = yield* provider.connections.list({
        fromEntityId: personId,
        toEntityId: orgId,
        relationshipType: "member_of",
      });

      if (connections.length === 0) {
        return null;
      }

      return (connections[0].metadata?.role as Role) || "org_user";
    });

  /**
   * Check if person is org owner
   */
  static isOrgOwner = (personId: string, orgId: string) =>
    Effect.gen(function* () {
      const role = yield* PeopleService.getRoleInOrganization(personId, orgId);
      return role === "org_owner";
    });

  /**
   * Check if person is platform owner
   */
  static isPlatformOwner = (personId: string) =>
    Effect.gen(function* () {
      const person = yield* PeopleService.get(personId);
      return person.properties.role === "platform_owner";
    });

  /**
   * List all people in organization
   */
  static listByOrganization = (orgId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get member_of connections TO this organization
      const connections = yield* provider.connections.list({
        toEntityId: orgId,
        relationshipType: "member_of",
      });

      // Get person things
      const people = [];
      for (const conn of connections) {
        const person = yield* provider.things.get(conn.fromEntityId);
        people.push({
          ...person,
          role: conn.metadata?.role || "org_user",
          joinedAt: conn.metadata?.joinedAt || conn.createdAt,
        });
      }

      return people;
    });
}
