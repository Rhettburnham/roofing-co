export async function onRequest(context) {
  console.log("=== Public Config Handler ===");
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
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    // Get the host from the request headers
    const host = request.headers.get('host');
    console.log('Request host:', host);

    // Map domains to config IDs
    const domainConfigMap = {
      'cowboy-vaqueros.com': 'client1',
      'www.cowboy-vaqueros.com': 'client1',
      'localhost': 'client1' // For local development
    };

    // Get the config ID for this domain
    const configId = domainConfigMap[host];
    console.log('Config ID for domain:', configId);

    if (!configId) {
      console.log('No config mapping found for domain');
      return new Response(JSON.stringify({ error: 'Configuration not found for this domain' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Fetch the config from R2
    const configKey = `configs/${configId}/combined_data.json`;
    console.log('Fetching config from R2:', configKey);
    const configObject = await env.ROOFING_CONFIGS.get(configKey);
    
    if (!configObject) {
      console.log('No config found in R2');
      return new Response(JSON.stringify({ error: 'Configuration not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Return the config
    console.log('Successfully retrieved config from R2');
    return new Response(configObject.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Public config error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
} 