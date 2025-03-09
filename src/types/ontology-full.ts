/**
 * ONE Platform Ontology
 * 
 * Core Concepts:
 * 1. Business - The root entity that contains all business-related configuration
 * 2. Content - Streams, Pages, Prompts and Agents that make up the site content
 * 3. UI/UX - Navigation, Layout, and Chat interface components
 * 4. SEO/Schema - Search engine optimization and structured data
 * 5. Internationalization - Language and localization settings
 * 6. Chat - Real-time communication and messaging system
 */

// 1. Business Domain
export const BusinessDomain = {
  core: {
    info: {
      schema: 'businessInfoSchema',
      properties: {
        name: 'string',
        description: 'string',
        website: 'string',
        legalName: 'string',
        type: 'string',
        founded: 'number',
        founders: ['string'],
        vatID: 'string?',
        companyNumber: 'string?',
        hours: 'string',
        support: {
          email: 'string',
          hours: 'string',
          response: 'string'
        },
        payments: ['string'],
        currencies: ['string']
      }
    },
    brand: {
      schema: 'brandSchema',
      components: {
        logos: {
          default: 'string',
          dark: 'string', 
          light: 'string'
        },
        favicon: {
          ico: 'string',
          png: 'string',
          svg: 'string',
          sizes: ['number']
        },
        colors: {
          primary: 'string',
          secondary: 'string',
          accent: 'string',
          background: 'string',
          text: 'string',
          light: 'Record<string>',
          dark: 'Record<string>'
        },
        fonts: {
          heading: 'string',
          body: 'string',
          code: 'string',
          system: {
            sans: 'string',
            serif: 'string',
            mono: 'string'
          }
        }
      }
    },
    contact: {
      schema: 'contactSchema',
      properties: {
        email: 'string',
        phone: 'string',
        whatsapp: 'string',
        telegram: 'string',
        address: {
          street: 'string',
          area: 'string',
          city: 'string',
          county: 'string',
          country: 'string'
        },
        social: {
          github: 'string',
          twitter: 'string',
          linkedin: 'string',
          instagram: 'string',
          youtube: 'string',
          discord: 'string',
          medium: 'string?',
          facebook: 'string',
          tiktok: 'string?',
          threads: 'string?',
          mastodon: 'string?',
          slack: 'string',
          telegram_channel: 'string'
        }
      }
    }
  }
};

// 2. Content Domain
export const ContentDomain = {
  types: {
    stream: {
      schema: 'streamSchema',
      properties: {
        title: 'string?',
        description: 'string?',
        date: 'date?',
        draft: 'boolean',
        featured: 'boolean',
        image: 'string?',
        video: 'string?',
        audio: 'string?',
        tags: ['string'],
        category: 'string?',
        author: 'string?',
        seo: 'partialSeoSchema?'
      }
    },
    prompt: {
      schema: 'promptSchema',
      properties: {
        title: 'string?',
        description: 'string?',
        role: 'string?',
        style: 'string?',
        goal: 'string?',
        maxResponseLength: 'number?',
        tools: ['string'],
        context: 'string?',
        sources: ['promptSourceSchema'],
        seo: 'partialSeoSchema?'
      }
    },
    agent: {
      schema: 'agentSchema',
      properties: {
        title: 'string',
        description: 'string',
        role: 'string',
        style: 'string',
        goal: 'string',
        maxResponseLength: 'number',
        tools: ['string'],
        context: 'string',
        sources: ['agentSourceSchema']
      }
    },
    page: {
      schema: 'pageSchema',
      properties: {
        title: 'string',
        description: 'string',
        showHeader: 'boolean?',
        showFooter: 'boolean?',
        showSidebar: 'boolean?',
        showChat: 'boolean?',
        chat: 'ChatConfigSchema?',
        seo: 'partialSeoSchema?'
      }
    }
  }
};

