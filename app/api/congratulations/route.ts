import { NextRequest } from 'next/server';

// GET request handler for fetching congratulations
export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://161.35.204.26:3010';
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api';
    
    const response = await fetch(`${apiUrl}${apiEndpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authentication headers if needed
        ...request.headers,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch data from API' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in proxy GET request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST request handler for submitting congratulations
export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://161.35.204.26:3010';
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api';
    
    // Get the request body
    const body = await request.json();
    
    const response = await fetch(`${apiUrl}${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authentication headers if needed
        ...request.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to submit data to API' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in proxy POST request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// OPTIONS request handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}