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
  try {
    const { request, env } = context;
    const origin = request.headers.get('Origin') || '';
    const cors = getCorsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin access
    const cookieHeader = request.headers.get('Cookie');
    const sessionId = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('session_id='))
      ?.split('=')[1];
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();
    if (!session || session.config_id !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { workerEmail, startRow, endRow } = await request.json();
    if (!workerEmail || !startRow || !endRow) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Check if workerEmail exists in users table and has config_id 'worker' or 'admin'
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND (config_id = "worker" OR config_id = "admin")'
    ).bind(workerEmail).first();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Worker email not found or not authorized (must be worker or admin)' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Update all rows in range where worker is empty
    const update = await env.DB.prepare(
      `UPDATE bbb_data SET worker = ? WHERE id >= ? AND id <= ? AND (worker IS NULL OR worker = '')`
    ).bind(workerEmail, startRow, endRow).run();
    return new Response(JSON.stringify({ message: `Assigned worker to rows ${startRow}-${endRow}`, updated: update.changes }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 