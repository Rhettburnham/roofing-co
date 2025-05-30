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

    // Parse the request body
    const requestData = await request.json();
    console.log('Request data received:', {
      hasCombinedData: !!requestData.combined_data,
      hasColors: !!requestData.colors,
      hasServices: !!requestData.services,
      hasAboutPage: !!requestData.about_page,
      hasAllBlocksShowcase: !!requestData.all_blocks_showcase,
      hasAssets: !!requestData.assets
    });

    // Save configs to R2
    console.log('Saving configs to R2...');
    const configsToSave = [
      { key: `configs/${configId}/combined_data.json`, data: requestData.combined_data },
      { key: `configs/${configId}/colors_output.json`, data: requestData.colors },
      { key: `configs/${configId}/services.json`, data: requestData.services },
      { key: `configs/${configId}/about_page.json`, data: requestData.about_page },
      { key: `configs/${configId}/all_blocks_showcase.json`, data: requestData.all_blocks_showcase }
    ];

    const savePromises = configsToSave.map(async ({ key, data }) => {
      if (data) {
        try {
          console.log(`Saving config to ${key}...`);
          await env.ROOFING_CONFIGS.put(key, JSON.stringify(data, null, 2), {
            httpMetadata: {
              contentType: 'application/json'
            }
          });
          console.log(`Successfully saved config to ${key}`);
        } catch (error) {
          console.error(`Error saving config to ${key}:`, error);
          throw error;
        }
      }
    });

    await Promise.all(savePromises);

    // Save assets to R2
    if (requestData.assets) {
      console.log('Saving assets to R2...');
      const assetPromises = Object.entries(requestData.assets).map(async ([path, assetData]) => {
        try {
          const key = `configs/${configId}/${path}`;
          console.log(`Saving asset to ${key}...`);
          
          let blob;
          let contentType;
          
          if (typeof assetData === 'string') {
            // Handle data URL
            if (assetData.startsWith('data:')) {
              const matches = assetData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
              if (matches) {
                contentType = matches[1];
                const base64Data = matches[2];
                const binaryData = atob(base64Data);
                const arrayBuffer = new ArrayBuffer(binaryData.length);
                const uint8Array = new Uint8Array(arrayBuffer);
                for (let i = 0; i < binaryData.length; i++) {
                  uint8Array[i] = binaryData.charCodeAt(i);
                }
                blob = new Blob([arrayBuffer], { type: contentType });
              }
            } else {
              // Handle regular URL
              const response = await fetch(assetData);
              blob = await response.blob();
              contentType = response.headers.get('content-type') || getContentType(path);
            }
          } else if (assetData instanceof Blob) {
            // Handle direct blob
            blob = assetData;
            contentType = blob.type || getContentType(path);
          } else if (assetData.data instanceof Blob) {
            // Handle { data: Blob, contentType: string }
            blob = assetData.data;
            contentType = assetData.contentType || blob.type || getContentType(path);
          } else if (typeof assetData.data === 'string' && assetData.contentType) {
            // Handle { data: base64 string, contentType: string }
            try {
              const binaryData = atob(assetData.data);
              const arrayBuffer = new ArrayBuffer(binaryData.length);
              const uint8Array = new Uint8Array(arrayBuffer);
              for (let i = 0; i < binaryData.length; i++) {
                uint8Array[i] = binaryData.charCodeAt(i);
              }
              blob = new Blob([uint8Array], { type: assetData.contentType });
              contentType = assetData.contentType;
            } catch (err) {
              console.error(`Failed to decode base64 asset for ${path}:`, err);
              return;
            }
          } else {
            console.error(`Invalid asset data format for ${path}:`, typeof assetData);
            return;
          }

          if (!blob) {
            console.error(`Failed to create blob for ${path}`);
            return;
          }

          await env.ROOFING_CONFIGS.put(key, blob, {
            httpMetadata: {
              contentType: contentType
            }
          });
          console.log(`Successfully saved asset to ${key}`);
        } catch (error) {
          console.error(`Error saving asset ${path}:`, error);
        }
      });

      await Promise.all(assetPromises);
    }

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