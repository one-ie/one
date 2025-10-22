/**
 * Blog Template - Ontology Adapter
 *
 * Generated from ontology-blog.yaml
 * Converts between template types and blog ontology types
 */

import type { Id } from '@backend/convex/_generated/dataModel';
import type {
  Thing,
  CreateThingInput,
  CreateConnectionInput,
  CreateEventInput,
} from '@/lib/template-ontology';
import {
  getProperty,
  getRequiredProperty,
  validateThingType,
  validateThingProperties,
  templateToThing,
} from '@/lib/template-ontology';
import type {
  Page,
  User,
  Link,
  Note,
  BlogPost,
  BlogCategory,
} from './types';

// ============================================================================
// Blog Ontology Types
// ============================================================================

/**
 * Thing types from blog ontology
 */
export type BlogThingType =
  | 'page'
  | 'user'
  | 'file'
  | 'link'
  | 'note'
  | 'blog_post'
  | 'blog_category';

/**
 * Connection types from blog ontology
 */
export type BlogConnectionType =
  | 'created_by'
  | 'updated_by'
  | 'viewed_by'
  | 'favorited_by'
  | 'posted_in';

/**
 * Event types from blog ontology
 */
export type BlogEventType =
  | 'thing_created'
  | 'thing_updated'
  | 'thing_deleted'
  | 'thing_viewed'
  | 'blog_post_published'
  | 'blog_post_viewed';

// ============================================================================
// Thing Conversions
// ============================================================================

/**
 * Convert ontology Thing to Page
 */
export function thingToPage(thing: Thing): Page {
  validateThingType(thing, 'page');

  return {
    id: thing._id,
    title: getRequiredProperty(thing, 'title'),
    slug: getRequiredProperty(thing, 'slug'),
    content: getRequiredProperty(thing, 'content'),
  };
}

/**
 * Convert Page to ontology Thing input
 */
export function pageToThing(
  entity: Page,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    entity,
    'page',
    groupId,
    (e) => ({
      title: e.title,
      slug: e.slug,
      content: e.content,
    })
  );
}


/**
 * Convert ontology Thing to User
 */
export function thingToUser(thing: Thing): User {
  validateThingType(thing, 'user');

  return {
    id: thing._id,
    email: getRequiredProperty(thing, 'email'),
    displayName: getRequiredProperty(thing, 'displayName'),
  };
}

/**
 * Convert User to ontology Thing input
 */
export function userToThing(
  entity: User,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    entity,
    'user',
    groupId,
    (e) => ({
      email: e.email,
      displayName: e.displayName,
    })
  );
}


/**
 * Convert ontology Thing to File
 */
export function thingToFile(thing: Thing): File {
  validateThingType(thing, 'file');

  return {
    id: thing._id,
    url: getRequiredProperty(thing, 'url'),
    mimeType: getRequiredProperty(thing, 'mimeType'),
    size: getRequiredProperty(thing, 'size'),
  };
}

/**
 * Convert File to ontology Thing input
 */
export function fileToThing(
  entity: File,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    entity,
    'file',
    groupId,
    (e) => ({
      url: e.url,
      mimeType: e.mimeType,
      size: e.size,
    })
  );
}


/**
 * Convert ontology Thing to Link
 */
export function thingToLink(thing: Thing): Link {
  validateThingType(thing, 'link');

  return {
    id: thing._id,
    url: getRequiredProperty(thing, 'url'),
    title: getRequiredProperty(thing, 'title'),
  };
}

/**
 * Convert Link to ontology Thing input
 */
export function linkToThing(
  entity: Link,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    entity,
    'link',
    groupId,
    (e) => ({
      url: e.url,
      title: e.title,
    })
  );
}


/**
 * Convert ontology Thing to Note
 */
export function thingToNote(thing: Thing): Note {
  validateThingType(thing, 'note');

  return {
    id: thing._id,
    content: getRequiredProperty(thing, 'content'),
  };
}

/**
 * Convert Note to ontology Thing input
 */
