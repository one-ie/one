/**
 * Core Ontology - Lean Version
 * Maps the essential relationships and types in the system
 */

// Core Domains
export const Domains = {
  Business: {
    description: 'Root configuration and settings',
    core: ['Config', 'Brand', 'Legal'],
    features: ['Localization', 'SEO', 'Analytics']
  },
  Content: {
    description: 'Pages, streams, prompts and agents',
    types: ['Page', 'Stream', 'Prompt', 'Agent'],
    features: ['Collections', 'Markdown', 'Media']
  },
  UI: {
    description: 'Components, layouts and interactions',
    core: ['Layout', 'Navigation', 'Theme'],
    features: ['Chat', 'Search', 'Forms']
  },
  Data: {
    description: 'Storage, validation and processing',
    core: ['Schema', 'Store', 'Cache'],
    features: ['Validation', 'Migration', 'Backup']
  }
};

// System Flows
export const Flow = {
  Data: {
    input: ['Validation', 'Processing', 'Storage'],
    output: ['Retrieval', 'Transformation', 'Presentation']
  },
  Content: {
    creation: ['Draft', 'Review', 'Publish'],
    delivery: ['Load', 'Transform', 'Render']
  },
  User: {
    interaction: ['Input', 'Process', 'Response'],
    journey: ['Enter', 'Engage', 'Exit']
  }
};

// Core Types
export const Types = {
  Config: {
    business: ['Info', 'Brand', 'Contact'],
    system: ['API', 'Storage', 'Cache'],
    features: ['Chat', 'Search', 'Analytics']
  },
  Content: {
    base: ['Title', 'Description', 'SEO'],
    types: ['Page', 'Stream', 'Prompt'],
    meta: ['Author', 'Date', 'Status']
  },
  UI: {
    layout: ['Header', 'Footer', 'Sidebar'],
    components: ['Button', 'Card', 'Form'],
    patterns: ['List', 'Grid', 'Stack']
  }
};

// Core Behaviors
export const Behaviors = {
  Validation: {
    schema: 'Zod type validation',
    rules: 'Business rule validation',
    input: 'User input validation'
  },
  Storage: {
    content: 'Astro collections',
    cache: 'Browser/Server cache',
    state: 'Application state'
  },
  Rendering: {
    static: 'Build-time rendering',
    dynamic: 'Server-side rendering',
    interactive: 'Client-side rendering'
  }
};

// System States
export const States = {
  Content: ['Draft', 'Review', 'Published', 'Archived'],
  User: ['Anonymous', 'Authenticated', 'Admin'],
  Process: ['Idle', 'Loading', 'Error', 'Success']
};

// Core Events
export const Events = {
  System: ['Init', 'Error', 'Update'],
  User: ['Login', 'Action', 'Logout'],
  Content: ['Create', 'Update', 'Delete']
};
