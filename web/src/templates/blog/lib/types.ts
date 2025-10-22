/**
 * Core Template Types
 *
 * Generated from ontology-core.yaml
 */


/**
 * page entity
 * Generated from ontology thing type
 */
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
}


/**
 * user entity
 * Generated from ontology thing type
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
}


/**
 * file entity
 * Generated from ontology thing type
 */
export interface File {
  id: string;
  url: string;
  mimeType: string;
  size: number;
}


/**
 * link entity
 * Generated from ontology thing type
 */
export interface Link {
  id: string;
  url: string;
  title: string;
}


/**
 * note entity
 * Generated from ontology thing type
 */
export interface Note {
  id: string;
  content: string;
}


/**
 * blog_post entity
 * Generated from ontology thing type
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: number;
  tags: string[];
  category: string;
}


/**
 * blog_category entity
 * Generated from ontology thing type
 */
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}
