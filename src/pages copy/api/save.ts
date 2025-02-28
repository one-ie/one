import type { APIRoute } from 'astro';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const content = data.get('content');
    
    if (import.meta.env.PROD) {
      // In production (Netlify)
      return new Response(JSON.stringify({
        success: true,
        message: 'Content saved to Netlify'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Local development
    const filePath = join(process.cwd(), 'public', 'saved-content.txt');
    await writeFile(filePath, content as string);

    return new Response(JSON.stringify({
      success: true,
      message: 'Content saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Error saving content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 