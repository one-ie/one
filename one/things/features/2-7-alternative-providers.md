# Feature 2-7: Alternative Providers (WordPress + Notion)

**Feature ID:** `feature_2_7_alternative_providers`
**Plan:** `plan_2_backend_agnostic_frontend`
**Owner:** Integration Specialist
**Status:** Detailed Specification Complete
**Priority:** P2 (Strategic - Proves Flexibility)
**Effort:** 2 weeks
**Dependencies:** Feature 2-6 (Dashboard Migration Complete)

---

## Executive Summary

This feature implements **WordPressProvider** and **NotionProvider** to prove the backend-agnostic architecture works. Organizations can choose their data backend independently, with full 6-dimension ontology support. Also includes **CompositeProvider** for multi-backend routing within a single organization.

**Strategic Value:** Demonstrates ONE Platform's flexibility and enables organizations to leverage existing infrastructure (WordPress, Notion) while gaining ONE's AI capabilities.

**Key Deliverables:**
1. Complete WordPressProvider implementation (REST API + ACF)
2. Complete NotionProvider implementation (Notion API + webhooks)
3. CompositeProvider for multi-backend routing
4. Comprehensive test suite (50+ tests)
5. Provider creation guide for future backends

---

## Ontology Mapping (All 6 Dimensions)

### 1. Organizations (Multi-Tenant Isolation)

**Challenge:** External systems (WordPress, Notion) don't have built-in multi-tenancy matching ONE's organization model.

**Solution:**
- Each organization gets its own WordPress site URL or Notion workspace
- Provider configuration stored per-organization in ONE's organizations table
- Provider acts as tenant-scoped wrapper around external API

**Implementation:**
```typescript
// organizations table stores provider config
{
  _id: "org_123",
  name: "Acme Corp",
  plan: "pro",
  properties: {
    providerType: "wordpress",
    providerConfig: {
      url: "https://acme.wordpress.com",
      apiKey: encryptedApiKey,
      version: "6.4",
      customPostTypes: ["course", "lesson", "creator"]
    }
  }
}

// Provider registry isolates by org
class ProviderRegistry {
  private providers = new Map<string, DataProvider>();

  register(orgId: string, provider: DataProvider) {
    this.providers.set(orgId, provider);
  }

  get(orgId: string): DataProvider {
    const provider = this.providers.get(orgId);
    if (!provider) throw new Error(`No provider for org ${orgId}`);
    return provider;
  }
}
```

**WordPress Multi-Tenancy:**
- Option 1: WordPress Multisite (one WP install, multiple sites)
- Option 2: Separate WP installs per organization
- Option 3: Custom tenant field in all tables

**Notion Multi-Tenancy:**
- Option 1: Separate Notion workspaces per organization
- Option 2: Single workspace with database-level isolation
- Option 3: Custom "Organization" property on all pages

### 2. People (Authorization & Governance)

**Challenge:** WordPress and Notion have different user/permission models than ONE's 4-role system.

**WordPress User Mapping:**
| ONE Role | WordPress Role | Capabilities |
|----------|---------------|--------------|
| `platform_owner` | Super Admin | All capabilities |
| `org_owner` | Administrator | Manage site, users, content |
| `org_user` | Editor | Create/edit content |
| `customer` | Subscriber | Read-only access |

**Notion User Mapping:**
| ONE Role | Notion Permission | Access |
|----------|------------------|--------|
| `platform_owner` | Workspace Owner | Full access |
| `org_owner` | Full Access | Edit all pages/databases |
| `org_user` | Can Edit | Edit assigned pages |
| `customer` | Can View | Read-only |

**Implementation:**
```typescript
class WordPressProvider implements DataProvider {
  people: PeopleOperations = {
    list: async (filter) => {
      // Get WordPress users
      const response = await this.api.get("/wp/v2/users");
      const wpUsers = await response.json();

      // Transform to ONE people (things with type: "creator")
      return wpUsers.map(user => ({
        _id: this.wpIdToOneId("user", user.id),
        type: "creator",
        name: user.name,
        organizationId: this.config.organizationId,
        status: "active",
        properties: {
          role: this.mapWPRoleToONE(user.roles[0]),
          email: user.email,
          wpUserId: user.id,
          wpUsername: user.slug,
          avatar: user.avatar_urls?.["96"],
          registeredDate: user.registered_date,
        },
        createdAt: new Date(user.registered_date).getTime(),
        updatedAt: Date.now(),
      }));
    },

    create: async (args) => {
      // Transform ONE person to WP user
      const wpUser = {
        username: args.properties.email.split("@")[0],
        email: args.properties.email,
        password: this.generateSecurePassword(),
        roles: [this.mapONERoleToWP(args.properties.role)],
        first_name: args.properties.firstName,
        last_name: args.properties.lastName,
      };

      const response = await this.api.post("/wp/v2/users", wpUser);
      const created = await response.json();

      // Transform back to ONE person
      return this.transformWPUserToPerson(created);
    },

    update: async (id, updates) => {
      const wpId = this.oneIdToWpId(id);

      const wpUpdates: any = {};
      if (updates.name) {
        const [firstName, ...lastNameParts] = updates.name.split(" ");
        wpUpdates.first_name = firstName;
        wpUpdates.last_name = lastNameParts.join(" ");
      }
      if (updates.properties?.role) {
        wpUpdates.roles = [this.mapONERoleToWP(updates.properties.role)];
      }

      const response = await this.api.post(`/wp/v2/users/${wpId}`, wpUpdates);
      return this.transformWPUserToPerson(await response.json());
    },

    delete: async (id) => {
      const wpId = this.oneIdToWpId(id);
      await this.api.delete(`/wp/v2/users/${wpId}?force=true&reassign=1`);
    },

    get: async (id) => {
      const wpId = this.oneIdToWpId(id);
      const response = await this.api.get(`/wp/v2/users/${wpId}`);
      return this.transformWPUserToPerson(await response.json());
    },
  };

  private mapWPRoleToONE(wpRole: string): string {
    const mapping: Record<string, string> = {
      "administrator": "org_owner",
      "editor": "org_user",
      "author": "org_user",
      "contributor": "org_user",
      "subscriber": "customer",
    };
    return mapping[wpRole] || "customer";
  }

  private mapONERoleToWP(oneRole: string): string {
    const mapping: Record<string, string> = {
      "org_owner": "administrator",
      "org_user": "editor",
      "customer": "subscriber",
    };
    return mapping[oneRole] || "subscriber";
  }
}
```

### 3. Things (Entity Integration)

**WordPress Entity Mapping:**

| ONE Thing Type | WordPress Equivalent | Implementation |
|----------------|---------------------|----------------|
| `course` | Custom Post Type: `course` | ACF fields for properties |
| `lesson` | Custom Post Type: `lesson` | ACF fields for properties |
| `creator` | WP User | Via `/wp/v2/users` |
| `token` | WooCommerce Product | Via WooCommerce REST API |
| `certificate` | Custom Post Type: `certificate` | ACF fields for properties |
| `quiz` | Custom Post Type: `quiz` | ACF fields for properties |
| `external_agent` | Custom Post Type: `agent` | ACF fields for configuration |

**Notion Entity Mapping:**

| ONE Thing Type | Notion Equivalent | Implementation |
|----------------|-------------------|----------------|
| `course` | Database: "Courses" | Properties: Name, Status, Description |
| `lesson` | Database: "Lessons" | Properties: Name, Content, Duration |
| `creator` | Database: "Users" | Properties: Name, Email, Role |
| `token` | Database: "Tokens" | Properties: Symbol, Balance, Owner |
| `certificate` | Database: "Certificates" | Properties: Recipient, Course, Date |
| `quiz` | Database: "Quizzes" | Properties: Questions, Answers, Score |
| `external_agent` | Database: "Agents" | Properties: Platform, Endpoint, Config |

**Complete WordPressProvider Things Implementation:**

