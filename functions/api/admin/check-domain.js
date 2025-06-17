import { createHash } from 'node:crypto';

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
  console.log("=== Check Domain Handler ===");
  
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

    // Verify admin access
    const cookieHeader = request.headers.get('Cookie');
    const sessionId = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('session_id='))
      ?.split('=')[1];
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
        },
      });
    }

    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    if (!session || session.config_id !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse request body
    const { email, configId } = await request.json();
    console.log('Request body:', { email, configId });

    // Check if config has any domain entries
    const configCheck = await env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM domains 
      WHERE config_id = ?
    `).bind(configId).first();

    const configHasDomain = configCheck.count > 0;

    // If config has domain, get the domain details
    let domainDetails = null;
    if (configHasDomain) {
      domainDetails = await env.DB.prepare(`
        SELECT email, config_id, is_paid, domain_purchased, domain, created_at
        FROM domains 
        WHERE config_id = ?
      `).bind(configId).first();
    }

    return new Response(JSON.stringify({
      configHasDomain,
      ...(domainDetails || {}),
      exists: !!domainDetails
    }), {
      headers: {
        ...cors,
        'Content-Type': 'application/json',
      },
    });

  } catch (err) {
    console.error('Check domain error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      type: err.constructor.name
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to check domain status',
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