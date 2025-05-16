import { createHash } from 'node:crypto';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for production
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://roofing-www.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Auth routes
      if (path.startsWith('/api/auth/')) {
        const action = path.split('/api/auth/')[1];

        switch (action) {
          case 'status':
            return handleAuthStatus(request, env, corsHeaders);
          case 'login':
            return handleLogin(request, env, corsHeaders);
          case 'signup':
            return handleSignup(request, env, corsHeaders);
          case 'logout':
            return handleLogout(request, env, corsHeaders);
          default:
            return new Response(JSON.stringify({ error: 'Not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function handleAuthStatus(request, env, corsHeaders) {
  try {
    const sessionId = request.headers.get('Cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!sessionId) {
      return new Response(JSON.stringify({ isAuthenticated: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await env.DB.prepare(
      'SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")'
    ).bind(sessionId).first();
    
    const isAuthenticated = !!session;

    return new Response(JSON.stringify({ isAuthenticated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return new Response(JSON.stringify({ error: 'Failed to check auth status' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleLogin(request, env, corsHeaders) {
  try {
    const { email, password } = await request.json();
    
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user || !verifyPassword(password, user.password_hash)) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sessionId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime("now", "+7 days"))'
    ).bind(sessionId, user.id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.roofing-www.workers.dev; Max-Age=604800`,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleSignup(request, env, corsHeaders) {
  try {
    const { email, password } = await request.json();
    
    const existingUser = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return new Response(JSON.stringify({ message: 'Email already registered' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const passwordHash = hashPassword(password);
    await env.DB.prepare(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)'
    ).bind(email, passwordHash).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Signup failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleLogout(request, env, corsHeaders) {
  try {
    const sessionId = request.headers.get('Cookie')?.split('session=')[1]?.split(';')[0];
    
    if (sessionId) {
      await env.DB.prepare(
        'DELETE FROM sessions WHERE id = ?'
      ).bind(sessionId).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.roofing-www.workers.dev; Max-Age=0',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
} 