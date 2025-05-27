import { createHash } from 'node:crypto';

export async function onRequest(context) {
  try {
    console.log("=== Login Handler ===");
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'Set-Cookie',
    };

    // Handle preflight requests
    if (context.request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (context.request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const { email, password } = await context.request.json();
    console.log('Login attempt:', { email });
    
    const user = await context.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user || !verifyPassword(password, user.password_hash)) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const sessionId = crypto.randomUUID();
    await context.env.DB.prepare(
      'INSERT INTO sessions (user_id, session_id, expires_at) VALUES (?, ?, datetime("now", "+7 days"))'
    ).bind(user.id, sessionId).run();

    // Check if user has a custom config
    let hasCustomConfig = false;
    try {
      const configKey = `configs/${user.config_id}/combined_data.json`;
      const configObject = await context.env.ROOFING_CONFIGS.get(configKey);
      hasCustomConfig = !!configObject;
    } catch (error) {
      console.error('Error checking custom config:', error);
    }

    return new Response(JSON.stringify({ 
      success: true,
      configId: user.config_id,
      hasCustomConfig
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
} 