import type { APIRoute } from 'astro';
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const config = {
  runtime: 'edge'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages } = await request.json();

    // Create a text stream using the AI SDK
    const stream = streamText({
      model: openai("gpt-4-mini"),
      messages: messages.map((message: any) => ({
        content: message.content,
        role: message.role,
      })),
    });

    // Return the stream response
    return stream.toDataStreamResponse();
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ 
        error: 'There was an error processing your request',
        details: error.message 
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}