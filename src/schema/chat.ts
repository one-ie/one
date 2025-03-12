import { z } from 'zod';

const ContentPart = z.object({
  type: z.literal('text'),
  text: z.string()
});

// Define supported providers
const ProviderSchema = z.enum(['openai', 'anthropic', 'mistral', 'ollama']).default('mistral');

// Define the system prompt schema to accept both string and array formats
const SystemPromptSchema = z.union([
  z.string(),
  z.array(ContentPart)
]).default([{
  type: 'text',
  text: 'I am Agent ONE. How can I help you today?'
}]);

// Define the suggestions schema
const SuggestionSchema = z.union([
  z.string(),
  z.object({
    label: z.string(),
    prompt: z.string()
  })
]);

export const ChatConfigSchema = z.object({
  // Core API configuration
  provider: ProviderSchema,
  model: z.string().default('mistral-large-latest'),
  apiKey: z.string().optional(),
  apiEndpoint: z.string().url().optional(),
  runtime: z.enum(['edge', 'node']).default('edge'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).default(2000),
  
  // API endpoint
  api: z.string().optional(),
  
  // Prompt configuration
  systemPrompt: SystemPromptSchema,
  userPrompt: z.array(ContentPart).optional(),
  addSystemPrompt: z.boolean().default(false),
  addBusinessPrompt: z.boolean().default(false),
  
  // Content configuration
  includeContent: z.boolean().default(true),
  contentPrefix: z.string().default('### Reference Content:'),
  
  // Alternative property names for compatibility with frontmatter
  aiProvider: ProviderSchema.optional(),
  aiModel: z.string().optional(),
  
  // Initial messages
  initialMessages: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      role: z.enum(['user', 'assistant', 'system'])
    })
  ).optional(),
  
  // Welcome configuration
  welcome: z.object({
    message: z.string().default('How can I help you today?'),
    avatar: z.string().default('/icon.svg'),
    suggestions: z.array(SuggestionSchema).default([])
  }).default({
    message: 'How can I help you today?',
    avatar: '/icon.svg',
    suggestions: []
  }),
  
  // Alternative welcome properties for compatibility with frontmatter
  welcomeMessage: z.string().optional(),
  avatar: z.string().optional(),
  suggestions: z.array(SuggestionSchema).optional(),
  
  // Metadata for SEO and organization
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional()
});

export type ChatConfig = z.infer<typeof ChatConfigSchema>;

// Helper function to create a default config
export function createDefaultConfig(overrides?: Partial<z.infer<typeof ChatConfigSchema>>): ChatConfig {
  return ChatConfigSchema.parse(overrides || {});
}

// Helper function to normalize config from different sources (like frontmatter)
export function normalizeConfig(config: Record<string, any>): ChatConfig {
  // Map alternative property names to standard ones
  const normalizedConfig: Record<string, any> = { ...config };
  
  // Handle provider mapping
  if (config.aiProvider && !config.provider) {
    normalizedConfig.provider = config.aiProvider;
  }
  
  // Handle model mapping
  if (config.aiModel && !config.model) {
    normalizedConfig.model = config.aiModel;
  }
  
  // Handle welcome message mapping
  if (config.welcomeMessage && !config.welcome?.message) {
    normalizedConfig.welcome = {
      ...(normalizedConfig.welcome || {}),
      message: config.welcomeMessage
    };
  }
  
  // Handle avatar mapping
  if (config.avatar && !config.welcome?.avatar) {
    normalizedConfig.welcome = {
      ...(normalizedConfig.welcome || {}),
      avatar: config.avatar
    };
  }
  
  // Handle suggestions mapping
  if (config.suggestions && !config.welcome?.suggestions) {
    normalizedConfig.welcome = {
      ...(normalizedConfig.welcome || {}),
      suggestions: config.suggestions.map((suggestion: string | { label: string, prompt: string }) => {
        if (typeof suggestion === 'string') {
          return { label: suggestion, prompt: suggestion };
        }
        return suggestion;
      })
    };
  }
  
  return ChatConfigSchema.parse(normalizedConfig);
}