// 3. UI/UX Domain
export const UIDomain = {
  navigation: {
    item: 'navigationItemSchema',
    structure: 'navigationSchema',
  },
  chat: {
    config: 'ChatConfigSchema',
    message: 'MessageSchema',
    thread: 'ThreadSchema',
    user: 'UserSchema',
    mode: 'ChatModeSchema',
  },
  layout: {
    props: 'LayoutProps',
    config: {
      header: 'HeaderConfigSchema',
      footer: 'FooterConfigSchema',
    }
  }
};

// 4. SEO/Schema Domain
export const SEODomain = {
  core: {
    metadata: {
      schema: 'seoSchema',
      required: {
        canonical: 'string',
        title: 'string',
        metaTitle: 'string',
        metaDescription: 'string',
        metaKeywords: ['string']
      },
      optional: {
        metaRobots: 'string',
        published: 'string',
        modified: 'string',
        author: 'string',
        section: 'string',
        tags: ['string']
      }
    },
    openGraph: {
      schema: 'openGraphSchema',
      required: {
        type: ['website', 'article', 'profile', 'book'],
        title: 'string',
        description: 'string',
        image: {
          url: 'string',
          width: 'number',
          height: 'number',
          alt: 'string'
        }
      }
    },
    twitter: {
      schema: 'twitterSchema',
      required: {
        card: ['summary', 'summary_large_image', 'app', 'player'],
        title: 'string',
        description: 'string',
        image: 'string'
      }
    }
  }
};

// 5. Internationalization Domain
export const I18NDomain = {
  core: {
    config: 'i18nSchema',
    locales: ['string'],
    currencies: {
      default: 'string',
      supported: ['string'],
    }
  }
};

