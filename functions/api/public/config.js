export async function onRequest(context) {
  console.log("=== Public Config Handler ===");
  try {
    const { request, env } = context;
    console.log('Context received:', { 
      hasRequest: !!request,
      hasEnv: !!env,
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

    // Get the host from the request
    const host = request.headers.get('Host');
    console.log('Request host:', host);

    // Map domains to config IDs
    const domainConfigMap = {
      'cowboy-vaqueros.com': 'client1',
      // Add more domain mappings here as needed
    };

    // Get the config ID for this domain
    const configId = domainConfigMap[host];
    console.log('Config ID for domain:', configId);

    if (!configId) {
      console.log('No config mapping found for domain');
      return new Response(JSON.stringify({ error: 'No configuration found for this domain' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Fetch the config data
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
    console.error('Error in public config handler:', {
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
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
} 