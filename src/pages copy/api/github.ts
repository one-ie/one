import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Access token from server-side environment variables
    const token = import.meta.env.GITHUB_TOKEN;
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'GitHub token not configured on server' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const response = await fetch('https://api.github.com/repos/one-ie/one/traffic/clones', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ 
          error: 'GitHub API error', 
          status: response.status, 
          details: errorText 
        }), 
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Return the GitHub API response to the client
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300, s-maxage=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Error in GitHub API endpoint:', error);
    
    // Safely handle the error message with proper type checking
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage 
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