// Chat Domain - Detailed Structure
export const ChatDomain = {
  core: {
    message: {
      schema: 'MessageSchema',
      types: {
        text: 'string',
        audio: 'AudioMessage',
        image: 'ImageMessage',
        system: 'SystemMessage',
        thinking: 'ThinkingMessage'
      },
      states: {
        sending: 'Message is being sent',
        sent: 'Message delivered successfully',
        error: 'Error in message delivery',
        deleted: 'Message was deleted',
        thinking: 'AI is generating response'
      },
      metadata: {
        id: 'string',
        timestamp: 'Date',
        edited: 'boolean',
        editHistory: ['EditRecord'],
        reactions: ['Reaction'],
        threadId: 'string?',
        parentId: 'string?'
      }
    },
    user: {
      schema: 'UserSchema',
      roles: {
        user: 'Regular user',
        admin: 'Administrator',
        guest: 'Guest user'
      },
      preferences: {
        theme: ['light', 'dark', 'earth'],
        notifications: 'boolean',
        sound: 'boolean'
      }
    },
    thread: {
      schema: 'ThreadSchema',
      properties: {
        id: 'string',
        title: 'string?',
        messages: ['Message'],
        participants: ['User'],
        status: ['active', 'archived', 'deleted']
      }
    }
  },

  modes: {
    icon: {
      schema: 'IconConfigSchema',
      properties: {
        position: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        badge: 'number?',
        pulse: 'boolean',
        launchMode: ['floating', 'fullscreen', 'split', 'responsive'],
        size: 'number',
        mobilePosition: ['top', 'bottom']
      }
    },
    floating: {
      schema: 'FloatingConfigSchema',
      properties: {
        dimensions: {
          minWidth: 'number',
          maxWidth: 'number',
          minHeight: 'number',
          maxHeight: 'number'
        },
        position: {
          x: 'number',
          y: 'number'
        },
        behavior: {
          draggable: 'boolean',
          resizable: 'boolean',
          snapToEdges: 'boolean',
          rememberPosition: 'boolean'
        }
      }
    },
    embedded: {
      schema: 'EmbeddedConfigSchema',
      properties: {
        dimensions: {
          width: 'string | number',
          height: 'string | number'
        },
        options: {
          inheritTheme: 'boolean',
          containerClassName: 'string?',
          showHeader: 'boolean'
        }
      }
    },
    split: {
      schema: 'SplitConfigSchema',
      properties: {
        layout: {
          showHeader: 'boolean',
          showNavigation: 'boolean',
          defaultWidth: 'string',
          minWidth: 'string',
          maxWidth: 'string'
        },
        options: {
          side: ['left', 'right'],
          collapsible: 'boolean'
        }
      }
    }
  },

  features: {
    media: {
      attachments: {
        schema: 'AttachmentSchema',
        types: ['image', 'audio', 'file', 'code'],
        properties: {
          id: 'string',
          url: 'string',
          name: 'string',
          size: 'number',
          mimeType: 'string',
          metadata: 'Record<string, any>'
        }
      },
      audio: {
        recording: 'boolean',
        playback: 'boolean',
        formats: ['mp3', 'wav', 'ogg']
      },
      images: {
        upload: 'boolean',
        preview: 'boolean',
        maxSize: 'number'
      }
    },
    formatting: {
      markdown: 'boolean',
      codeHighlighting: 'boolean',
      latex: 'boolean'
    },
    interactions: {
      reactions: {
        schema: 'ReactionSchema',
        properties: {
          emoji: 'string',
          count: 'number',
          users: ['string']
        }
      },
      commands: {
        schema: 'CommandSchema',
        properties: {
          id: 'string',
          name: 'string',
          description: 'string',
          icon: 'string?',
          shortcut: 'string?',
          action: 'Function'
        }
      },
      editing: {
        enabled: 'boolean',
        history: 'boolean',
        timeLimit: 'number?'
      }
    }
  },

  ui: {
    header: {
      schema: 'HeaderConfigSchema',
      properties: {
        visible: 'boolean',
        showTitle: 'boolean',
        showClose: 'boolean',
        showMinimize: 'boolean',
        showModeToggle: 'boolean',
        height: 'number',
        customActions: ['Action']
      }
    },
    input: {
      properties: {
        placeholder: 'string',
        multiline: 'boolean',
        maxLength: 'number?',
        suggestions: 'boolean',
        fileUpload: 'boolean'
      },
      shortcuts: {
        send: 'enter',
        newLine: 'shift+enter',
        suggestions: 'ctrl+space'
      }
    },
    theme: {
      schema: 'ThemeSchema',
      variants: {
        light: 'LightTheme',
        dark: 'DarkTheme',
        earth: 'EarthTheme'
      },
      properties: {
        background: 'string',
        text: 'string',
        primary: 'string',
        secondary: 'string',
        accent: 'string',
        border: 'string',
        shadow: 'string'
      }
    }
  },

  state: {
    persistence: {
      enabled: 'boolean',
      storage: ['localStorage', 'sessionStorage', 'indexedDB'],
      keys: {
        messages: 'string',
        preferences: 'string',
        position: 'string'
      }
    },
    loading: {
      states: {
        isTyping: 'boolean',
        isUploading: 'boolean',
        isProcessing: 'boolean'
      }
    }
  },

  events: {
    message: {
      onSend: 'Function',
      onReceive: 'Function',
      onEdit: 'Function',
      onDelete: 'Function',
      onError: 'Function'
    },
    mode: {
      onChange: 'Function',
      onMinimize: 'Function',
      onMaximize: 'Function',
      onClose: 'Function'
    },
    media: {
      onUpload: 'Function',
      onDownload: 'Function',
      onPlayback: 'Function',
      onError: 'Function'
    }
  },

  accessibility: {
    aria: {
      labels: {
        chatWindow: 'string',
        messageInput: 'string',
        sendButton: 'string',
        toggleButton: 'string',
        closeButton: 'string'
      },
      live: {
        messages: 'polite',
        status: 'polite',
        errors: 'assertive'
      }
    },
    keyboard: {
      shortcuts: {
        toggleChat: 'ctrl+space',
        sendMessage: 'enter',
        newLine: 'shift+enter',
        closeChat: 'escape'
      },
      navigation: {
        messages: 'arrow keys',
        commands: 'tab',
        modes: 'alt+number'
      }
    }
  }
};

