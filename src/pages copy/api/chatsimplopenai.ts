import type { APIRoute } from 'astro';
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { mistral } from "@ai-sdk/mistral";
import { createEdgeRuntimeAPI } from "@assistant-ui/react/edge";
import { type ChatConfig } from '@/schema/chat';
import type { Message } from 'ai';

interface ChatRequest {
  id: string;
  messages: Message[];
  config: ChatConfig;
}

const getProvider = (config: ChatConfig) => {
  switch (config.provider) {
    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      return anthropic(config.model);
      
    case 'mistral':
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error('MISTRAL_API_KEY not configured');
      }
      return mistral(config.model);
      
    case 'openai':
    default:
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      return openai(config.model);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const requestData = await request.json() as ChatRequest;
    const config = {
      ...requestData.config,
      provider: requestData.config?.provider || 'openai',
      model: requestData.config?.model || 'gpt-4o-mini'
    };

    // Check environment variables early
    const envKey = `${config.provider.toUpperCase()}_API_KEY`;
    if (!process.env[envKey]) {
      throw new Error(`Missing ${envKey} in environment variables`);
    }

    // Transform messages to the format expected by the AI provider
    const messages = requestData.messages.map(msg => {
      // Handle content that's already in the correct format
      if (Array.isArray(msg.content) && msg.content[0]?.type === 'text') {
        return msg;
      }
      // Transform string content to expected format
      return {
        ...msg,
        content: [{
          type: 'text' as const,
          text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }]
      };
    });

    console.log('Sending messages:', JSON.stringify(messages, null, 2));

    const handler = createEdgeRuntimeAPI({
      model: getProvider(config),
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2000
    });

    const response = await handler.POST({
      ...request,
      json: async () => ({
        messages,
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