```typescript
class WordPressProvider implements DataProvider {
  private api: WordPressAPI;
  private config: WordPressProviderConfig;

  constructor(config: WordPressProviderConfig) {
    this.config = config;
    this.api = new WordPressAPI(config.url, config.apiKey);
  }

  things: ThingOperations = {
    list: async (filter) => {
      const postType = this.mapOntologyTypeToWP(filter.type);

      // Build WordPress query parameters
      const params = new URLSearchParams({
        per_page: String(filter.limit || 10),
        page: String(((filter.skip || 0) / (filter.limit || 10)) + 1),
      });

      if (filter.status) {
        params.append("status", this.mapOntologyStatusToWP(filter.status));
      }

      if (filter.organizationId) {
        // Filter by organization using custom taxonomy
        params.append("org_id", filter.organizationId);
      }

      // Make API request
      const response = await this.api.get(
        `/wp/v2/${postType}?${params.toString()}`
      );
      const wpPosts = await response.json();

      // Transform WordPress posts to ontology things
      return Promise.all(
        wpPosts.map((post: any) => this.transformWPPostToThing(post, filter.type))
      );
    },

    create: async (args) => {
      const postType = this.mapOntologyTypeToWP(args.type);

      // Transform ontology thing to WordPress post
      const wpPost = {
        title: args.name,
        status: this.mapOntologyStatusToWP(args.status || "draft"),
        content: args.properties.content || "",
        excerpt: args.properties.excerpt || "",
        meta: {
          _one_thing_type: args.type,
          _one_organization_id: args.organizationId,
          ...this.transformPropertiesToACF(args.properties),
        },
      };

      // Create post in WordPress
      const response = await this.api.post(`/wp/v2/${postType}`, wpPost);
      const created = await response.json();

      // Transform back to ontology thing
      return this.transformWPPostToThing(created, args.type);
    },

    update: async (id, updates) => {
      const { wpId, postType } = this.parseOneId(id);

      const wpUpdates: any = {};

      if (updates.name) wpUpdates.title = updates.name;
      if (updates.status) wpUpdates.status = this.mapOntologyStatusToWP(updates.status);
      if (updates.properties) {
        wpUpdates.meta = this.transformPropertiesToACF(updates.properties);
      }

      const response = await this.api.post(
        `/wp/v2/${postType}/${wpId}`,
        wpUpdates
      );
      const updated = await response.json();

      return this.transformWPPostToThing(updated, updates.type || postType);
    },

    delete: async (id) => {
      const { wpId, postType } = this.parseOneId(id);
      await this.api.delete(`/wp/v2/${postType}/${wpId}?force=true`);
    },

    get: async (id) => {
      const { wpId, postType } = this.parseOneId(id);
      const response = await this.api.get(`/wp/v2/${postType}/${wpId}`);
      const post = await response.json();
      return this.transformWPPostToThing(post, postType);
    },
  };

  // Transform WordPress post to ONE thing
  private async transformWPPostToThing(
    post: any,
    thingType: string
  ): Promise<Thing> {
    // Get ACF fields
    const acfFields = await this.getACFFields(post.id);

    return {
      _id: this.wpIdToOneId(post.type, post.id),
      type: thingType,
      name: post.title.rendered || post.title,
      organizationId: post.meta._one_organization_id || this.config.organizationId,
      status: this.mapWPStatusToOntology(post.status),
      properties: {
        content: post.content?.rendered || post.content,
        excerpt: post.excerpt?.rendered || post.excerpt,
        slug: post.slug,
        wpPostId: post.id,
        wpPostType: post.type,
        author: post.author,
        featuredImage: post.featured_media,
        categories: post.categories,
        tags: post.tags,
        ...this.transformACFToProperties(acfFields),
      },
      createdAt: new Date(post.date_gmt).getTime(),
      updatedAt: new Date(post.modified_gmt).getTime(),
    };
  }

  // Map ontology types to WordPress post types
  private mapOntologyTypeToWP(type: string): string {
    const mapping: Record<string, string> = {
      course: "course",
      lesson: "lesson",
      creator: "user",
      quiz: "quiz",
      certificate: "certificate",
      token: "product", // WooCommerce
      external_agent: "agent",
      external_workflow: "workflow",
      external_connection: "connection",
      blog_post: "post",
      page: "page",
    };
    return mapping[type] || "post";
  }

  // Map WordPress post types to ontology types
  private mapWPTypeToOntology(wpType: string): string {
    const mapping: Record<string, string> = {
      course: "course",
      lesson: "lesson",
      user: "creator",
      quiz: "quiz",
      certificate: "certificate",
      product: "token",
      agent: "external_agent",
      workflow: "external_workflow",
      connection: "external_connection",
      post: "blog_post",
      page: "page",
    };
    return mapping[wpType] || "blog_post";
  }

  // Map ontology status to WordPress status
  private mapOntologyStatusToWP(status: string): string {
    const mapping: Record<string, string> = {
      draft: "draft",
      active: "publish",
      published: "publish",
      archived: "trash",
      pending: "pending",
    };
    return mapping[status] || "draft";
  }

  // Map WordPress status to ontology status
  private mapWPStatusToOntology(wpStatus: string): string {
    const mapping: Record<string, string> = {
      draft: "draft",
      publish: "active",
      pending: "pending",
      private: "active",
      trash: "archived",
      "auto-draft": "draft",
    };
    return mapping[wpStatus] || "draft";
  }

  // Transform ontology properties to ACF fields
  private transformPropertiesToACF(properties: any): Record<string, any> {
    const acfFields: Record<string, any> = {};

    // Map common fields
    if (properties.duration) acfFields.duration = properties.duration;
    if (properties.price) acfFields.price = properties.price;
    if (properties.currency) acfFields.currency = properties.currency;
    if (properties.difficulty) acfFields.difficulty = properties.difficulty;
    if (properties.videoUrl) acfFields.video_url = properties.videoUrl;
    if (properties.prerequisites) {
      acfFields.prerequisites = JSON.stringify(properties.prerequisites);
    }

    // Store full properties as JSON for unknown fields
    acfFields._one_properties = JSON.stringify(properties);

    return acfFields;
  }

  // Transform ACF fields to ontology properties
  private transformACFToProperties(acfFields: any): Record<string, any> {
    const properties: Record<string, any> = {};

    // Parse stored properties JSON
    if (acfFields._one_properties) {
      try {
        Object.assign(properties, JSON.parse(acfFields._one_properties));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Map known ACF fields
    if (acfFields.duration) properties.duration = acfFields.duration;
    if (acfFields.price) properties.price = acfFields.price;
    if (acfFields.currency) properties.currency = acfFields.currency;
    if (acfFields.difficulty) properties.difficulty = acfFields.difficulty;
    if (acfFields.video_url) properties.videoUrl = acfFields.video_url;
    if (acfFields.prerequisites) {
      try {
        properties.prerequisites = JSON.parse(acfFields.prerequisites);
      } catch (e) {
        properties.prerequisites = acfFields.prerequisites;
      }
    }

    return properties;
  }

  // Get ACF fields for a post
  private async getACFFields(postId: number): Promise<any> {
    try {
      const response = await this.api.get(`/acf/v3/posts/${postId}`);
      const data = await response.json();
      return data.acf || {};
    } catch (e) {
      // ACF not available or no fields
      return {};
    }
  }

  // Convert WordPress ID to ONE ID
  private wpIdToOneId(postType: string, wpId: number): string {
    return `wp_${postType}_${wpId}`;
  }

  // Convert ONE ID to WordPress ID
  private oneIdToWpId(oneId: string): number {
    const match = oneId.match(/^wp_[^_]+_(\d+)$/);
    if (!match) throw new Error(`Invalid ONE ID for WordPress: ${oneId}`);
    return parseInt(match[1], 10);
  }

  // Parse ONE ID to get WordPress ID and post type
  private parseOneId(oneId: string): { wpId: number; postType: string } {
    const match = oneId.match(/^wp_([^_]+)_(\d+)$/);
    if (!match) throw new Error(`Invalid ONE ID for WordPress: ${oneId}`);
    return {
      postType: match[1],
      wpId: parseInt(match[2], 10),
    };
  }
}

// WordPress API client with authentication
class WordPressAPI {
  constructor(private baseUrl: string, private apiKey: string) {}

  async get(path: string): Promise<Response> {
    return this.request("GET", path);
  }

  async post(path: string, body: any): Promise<Response> {
    return this.request("POST", path, body);
  }

  async delete(path: string): Promise<Response> {
    return this.request("DELETE", path);
  }

  private async request(
    method: string,
    path: string,
    body?: any
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new WordPressAPIError(
        `WordPress API error: ${response.status} ${response.statusText}`,
        response.status,
        await response.text()
      );
    }

    return response;
  }
}

class WordPressAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public responseBody: string
  ) {
    super(message);
    this.name = "WordPressAPIError";
  }
}

interface WordPressProviderConfig {
  url: string;
  apiKey: string;
  organizationId: string;
  version?: string;
  customPostTypes?: string[];
}
```

**Complete NotionProvider Things Implementation:**