// Relationships and Dependencies
export const TypeRelationships = {
  // Business depends on
  Business: ['Brand', 'Contact', 'I18n', 'SEO', 'Schema'],
  
  // Content depends on
  Content: ['SEO', 'Schema'],
  
  // Page depends on
  Page: {
    requires: ['SEO', 'Chat', 'Layout'],
    optional: ['Header', 'Footer', 'Sidebar']
  },
  
  // Navigation depends on
  Navigation: ['Business', 'Content'],
  
  // Chat relationships
  Chat: {
    dependencies: ['User', 'Message', 'Thread'],
    core: ['Message', 'User', 'Thread'],
    features: ['Media', 'Formatting', 'Interactions'],
    ui: ['Header', 'Input', 'Theme'],
    state: ['Persistence', 'Loading'],
    events: ['Message', 'Mode', 'Media'],
    accessibility: ['ARIA', 'Keyboard']
  },
  
  Message: {
    dependencies: ['User', 'Thread', 'Attachment', 'Reaction'],
    states: ['Sending', 'Sent', 'Error', 'Deleted', 'Thinking'],
    features: ['Editing', 'Reactions', 'Threading']
  },
  
  Thread: {
    contains: ['Message'],
    participants: ['User'],
    metadata: ['Title', 'Status', 'Timestamps']
  },
  
  Stream: {
    requires: ['SEO'],
    optional: ['Author', 'Category', 'Media']
  },
  
  Agent: {
    requires: ['Source', 'Tools'],
    optional: ['SEO']
  },
  
  Prompt: {
    requires: ['Source'],
    optional: ['SEO', 'Tools']
  },
  
  Brand: {
    components: ['Logo', 'Favicon', 'Colors', 'Fonts'],
    variants: ['Light', 'Dark']
  }
};

// Type Hierarchy
export const TypeHierarchy = {
  root: 'BusinessConfig',
  primary: [
    'Stream',
    'Page', 
    'Prompt',
    'Agent'
  ],
  supporting: [
    'Navigation',
    'Layout',
    'Chat',
    'SEO',
    'Schema'
  ],
  utility: [
    'Brand',
    'Contact', 
    'I18n'
  ],
  chat: {
    core: ['Message', 'User', 'Thread'],
    config: ['Mode', 'Features', 'UI', 'State'],
    features: ['Media', 'Formatting', 'Interactions'],
    ui: ['Header', 'Input', 'Theme'],
    events: ['Message', 'Mode', 'Media'],
    accessibility: ['ARIA', 'Keyboard']
  }
};
/**
 * Key Insights:
 * 
 * 1. BusinessConfig is the root configuration that ties everything together
 * 2. Content types (Stream, Page, Prompt, Agent) are the primary entities
 * 3. SEO and Schema are cross-cutting concerns that apply to multiple domains
 * 4. Chat system has its own rich type hierarchy for real-time communication
 * 5. Navigation and Layout bridge business configuration with content presentation
 * 
 * Design Patterns:
 * 
 * 1. Schema-First: All types are defined using Zod schemas
 * 2. Composition: Complex types are built by composing simpler ones
 * 3. Inheritance: Types often extend base schemas with additional fields
 * 4. Partial Types: Flexible partial schemas for optional configurations
 * 5. Single Source of Truth: Business config as the central configuration
 */

// Export type system metadata
export const TypeSystem = {
  domains: {
    business: BusinessDomain,
    content: ContentDomain,
    ui: UIDomain,
    seo: SEODomain,
    i18n: I18NDomain,
    chat: ChatDomain
  },
  relationships: TypeRelationships,
  hierarchy: TypeHierarchy
};

