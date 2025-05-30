export async function onRequest(context) {
  console.log("=== Config Load Handler ===");
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

    // Only allow GET requests
    if (request.method !== 'GET') {
      console.log('Invalid method:', request.method);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
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

    // Load all configs from R2
    console.log('Loading configs from R2...');
    const configsToLoad = [
      { key: `configs/${configId}/combined_data.json`, name: 'combined_data' },
      { key: `configs/${configId}/colors_output.json`, name: 'colors' },
      { key: `configs/${configId}/services.json`, name: 'services' },
      { key: `configs/${configId}/about_page.json`, name: 'about_page' },
      { key: `configs/${configId}/all_blocks_showcase.json`, name: 'all_blocks_showcase' }
    ];

    const configData = {};
    const loadPromises = configsToLoad.map(async ({ key, name }) => {
      try {
        console.log(`Loading ${name} from ${key}...`);
        const object = await env.ROOFING_CONFIGS.get(key);
        if (object) {
          console.log(`Found ${name}, parsing JSON...`);
          const text = await object.text();
          try {
            const data = JSON.parse(text);
            console.log(`Successfully loaded ${name}:`, {
              hasData: !!data,
              type: typeof data,
              isArray: Array.isArray(data),
              keys: Object.keys(data || {})
            });
            configData[name] = data;
          } catch (parseError) {
            console.error(`Error parsing ${name}:`, parseError);
          }
        } else {
          console.log(`No data found for ${name}`);
        }
      } catch (error) {
        console.error(`Error loading ${name}:`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log('All configs loaded:', {
      hasCombinedData: !!configData.combined_data,
      hasColors: !!configData.colors,
      hasServices: !!configData.services,
      hasAboutPage: !!configData.about_page,
      hasAllBlocksShowcase: !!configData.all_blocks_showcase
    });

    // Load assets from R2
    console.log('Loading assets from R2...');
    const assets = {};
    try {
      const assetList = await env.ROOFING_CONFIGS.list({ prefix: `configs/${configId}/assets/` });
      console.log(`Found ${assetList.objects.length} assets`);
      
      const assetPromises = assetList.objects.map(async (asset) => {
        try {
          console.log(`Loading asset: ${asset.key}`);
          const object = await env.ROOFING_CONFIGS.get(asset.key);
          if (object) {
            // Extract just the asset path without the configs/configId prefix
            const path = asset.key.replace(`configs/${configId}/`, '');
            console.log(`Successfully loaded asset: ${path}`);
            
            // Create URL without duplicating configs/ in the path
            const url = `/api/assets/get?path=${path}`;
            assets[path] = url;
            console.log(`Created asset URL: ${url}`);
          } else {
            console.log(`No data found for asset: ${asset.key}`);
          }
        } catch (error) {
          console.error(`Error loading asset ${asset.key}:`, error);
        }
      });

      await Promise.all(assetPromises);
      console.log('All assets loaded:', Object.keys(assets));
    } catch (error) {
      console.error('Error loading assets:', error);
    }

    return new Response(JSON.stringify({ 
      success: true,
      ...configData,
      assets
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in config load handler:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: error.constructor.name
    });
    return new Response(JSON.stringify({ 
      error: 'Failed to load config',
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

function getContentType(path) {
  const extension = path.split('.').pop().toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'pdf': 'application/pdf'
  };
  return contentTypes[extension] || 'application/octet-stream';
} 