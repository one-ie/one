// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const POST: APIRoute = async ({ request }) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Received API request`);
  
  try {
    // Validate environment variables
    console.log(`[${requestId}] Checking OpenAI API key configuration`);
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Parse and validate request body
    console.log(`[${requestId}] Parsing request body`);
    const { messages } = await request.json();
    if (!Array.isArray(messages)) {
      throw new Error('Invalid messages format: expected an array');
    }
    console.log(`[${requestId}] Received ${messages.length} messages:`, JSON.stringify(messages, null, 2));

    console.log(`[${requestId}] Initializing streamText with OpenAI model gpt-4o-mini`);
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: 'You are a helpful assistant',
      messages,
    });
    console.log(`[${requestId}] StreamText initialized successfully`);

    // Create a TransformStream to properly handle the text stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Handle the text stream
    (async () => {
      try {
        for await (const chunk of result.textStream) {
          await writer.write(new TextEncoder().encode(chunk));
        }
      } catch (error) {
        console.error(`[${requestId}] Stream error:`, error);
      } finally {
        await writer.close();
      }
    })();

    // Return the streaming response
    return new Response(readable, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${requestId}] API Error:`, errorMessage);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
