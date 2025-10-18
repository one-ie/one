/**
 * OrganizationService - Multi-Tenant Organization Operations
 *
 * Handles organization creation, resource quotas, usage tracking, and billing.
 * Enforces multi-tenant isolation and plan-based limits.
 */

import { Effect } from "effect";
import {
  DataProviderService,
} from "../providers/DataProvider";
import {
  DEFAULT_LIMITS,
  isValidPlan,
  type OrganizationPlan,
} from "./constants";
import type { CreateOrganizationArgs, OrganizationError } from "./types";

// ============================================================================
// ORGANIZATION SERVICE
// ============================================================================

export class OrganizationService {
  /**
   * Create a new organization with default limits
   */
  static create = (args: CreateOrganizationArgs) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate plan
      const plan = args.plan || "starter";
      if (!isValidPlan(plan)) {
        return yield* Effect.fail<OrganizationError>({
          _tag: "InvalidPlanError",
          plan,
        });
      }

      // Get default limits for plan
      const limits = DEFAULT_LIMITS[plan];

      // Create organization thing
      const orgId = yield* provider.things.create({
        type: "organization",
        name: args.name,
        status: "active",
        properties: {
          name: args.name,
          slug: args.slug,
          plan,
          limits,
          usage: {
            users: 0,
            storage: 0,
            apiCalls: 0,
            inference: 0,
            courses: 0,
            clones: 0,
          },
          status: "active",
          settings: {
            allowSignups: true,
            requireEmailVerification: false,
            enableTwoFactor: false,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });

      // If creator provided, create ownership connection
      if (args.creatorId) {
        yield* provider.connections.create({
          fromEntityId: args.creatorId,
          toEntityId: orgId,
          relationshipType: "owns",
          metadata: {
            role: "org_owner",
          },
        });

        // Create member_of connection
        yield* provider.connections.create({
          fromEntityId: args.creatorId,
          toEntityId: orgId,
          relationshipType: "member_of",
          metadata: {
            role: "org_owner",
            joinedAt: Date.now(),
          },
        });
      }

      // Log creation event
      yield* provider.events.create({
        type: "organization_created",
        actorId: args.creatorId || "system",
        targetId: orgId,
        metadata: {
          name: args.name,
          slug: args.slug,
          plan,
        },
      });

      return orgId;
    });

  /**
   * Get organization by ID
   */
  static get = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const org = yield* provider.things.get(id);

      // Validate is organization
      if (org.type !== "organization") {
        return yield* Effect.fail<OrganizationError>({
          _tag: "ValidationError",
          message: "Thing is not an organization",
        });
      }

