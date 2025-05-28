export async function onRequest(context) {
  try {
    const { request, env } = context;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get session ID from cookie
    const cookieHeader = request.headers.get('Cookie');
    let sessionId = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      sessionId = cookies['session_id'];
    }

    // Get domain from request
    const domain = request.headers.get('host');

    let configId = null;

    // If authenticated, get config ID from session
    if (sessionId) {
      const session = await env.DB.prepare(
        'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
      ).bind(sessionId).first();
      
      if (session) {
        configId = session.config_id;
      }
    }

    // If not authenticated, check for custom domain
    if (!configId) {
      const domainConfig = await env.DB.prepare(
        'SELECT config_id FROM domain_configs WHERE domain = ?'
      ).bind(domain).first();
      
      if (domainConfig) {
        configId = domainConfig.config_id;
      }
    }

    // If no config ID found, return empty response
    if (!configId) {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Fetch all config files
    const configKeys = [
      `configs/${configId}/combined_data.json`,
      `configs/${configId}/colors_output.json`,
      `configs/${configId}/services.json`,
      `configs/${configId}/about_page.json`,
      `configs/${configId}/all_blocks_showcase.json`
    ];

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
      success: true,
      combined_data: null,
      colors: null,
      services: null,
      about_page: null,
      all_blocks_showcase: null
    };

    configResults.forEach(result => {
      if (result) {
        if (result.key.includes('combined_data.json')) {
          responseData.combined_data = result.data;
        } else if (result.key.includes('colors_output.json')) {
          responseData.colors = result.data;
        } else if (result.key.includes('services.json')) {
          responseData.services = result.data;
        } else if (result.key.includes('about_page.json')) {
          responseData.about_page = result.data;
        } else if (result.key.includes('all_blocks_showcase.json')) {
          responseData.all_blocks_showcase = result.data;
        }
      }
    });

    // List all assets in R2 for this config
    const assets = await env.ROOFING_CONFIGS.list({ prefix: `configs/${configId}/assets/` });
    
    // Create a map of asset paths to their data
    const assetMap = {};
    
    // Fetch all assets in parallel
    const assetPromises = assets.objects.map(async (asset) => {
      const assetData = await env.ROOFING_CONFIGS.get(asset.key);
      if (assetData) {
        // Remove the config prefix to get the relative path
        const relativePath = asset.key.replace(`configs/${configId}/assets/`, '');
        assetMap[relativePath] = {
          data: await assetData.arrayBuffer(),
          contentType: assetData.httpMetadata?.contentType || 'application/octet-stream'
        };
      }
    });

    await Promise.all(assetPromises);

    // Add assets to response
    responseData.assets = assetMap;

    return new Response(JSON.stringify(responseData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in config load handler:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to load config',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
} 