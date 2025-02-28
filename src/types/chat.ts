import { z } from 'zod';

// Default values
const DEFAULT_CONFIG = {
  mode: 'split' as const,
  provider: 'openai',
  model: 'gpt-4',
  apiEndpoint: 'https://n8n.agentc.app/webhook/chat',
  theme: 'system' as const
} as const;

// Default event handlers
const DEFAULT_EVENTS = {
  onError: (error: string) => console.error('[Chat Error]:', error),
  onMessage: (message: any) => console.log('[Chat Message]:', message)
} as const;

// Chat mode and size types
export type ChatMode = 'split' | 'icon' | 'floating' | 'fullscreen' | 'embedded';
export type ChatSize = 'full' | 'half' | 'third' | 'quarter';

// Define event handlers type separately
export type ChatEvents = {
  onError?: (error: string) => void;
  onMessage?: (message: any) => void;
};

// Chat configuration schema without events
export const ChatConfigSchema = z.object({
  // Required fields
  mode: z.enum(['split', 'icon', 'floating', 'fullscreen', 'embedded']),
  
  // Optional fields
  title: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  welcome: z.string().optional(),
  systemPrompt: z.string().optional(),
  
  // Add webhook related fields
  webhookUrl: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  attachments: z.boolean().optional(),
});

// Complete chat config type that includes both schema fields and events
export type ChatConfig = z.infer<typeof ChatConfigSchema> & {
  events?: ChatEvents;
};

// Message type
export type EnhancedMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error' | 'thinking';
  edited: boolean;
  image?: {
    url: string;
    alt?: string;
  };
  audio?: {
    url: string;
    type: string;
  };
  attachments?: Array<{
    id: string;
    url: string;
    name: string;
    size: number;
    type: string;
  }>;
};