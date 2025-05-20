import { createHash } from 'node:crypto';

export async function onRequest(context) {
  try {
    console.log("=== Signup Handler ===");
    
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

    const { email, password, code } = await context.request.json();
    console.log('Signup attempt:', { email, code });
    
    // Check if email is already registered
    const existingUser = await context.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      console.log('Email already registered:', email);
      return new Response(JSON.stringify({ message: 'Email already registered' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if code has already been used
    console.log('Checking for code reuse:', code);
    const usedCode = await context.env.DB.prepare(
      'SELECT * FROM users WHERE config_id = ? AND config_id != "default" AND config_id != "admin"'
    ).bind(code).first();

    console.log('Code reuse check result:', {
      code,
      foundUser: usedCode ? {
        email: usedCode.email,
        config_id: usedCode.config_id,
        created_at: usedCode.created_at
      } : null
    });

    if (usedCode) {
      console.log('Code already used by:', usedCode.email);
      return new Response(JSON.stringify({ message: 'This signup code has already been used' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const passwordHash = hashPassword(password);
    console.log('Creating new user with config_id:', code);
    await context.env.DB.prepare(
      'INSERT INTO users (email, password_hash, config_id) VALUES (?, ?, ?)'
    ).bind(email, passwordHash, code).run();

    console.log('User created successfully');
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Signup failed' }), {
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