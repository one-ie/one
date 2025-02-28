/**
 * Astro-Specific Ontology Mappings
 */

export const AstroMappings = {
  Collections: {
    content: {
      types: ['streams', 'pages', 'prompts'],
      features: ['Draft', 'Schedule', 'Archive'],
      processing: ['Markdown', 'MDX', 'YAML']
    },
    config: {
      business: ['settings', 'brand', 'legal'],
      system: ['routes', 'integrations', 'api'],
      features: ['chat', 'search', 'analytics']
    }
  },
  
  Components: {
    islands: {
      interactive: ['Chat', 'Search', 'Forms'],
      features: ['RealTime', 'Optimistic', 'Offline'],
      loading: ['Eager', 'Lazy', 'OnVisible']
    },
    static: {
      layout: ['Header', 'Footer', 'Sidebar'],
      content: ['Article', 'Section', 'Card'],
      utility: ['SEO', 'Analytics', 'Schema']
    }
  },

  Integration: {
    data: {
      sources: ['Local', 'Remote', 'Hybrid'],
      processing: ['Transform', 'Validate', 'Cache'],
      storage: ['Collections', 'Database', 'API']
    },
    rendering: {
      modes: ['Static', 'Server', 'Hybrid'],
      optimization: ['Images', 'Fonts', 'Scripts'],
      caching: ['Browser', 'Edge', 'Server']
    },
    deployment: {
      environments: ['Dev', 'Stage', 'Prod'],
      providers: ['Vercel', 'Netlify', 'Edge'],
      features: ['Preview', 'Branch', 'Rollback']
    }
  }
};

// Framework-specific behaviors
export const AstroBehaviors = {
  Rendering: {
    static: ['Collections', 'Assets', 'Routes'],
    server: ['API', 'Auth', 'Dynamic'],
    client: ['Islands', 'State', 'Effects']
  },
  
  Optimization: {
    assets: ['Images', 'Fonts', 'Scripts'],
    delivery: ['Compression', 'CDN', 'Edge'],
    performance: ['Metrics', 'Budgets', 'Scores']
  }
}; 