export async function onRequest(context) {
  console.log("=== Config Save Handler ===");
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
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

    // Get the config data from the request body
    console.log('Reading request body...');
    const { combined_data, colors, services, aboutPageData, all_blocks_showcase, assets } = await request.json();
    console.log('Config data received:', {
      hasCombinedData: !!combined_data,
      hasColors: !!colors,
      hasServices: !!services,
      hasAboutPage: !!aboutPageData,
      hasAllBlocksShowcase: !!all_blocks_showcase,
      hasAssets: !!assets
    });

    // Save all configs to R2
    const configsToSave = [
      { key: `configs/${configId}/combined_data.json`, data: combined_data },
      { key: `configs/${configId}/colors_output.json`, data: colors },
      { key: `configs/${configId}/services.json`, data: services },
      { key: `configs/${configId}/about_page.json`, data: aboutPageData },
      { key: `configs/${configId}/all_blocks_showcase.json`, data: all_blocks_showcase }
    ];

    console.log('Saving configs to R2:', configsToSave.map(c => c.key));
    
    // Save all configs in parallel
    const savePromises = configsToSave.map(async ({ key, data }) => {
      if (!data) {
        console.log(`Skipping ${key} - no data provided`);
        return;
      }
      try {
        const jsonString = JSON.stringify(data, null, 2);
        await env.ROOFING_CONFIGS.put(key, jsonString, {
          httpMetadata: {
            contentType: 'application/json'
          }
        });
        console.log(`Saved ${key} successfully`);
      } catch (error) {
        console.error(`Error saving ${key}:`, error);
        throw error;
      }
    });

    // Save assets if provided
    if (assets) {
      console.log('Saving assets to R2...');
      const assetPromises = Object.entries(assets).map(async ([path, data]) => {
        if (!data) {
          console.log(`Skipping asset ${path} - no data provided`);
          return;
        }
        try {
          const assetKey = `configs/${configId}/assets/${path}`;
          await env.ROOFING_CONFIGS.put(assetKey, data, {
            httpMetadata: {
              contentType: getContentType(path)
            }
          });
          console.log(`Saved asset ${path} successfully`);
        } catch (error) {
          console.error(`Error saving asset ${path}:`, error);
          throw error;
        }
      });
      savePromises.push(...assetPromises);
    }

    await Promise.all(savePromises);
    console.log('All configs and assets saved successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in config save handler:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: error.constructor.name
    });
    return new Response(JSON.stringify({ 
      error: 'Failed to save config',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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