      return org;
    });

  /**
   * Get organization by slug
   */
  static getBySlug = (slug: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // List all organizations
      const orgs = yield* provider.things.list({ type: "organization" });

      // Find by slug
      const org = orgs.find((o) => o.properties.slug === slug);

      if (!org) {
        return yield* Effect.fail<OrganizationError>({
          _tag: "NotFoundError",
          id: slug,
        });
      }

      return org;
    });

  /**
   * Check if organization has capacity for resource
   */
  static checkLimit = (orgId: string, resource: string) =>
    Effect.gen(function* () {
      const org = yield* OrganizationService.get(orgId);

      const limit = org.properties.limits[resource];
      const usage = org.properties.usage[resource];

      if (limit === undefined || usage === undefined) {
        return yield* Effect.fail<OrganizationError>({
          _tag: "ValidationError",
          message: `Unknown resource: ${resource}`,
        });
      }

      return {
        canProceed: usage < limit,
        remaining: limit - usage,
        limit,
        usage,
      };
    });

  /**
   * Update organization usage counter
   */
  static updateUsage = (orgId: string, resource: string, delta: number) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const org = yield* OrganizationService.get(orgId);

      const currentUsage = org.properties.usage[resource] || 0;
      const newUsage = Math.max(0, currentUsage + delta);

      // Update usage
      yield* provider.things.update(orgId, {
        properties: {
          ...org.properties,
          usage: {
            ...org.properties.usage,
            [resource]: newUsage,
          },
          updatedAt: Date.now(),
        },
      });

      // Log usage update
      yield* provider.events.create({
        type: "organization_updated",
        actorId: "system",
        targetId: orgId,
        metadata: {
          resource,
          delta,
          previousUsage: currentUsage,
          newUsage,
        },
      });

      return newUsage;
    });

  /**
   * Upgrade organization plan
   */
  static upgradePlan = (orgId: string, newPlan: OrganizationPlan, actorId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate plan
      if (!isValidPlan(newPlan)) {
        return yield* Effect.fail<OrganizationError>({
          _tag: "InvalidPlanError",
          plan: newPlan,
        });
      }

      const org = yield* OrganizationService.get(orgId);
      const oldPlan = org.properties.plan;

      // Get new limits
      const newLimits = DEFAULT_LIMITS[newPlan];

      // Update organization
      yield* provider.things.update(orgId, {
        properties: {
          ...org.properties,
          plan: newPlan,
          limits: newLimits,
          updatedAt: Date.now(),
        },
      });

      // Log plan change
      yield* provider.events.create({
        type: "organization_updated",
        actorId,
        targetId: orgId,
        metadata: {
          action: "plan_upgraded",
          oldPlan,
          newPlan,
        },
      });

      return yield* OrganizationService.get(orgId);
    });

  /**
   * Suspend organization
   */
  static suspend = (orgId: string, reason: string, actorId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const org = yield* OrganizationService.get(orgId);

      // Update status
      yield* provider.things.update(orgId, {
        properties: {
          ...org.properties,
          status: "suspended",
          suspendedAt: Date.now(),
          suspendedReason: reason,
          updatedAt: Date.now(),
        },
      });

      // Log suspension
      yield* provider.events.create({
        type: "organization_updated",
        actorId,
        targetId: orgId,
        metadata: {
          action: "suspended",
          reason,
        },
      });

      return yield* OrganizationService.get(orgId);
    });

  /**
   * Activate organization
   */
  static activate = (orgId: string, actorId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const org = yield* OrganizationService.get(orgId);

      // Update status
      yield* provider.things.update(orgId, {
        properties: {
          ...org.properties,
          status: "active",
          suspendedAt: undefined,
          suspendedReason: undefined,
          updatedAt: Date.now(),
        },
      });

      // Log activation
      yield* provider.events.create({
        type: "organization_updated",
        actorId,
        targetId: orgId,
        metadata: {
          action: "activated",
        },
      });

      return yield* OrganizationService.get(orgId);
    });

  /**
   * Get organization members
   */
  static getMembers = (orgId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get member_of connections TO this organization
      const connections = yield* provider.connections.list({
        toEntityId: orgId,
        relationshipType: "member_of",
      });

      // Get person things
      const members = [];
      for (const conn of connections) {
        const person = yield* provider.things.get(conn.fromEntityId);
        members.push({
          ...person,
          role: conn.metadata?.role || "org_user",
          joinedAt: conn.metadata?.joinedAt || conn.createdAt,
        });
      }

      return members;
    });

  /**
   * Get organization statistics
   */
  static getStatistics = (orgId: string) =>
    Effect.gen(function* () {
      const org = yield* OrganizationService.get(orgId);
      const members = yield* OrganizationService.getMembers(orgId);

      return {
        organization: {
          id: org._id,
          name: org.properties.name,
          plan: org.properties.plan,
          status: org.properties.status,
        },
        members: {
          total: members.length,
          byRole: members.reduce(
            (acc, m) => {
              acc[m.role] = (acc[m.role] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
        },
        usage: org.properties.usage,
        limits: org.properties.limits,
        utilization: Object.entries(org.properties.usage).reduce(
          (acc, [key, value]) => {
            const limit = org.properties.limits[key];
            acc[key] = limit > 0 ? ((value as number) / limit) * 100 : 0;
            return acc;
          },
          {} as Record<string, number>
        ),
      };
    });

  /**
   * List all organizations
   */
  static list = (limit?: number) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.things.list({
        type: "organization",
        limit,
      });
    });
}
