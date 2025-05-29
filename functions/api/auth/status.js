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
  console.log("=== Auth Status Handler ===");
  
  try {
    const { request, env } = context;
    console.log('Context received:', { 
      hasRequest: !!request,
      hasEnv: !!env,
      hasDB: !!env?.DB
    });

    const origin = request.headers.get('Origin') || '';
    console.log('Request origin:', origin);
    const cors = getCorsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Read session_id from cookie
    const cookieHeader = request.headers.get('Cookie');
    console.log('Cookie header:', cookieHeader);
    
    let sessionId = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      sessionId = cookies['session_id'];
    }
    
    console.log('Session ID from cookie:', sessionId ? 'present' : 'missing');
    
    if (!sessionId) {
      return new Response(JSON.stringify({ isAuthenticated: false }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Look up session
    console.log('Preparing database query...');
    const query = env.DB.prepare(
      `SELECT s.*, u.config_id
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_id = ? AND s.expires_at > datetime("now")`
    );
    
    console.log('Binding session ID to query...');
    const boundQuery = query.bind(sessionId);
    
    console.log('Executing query...');
    const session = await boundQuery.first();
    
    console.log('Session query result:', session ? 'found' : 'not found');

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
    console.error('Auth status error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      type: err.constructor.name
    });
    
    // Return a more detailed error response in development
    return new Response(JSON.stringify({ 
      error: 'Failed to check auth status',
      details: err.message
    }), {
      status: 500,
      headers: { 
        ...getCorsHeaders('*'),
        'Content-Type': 'application/json'
      },
    });
  }
}
