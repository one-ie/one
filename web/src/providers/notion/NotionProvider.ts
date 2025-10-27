/**
 * NotionProvider - Notion API Implementation of DataProvider
 *
 * Maps Notion databases and pages to ONE ontology:
 * - Notion Pages → things (type determined by database)
 * - Notion Relations → connections
 * - Notion Database Properties → knowledge (labels)
 * - Page Updates → events
 *
 * Uses @notionhq/client for API access
 * Supports all 6 dimensions of the ONE ontology
 */

import { Effect, Layer } from "effect";
import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import type {
  DataProvider,
  Group,
  Thing,
  Connection,
  Event,
  Knowledge,
  ThingKnowledge,
  CreateThingInput,
  UpdateThingInput,
  CreateGroupInput,
  UpdateGroupInput,
  CreateConnectionInput,
  CreateEventInput,
  CreateKnowledgeInput,
  ListThingsOptions,
  ListConnectionsOptions,
  ListEventsOptions,
  ListGroupsOptions,
  SearchKnowledgeOptions,
} from "../DataProvider";
import {
  DataProviderService,
  ThingNotFoundError,
  ThingCreateError,
  ThingUpdateError,
  ConnectionNotFoundError,
  ConnectionCreateError,
  QueryError,
  EventCreateError,
  KnowledgeNotFoundError,
  GroupNotFoundError,
  GroupCreateError,
} from "../DataProvider";

// ============================================================================
// CONFIG
// ============================================================================

export interface NotionProviderConfig {
  auth: string; // Notion integration token
  organizationId: string; // ONE organization ID
  databaseIds: Record<string, string>; // thing type → database ID mapping
  convexUrl?: string; // For hybrid event/knowledge storage
}

// ============================================================================
// NOTION API HELPERS
// ============================================================================

type NotionPropertyValue =
  | { type: "title"; title: Array<{ text: { content: string } }> }
  | { type: "rich_text"; rich_text: Array<{ text: { content: string } }> }
  | { type: "number"; number: number | null }
  | { type: "select"; select: { name: string } | null }
  | { type: "multi_select"; multi_select: Array<{ name: string }> }
  | { type: "date"; date: { start: string } | null }
  | { type: "checkbox"; checkbox: boolean }
  | { type: "url"; url: string | null }
  | { type: "email"; email: string | null }
  | { type: "phone_number"; phone_number: string | null }
  | { type: "relation"; relation: Array<{ id: string }> };

// ============================================================================
// NOTION PROVIDER IMPLEMENTATION
// ============================================================================