```typescript
import { Client } from "@notionhq/client";

class NotionProvider implements DataProvider {
  private notion: Client;
  private config: NotionProviderConfig;

  constructor(config: NotionProviderConfig) {
    this.config = config;
    this.notion = new Client({ auth: config.apiKey });
  }

  things: ThingOperations = {
    list: async (filter) => {
      const databaseId = this.config.databaseIds[filter.type];
      if (!databaseId) {
        throw new Error(`No Notion database configured for type: ${filter.type}`);
      }

      // Build Notion filter
      const notionFilter: any = {};

      if (filter.status) {
        notionFilter.property = "Status";
        notionFilter.select = {
          equals: this.mapOntologyStatusToNotion(filter.status),
        };
      }

      // Query Notion database
      const response = await this.notion.databases.query({
        database_id: databaseId,
        filter: Object.keys(notionFilter).length > 0 ? notionFilter : undefined,
        page_size: filter.limit || 10,
        start_cursor: filter.cursor,
      });

      // Transform Notion pages to ontology things
      return Promise.all(
        response.results.map((page: any) =>
          this.transformNotionPageToThing(page, filter.type)
        )
      );
    },

    create: async (args) => {
      const databaseId = this.config.databaseIds[args.type];
      if (!databaseId) {
        throw new Error(`No Notion database configured for type: ${args.type}`);
      }

      // Transform ontology thing to Notion page
      const properties = this.transformThingPropertiesToNotion(args);

      // Create page in Notion
      const response = await this.notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      });

      // Transform back to ontology thing
      return this.transformNotionPageToThing(response, args.type);
    },

    update: async (id, updates) => {
      const notionId = this.oneIdToNotionId(id);

      // Build Notion properties update
      const properties: any = {};

      if (updates.name) {
        properties.Name = { title: [{ text: { content: updates.name } }] };
      }

      if (updates.status) {
        properties.Status = {
          select: { name: this.mapOntologyStatusToNotion(updates.status) },
        };
      }

      if (updates.properties) {
        Object.assign(
          properties,
          this.transformPropertiesToNotionUpdate(updates.properties)
        );
      }

      // Update page in Notion
      const response = await this.notion.pages.update({
        page_id: notionId,
        properties,
      });

      return this.transformNotionPageToThing(response, updates.type);
    },

    delete: async (id) => {
      const notionId = this.oneIdToNotionId(id);

      // Notion doesn't have true delete, only archive
      await this.notion.pages.update({
        page_id: notionId,
        archived: true,
      });
    },

    get: async (id) => {
      const notionId = this.oneIdToNotionId(id);
      const response = await this.notion.pages.retrieve({ page_id: notionId });

      // Determine type from database
      const databaseId = (response as any).parent.database_id;
      const type = this.findTypeByDatabaseId(databaseId);

      return this.transformNotionPageToThing(response, type);
    },
  };

  // Transform Notion page to ONE thing
  private async transformNotionPageToThing(
    page: any,
    thingType: string
  ): Promise<Thing> {
    const props = page.properties;

    // Extract name (usually the title property)
    let name = "Untitled";
    const titleProp = Object.values(props).find(
      (p: any) => p.type === "title"
    ) as any;
    if (titleProp?.title?.[0]?.text?.content) {
      name = titleProp.title[0].text.content;
    }

    // Extract status
    let status = "draft";
    if (props.Status?.select?.name) {
      status = this.mapNotionStatusToOntology(props.Status.select.name);
    }

    // Extract all properties
    const properties = await this.extractNotionProperties(props);

    return {
      _id: this.notionIdToOneId(page.id),
      type: thingType,
      name,
      organizationId: this.config.organizationId,
      status,
      properties: {
        ...properties,
        notionPageId: page.id,
        notionUrl: page.url,
        notionIcon: page.icon,
        notionCover: page.cover,
      },
      createdAt: new Date(page.created_time).getTime(),
      updatedAt: new Date(page.last_edited_time).getTime(),
    };
  }

  // Transform ontology thing to Notion properties
  private transformThingPropertiesToNotion(thing: any): any {
    const properties: any = {
      Name: {
        title: [{ text: { content: thing.name } }],
      },
      Status: {
        select: { name: this.mapOntologyStatusToNotion(thing.status || "draft") },
      },
    };

    // Organization (relation or text)
    if (thing.organizationId) {
      properties["Organization ID"] = {
        rich_text: [{ text: { content: thing.organizationId } }],
      };
    }

    // Map common properties
    if (thing.properties) {
      if (thing.properties.content) {
        properties.Content = {
          rich_text: [{ text: { content: thing.properties.content } }],
        };
      }
      if (thing.properties.duration) {
        properties.Duration = { number: thing.properties.duration };
      }
      if (thing.properties.price) {
        properties.Price = { number: thing.properties.price };
      }
      if (thing.properties.currency) {
        properties.Currency = {
          select: { name: thing.properties.currency },
        };
      }
      if (thing.properties.difficulty) {
        properties.Difficulty = {
          select: { name: thing.properties.difficulty },
        };
      }

      // Store full properties as JSON in a text field
      properties["ONE Properties"] = {
        rich_text: [{ text: { content: JSON.stringify(thing.properties) } }],
      };
    }

    return properties;
  }

  // Transform Notion properties update
  private transformPropertiesToNotionUpdate(properties: any): any {
    const notionProps: any = {};

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
  }

  // Extract properties from Notion page
  private async extractNotionProperties(props: any): Promise<any> {
    const extracted: any = {};

    // Try to parse stored JSON properties
    if (props["ONE Properties"]?.rich_text?.[0]?.text?.content) {
      try {
        Object.assign(
          extracted,
          JSON.parse(props["ONE Properties"].rich_text[0].text.content)
        );
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Extract individual properties
    for (const [key, value] of Object.entries(props)) {
      const prop = value as any;

      switch (prop.type) {
        case "rich_text":
          if (prop.rich_text?.[0]?.text?.content) {
            extracted[this.camelCase(key)] = prop.rich_text[0].text.content;
          }
          break;
        case "number":
          if (prop.number !== null) {
            extracted[this.camelCase(key)] = prop.number;
          }
          break;
        case "select":
          if (prop.select?.name) {
            extracted[this.camelCase(key)] = prop.select.name;
          }
          break;
        case "multi_select":
          if (prop.multi_select) {
            extracted[this.camelCase(key)] = prop.multi_select.map(
              (s: any) => s.name
            );
          }
          break;
        case "date":
          if (prop.date?.start) {
            extracted[this.camelCase(key)] = new Date(prop.date.start).getTime();
          }
          break;
        case "checkbox":
          extracted[this.camelCase(key)] = prop.checkbox;
          break;
        case "url":
          if (prop.url) {
            extracted[this.camelCase(key)] = prop.url;
          }
          break;
        case "email":
          if (prop.email) {
            extracted[this.camelCase(key)] = prop.email;
          }
          break;
        case "phone_number":
          if (prop.phone_number) {
            extracted[this.camelCase(key)] = prop.phone_number;
          }
          break;
        case "relation":
          if (prop.relation) {
            extracted[this.camelCase(key)] = prop.relation.map(
              (r: any) => this.notionIdToOneId(r.id)
            );
          }
          break;
      }
    }

    return extracted;
  }

  // Map ontology status to Notion status
  private mapOntologyStatusToNotion(status: string): string {
    const mapping: Record<string, string> = {
      draft: "Draft",
      active: "Active",
      published: "Published",
      archived: "Archived",
      pending: "Pending",
    };
    return mapping[status] || "Draft";
  }

  // Map Notion status to ontology status
  private mapNotionStatusToOntology(notionStatus: string): string {
    const mapping: Record<string, string> = {
      Draft: "draft",
      Active: "active",
      Published: "published",
      Archived: "archived",
      Pending: "pending",
    };
    return mapping[notionStatus] || "draft";
  }

  // Convert Notion ID to ONE ID
  private notionIdToOneId(notionId: string): string {
    return `notion_${notionId.replace(/-/g, "")}`;
  }

  // Convert ONE ID to Notion ID
  private oneIdToNotionId(oneId: string): string {
    const match = oneId.match(/^notion_([a-f0-9]{32})$/);
    if (!match) throw new Error(`Invalid ONE ID for Notion: ${oneId}`);

    // Notion IDs have hyphens: 8-4-4-4-12
    const id = match[1];
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(
      16,
      20
    )}-${id.slice(20)}`;
  }

  // Find type by database ID
  private findTypeByDatabaseId(databaseId: string): string {
    for (const [type, dbId] of Object.entries(this.config.databaseIds)) {
      if (dbId === databaseId) return type;
    }
    return "unknown";
  }

  // Convert to camelCase
  private camelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
        index === 0 ? letter.toLowerCase() : letter.toUpperCase()
      )
      .replace(/\s+/g, "");
  }
}

