import { createHash } from 'node:crypto';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers - allow both localhost and production
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://roofing-www.pages.dev',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'https://roofing-www.pages.dev',
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

      // Config routes
      if (path.startsWith('/api/config/')) {
        const configPath = path.split('/api/config/')[1];
        if (configPath === 'save' && request.method === 'POST') {
          return handleConfigSave(request, env, corsHeaders);
        }
        return handleConfigRequest(request, env, configPath, corsHeaders);
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
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();
    
    const isAuthenticated = !!session;

    return new Response(JSON.stringify({ 
      isAuthenticated,
      configId: session?.config_id || 'default'
    }), {
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
      'INSERT INTO sessions (user_id, session_id, expires_at) VALUES (?, ?, datetime("now", "+7 days"))'
    ).bind(user.id, sessionId).run();

    // Check if user has a custom config
    let hasCustomConfig = false;
    try {
      const configKey = `configs/${user.config_id}/combined_data.json`;
      const configObject = await env.ROOFING_CONFIGS.get(configKey);
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
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
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
    const { email, password, code } = await request.json();
    
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
      'INSERT INTO users (email, password_hash, config_id) VALUES (?, ?, ?)'
    ).bind(email, passwordHash, code).run();

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
        'DELETE FROM sessions WHERE session_id = ?'
      ).bind(sessionId).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
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

async function handleConfigRequest(request, env, configPath, corsHeaders) {
  try {
    console.log("Config request received for path:", configPath);
    
    // Verify authentication
    const sessionId = request.headers.get('Cookie')?.split('session=')[1]?.split(';')[0];
    console.log("Session ID from cookie:", sessionId);
    
    if (!sessionId) {
      console.log("No session ID found in cookie");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();
    
    console.log("Session data from DB:", session);

    if (!session) {
      console.log("No valid session found");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the config from R2
    const configKey = `configs/${session.config_id}/${configPath}`;
    console.log("Attempting to fetch from R2 with key:", configKey);
    
    // Remove the config_id from the path if it's already included
    const cleanPath = configPath.replace(`${session.config_id}/`, '');
    const finalConfigKey = `configs/${session.config_id}/${cleanPath}`;
    console.log("Final R2 key:", finalConfigKey);
    
    const configObject = await env.ROOFING_CONFIGS.get(finalConfigKey);
    console.log("R2 response:", configObject ? "Config found" : "Config not found");

    if (!configObject) {
      console.log("Config not found in R2 bucket");
      return new Response(JSON.stringify({ error: 'Config not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the config
    console.log("Successfully retrieved config from R2");
    return new Response(configObject.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Config request error:", error);
    return new Response(JSON.stringify({ error: 'Failed to fetch config' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleConfigSave(request, env, corsHeaders) {
  try {
    console.log("Config save request received");
    
    // Verify authentication
    const sessionId = request.headers.get('Cookie')?.split('session=')[1]?.split(';')[0];
    console.log("Session ID from cookie:", sessionId);
    
    if (!sessionId) {
      console.log("No session ID found in cookie");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();
    
    console.log("Session data from DB:", session);

    if (!session) {
      console.log("No valid session found");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the config data from the request
    const { config } = await request.json();
    if (!config) {
      return new Response(JSON.stringify({ error: 'No config data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save to R2
    const configKey = `configs/${session.config_id}/combined_data.json`;
    console.log("Saving config to R2 with key:", configKey);
    
    await env.ROOFING_CONFIGS.put(configKey, JSON.stringify(config, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
    });

    console.log("Config saved successfully");
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Config save error:", error);
    return new Response(JSON.stringify({ error: 'Failed to save config' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
} 