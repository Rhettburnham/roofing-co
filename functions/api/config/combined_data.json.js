export async function onRequest(context) {
  console.log("=== Config Handler ===");
  try {
    const { request, env } = context;
    console.log('Context received:', { 
      hasRequest: !!request,
      hasEnv: !!env,
      hasDB: !!env?.DB,
      hasROOFING_CONFIGS: !!env?.ROOFING_CONFIGS
    });

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
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
      console.log('No session ID found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Verify the session and get config ID
    console.log('Querying database for session...');
    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    if (!session) {
      console.log('No valid session found');
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const configId = session.config_id;
    console.log('Config ID from session:', configId);

    // Determine which config file to fetch based on the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const requestedFile = pathParts[pathParts.length - 1];
    
    let configKey;
    switch (requestedFile) {
      case 'services.json':
        configKey = `configs/${configId}/services.json`;
        break;
      case 'colors.json':
        configKey = `configs/${configId}/colors.json`;
        break;
      default:
        configKey = `configs/${configId}/combined_data.json`;
    }
    
    console.log('Fetching config from R2:', configKey);
    const configObject = await env.ROOFING_CONFIGS.get(configKey);
    
    if (!configObject) {
      console.log('No config found in R2');
      return new Response(JSON.stringify({ error: 'Failed to fetch config' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    console.log('Parsing config data...');
    const configData = await configObject.json();
    console.log('Config data fetched successfully');

    return new Response(JSON.stringify(configData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in config handler:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: error.constructor.name
    });
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }
} 