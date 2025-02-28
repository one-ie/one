/**
 * Chat System Ontology
 * A comprehensive type system for real-time chat functionality
 */

export const ChatOntology = {
  // Core Chat Entities
  core: {
    message: {
      types: {
        text: 'Plain text message',
        system: 'System notification',
        thinking: 'AI processing indicator',
        audio: 'Voice/Audio message',
        image: 'Image with caption',
        file: 'Attachment with metadata',
        action: 'Interactive command'
      },
      states: {
        draft: 'Being composed',
        sending: 'In transit',
        sent: 'Delivered',
        error: 'Failed to send',
        deleted: 'Soft deleted',
        edited: 'Modified after sending'
      },
      metadata: {
        id: 'Unique identifier',
        timestamp: 'Creation time',
        editHistory: 'Modification log',
        reactions: 'User reactions',
        threadId: 'Parent thread',
        attachments: 'Media files'
      }
    },

    user: {
      roles: {
        user: 'Standard user',
        admin: 'Administrator',
        ai: 'AI assistant',
        system: 'System actor'
      },
      states: {
        online: 'Currently active',
        offline: 'Not available',
        typing: 'Composing message',
        idle: 'Inactive timeout'
      },
      preferences: {
        theme: ['light', 'dark', 'earth'],
        notifications: 'Alert settings',
        sounds: 'Audio feedback',
        language: 'Interface locale'
      }
    },

    thread: {
      types: {
        main: 'Primary conversation',
        sidebar: 'Context thread',
        modal: 'Focused dialog'
      },
      states: {
        active: 'Ongoing',
        archived: 'Completed',
        locked: 'Read only'
      }
    }
  },

  // Display Modes
  modes: {
    icon: {
      positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      features: ['badge', 'pulse', 'tooltip'],
      transitions: ['fade', 'slide', 'scale']
    },
    floating: {
      dimensions: {
        min: { width: 300, height: 400 },
        max: { width: 800, height: 900 }
      },
      features: ['drag', 'resize', 'minimize'],
      positions: ['remember', 'reset', 'snap']
    },
    embedded: {
      layouts: ['full', 'compact', 'minimal'],
      features: ['header', 'footer', 'sidebar'],
      inheritance: ['theme', 'styles', 'context']
    },
    fullscreen: {
      transitions: ['slide', 'fade', 'none'],
      features: ['escape', 'backdrop', 'scroll'],
      restore: ['position', 'size', 'mode']
    }
  },

  // Interactive Features
  features: {
    input: {
      types: ['text', 'voice', 'file'],
      actions: ['send', 'edit', 'delete'],
      enhancements: ['emoji', 'mentions', 'commands']
    },
    media: {
      upload: {
        types: ['image', 'audio', 'file'],
        validation: ['size', 'type', 'count'],
        processing: ['compress', 'preview', 'store']
      },
      playback: {
        audio: ['play', 'pause', 'seek'],
        video: ['play', 'fullscreen', 'pip'],
        controls: ['volume', 'speed', 'quality']
      }
    },
    interactions: {
      reactions: {
        types: ['emoji', 'like', 'custom'],
        actions: ['add', 'remove', 'toggle'],
        display: ['inline', 'popup', 'counter']
      },
      commands: {
        types: ['action', 'navigation', 'api'],
        triggers: ['slash', 'shortcut', 'menu'],
        context: ['global', 'message', 'input']
      },
      threads: {
        actions: ['create', 'reply', 'close'],
        display: ['inline', 'sidebar', 'modal'],
        features: ['collapse', 'search', 'filter']
      }
    }
  },

  // UI Components
  ui: {
    layout: {
      header: {
        elements: ['title', 'actions', 'status'],
        controls: ['close', 'minimize', 'mode'],
        features: ['sticky', 'resize', 'custom']
      },
      messages: {
        layout: ['vertical', 'bubbles', 'grouped'],
        features: ['scroll', 'load-more', 'jump'],
        indicators: ['typing', 'read', 'error']
      },
      input: {
        types: ['single', 'multi', 'rich'],
        features: ['resize', 'paste', 'preview'],
        actions: ['send', 'attach', 'command']
      }
    },
    theme: {
      schemes: {
        light: 'Light mode colors',
        dark: 'Dark mode colors',
        earth: 'Earth tone palette'
      },
      elements: {
        messages: ['user', 'ai', 'system'],
        inputs: ['field', 'button', 'menu'],
        accents: ['primary', 'success', 'error']
      }
    }
  },

  // State Management
  state: {
    persistence: {
      storage: ['local', 'session', 'indexed'],
      entities: ['messages', 'settings', 'drafts'],
      sync: ['realtime', 'periodic', 'manual']
    },
    loading: {
      states: ['idle', 'loading', 'error', 'success'],
      indicators: ['spinner', 'pulse', 'skeleton'],
      timeouts: ['retry', 'stale', 'expire']
    },
    cache: {
      types: ['message', 'media', 'user'],
      strategies: ['memory', 'storage', 'network'],
      policies: ['ttl', 'size', 'priority']
    }
  },

  // Event System
  events: {
    message: {
      lifecycle: ['compose', 'send', 'deliver', 'read'],
      actions: ['edit', 'delete', 'react', 'reply'],
      errors: ['send', 'receive', 'media']
    },
    ui: {
      window: ['open', 'close', 'resize', 'move'],
      view: ['scroll', 'focus', 'blur', 'click'],
      media: ['upload', 'download', 'play', 'pause']
    },
    system: {
      connection: ['connect', 'disconnect', 'reconnect'],
      sync: ['start', 'complete', 'error'],
      lifecycle: ['mount', 'update', 'unmount']
    }
  },

  // Accessibility
  a11y: {
    aria: {
      landmarks: ['chat', 'messages', 'input'],
      live: ['polite', 'assertive', 'off'],
      labels: ['button', 'input', 'status']
    },
    keyboard: {
      navigation: ['arrows', 'tab', 'escape'],
      shortcuts: ['send', 'close', 'commands'],
      focus: ['trap', 'restore', 'manage']
    },
    announcements: {
      message: ['new', 'edited', 'deleted'],
      status: ['connecting', 'error', 'success'],
      activity: ['typing', 'upload', 'action']
    }
  },

  ai: {
    providers: {
      types: ['openai', 'anthropic', 'local'],
      models: ['gpt-4', 'claude', 'custom'],
      features: ['streaming', 'functions', 'tools']
    },
    context: {
      system: ['role', 'goals', 'constraints'],
      memory: ['short-term', 'long-term', 'semantic'],
      tools: ['search', 'calculate', 'generate']
    },
    processing: {
      streaming: ['tokens', 'chunks', 'completion'],
      validation: ['safety', 'relevance', 'quality'],
      optimization: ['caching', 'batching', 'routing']
    }
  },

  security: {
    authentication: {
      methods: ['token', 'oauth', 'session'],
      roles: ['user', 'admin', 'guest'],
      permissions: ['read', 'write', 'moderate']
    },
    privacy: {
      data: ['pii', 'sensitive', 'public'],
      retention: ['session', 'temporary', 'permanent'],
      compliance: ['gdpr', 'ccpa', 'hipaa']
    },
    moderation: {
      content: ['text', 'media', 'links'],
      actions: ['filter', 'flag', 'block'],
      automation: ['ai', 'rules', 'human']
    }
  },

  analytics: {
    metrics: {
      usage: ['sessions', 'messages', 'users'],
      performance: ['latency', 'errors', 'load'],
      engagement: ['duration', 'interactions', 'retention']
    },
    tracking: {
      events: ['user', 'system', 'error'],
      flows: ['conversation', 'feature', 'error'],
      custom: ['goals', 'funnels', 'segments']
    },
    reporting: {
      types: ['real-time', 'aggregate', 'trends'],
      exports: ['csv', 'json', 'api'],
      alerts: ['threshold', 'anomaly', 'error']
    }
  }
};

// Type Relationships
export const ChatRelationships = {
  message: {
    requires: ['user', 'thread'],
    triggers: ['events', 'state'],
    affects: ['ui', 'storage']
  },
  mode: {
    affects: ['layout', 'features', 'behavior'],
    responds: ['screen', 'interaction', 'context'],
    maintains: ['state', 'history', 'preferences']
  },
  feature: {
    enhances: ['core', 'ui', 'interaction'],
    requires: ['capabilities', 'permissions'],
    integrates: ['system', 'external', 'api']
  }
};

// Behavioral Patterns
export const ChatPatterns = {
  interaction: {
    input: ['compose', 'preview', 'send'],
    response: ['receive', 'render', 'react'],
    feedback: ['visual', 'audio', 'haptic']
  },
  lifecycle: {
    session: ['start', 'maintain', 'end'],
    message: ['create', 'transit', 'deliver'],
    feature: ['initialize', 'execute', 'cleanup']
  },
  optimization: {
    performance: ['lazy', 'throttle', 'batch'],
    resources: ['cache', 'prefetch', 'cleanup'],
    experience: ['predict', 'preload', 'optimize']
  }
};
