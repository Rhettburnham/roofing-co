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
    if (request.method !== 'GET') {
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

    // Check for workerEmail query param
    const url = new URL(request.url);
    const workerEmail = url.searchParams.get('workerEmail');
    if (workerEmail) {
      // Return all bbb_data rows for this worker
      const rows = await env.DB.prepare(
        'SELECT id, business_name, contact_status, config_id, google_reviews_link FROM bbb_data WHERE LOWER(worker) = LOWER(?) ORDER BY id ASC'
      ).bind(workerEmail).all();
      return new Response(JSON.stringify({ leads: rows.results }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Query all rows from bbb_data
    const allRows = await env.DB.prepare('SELECT id, worker FROM bbb_data ORDER BY id ASC').all();
    const rows = allRows.results;
    if (!rows.length) {
      return new Response(JSON.stringify({ availableRows: '' }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    // Find available (unassigned) rows
    const available = rows.filter(r => !r.worker || r.worker === '').map(r => r.id);
    // Format as ranges (e.g. 1-3,5-8)
    let ranges = [];
    let start = null, end = null;
    for (let i = 0; i < available.length; i++) {
      if (start === null) {
        start = available[i];
        end = available[i];
      } else if (available[i] === end + 1) {
        end = available[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = available[i];
        end = available[i];
      }
    }
    if (start !== null) {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
    }
    const availableRows = ranges.join(',');
    return new Response(JSON.stringify({ availableRows }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 