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

    // Fetch all config files
    const configKeys = [
      `configs/${configId}/combined_data.json`,
      `configs/${configId}/colors_output.json`,
      `configs/${configId}/services.json`
    ];
    
    console.log('Fetching all configs from R2:', configKeys);
    
    // Fetch all configs in parallel
    const configPromises = configKeys.map(async (key) => {
      const configObject = await env.ROOFING_CONFIGS.get(key);
      if (!configObject) {
        console.log(`No config found in R2 for key: ${key}`);
        return null;
      }
      try {
        const data = await configObject.json();
        return { key, data };
      } catch (error) {
        console.error(`Error parsing config for key ${key}:`, error);
        return null;
      }
    });

    const configResults = await Promise.all(configPromises);
    
    // Combine all configs into a single response
    const responseData = {
      combined_data: null,
      colors: null,
      services: null
    };

    configResults.forEach(result => {
      if (result) {
        if (result.key.includes('combined_data.json')) {
          responseData.combined_data = result.data;
        } else if (result.key.includes('colors_output.json')) {
          responseData.colors = result.data;
        } else if (result.key.includes('services.json')) {
          responseData.services = result.data;
        }
      }
    });

    console.log('Config data fetched successfully');
    return new Response(JSON.stringify(responseData), {
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