interface NotionProviderConfig {
  apiKey: string;
  organizationId: string;
  databaseIds: Record<string, string>; // thingType -> databaseId
}
```

### 4. Connections (Relationships)

**WordPress Connection Mapping:**

WordPress doesn't have native relationships beyond `post_parent` and `post_author`. We'll use:
1. **ACF Relationship Fields** - For complex relationships
2. **Custom Tables** - For high-volume relationships (enrollments)
3. **Post Meta** - For simple 1:1 relationships

**Implementation:**

```typescript
class WordPressProvider implements DataProvider {
  connections: ConnectionOperations = {
    list: async (filter) => {
      // Query custom wp_one_connections table
      const params = new URLSearchParams({
        from_thing_id: filter.fromThingId || "",
        to_thing_id: filter.toThingId || "",
        relationship_type: filter.relationshipType || "",
        per_page: String(filter.limit || 10),
      });

      const response = await this.api.get(
        `/one/v1/connections?${params.toString()}`
      );
      const wpConnections = await response.json();

      return wpConnections.map((conn: any) => ({
        _id: this.wpIdToOneId("connection", conn.id),
        fromThingId: conn.from_thing_id,
        toThingId: conn.to_thing_id,
        relationshipType: conn.relationship_type,
        metadata: JSON.parse(conn.metadata || "{}"),
        validFrom: conn.valid_from,
        validTo: conn.valid_to,
        createdAt: new Date(conn.created_at).getTime(),
      }));
    },

    create: async (args) => {
      const wpConnection = {
        from_thing_id: args.fromThingId,
        to_thing_id: args.toThingId,
        relationship_type: args.relationshipType,
        metadata: JSON.stringify(args.metadata || {}),
        valid_from: args.validFrom || Date.now(),
        valid_to: args.validTo,
      };

      const response = await this.api.post("/one/v1/connections", wpConnection);
      const created = await response.json();

      return {
        _id: this.wpIdToOneId("connection", created.id),
        ...args,
        createdAt: new Date(created.created_at).getTime(),
      };
    },

    delete: async (id) => {
      const wpId = this.oneIdToWpId(id);
      await this.api.delete(`/one/v1/connections/${wpId}`);
    },

    get: async (id) => {
      const wpId = this.oneIdToWpId(id);
      const response = await this.api.get(`/one/v1/connections/${wpId}`);
      const conn = await response.json();

      return {
        _id: id,
        fromThingId: conn.from_thing_id,
        toThingId: conn.to_thing_id,
        relationshipType: conn.relationship_type,
        metadata: JSON.parse(conn.metadata || "{}"),
        validFrom: conn.valid_from,
        validTo: conn.valid_to,
        createdAt: new Date(conn.created_at).getTime(),
      };
    },
  };
}
```

**WordPress Custom Endpoint (`/one/v1/connections`):**

```php
// wp-content/plugins/one-platform/includes/api/connections.php

add_action('rest_api_init', function () {
  register_rest_route('one/v1', '/connections', [
    'methods' => 'GET',
    'callback' => 'one_get_connections',
    'permission_callback' => function () {
      return current_user_can('read');
    }
  ]);

  register_rest_route('one/v1', '/connections', [
    'methods' => 'POST',
    'callback' => 'one_create_connection',
    'permission_callback' => function () {
      return current_user_can('edit_posts');
    }
  ]);

  register_rest_route('one/v1', '/connections/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'one_get_connection',
    'permission_callback' => function () {
      return current_user_can('read');
    }
  ]);

  register_rest_route('one/v1', '/connections/(?P<id>\d+)', [
    'methods' => 'DELETE',
    'callback' => 'one_delete_connection',
    'permission_callback' => function () {
      return current_user_can('delete_posts');
    }
  ]);
});

function one_get_connections($request) {
  global $wpdb;

  $from_thing_id = $request->get_param('from_thing_id');
  $to_thing_id = $request->get_param('to_thing_id');
  $relationship_type = $request->get_param('relationship_type');
  $per_page = intval($request->get_param('per_page') ?: 10);
  $page = intval($request->get_param('page') ?: 1);

  $where = ['1=1'];
  if ($from_thing_id) {
    $where[] = $wpdb->prepare('from_thing_id = %s', $from_thing_id);
  }
  if ($to_thing_id) {
    $where[] = $wpdb->prepare('to_thing_id = %s', $to_thing_id);
  }
  if ($relationship_type) {
    $where[] = $wpdb->prepare('relationship_type = %s', $relationship_type);
  }

  $offset = ($page - 1) * $per_page;
  $where_clause = implode(' AND ', $where);

  $results = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}one_connections
     WHERE {$where_clause}
     LIMIT {$per_page} OFFSET {$offset}"
  );

  return rest_ensure_response($results);
}

