import { createHash } from 'node:crypto'; // if you need hash functions elsewhere

// Shared CORS headers helper
const corsHeaders = (origin) => {
  const allowedOrigins = [
    'https://roofing-www.pages.dev',
    'https://roofing-co.pages.dev',
    'https://roofing-co-with-workers.pages.dev',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[2],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Set-Cookie',
  };
};

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(origin);
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Read session cookie
    const sessionId = context.request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return new Response(JSON.stringify({ isAuthenticated: false }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Query DB for valid session
    const session = await env.DB.prepare(
      `SELECT s.*, u.config_id
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_id = ? AND s.expires_at > datetime("now")`
    )
    .bind(sessionId)
    .first();

    if (!session) {
      return new Response(JSON.stringify({ isAuthenticated: false }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Return authenticated + configId
    return new Response(JSON.stringify({
      isAuthenticated: true,
      configId: session.config_id || 'default'
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Auth status error:', err);
    return new Response(JSON.stringify({ error: 'Failed to check auth status' }), {
      status: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
  }
}
