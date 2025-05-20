// functions/api/auth/status.js
import { createHash } from 'node:crypto'; // only if you need hashing elsewhere

// Shared CORS helper
function getCorsHeaders(origin) {
  const allowed = [
    'https://roofing-www.pages.dev',
    'https://roofing-co.pages.dev',
    'https://roofing-co-with-workers.pages.dev',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  const acao = allowed.includes(origin) ? origin : allowed[2];
  return {
    'Access-Control-Allow-Origin': acao,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Set-Cookie',
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const cors = getCorsHeaders(origin);

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // Read session_id from cookie
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return new Response(JSON.stringify({ isAuthenticated: false }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Look up session
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
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Success
    return new Response(JSON.stringify({
      isAuthenticated: true,
      configId: session.config_id || 'default',
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Auth status error:', err);
    return new Response(JSON.stringify({ error: 'Failed to check auth status' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}