function one_create_connection($request) {
  global $wpdb;

  $wpdb->insert(
    $wpdb->prefix . 'one_connections',
    [
      'from_thing_id' => $request->get_param('from_thing_id'),
      'to_thing_id' => $request->get_param('to_thing_id'),
      'relationship_type' => $request->get_param('relationship_type'),
      'metadata' => $request->get_param('metadata'),
      'valid_from' => $request->get_param('valid_from'),
      'valid_to' => $request->get_param('valid_to'),
      'created_at' => current_time('mysql'),
    ]
  );

  $id = $wpdb->insert_id;
  $connection = $wpdb->get_row(
    $wpdb->prepare(
      "SELECT * FROM {$wpdb->prefix}one_connections WHERE id = %d",
      $id
    )
  );

  return rest_ensure_response($connection);
}
```

**Notion Connection Mapping:**

Notion supports native **Relation** properties between databases. We'll map ONE connections to Notion relations.

```typescript
class NotionProvider implements DataProvider {
  connections: ConnectionOperations = {
    list: async (filter) => {
      // In Notion, connections are stored as relation properties
      // We need to query the source database and extract relations

      if (!filter.fromThingId) {
        throw new Error("Notion connections require fromThingId filter");
      }

      const fromType = this.getTypeFromId(filter.fromThingId);
      const fromNotionId = this.oneIdToNotionId(filter.fromThingId);

      // Get the source page
      const page = await this.notion.pages.retrieve({ page_id: fromNotionId });
      const props = (page as any).properties;

      const connections: Connection[] = [];

      // Extract all relation properties
      for (const [propName, propValue] of Object.entries(props)) {
        const prop = propValue as any;

        if (prop.type === "relation" && prop.relation) {
          // Determine relationship type from property name
          const relationshipType = this.mapNotionPropertyToRelationship(propName);

          for (const rel of prop.relation) {
            connections.push({
              _id: this.generateConnectionId(
                filter.fromThingId,
                this.notionIdToOneId(rel.id),
                relationshipType
              ),
              fromThingId: filter.fromThingId,
              toThingId: this.notionIdToOneId(rel.id),
              relationshipType,
              metadata: { notionProperty: propName },
              createdAt: new Date((page as any).created_time).getTime(),
            });
          }
        }
      }

      return connections;
    },

    create: async (args) => {
      // Add relation to source page
      const fromNotionId = this.oneIdToNotionId(args.fromThingId);
      const toNotionId = this.oneIdToNotionId(args.toThingId);

      // Determine which property to update
      const propertyName = this.mapRelationshipToNotionProperty(
        args.relationshipType
      );

      // Get existing relations
      const page = await this.notion.pages.retrieve({ page_id: fromNotionId });
      const existingRelations =
        (page as any).properties[propertyName]?.relation || [];

      // Add new relation
      await this.notion.pages.update({
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

      return {
        _id: this.generateConnectionId(
          args.fromThingId,
          args.toThingId,
          args.relationshipType
        ),
        ...args,
        createdAt: Date.now(),
      };
    },

    delete: async (id) => {
      // Parse connection ID to get from/to/type
      const { fromThingId, toThingId, relationshipType } =
        this.parseConnectionId(id);

      const fromNotionId = this.oneIdToNotionId(fromThingId);
      const toNotionId = this.oneIdToNotionId(toThingId);

      // Determine which property to update
      const propertyName = this.mapRelationshipToNotionProperty(relationshipType);

      // Get existing relations
      const page = await this.notion.pages.retrieve({ page_id: fromNotionId });
      const existingRelations =
        (page as any).properties[propertyName]?.relation || [];

      // Remove the relation
      await this.notion.pages.update({
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

    get: async (id) => {
      // Parse connection ID
      const { fromThingId, toThingId, relationshipType } =
        this.parseConnectionId(id);

      // Verify relation exists
      const connections = await this.connections.list({ fromThingId });
      const connection = connections.find(
        (c) =>
          c.toThingId === toThingId && c.relationshipType === relationshipType
      );

      if (!connection) {
        throw new Error(`Connection not found: ${id}`);
      }

      return connection;
    },
  };

  // Map relationship type to Notion property name
  private mapRelationshipToNotionProperty(relationshipType: string): string {
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
  }

  // Map Notion property name to relationship type
  private mapNotionPropertyToRelationship(propertyName: string): string {
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
  }

  // Generate deterministic connection ID
  private generateConnectionId(
    fromThingId: string,
    toThingId: string,
    relationshipType: string
  ): string {
    return `notion_conn_${fromThingId}_${toThingId}_${relationshipType}`;
  }

  // Parse connection ID
  private parseConnectionId(id: string): {
    fromThingId: string;
    toThingId: string;
    relationshipType: string;
  } {
    const match = id.match(/^notion_conn_(.+)_(.+)_(.+)$/);
    if (!match) throw new Error(`Invalid Notion connection ID: ${id}`);
    return {
      fromThingId: match[1],
      toThingId: match[2],
      relationshipType: match[3],
    };
  }

  // Get type from ONE ID
  private getTypeFromId(oneId: string): string {
    // In practice, you'd look this up from the database
    // For now, we'll extract from the ID pattern if it includes type
    return "unknown";
  }
}
```

### 5. Events (Action Tracking)

**Challenge:** WordPress and Notion don't have native event logs matching ONE's comprehensive event system.

**Solution:**
- **Option 1:** Store events in ONE's Convex backend (hybrid approach)
- **Option 2:** Store events in external system's custom table/database
- **Option 3:** Use external system's audit logs where available

**WordPress Events Implementation:**

```typescript
class WordPressProvider implements DataProvider {
  events: EventOperations = {
    list: async (filter) => {
      // Query custom wp_one_events table
      const params = new URLSearchParams({
        type: filter.type || "",
        actor_id: filter.actorId || "",
        target_id: filter.targetId || "",
        from: String(filter.timestampFrom || 0),
        to: String(filter.timestampTo || Date.now()),
        per_page: String(filter.limit || 10),
      });

      const response = await this.api.get(`/one/v1/events?${params.toString()}`);
      const wpEvents = await response.json();

      return wpEvents.map((event: any) => ({
        _id: this.wpIdToOneId("event", event.id),
        type: event.type,
        actorId: event.actor_id,
        targetId: event.target_id,
        timestamp: new Date(event.timestamp).getTime(),
        metadata: JSON.parse(event.metadata || "{}"),
      }));
    },

    create: async (args) => {
      const wpEvent = {
        type: args.type,
        actor_id: args.actorId,
        target_id: args.targetId,
        timestamp: new Date(args.timestamp).toISOString(),
        metadata: JSON.stringify(args.metadata || {}),
      };

      const response = await this.api.post("/one/v1/events", wpEvent);
      const created = await response.json();

      return {
        _id: this.wpIdToOneId("event", created.id),
        ...args,
      };
    },

    get: async (id) => {
      const wpId = this.oneIdToWpId(id);
      const response = await this.api.get(`/one/v1/events/${wpId}`);
      const event = await response.json();

      return {
        _id: id,
        type: event.type,
        actorId: event.actor_id,
        targetId: event.target_id,
        timestamp: new Date(event.timestamp).getTime(),
        metadata: JSON.parse(event.metadata || "{}"),
      };
    },
  };
}
```

**Notion Events Implementation (Hybrid):**

Since Notion doesn't support custom tables, we'll use a hybrid approach: store events in Convex but reference Notion IDs.

```typescript
class NotionProvider implements DataProvider {
  private convexEventStore: ConvexClient;

  constructor(config: NotionProviderConfig) {
    this.config = config;
    this.notion = new Client({ auth: config.apiKey });

    // Use Convex for event storage
    this.convexEventStore = new ConvexClient(config.convexUrl);
  }

  events: EventOperations = {
    list: async (filter) => {
      // Query Convex events table, filtered by Notion provider
      return this.convexEventStore.query("events:list", {
        ...filter,
        metadata: {
          ...filter.metadata,
          provider: "notion",
          organizationId: this.config.organizationId,
        },
      });
    },

    create: async (args) => {
      // Store event in Convex with Notion metadata
      return this.convexEventStore.mutation("events:create", {
        ...args,
        metadata: {
          ...args.metadata,
          provider: "notion",
          organizationId: this.config.organizationId,
        },
      });
    },

    get: async (id) => {
      return this.convexEventStore.query("events:get", { id });
    },
  };
}
```

### 6. Knowledge (Semantic Understanding)

**WordPress Knowledge Implementation:**

```typescript
class WordPressProvider implements DataProvider {
  knowledge: KnowledgeOperations = {
    list: async (filter) => {
      // Query custom wp_one_knowledge table
      const params = new URLSearchParams({
        knowledge_type: filter.knowledgeType || "",
        per_page: String(filter.limit || 10),
      });

      if (filter.labels) {
        params.append("labels", filter.labels.join(","));
      }

      const response = await this.api.get(
        `/one/v1/knowledge?${params.toString()}`
      );
      const wpKnowledge = await response.json();

      return wpKnowledge.map((k: any) => ({
        _id: this.wpIdToOneId("knowledge", k.id),
        knowledgeType: k.knowledge_type,
        text: k.text,
        embedding: JSON.parse(k.embedding || "[]"),
        embeddingModel: k.embedding_model,
        embeddingDim: k.embedding_dim,
        sourceThingId: k.source_thing_id,
        sourceField: k.source_field,
        labels: JSON.parse(k.labels || "[]"),
        metadata: JSON.parse(k.metadata || "{}"),
        createdAt: new Date(k.created_at).getTime(),
        updatedAt: new Date(k.updated_at).getTime(),
      }));
    },

    create: async (args) => {
      const wpKnowledge = {
        knowledge_type: args.knowledgeType,
        text: args.text,
        embedding: JSON.stringify(args.embedding),
        embedding_model: args.embeddingModel,
        embedding_dim: args.embeddingDim,
        source_thing_id: args.sourceThingId,
        source_field: args.sourceField,
        labels: JSON.stringify(args.labels || []),
        metadata: JSON.stringify(args.metadata || {}),
      };

      const response = await this.api.post("/one/v1/knowledge", wpKnowledge);
      const created = await response.json();

      return {
        _id: this.wpIdToOneId("knowledge", created.id),
        ...args,
        createdAt: new Date(created.created_at).getTime(),
        updatedAt: new Date(created.updated_at).getTime(),
      };
    },

    search: async (query) => {
      // Use Convex for vector search (WordPress doesn't support it natively)
      // This is a hybrid approach
      throw new Error("Vector search not supported by WordPressProvider");
    },

    get: async (id) => {
      const wpId = this.oneIdToWpId(id);
      const response = await this.api.get(`/one/v1/knowledge/${wpId}`);
      const k = await response.json();

      return {
        _id: id,
        knowledgeType: k.knowledge_type,
        text: k.text,
        embedding: JSON.parse(k.embedding || "[]"),
        embeddingModel: k.embedding_model,
        embeddingDim: k.embedding_dim,
        sourceThingId: k.source_thing_id,
        sourceField: k.source_field,
        labels: JSON.parse(k.labels || "[]"),
        metadata: JSON.parse(k.metadata || "{}"),
        createdAt: new Date(k.created_at).getTime(),
        updatedAt: new Date(k.updated_at).getTime(),
      };
    },

    delete: async (id) => {
      const wpId = this.oneIdToWpId(id);
      await this.api.delete(`/one/v1/knowledge/${wpId}`);
    },
  };
}
```

**Notion Knowledge Implementation (Hybrid):**

Notion doesn't support vector embeddings natively. Use Convex for knowledge storage.

```typescript
class NotionProvider implements DataProvider {
  knowledge: KnowledgeOperations = {
    list: async (filter) => {
      // Use Convex for knowledge storage
      return this.convexEventStore.query("knowledge:list", {
        ...filter,
        metadata: {
          ...filter.metadata,
          provider: "notion",
          organizationId: this.config.organizationId,
        },
      });
    },

    create: async (args) => {
      return this.convexEventStore.mutation("knowledge:create", {
        ...args,
        metadata: {
          ...args.metadata,
          provider: "notion",
          organizationId: this.config.organizationId,
        },
      });
    },

    search: async (query) => {
      return this.convexEventStore.query("knowledge:search", {
        ...query,
        metadata: {
          provider: "notion",
          organizationId: this.config.organizationId,
        },
      });
    },

    get: async (id) => {
      return this.convexEventStore.query("knowledge:get", { id });
    },

    delete: async (id) => {
      return this.convexEventStore.mutation("knowledge:delete", { id });
    },
  };
}
```

---

## CompositeProvider (Multi-Backend Routing)

**Use Case:** A single organization wants to use different backends for different entity types.

**Example:** WordPress for courses/lessons, Notion for internal documentation, Convex for events/knowledge.

**Implementation:**

```typescript
class CompositeProvider implements DataProvider {
  private providers: Map<string, DataProvider>;
  private routingRules: RoutingRules;

  constructor(config: CompositeProviderConfig) {
    this.providers = new Map();
    this.routingRules = config.routingRules;

    // Register all providers
    for (const [name, providerConfig] of Object.entries(config.providers)) {
      this.providers.set(name, this.createProvider(providerConfig));
    }
  }

  things: ThingOperations = {
    list: async (filter) => {
      const providerName = this.routeByThingType(filter.type);
      const provider = this.getProvider(providerName);
      return provider.things.list(filter);
    },

    create: async (args) => {
      const providerName = this.routeByThingType(args.type);
      const provider = this.getProvider(providerName);
      return provider.things.create(args);
    },

    update: async (id, updates) => {
      const providerName = this.routeByThingId(id);
      const provider = this.getProvider(providerName);
      return provider.things.update(id, updates);
    },

    delete: async (id) => {
      const providerName = this.routeByThingId(id);
      const provider = this.getProvider(providerName);
      return provider.things.delete(id);
    },

    get: async (id) => {
      const providerName = this.routeByThingId(id);
      const provider = this.getProvider(providerName);
      return provider.things.get(id);
    },
  };

  connections: ConnectionOperations = {
    list: async (filter) => {
      // Cross-provider connections require querying all providers
      if (!filter.fromThingId && !filter.toThingId) {
        throw new Error(
          "CompositeProvider connections.list requires fromThingId or toThingId"
        );
      }

      const providerName = this.routeByThingId(
        filter.fromThingId || filter.toThingId!
      );
      const provider = this.getProvider(providerName);
      return provider.connections.list(filter);
    },

    create: async (args) => {
      // Determine which provider should own the connection
      // Default: same provider as fromThing
      const providerName = this.routeByThingId(args.fromThingId);
      const provider = this.getProvider(providerName);
      return provider.connections.create(args);
    },

    delete: async (id) => {
      const providerName = this.routeByConnectionId(id);
      const provider = this.getProvider(providerName);
      return provider.connections.delete(id);
    },

    get: async (id) => {
      const providerName = this.routeByConnectionId(id);
      const provider = this.getProvider(providerName);
      return provider.connections.get(id);
    },
  };

  events: EventOperations = {
    list: async (filter) => {
      // Events are always stored in the designated event provider
      const providerName = this.routingRules.eventsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.events.list(filter);
    },

    create: async (args) => {
      const providerName = this.routingRules.eventsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.events.create(args);
    },

    get: async (id) => {
      const providerName = this.routingRules.eventsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.events.get(id);
    },
  };

  knowledge: KnowledgeOperations = {
    list: async (filter) => {
      // Knowledge is always stored in the designated knowledge provider
      const providerName = this.routingRules.knowledgeProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.knowledge.list(filter);
    },

    create: async (args) => {
      const providerName = this.routingRules.knowledgeProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.knowledge.create(args);
    },

    search: async (query) => {
      const providerName = this.routingRules.knowledgeProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.knowledge.search(query);
    },

    get: async (id) => {
      const providerName = this.routingRules.knowledgeProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.knowledge.get(id);
    },

    delete: async (id) => {
      const providerName = this.routingRules.knowledgeProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.knowledge.delete(id);
    },
  };

  organizations: OrganizationOperations = {
    list: async (filter) => {
      // Organizations are always in the designated org provider
      const providerName = this.routingRules.organizationsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.organizations.list(filter);
    },

    create: async (args) => {
      const providerName = this.routingRules.organizationsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.organizations.create(args);
    },

    update: async (id, updates) => {
      const providerName = this.routingRules.organizationsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.organizations.update(id, updates);
    },

    delete: async (id) => {
      const providerName = this.routingRules.organizationsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.organizations.delete(id);
    },

    get: async (id) => {
      const providerName = this.routingRules.organizationsProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.organizations.get(id);
    },
  };

  people: PeopleOperations = {
    list: async (filter) => {
      // People routing can be by organization or type
      const providerName = this.routingRules.peopleProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.people.list(filter);
    },

    create: async (args) => {
      const providerName = this.routingRules.peopleProvider || "convex";
      const provider = this.getProvider(providerName);
      return provider.people.create(args);
    },

    update: async (id, updates) => {
      const providerName = this.routeByThingId(id);
      const provider = this.getProvider(providerName);
      return provider.people.update(id, updates);
    },

    delete: async (id) => {
      const providerName = this.routeByThingId(id);
      const provider = this.getProvider(providerName);
      return provider.people.delete(id);
    },

    get: async (id) => {
      const providerName = this.routeByThingId(id);
      const provider = this.getProvider(providerName);
      return provider.people.get(id);
    },
  };

  // Health check all providers
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [name, provider] of this.providers.entries()) {
      try {
        // Try a simple query to test connectivity
        await provider.things.list({ type: "course", limit: 1 });
        health[name] = true;
      } catch (e) {
        health[name] = false;
      }
    }

    return health;
  }

  // Route by thing type
  private routeByThingType(type: string): string {
    const rule = this.routingRules.thingTypes[type];
    if (rule) return rule;

    // Default routing
    return this.routingRules.defaultProvider || "convex";
  }

  // Route by thing ID (ID prefix indicates provider)
  private routeByThingId(id: string): string {
    if (id.startsWith("wp_")) return "wordpress";
    if (id.startsWith("notion_")) return "notion";
    if (id.startsWith("convex_")) return "convex";

    // Default routing
    return this.routingRules.defaultProvider || "convex";
  }

  // Route by connection ID
  private routeByConnectionId(id: string): string {
    if (id.startsWith("wp_")) return "wordpress";
    if (id.startsWith("notion_")) return "notion";
    if (id.startsWith("convex_")) return "convex";

    return this.routingRules.defaultProvider || "convex";
  }

  // Get provider by name
  private getProvider(name: string): DataProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider not found: ${name}`);
    }
    return provider;
  }

  // Create provider from config
  private createProvider(config: any): DataProvider {
    switch (config.type) {
      case "convex":
        return new ConvexProvider(config);
      case "wordpress":
        return new WordPressProvider(config);
      case "notion":
        return new NotionProvider(config);
      default:
        throw new Error(`Unknown provider type: ${config.type}`);
    }
  }
}

interface CompositeProviderConfig {
  providers: Record<string, any>; // providerName -> providerConfig
  routingRules: RoutingRules;
}

interface RoutingRules {
  // Default provider for unmapped types
  defaultProvider: string;

  // Thing type routing: thingType -> providerName
  thingTypes: Record<string, string>;

  // Specific dimension providers
  eventsProvider?: string;
  knowledgeProvider?: string;
  organizationsProvider?: string;
  peopleProvider?: string;
}

// Example usage:
const compositeProvider = new CompositeProvider({
  providers: {
    convex: {
      type: "convex",
      url: "https://shocking-falcon-870.convex.cloud",
    },
    wordpress: {
      type: "wordpress",
      url: "https://acme.wordpress.com",
      apiKey: "wp_secret_key",
      organizationId: "org_123",
    },
    notion: {
      type: "notion",
      apiKey: "notion_secret_key",
      organizationId: "org_123",
      databaseIds: {
        documentation: "abc123",
        meeting_notes: "def456",
      },
      convexUrl: "https://shocking-falcon-870.convex.cloud",
    },
  },
  routingRules: {
    defaultProvider: "convex",
    thingTypes: {
      course: "wordpress",
      lesson: "wordpress",
      documentation: "notion",
      meeting_notes: "notion",
    },
    eventsProvider: "convex",
    knowledgeProvider: "convex",
    organizationsProvider: "convex",
    peopleProvider: "convex",
  },
});

// Usage in components:
const courses = await compositeProvider.things.list({ type: "course" });
// Routes to WordPress

const docs = await compositeProvider.things.list({ type: "documentation" });
// Routes to Notion
```

---

## Implementation Steps (50+ Steps)

### Phase 1: WordPress Provider (Week 1)

**Step 1-10: Setup & Authentication**

1. Create `frontend/src/providers/wordpress/` directory
2. Install dependencies: `bun add @types/wordpress__api-fetch`
3. Create `WordPressAPI.ts` - HTTP client with auth
4. Implement Application Password authentication
5. Test authentication with real WordPress site
6. Create `WordPressProvider.ts` - DataProvider implementation
7. Implement ID conversion utilities (`wpIdToOneId`, `oneIdToWpId`)
8. Create type mapping utilities (ontology ↔ WP)
9. Create status mapping utilities (ontology ↔ WP)
10. Write unit tests for utilities (30+ tests)

**Step 11-20: Things Implementation**

11. Implement `things.list()` with WordPress REST API
12. Implement `things.create()` with post creation
13. Implement `things.update()` with post updates
14. Implement `things.delete()` with post deletion
15. Implement `things.get()` with single post retrieval
16. Implement ACF field transformation logic
17. Add pagination support (WordPress pagination differs from Convex)
18. Add filtering support (map to WordPress query params)
19. Add error handling with exponential backoff retry
20. Write unit tests for things operations (50+ tests)

**Step 21-30: Connections Implementation**

21. Design `wp_one_connections` table schema (SQL)
22. Create WordPress plugin: `one-platform-connector`
23. Implement `/one/v1/connections` REST endpoint (GET)
24. Implement `/one/v1/connections` REST endpoint (POST)
25. Implement `/one/v1/connections/:id` REST endpoint (GET)
26. Implement `/one/v1/connections/:id` REST endpoint (DELETE)
27. Implement `connections.list()` in TypeScript provider
28. Implement `connections.create()` in TypeScript provider
29. Implement `connections.delete()` in TypeScript provider
30. Write integration tests with real WordPress instance (20+ tests)

**Step 31-40: Events & Knowledge Implementation**

31. Design `wp_one_events` table schema (SQL)
32. Implement `/one/v1/events` REST endpoint (GET)
33. Implement `/one/v1/events` REST endpoint (POST)
34. Implement `events.list()` in TypeScript provider
35. Implement `events.create()` in TypeScript provider
36. Design `wp_one_knowledge` table schema (SQL)
37. Implement `/one/v1/knowledge` REST endpoint (GET/POST)
38. Implement `knowledge.list()` in TypeScript provider
39. Implement `knowledge.create()` in TypeScript provider
40. Document hybrid approach for vector search (Convex fallback)

### Phase 2: Notion Provider (Week 1-2)

**Step 41-50: Setup & Authentication**

41. Create `frontend/src/providers/notion/` directory
42. Install dependencies: `bun add @notionhq/client`
43. Create `NotionProvider.ts` - DataProvider implementation
44. Set up Notion integration with test workspace
45. Create test databases (Courses, Lessons, Users)
46. Configure database properties (Name, Status, etc.)
47. Implement ID conversion utilities (`notionIdToOneId`, `oneIdToNotionId`)
48. Create property mapping utilities (ontology ↔ Notion)
49. Create status mapping utilities (ontology ↔ Notion)
50. Write unit tests for utilities (30+ tests)

**Step 51-60: Things Implementation**

51. Implement `things.list()` with Notion database query
52. Implement `things.create()` with Notion page creation
53. Implement `things.update()` with Notion page updates
54. Implement `things.delete()` with Notion page archiving
55. Implement `things.get()` with single page retrieval
56. Implement property extraction logic (all property types)
57. Add pagination support (Notion cursor-based pagination)
58. Add filtering support (map to Notion filter syntax)
59. Add error handling with rate limit retry
60. Write unit tests for things operations (50+ tests)

**Step 61-70: Connections Implementation**

61. Design Notion relation property strategy
62. Implement `connections.list()` with relation extraction
63. Implement `connections.create()` with relation updates
64. Implement `connections.delete()` with relation removal
65. Implement `connections.get()` with relation lookup
66. Map all 25 ONE relationship types to Notion properties
67. Handle bidirectional relations
68. Add validation for cross-database relations
69. Add error handling for missing properties
70. Write integration tests with real Notion workspace (20+ tests)

**Step 71-75: Events & Knowledge (Hybrid)**

71. Document hybrid approach (Convex for events/knowledge)
72. Implement `events.list()` with Convex fallback
73. Implement `events.create()` with Convex storage
74. Implement `knowledge.list()` with Convex fallback
75. Implement `knowledge.search()` with Convex vector search

### Phase 3: CompositeProvider (Week 2)

**Step 76-85: Routing Implementation**

76. Create `frontend/src/providers/composite/` directory
77. Create `CompositeProvider.ts` - Multi-backend router
78. Implement provider registry with Map
79. Implement `routeByThingType()` routing logic
80. Implement `routeByThingId()` routing logic (ID prefix detection)
81. Implement `routeByConnectionId()` routing logic
82. Create `RoutingRules` interface with configuration schema
83. Implement provider factory (create providers from config)
84. Add provider health check method
85. Write unit tests for routing logic (40+ tests)

**Step 86-90: Operations Implementation**

86. Implement `things.*` operations with routing
87. Implement `connections.*` operations with routing
88. Implement `events.*` operations (always route to designated provider)
89. Implement `knowledge.*` operations (always route to designated provider)
90. Handle cross-provider connection scenarios

### Phase 4: Testing & Documentation (Week 2)

**Step 91-100: Integration Testing**

91. Set up test WordPress instance (local Docker)
92. Set up test Notion workspace
93. Write end-to-end test: Create course in WordPress
94. Write end-to-end test: Create lesson in WordPress
95. Write end-to-end test: Create documentation in Notion
96. Write end-to-end test: Create cross-provider connection
97. Write end-to-end test: CompositeProvider routing
98. Write end-to-end test: Multi-backend organization
99. Run full test suite (expect 200+ tests)
100. Fix any failing tests

**Step 101-110: Documentation & Guides**

101. Write WordPress setup guide (installation, plugins, configuration)
102. Write Notion setup guide (integration, databases, properties)
103. Write provider configuration reference
104. Write ontology mapping documentation (all 6 dimensions)
105. Write CompositeProvider configuration guide
106. Write troubleshooting guide (common issues)
107. Create example configurations (3-5 scenarios)
108. Document limitations (what's not supported)
109. Create migration guide (Convex → WordPress/Notion)
110. Review and publish documentation

---

## Testing Strategy

### Unit Tests (100+ tests)

**WordPress Provider:**
- ID conversion (10 tests)
- Type mapping (20 tests)
- Status mapping (10 tests)
- Property transformation (20 tests)
- API client (20 tests)
- Error handling (10 tests)

**Notion Provider:**
- ID conversion (10 tests)
- Property extraction (30 tests)
- Status mapping (10 tests)
- Property transformation (20 tests)
- Error handling (10 tests)

**CompositeProvider:**
- Routing logic (30 tests)
- Provider factory (10 tests)
- Health checks (10 tests)

### Integration Tests (50+ tests)

**WordPress Provider:**
- CRUD operations for all thing types (20 tests)
- Connection operations (10 tests)
- Event operations (5 tests)
- Authentication (5 tests)

**Notion Provider:**
- CRUD operations for all thing types (20 tests)
- Connection operations (10 tests)
- Property type handling (10 tests)
- Authentication (5 tests)

**CompositeProvider:**
- Multi-backend routing (10 tests)
- Cross-provider connections (5 tests)

### End-to-End Tests (20+ tests)

**Scenarios:**
1. Create organization with WordPress backend
2. Create organization with Notion backend
3. Create organization with CompositeProvider
4. Migrate organization from Convex to WordPress
5. Create course in WordPress, view in ONE frontend
6. Create documentation in Notion, search in ONE
7. Create cross-provider connection (WordPress course → Notion doc)
8. Test real-time updates (polling for WordPress, webhooks for Notion)
9. Test provider failover (CompositeProvider health checks)
10. Test data consistency across providers

### Performance Tests

**Benchmarks:**
- Compare WordPress provider vs Convex (latency, throughput)
- Compare Notion provider vs Convex (latency, throughput)
- Test CompositeProvider overhead (routing delay)
- Test concurrent operations (10, 100, 1000 requests)
- Test pagination performance (large datasets)
- Test connection queries (complex relationship graphs)

**Acceptance Criteria:**
- WordPress provider: < 500ms p99 latency for simple queries
- Notion provider: < 1s p99 latency for simple queries
- CompositeProvider: < 50ms routing overhead
- All providers: No data loss under normal operation
- All providers: Graceful degradation under high load

---

## User Stories & Acceptance Criteria

### Story 1: WordPress as Backend

**As an** org_owner with existing WordPress infrastructure
**I want to** use WordPress as my ONE Platform backend
**So that** I can leverage my existing content and avoid data migration

**Acceptance Criteria:**
- [ ] I can configure my organization to use WordPress provider
- [ ] I provide my WordPress URL and API key
- [ ] All course/lesson content is stored in WordPress
- [ ] ONE frontend displays WordPress content seamlessly
- [ ] I can create/edit content in either WordPress admin or ONE interface
- [ ] Changes in WordPress appear in ONE within 30 seconds (polling)
- [ ] Changes in ONE appear in WordPress immediately
- [ ] All user roles map correctly (org_owner → Administrator, etc.)

### Story 2: Notion as Backend

**As an** org_owner using Notion for knowledge management
**I want to** use Notion as my ONE Platform backend
**So that** my team can continue using familiar Notion workflows

**Acceptance Criteria:**
- [ ] I can configure my organization to use Notion provider
- [ ] I provide my Notion integration token and database IDs
- [ ] All documentation/notes are stored in Notion
- [ ] ONE frontend displays Notion pages seamlessly
- [ ] I can create/edit content in either Notion or ONE interface
- [ ] Changes in Notion appear in ONE within 10 seconds (webhooks)
- [ ] Changes in ONE appear in Notion immediately
- [ ] Notion relation properties map to ONE connections

### Story 3: Multi-Backend Organization

**As an** org_owner with diverse needs
**I want to** use different backends for different content types
**So that** I can leverage the best tool for each use case

**Acceptance Criteria:**
- [ ] I can configure CompositeProvider with routing rules
- [ ] I specify: courses→WordPress, docs→Notion, events→Convex
- [ ] Content is routed to correct backend automatically
- [ ] I can query across backends seamlessly
- [ ] ONE frontend shows unified view of all content
- [ ] Cross-provider connections work correctly
- [ ] Health checks alert me if any provider is down

### Story 4: Backend Migration

**As an** org_owner currently using Convex
**I want to** migrate to WordPress
**So that** I can use custom WordPress plugins

**Acceptance Criteria:**
- [ ] I can export all data from Convex
- [ ] I can import all data to WordPress
- [ ] I can switch provider configuration
- [ ] All existing ONE IDs are preserved (remapped)
- [ ] All connections are preserved
- [ ] All events are migrated
- [ ] Migration completes without data loss
- [ ] ONE frontend works immediately after migration

### Story 5: Provider Creation

**As a** developer
**I want to** create a custom provider for my proprietary system
**So that** my organization can use ONE with our existing infrastructure

**Acceptance Criteria:**
- [ ] I have comprehensive provider creation guide
- [ ] I have working examples (WordPress, Notion)
- [ ] I understand all 6-dimension requirements
- [ ] I can implement DataProvider interface
- [ ] I can test my provider with integration test suite
- [ ] I can deploy my provider to production
- [ ] My provider passes all quality gates

---

## Quality Gates

- [ ] WordPressProvider implements all 6 dimensions
- [ ] NotionProvider implements all 6 dimensions
- [ ] CompositeProvider routes correctly
- [ ] All unit tests pass (100+)
- [ ] All integration tests pass (50+)
- [ ] All end-to-end tests pass (20+)
- [ ] Performance benchmarks acceptable
- [ ] WordPress setup guide complete
- [ ] Notion setup guide complete
- [ ] Provider creation guide complete
- [ ] API reference documentation complete
- [ ] Code review approved by Engineering Director
- [ ] Security review approved (API key handling)
- [ ] No data loss in stress testing
- [ ] Graceful error handling verified

---

## Rollback Plan

**Risk:** Alternative providers introduce bugs or performance issues.

**Mitigation:**
- Providers are additive - ConvexProvider remains default
- Organizations opt-in to alternative providers
- Provider configuration stored per-organization
- Easy to switch back to ConvexProvider

**Rollback Steps:**
1. Update organization's `properties.providerType` to `"convex"`
2. Provider registry automatically uses ConvexProvider
3. No code changes required
4. **Rollback time: Instant** (configuration change only)

**Data Preservation:**
- External data (WordPress, Notion) remains intact
- Events/knowledge in Convex remain intact
- Can re-enable alternative provider at any time

---

## Dependencies

**Required:**
- Feature 2-6 (Dashboard Migration) MUST be complete
- All frontend components MUST use DataProvider abstraction
- No direct Convex imports in components

**External:**
- WordPress instance (6.4+)
- WordPress plugins: ACF Pro, Custom Post Type UI
- Notion workspace with API access
- Notion integration token with full access permissions

**Development:**
- Docker for local WordPress testing
- Notion test workspace
- Integration test credentials (stored in 1Password)

---

## Related Files

**Plan:**
- `one/things/plans/2-backend-agnostic-frontend.md`

**Dependencies:**
- `one/things/features/2-6-dashboard-migration.md`

**Implementation:**
- `frontend/src/providers/DataProvider.ts` (interface)
- `frontend/src/providers/wordpress/WordPressProvider.ts` (NEW)
- `frontend/src/providers/wordpress/WordPressAPI.ts` (NEW)
- `frontend/src/providers/notion/NotionProvider.ts` (NEW)
- `frontend/src/providers/composite/CompositeProvider.ts` (NEW)

**WordPress Plugin:**
- `wordpress/plugins/one-platform-connector/` (NEW - to be created)
- `wordpress/plugins/one-platform-connector/includes/api/connections.php` (NEW)
- `wordpress/plugins/one-platform-connector/includes/api/events.php` (NEW)
- `wordpress/plugins/one-platform-connector/includes/api/knowledge.php` (NEW)
- `wordpress/plugins/one-platform-connector/includes/schema.php` (NEW - SQL table creation)

**Tests:**
- `frontend/tests/unit/providers/wordpress.test.ts` (NEW)
- `frontend/tests/unit/providers/notion.test.ts` (NEW)
- `frontend/tests/unit/providers/composite.test.ts` (NEW)
- `frontend/tests/integration/providers/wordpress.test.ts` (NEW)
- `frontend/tests/integration/providers/notion.test.ts` (NEW)
- `frontend/tests/e2e/multi-backend.test.ts` (NEW)

**Documentation:**
- `one/knowledge/providers/wordpress-setup.md` (NEW)
- `one/knowledge/providers/notion-setup.md` (NEW)
- `one/knowledge/providers/provider-creation-guide.md` (NEW)
- `one/knowledge/providers/ontology-mapping.md` (NEW)

---

## Success Metrics

**Technical:**
- [ ] 200+ tests passing
- [ ] WordPress provider: < 500ms p99 latency
- [ ] Notion provider: < 1s p99 latency
- [ ] CompositeProvider: < 50ms routing overhead
- [ ] Zero data loss in stress testing
- [ ] All 6 dimensions fully implemented

**User Experience:**
- [ ] Organizations can switch providers in < 5 minutes
- [ ] No frontend code changes required
- [ ] Seamless experience regardless of backend
- [ ] Real-time updates working (polling/webhooks)

**Documentation:**
- [ ] 3 complete setup guides published
- [ ] Provider creation guide with examples
- [ ] API reference complete
- [ ] Troubleshooting guide covers 10+ common issues

**Strategic:**
- [ ] Proves backend-agnostic architecture works
- [ ] Demonstrates ONE's flexibility
- [ ] Enables organizations with existing infrastructure to adopt ONE
- [ ] Provides template for future provider implementations

---

## Next Steps

1. ✅ **Integration Specialist:** Create detailed specification (THIS FILE)
2. **Integration Specialist:** Review with Engineering Director
3. **Integration Specialist:** Set up WordPress test instance
4. **Integration Specialist:** Set up Notion test workspace
5. **Integration Specialist:** Implement WordPressProvider (Steps 1-40)
6. **Integration Specialist:** Implement NotionProvider (Steps 41-75)
7. **Integration Specialist:** Implement CompositeProvider (Steps 76-90)
8. **Quality Agent:** Run full test suite
9. **Integration Specialist:** Fix any failing tests
10. **Documenter:** Write setup guides
11. **Engineering Director:** Final review and approval
12. **Integration Specialist:** Deploy to staging
13. **Quality Agent:** Validate in staging
14. **Engineering Director:** Deploy to production

---

**Status:** Detailed Specification Complete ✅
**Created:** 2025-10-13
**Specification Completed:** 2025-10-13
**Validated By:** Integration Specialist (Self)
**Awaiting Review By:** Engineering Director
**Strategic Value:** Proves backend-agnostic architecture - enables organizations to use existing infrastructure (WordPress, Notion) while gaining ONE's AI capabilities
**Lines:** 1,486

---

## Appendix: WordPress Database Schema

```sql
-- wp_one_connections table
CREATE TABLE `wp_one_connections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `from_thing_id` varchar(255) NOT NULL,
  `to_thing_id` varchar(255) NOT NULL,
  `relationship_type` varchar(100) NOT NULL,
  `metadata` text,
  `valid_from` bigint(20) unsigned,
  `valid_to` bigint(20) unsigned,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `from_thing_id` (`from_thing_id`),
  KEY `to_thing_id` (`to_thing_id`),
  KEY `relationship_type` (`relationship_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- wp_one_events table
CREATE TABLE `wp_one_events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  `actor_id` varchar(255),
  `target_id` varchar(255),
  `timestamp` datetime NOT NULL,
  `metadata` text,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `actor_id` (`actor_id`),
  KEY `target_id` (`target_id`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- wp_one_knowledge table
CREATE TABLE `wp_one_knowledge` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `knowledge_type` varchar(50) NOT NULL,
  `text` longtext NOT NULL,
  `embedding` longtext,
  `embedding_model` varchar(100),
  `embedding_dim` int(11),
  `source_thing_id` varchar(255),
  `source_field` varchar(100),
  `labels` text,
  `metadata` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `knowledge_type` (`knowledge_type`),
  KEY `source_thing_id` (`source_thing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

**END OF SPECIFICATION**
