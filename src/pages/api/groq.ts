import type { APIRoute } from 'astro';
import 'dotenv/config';
import { createGroq } from '@ai-sdk/groq';
import { createEdgeRuntimeAPI } from "@assistant-ui/react/edge";
import type { Message } from 'ai';

interface ChatRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const POST: APIRoute = async ({ request }): Promise<Response> => {
  try {
    const requestData = await request.json() as ChatRequest;
    
    // Initialize Groq provider
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY || '',
    });
    
    // Get the chat model
    const model = groq.chatModel(requestData.model || 'gemma2-9b-it');
    
    // Create edge runtime handler
    const handler = createEdgeRuntimeAPI({
      model,
      temperature: requestData.temperature || 0.7,
      maxTokens: requestData.maxTokens || 500,
    });

    // Send the request
    const response = await handler.POST({
      ...request,
      json: async () => ({
        messages: requestData.messages,
        functions: [],
        function_call: null
      })
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `Edge runtime error: ${response.statusText}`,
          timestamp: new Date().toISOString()
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Groq API error:', errorMessage);
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