export function noteToThing(
  entity: Note,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    entity,
    'note',
    groupId,
    (e) => ({
      content: e.content,
    })
  );
}


/**
 * Convert ontology Thing to BlogPost
 */
export function thingToBlogPost(thing: Thing): BlogPost {
  validateThingType(thing, 'blog_post');

  return {
    id: thing._id,
    title: getRequiredProperty(thing, 'title'),
    slug: getRequiredProperty(thing, 'slug'),
    content: getRequiredProperty(thing, 'content'),
    excerpt: getRequiredProperty(thing, 'excerpt'),
    featuredImage: getRequiredProperty(thing, 'featuredImage'),
    publishedAt: getRequiredProperty(thing, 'publishedAt'),
    tags: getRequiredProperty(thing, 'tags'),
    category: getRequiredProperty(thing, 'category'),
  };
}

/**
 * Convert BlogPost to ontology Thing input
 */
export function blogPostToThing(
  entity: BlogPost,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    entity,
    'blog_post',
    groupId,
    (e) => ({
      title: e.title,
      slug: e.slug,
      content: e.content,
      excerpt: e.excerpt,
      featuredImage: e.featuredImage,
      publishedAt: e.publishedAt,
      tags: e.tags,
      category: e.category,
    })
  );
}


/**
 * Convert ontology Thing to BlogCategory
 */
export function thingToBlogCategory(thing: Thing): BlogCategory {
  validateThingType(thing, 'blog_category');

  return {
    id: thing._id,
    name: getRequiredProperty(thing, 'name'),
    slug: getRequiredProperty(thing, 'slug'),
    description: getRequiredProperty(thing, 'description'),
  };
}

/**
 * Convert BlogCategory to ontology Thing input
 */
export function blogCategoryToThing(
  entity: BlogCategory,
  groupId: Id<'groups'>
): CreateThingInput {
  return templateToThing(
    entity,
    'blog_category',
    groupId,
    (e) => ({
      name: e.name,
      slug: e.slug,
      description: e.description,
    })
  );
}

// ============================================================================
// Event Helpers
// ============================================================================


/**
 * Create 'thing_created' event
 */
export function createThingCreatedEvent(
  targetId: Id<'entities'>,
  actorId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata?: Record<string, any>
): CreateEventInput {
  return {
    groupId,
    type: 'thing_created',
    actorId,
    targetId,
    metadata,
  };
}

/**
 * Create 'thing_updated' event
 */
export function createThingUpdatedEvent(
  targetId: Id<'entities'>,
  actorId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata?: Record<string, any>
): CreateEventInput {
  return {
    groupId,
    type: 'thing_updated',
    actorId,
    targetId,
    metadata,
  };
}

/**
 * Create 'thing_deleted' event
 */
export function createThingDeletedEvent(
  targetId: Id<'entities'>,
  actorId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata?: Record<string, any>
): CreateEventInput {
  return {
    groupId,
    type: 'thing_deleted',
    actorId,
    targetId,
    metadata,
  };
}

/**
 * Create 'thing_viewed' event
 */
export function createThingViewedEvent(
  targetId: Id<'entities'>,
  actorId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata?: Record<string, any>
): CreateEventInput {
  return {
    groupId,
    type: 'thing_viewed',
    actorId,
    targetId,
    metadata,
  };
}

/**
 * Create 'blog_post_published' event
 */
export function createBlogPostPublishedEvent(
  targetId: Id<'entities'>,
  actorId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata?: Record<string, any>
): CreateEventInput {
  return {
    groupId,
    type: 'blog_post_published',
    actorId,
    targetId,
    metadata,
  };
}

/**
 * Create 'blog_post_viewed' event
 */
export function createBlogPostViewedEvent(
  targetId: Id<'entities'>,
  actorId: Id<'entities'>,
  groupId: Id<'groups'>,
  metadata?: Record<string, any>
): CreateEventInput {
  return {
    groupId,
    type: 'blog_post_viewed',
    actorId,
    targetId,
    metadata,
  };
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
  BlogThingType,
  BlogConnectionType,
  BlogEventType,
};
