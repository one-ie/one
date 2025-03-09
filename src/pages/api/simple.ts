import { mistral } from "@ai-sdk/mistral";
import { streamText } from "ai";

export const config = {
  runtime: 'edge',
};

export async function POST(req: Request) {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse and validate request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate streaming response
    const result = streamText({
      model: mistral("mistral-large-latest"),
      system: "You are a helpful assistant",
      messages,
    });

    // Return streaming response
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