export const makeNotionProvider = (config: NotionProviderConfig): DataProvider => {
  const notion = new Client({ auth: config.auth });

  // ===== ID CONVERTERS =====

  const notionIdToOneId = (notionId: string): string => {
    // Notion IDs: 8-4-4-4-12 format with hyphens
    // ONE IDs: notion_<32-char-hex>
    return `notion_${notionId.replace(/-/g, "")}`;
  };

  const oneIdToNotionId = (oneId: string): string => {
    // Convert notion_abc123... back to abc12345-6789-...
    const match = oneId.match(/^notion_([a-f0-9]{32})$/);
    if (!match) throw new Error(`Invalid ONE ID for Notion: ${oneId}`);

    const id = match[1];
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
  };

  // ===== STATUS MAPPERS =====

  const mapOntologyStatusToNotion = (status: string): string => {
    const mapping: Record<string, string> = {
      draft: "Draft",
      active: "Active",
      published: "Published",
      archived: "Archived",
      inactive: "Inactive",
    };
    return mapping[status] || "Draft";
  };

  const mapNotionStatusToOntology = (notionStatus: string): string => {
    const mapping: Record<string, string> = {
      Draft: "draft",
      Active: "active",
      Published: "published",
      Archived: "archived",
      Inactive: "inactive",
    };
    return mapping[notionStatus] || "draft";
  };

  // ===== PROPERTY EXTRACTORS =====

  const extractTitleFromProperties = (properties: Record<string, any>): string => {
    // Find first title property
    for (const [key, value] of Object.entries(properties)) {
      if (value.type === "title" && value.title?.[0]?.text?.content) {
        return value.title[0].text.content;
      }
    }
    return "Untitled";
  };

  const extractStatusFromProperties = (properties: Record<string, any>): "draft" | "active" | "published" | "archived" => {
    const status = properties.Status?.select?.name
      ? mapNotionStatusToOntology(properties.Status.select.name)
      : "draft";

    // Type guard to ensure status is valid
    if (status === "draft" || status === "active" || status === "published" || status === "archived") {
      return status;
    }
    return "draft";
  };

  const extractPropertiesFromNotion = async (
    properties: Record<string, any>
  ): Promise<Record<string, any>> => {
    const extracted: Record<string, any> = {};

    // Try to parse stored JSON properties
    if (properties["ONE Properties"]?.rich_text?.[0]?.text?.content) {
      try {
        Object.assign(
          extracted,
          JSON.parse(properties["ONE Properties"].rich_text[0].text.content)
        );
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Extract individual properties by type
    for (const [key, value] of Object.entries(properties)) {
      const prop = value as NotionPropertyValue;

      switch (prop.type) {
        case "rich_text":
          if (prop.rich_text?.[0]?.text?.content) {
            extracted[camelCase(key)] = prop.rich_text[0].text.content;
          }
          break;
        case "number":
          if (prop.number !== null && prop.number !== undefined) {
            extracted[camelCase(key)] = prop.number;
          }
          break;
        case "select":
          if (prop.select?.name) {
            extracted[camelCase(key)] = prop.select.name;
          }
          break;
        case "multi_select":
          if (prop.multi_select) {
            extracted[camelCase(key)] = prop.multi_select.map((s) => s.name);
          }
          break;
        case "date":
          if (prop.date?.start) {
            extracted[camelCase(key)] = new Date(prop.date.start).getTime();
          }
          break;
        case "checkbox":
          extracted[camelCase(key)] = prop.checkbox;
          break;
        case "url":
          if (prop.url) {
            extracted[camelCase(key)] = prop.url;
          }
          break;
        case "email":
          if (prop.email) {
            extracted[camelCase(key)] = prop.email;
          }
          break;
        case "phone_number":
          if (prop.phone_number) {
            extracted[camelCase(key)] = prop.phone_number;
          }
          break;
        case "relation":
          if (prop.relation) {
            extracted[camelCase(key)] = prop.relation.map((r) => notionIdToOneId(r.id));
          }
          break;
      }
    }

    return extracted;
  };

  // ===== MAPPERS =====

  const mapNotionPageToThing = async (page: PageObjectResponse, thingType: string): Promise<Thing> => {
    const props = (page as any).properties;

    return {
      _id: notionIdToOneId(page.id),
      type: thingType,
      name: extractTitleFromProperties(props),
      status: extractStatusFromProperties(props) as any,
      createdAt: new Date(page.created_time).getTime(),
      updatedAt: new Date(page.last_edited_time).getTime(),
      properties: {
        organizationId: config.organizationId,
        ...(await extractPropertiesFromNotion(props)),
        notionPageId: page.id,
        notionUrl: page.url,
      },
    };
  };

  const transformThingPropertiesToNotion = (thing: CreateThingInput): Record<string, any> => {
    const properties: Record<string, any> = {
      Name: {
        title: [{ text: { content: thing.name } }],
      },
      Status: {
        select: { name: mapOntologyStatusToNotion(thing.status || "draft") },
      },
    };

    // Organization ID (text field)
    properties["Organization ID"] = {
      rich_text: [{ text: { content: config.organizationId } }],
    };

    // Map common properties to Notion format
    if (thing.properties) {
      if (thing.properties.content) {
        properties.Content = {
          rich_text: [{ text: { content: thing.properties.content } }],
        };
      }
      if (thing.properties.duration !== undefined) {
        properties.Duration = { number: thing.properties.duration };
      }
      if (thing.properties.price !== undefined) {
        properties.Price = { number: thing.properties.price };
      }
      if (thing.properties.currency) {
        properties.Currency = { select: { name: thing.properties.currency } };
      }
      if (thing.properties.difficulty) {
        properties.Difficulty = { select: { name: thing.properties.difficulty } };
      }

      // Store full properties as JSON
      properties["ONE Properties"] = {
        rich_text: [{ text: { content: JSON.stringify(thing.properties) } }],
      };
    }

    return properties;
  };

  const transformPropertiesToNotionUpdate = (properties: Record<string, any>): Record<string, any> => {
    const notionProps: Record<string, any> = {};

    if (properties.content) {
      notionProps.Content = {
        rich_text: [{ text: { content: properties.content } }],
      };
    }
    if (properties.duration !== undefined) {
      notionProps.Duration = { number: properties.duration };
    }
    if (properties.price !== undefined) {
      notionProps.Price = { number: properties.price };
    }
    if (properties.currency) {
      notionProps.Currency = { select: { name: properties.currency } };
    }
    if (properties.difficulty) {
      notionProps.Difficulty = { select: { name: properties.difficulty } };
    }

    // Update full properties JSON
    notionProps["ONE Properties"] = {
      rich_text: [{ text: { content: JSON.stringify(properties) } }],
    };

    return notionProps;
  };

  // ===== UTILITY FUNCTIONS =====

  const camelCase = (str: string): string => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
        index === 0 ? letter.toLowerCase() : letter.toUpperCase()
      )
      .replace(/\s+/g, "");
  };

  const findTypeByDatabaseId = (databaseId: string): string => {
    for (const [type, dbId] of Object.entries(config.databaseIds)) {
      if (dbId === databaseId) return type;
    }
    return "unknown";
  };

  // ===== RELATIONSHIP MAPPERS =====

  const mapRelationshipToNotionProperty = (relationshipType: string): string => {
    const mapping: Record<string, string> = {
      owns: "Owner",
      part_of: "Parent",
      enrolled_in: "Enrollments",
      authored: "Author",
      holds_tokens: "Token Holdings",
      delegated: "Delegated To",
      communicated: "Communicated With",
      transacted: "Transactions",
    };
    return mapping[relationshipType] || "Related";
  };

  const mapNotionPropertyToRelationship = (propertyName: string): string => {
    const mapping: Record<string, string> = {
      Owner: "owns",
      Parent: "part_of",
      Enrollments: "enrolled_in",
      Author: "authored",
      "Token Holdings": "holds_tokens",
      "Delegated To": "delegated",
      "Communicated With": "communicated",
      Transactions: "transacted",
    };
    return mapping[propertyName] || "related";
  };

  const generateConnectionId = (
    fromThingId: string,
    toThingId: string,
    relationshipType: string
  ): string => {
    return `notion_conn_${fromThingId}_${toThingId}_${relationshipType}`;
  };

  const parseConnectionId = (
    id: string
  ): { fromThingId: string; toThingId: string; relationshipType: string } => {
    const match = id.match(/^notion_conn_(.+)_(.+)_(.+)$/);
    if (!match) throw new Error(`Invalid Notion connection ID: ${id}`);
    return {
      fromThingId: match[1],
      toThingId: match[2],
      relationshipType: match[3],
    };
  };

  // ============================================================================
  // DATAPROVIDER INTERFACE IMPLEMENTATION
  // ============================================================================

  return {
    auth: {} as any, // Notion provider doesn't handle auth

    // ===== GROUPS =====
    groups: {
      get: (id: string) =>
        Effect.fail(
          new GroupNotFoundError(id, "Notion provider does not support groups")
        ),

      getBySlug: (slug: string) =>
        Effect.fail(
          new GroupNotFoundError(slug, "Notion provider does not support groups")
        ),

      list: () =>
        Effect.succeed([]),

      create: () =>
        Effect.fail(
          new GroupCreateError("Notion provider does not support creating groups")
        ),

      update: () =>
        Effect.fail(
          new GroupNotFoundError("", "Notion provider does not support updating groups")
        ),

      delete: () =>
        Effect.fail(
          new GroupNotFoundError("", "Notion provider does not support deleting groups")
        ),
    },

    // ===== THINGS =====
    things: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const notionId = oneIdToNotionId(id);
            const response = await notion.pages.retrieve({ page_id: notionId });

            if (!("properties" in response)) {
              throw new Error("Not a page");
            }

            const databaseId = (response.parent as any).database_id;
            const type = findTypeByDatabaseId(databaseId);

            return mapNotionPageToThing(response, type);
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),

      list: (options?: ListThingsOptions) =>
        Effect.tryPromise({
          try: async () => {
            if (!options?.type) {
              throw new QueryError("Notion provider requires type for listing things");
            }

            const databaseId = config.databaseIds[options.type];
            if (!databaseId) {
              throw new QueryError(`No Notion database configured for type: ${options.type}`);
            }

            // Build Notion filter
            const filter: any = {};

            if (options.status) {
              filter.property = "Status";
              filter.select = {
                equals: mapOntologyStatusToNotion(options.status),
              };
            }

            // Query Notion database
            const response = await (notion.databases as any).query({
              database_id: databaseId,
              filter: Object.keys(filter).length > 0 ? filter : undefined,
              page_size: options.limit || 10,
            });

            // Transform all pages
            const things = await Promise.all(
              response.results.map((page: any) => {
                if (!("properties" in page)) {
                  throw new Error("Not a page");
                }
                return mapNotionPageToThing(page as PageObjectResponse, options.type!);
              })
            );

            return things;
          },
          catch: (error) => new QueryError("Failed to list Notion pages", error),
        }),

      create: (input: CreateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const databaseId = config.databaseIds[input.type];
            if (!databaseId) {
              throw new ThingCreateError(`No Notion database configured for type: ${input.type}`);
            }

            // Transform to Notion properties
            const properties = transformThingPropertiesToNotion(input);

            // Create page in Notion
            const response = await notion.pages.create({
              parent: { database_id: databaseId },
              properties,
            });

            return notionIdToOneId(response.id);
          },
          catch: (error) => new ThingCreateError(String(error), error),
        }),

      update: (id: string, input: UpdateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const notionId = oneIdToNotionId(id);

            // Build properties update
            const properties: Record<string, any> = {};

            if (input.name) {
              properties.Name = { title: [{ text: { content: input.name } }] };
            }

            if (input.status) {
              properties.Status = {
                select: { name: mapOntologyStatusToNotion(input.status) },
              };
            }

            if (input.properties) {
              Object.assign(properties, transformPropertiesToNotionUpdate(input.properties));
            }

            // Update page in Notion
            await notion.pages.update({
              page_id: notionId,
              properties,
            });
          },
          catch: (error) => new ThingUpdateError(id, String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const notionId = oneIdToNotionId(id);

            // Notion doesn't have true delete, only archive
            await notion.pages.update({
              page_id: notionId,
              archived: true,
            });
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),
    },

    // ===== CONNECTIONS =====
    connections: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            // Parse connection ID
            const { fromThingId, toThingId, relationshipType } = parseConnectionId(id);

            // Note: this.connections refers to the parent DataProvider's connections object
            // We're inside connections.get, but need to call connections.list to verify
            // TypeScript sees this as possibly undefined due to the recursive structure
            // Verify relation exists
            const connections = await Effect.runPromise(
              // @ts-ignore - this.connections is defined as we're inside the connections object
              this.connections.list({ fromEntityId: fromThingId })
            ) as Connection[];
            const connection = connections?.find(
              (c: Connection) => c.toEntityId === toThingId && c.relationshipType === relationshipType
            );

            if (!connection) {
              throw new ConnectionNotFoundError(id, "Connection not found");
            }

            return connection;
          },
          catch: (error) => new ConnectionNotFoundError(id, String(error)),
        }),

      list: (options?: ListConnectionsOptions) =>
        Effect.tryPromise({
          try: async () => {
            if (!options?.fromEntityId && !options?.toEntityId) {
              throw new QueryError(
                "Notion connections.list requires fromEntityId or toEntityId"
              );
            }

            const fromId = options.fromEntityId;
            if (!fromId) return [];

            const notionId = oneIdToNotionId(fromId);

            // Get the source page
            const page = await notion.pages.retrieve({ page_id: notionId });

            if (!("properties" in page)) {
              throw new Error("Not a page");
            }

            const props = (page as any).properties;
            const connections: Connection[] = [];

            // Extract all relation properties
            for (const [propName, propValue] of Object.entries(props)) {
              const prop = propValue as any;

              if (prop.type === "relation" && prop.relation) {
                const relationshipType = mapNotionPropertyToRelationship(propName);

                for (const rel of prop.relation) {
                  connections.push({
                    _id: generateConnectionId(fromId, notionIdToOneId(rel.id), relationshipType),
                    fromEntityId: fromId,
                    toEntityId: notionIdToOneId(rel.id),
                    relationshipType: relationshipType as any,
                    metadata: { notionProperty: propName, protocol: "notion" },
                    createdAt: new Date(page.created_time).getTime(),
                  });
                }
              }
            }

            return connections;
          },
          catch: (error) => new QueryError("Failed to list Notion connections", error),
        }),

      create: (input: CreateConnectionInput) =>
        Effect.tryPromise({
          try: async () => {
            // Add relation to source page
            const fromNotionId = oneIdToNotionId(input.fromEntityId);
            const toNotionId = oneIdToNotionId(input.toEntityId);

            // Determine which property to update
            const propertyName = mapRelationshipToNotionProperty(input.relationshipType);

            // Get existing relations
            const page = await notion.pages.retrieve({ page_id: fromNotionId });
            if (!("properties" in page)) {
              throw new Error("Not a page");
            }

            const existingRelations = (page as any).properties[propertyName]?.relation || [];

            // Add new relation
            await notion.pages.update({
              page_id: fromNotionId,
              properties: {
                [propertyName]: {
                  relation: [
                    ...existingRelations.map((r: any) => ({ id: r.id })),
                    { id: toNotionId },
                  ],
                },
              },
            });

            return generateConnectionId(
              input.fromEntityId,
              input.toEntityId,
              input.relationshipType
            );
          },
          catch: (error) => new ConnectionCreateError(String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            // Parse connection ID
            const { fromThingId, toThingId, relationshipType } = parseConnectionId(id);

            const fromNotionId = oneIdToNotionId(fromThingId);
            const toNotionId = oneIdToNotionId(toThingId);

            // Determine which property to update
            const propertyName = mapRelationshipToNotionProperty(relationshipType);

            // Get existing relations
            const page = await notion.pages.retrieve({ page_id: fromNotionId });
            if (!("properties" in page)) {
              throw new Error("Not a page");
            }

            const existingRelations = (page as any).properties[propertyName]?.relation || [];

            // Remove the relation
            await notion.pages.update({
              page_id: fromNotionId,
              properties: {
                [propertyName]: {
                  relation: existingRelations
                    .filter((r: any) => r.id !== toNotionId)
                    .map((r: any) => ({ id: r.id })),
                },
              },
            });
          },
          catch: (error) => new ConnectionNotFoundError(id, String(error)),
        }),
    },

    // ===== EVENTS =====
    // NOTE: Notion doesn't support events natively - use hybrid approach with Convex
    events: {
      get: (id: string) =>
        Effect.fail(
          new QueryError("Notion provider does not support events - use Convex for event storage")
        ),

      list: (options?: ListEventsOptions) =>
        Effect.succeed([]), // Could integrate with Convex for hybrid storage

      create: (input: CreateEventInput) =>
        Effect.fail(
          new EventCreateError("Notion provider does not support events - use Convex for event storage")
        ),
    },

    // ===== KNOWLEDGE =====
    // NOTE: Notion doesn't support vector embeddings - use hybrid approach with Convex
    knowledge: {
      get: (id: string) =>
        Effect.fail(
          new KnowledgeNotFoundError(
            id,
            "Notion provider does not support knowledge - use Convex for knowledge storage"
          )
        ),

      list: (options?: SearchKnowledgeOptions) =>
        Effect.succeed([]), // Could integrate with Convex for hybrid storage

      create: (input: CreateKnowledgeInput) =>
        Effect.fail(
          new QueryError("Notion provider does not support knowledge - use Convex for knowledge storage")
        ),

      link: (thingId: string, knowledgeId: string, role?: ThingKnowledge["role"]) =>
        Effect.fail(
          new QueryError("Notion provider does not support knowledge - use Convex for knowledge storage")
        ),

      search: (embedding: number[], options?: SearchKnowledgeOptions) =>
        Effect.fail(
          new QueryError("Notion provider does not support vector search - use Convex for knowledge storage")
        ),
    },
  };
};

// ============================================================================
// EFFECT LAYER
// ============================================================================

export const NotionProviderLive = (config: NotionProviderConfig) =>
  Layer.succeed(DataProviderService, makeNotionProvider(config));

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const notionProvider = (
  auth: string,
  organizationId: string,
  databaseIds: Record<string, string>,
  convexUrl?: string
) => makeNotionProvider({ auth, organizationId, databaseIds, convexUrl });
