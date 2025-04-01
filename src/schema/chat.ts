import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

// Core schema definitions
const ProviderSchema = z.enum(['openai', 'anthropic', 'mistral', 'openrouter'])
  .default('openrouter');

const ContentPartSchema = z.object({
  type: z.literal('text'),
  text: z.string()
});

const SystemPromptSchema = z.union([
  z.string(),
  z.array(ContentPartSchema)
]).default('I am Agent ONE. How can I help you today?');

const SuggestionSchema = z.union([
  z.string(),
  z.object({
    label: z.string(),
    prompt: z.string()  
  })
]);

const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  role: z.enum(['user', 'assistant', 'system'])
});

// Base schema without transform
const BaseChatSchema = z.object({
  // Layout and Meta
  layout: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),

  // AI Config
  aiProvider: ProviderSchema.optional().default('openrouter'),
  aiModel: z.string().optional().default('google/gemini-2.0-flash-001'),
  apiEndpoint: z.string().url().optional().default('https://api.openai.com/v1'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(999999).optional().default(999999),
  
  // Prompt Config
  systemPrompt: SystemPromptSchema.optional(),
  addSystemPrompt: z.boolean().optional().default(true),
  addBusinessPrompt: z.boolean().optional().default(true),

  // Welcome Config
  welcomeMessage: z.string().optional()
    .default('How can I help you today?'),
  avatar: z.string().optional().default('/icon.svg'),
  suggestions: z.array(SuggestionSchema).optional().default([]),

  // Optional Config
  api: z.string().optional(),
  apiKey: z.string().optional(),
  runtime: z.enum(['edge', 'node']).optional().default('edge'),
  includeContent: z.boolean().optional().default(true),
  initialMessages: z.array(MessageSchema).optional()
});

// Type exports
export type ContentPart = z.infer<typeof ContentPartSchema>;
export type Suggestion = z.infer<typeof SuggestionSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type BaseChat = z.infer<typeof BaseChatSchema>;

// Helper function to load prompt content
function loadPromptContent(filePath: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
  } catch (error) {
    console.warn(`Warning: Could not load prompt from ${filePath}`, error);
    return '';
  }
}

// Function to combine prompts in order
function combinePrompts(config: BaseChat): ContentPart[] {
  const prompts: string[] = [];

  // Add system prompt (1.md) if enabled
  if (config.addSystemPrompt) {
    const systemPrompt = loadPromptContent('src/content/prompts/system.md');
    if (systemPrompt) prompts.push(systemPrompt);
  }

  // Add business prompt (business.md) if enabled
  if (config.addBusinessPrompt) {
    const businessPrompt = loadPromptContent('src/content/prompts/business.md');
    if (businessPrompt) prompts.push(businessPrompt);
  }

  // Add page-specific system prompt if provided
  if (config.systemPrompt) {
    prompts.push(typeof config.systemPrompt === 'string' 
      ? config.systemPrompt 
      : config.systemPrompt.map((p: ContentPart) => p.text).join('\n\n')
    );
  }

  // Convert to ContentPart array
  return prompts.map(text => ({
    type: 'text' as const,
    text: text.trim()
  }));
}

// Schema with transform
export const ChatSchema = BaseChatSchema.transform((config): Chat => ({
  ...config,
  provider: config.aiProvider || 'mistral',
  model: config.aiModel || 'mistral-large-latest',
  welcome: {
    message: config.welcomeMessage || 'How can I help you today?',
    avatar: config.avatar || '/icon.svg',
    suggestions: (config.suggestions || []).map(suggestion => 
      typeof suggestion === 'string' 
        ? { label: suggestion, prompt: suggestion }
        : suggestion
    )
  },
  systemPrompt: combinePrompts(config)
}));

// Type for transformed output
export interface Chat extends BaseChat {
  provider: string;
  model: string;
  welcome: {
    message: string;
    avatar: string;
    suggestions: Array<{ label: string; prompt: string; }>;
  };
  systemPrompt: ContentPart[];
}

// Type alias for backward compatibility
export type ChatConfig = Chat;

// Exports for backward compatibility
export const ChatConfigSchema = ChatSchema;

// Function exports
export function normalizeConfig(config: Record<string, any>): Chat {
  return ChatSchema.parse(config || {});
}

export function createChat(overrides?: Partial<Chat>): Chat {
  return ChatSchema.parse(overrides || {});
}

export const createDefaultConfig = createChat;