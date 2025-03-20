import type { APIRoute } from 'astro';
import 'dotenv/config';
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { mistral } from "@ai-sdk/mistral";
import { openrouter } from '@openrouter/ai-sdk-provider';
import { createEdgeRuntimeAPI } from "@assistant-ui/react/edge";
import { type ChatConfig } from '@/schema/chat';
import type { Message } from 'ai';

interface ChatRequest {
  id: string;
  messages: Message[];
  config?: ChatConfig;
  provider?: string;
  model?: string;
  apiEndpoint?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  addSystemPrompt?: boolean;
  addBusinessPrompt?: boolean;
  content?: string;
}

interface ExtendedMessage extends Message {
  role: 'system' | 'user' | 'assistant';
}

const getProvider = (config: ChatRequest) => {
  // Use config object first, then fallback to individual properties
  const provider = config.config?.provider || config.provider || 'mistral';
  const model = config.config?.model || config.model || 'mistral-large-latest';
  
  switch (provider) {
    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      return anthropic(model);
      
    case 'mistral':
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error('MISTRAL_API_KEY not configured');
      }
      return mistral(model);
    
    case 'openrouter':
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured');
      }
      return openrouter(model);
      
    case 'openai':
    default:
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      return openai(model);
  }
};

// Function to load system prompts
const loadSystemPrompt = async (addSystemPrompt: boolean = false) => {
  if (!addSystemPrompt) return '';
  try {
    return "You are Agent ONE, an AI assistant focused on helping users with their tasks.";
  } catch (error) {
    console.error('Error loading system prompt:', error);
    return '';
  }
};

// Function to load business prompts
const loadBusinessPrompt = async (addBusinessPrompt: boolean = false) => {
  if (!addBusinessPrompt) return '';
  try {
    return "You specialize in helping businesses with commercial applications, licensing, and enterprise solutions.";
  } catch (error) {
    console.error('Error loading business prompt:', error);
    return '';
  }
};

// Process system prompt from various formats
const processSystemPrompt = (systemPrompt: any): string => {
  if (!systemPrompt) return '';
  
  if (typeof systemPrompt === 'string') {
    return systemPrompt;
  }
  
  if (Array.isArray(systemPrompt)) {
    return systemPrompt.map(p => {
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object' && p.text) return p.text;
      return '';
    }).filter(Boolean).join('\n\n');
  }
  
  return '';
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const requestData = await request.json() as ChatRequest;
    
    // Get the config object with proper typing
    const config = requestData.config || {} as ChatConfig;
    
    // Merge configuration from different sources, prioritizing direct properties over config object
    const provider = requestData.provider || config.provider || 'mistral';
    const model = requestData.model || config.model || 'mistral-large-latest';
    const temperature = requestData.temperature || config.temperature || 0.7;
    const maxTokens = requestData.maxTokens || config.maxTokens || 12000;
    
    // Handle system prompts
    const userSystemPrompt = processSystemPrompt(requestData.systemPrompt || config.systemPrompt || '');
    const addSystemPrompt = requestData.addSystemPrompt || config.addSystemPrompt || false;
    const addBusinessPrompt = requestData.addBusinessPrompt || config.addBusinessPrompt || false;
    
    // Get content settings
    const includeContent = config.includeContent !== undefined ? config.includeContent : true;

    // Get content if available
    const content = requestData.content || '';
    
    // Check environment variables early
    const envKey = `${provider.toUpperCase()}_API_KEY`;
    if (!process.env[envKey]) {
      throw new Error(`Missing ${envKey} in environment variables`);
    }

    // Load system and business prompts if needed
    const baseSystemPrompt = await loadSystemPrompt(addSystemPrompt);
    const businessPrompt = await loadBusinessPrompt(addBusinessPrompt);
    
    // Combine prompts
    let fullSystemPrompt = [baseSystemPrompt, businessPrompt, userSystemPrompt]
      .filter(Boolean)
      .join('\n\n');
    
    // Process and validate content if available and includeContent is true
    if (content && includeContent) {
      console.log('Adding content to system prompt');
      let processedContent = content;
      
      try {
        // Handle potential JSON string
        if (typeof content === 'string' && content.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(content);
            if (typeof parsed === 'object' && parsed !== null) {
              processedContent = parsed.value || parsed.content || parsed.body ||
                              parsed.text || JSON.stringify(parsed, null, 2);
            }
          } catch (e) {
            console.log('Content is not valid JSON, using as-is');
          }
        }

        // Clean up any [object Object] strings
        if (processedContent === '[object Object]') {
          processedContent = 'Error: Content could not be properly extracted';
        }

        // Add the content to the system prompt
        fullSystemPrompt = `${fullSystemPrompt}\n\nPage Content:\n${processedContent}`;
      } catch (e) {
        console.error('Error processing content:', e);
        fullSystemPrompt = `${fullSystemPrompt}\n\nError: Could not process page content`;
      }
    }
    
    // Add system prompt if available
    let messages: ExtendedMessage[] = [...requestData.messages] as ExtendedMessage[];
    if (fullSystemPrompt) {
      messages.unshift({
        id: 'system-1',
        role: 'system',
        content: fullSystemPrompt
      });
    }

    // Transform messages to the format expected by the AI provider
    const formattedMessages = messages.map(msg => {
      if (Array.isArray(msg.content) && msg.content[0]?.type === 'text') {
        return msg;
      }
      return {
        ...msg,
        content: [{
          type: 'text' as const,
          text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }]
      };
    });

    const handler = createEdgeRuntimeAPI({
      model: getProvider(requestData),
      temperature,
      maxTokens
    });

    const response = await handler.POST({
      ...request,
      json: async () => ({
        messages: formattedMessages,
        functions: [],
        function_call: null
      })
    });

    if (!response.ok) {
      throw new Error(`Edge runtime error: ${response.statusText}`);
    }

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Chat API error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
