export async function onRequestPost(context) {
  try {
    console.log("=== List Configs Handler ===");
    console.log('Request details:', {
      method: context.request.method,
      url: context.request.url,
      headers: Object.fromEntries(context.request.headers.entries()),
      hasDB: !!context.env?.DB,
      hasROOFING_CONFIGS: !!context.env?.ROOFING_CONFIGS
    });
    
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
      console.log('Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    // Read session_id from cookie
    const cookieHeader = context.request.headers.get('Cookie');
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

    const session = await context.env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    console.log('Session lookup result:', session ? {
      hasConfigId: !!session.config_id,
      configId: session.config_id,
      expiresAt: session.expires_at
    } : 'No session found');

    if (!session || session.config_id !== 'admin') {
      console.log('Invalid session or not admin');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get prefix from request body
    const body = await context.request.json();
    const prefix = body.prefix;
    console.log('Using prefix:', prefix);
    
    // List with configs prefix without delimiter first to get all objects
    console.log('\nListing all objects with configs prefix...');
    const allObjects = await context.env.ROOFING_CONFIGS.list({
      prefix: 'configs/'
    });
    console.log('All objects found:', allObjects.objects?.length || 0);

    // Now list with delimiter to get folder structure
    console.log('\nListing with delimiter for folder structure...');
    const listOptions = {
      prefix: prefix || 'configs/',
      delimiter: '/',
    };
    console.log('List options:', listOptions);

    const listed = await context.env.ROOFING_CONFIGS.list(listOptions);
    console.log('Listed objects:', listed.objects?.length || 0);
    console.log('Common prefixes:', listed.commonPrefixes?.length || 0);
    
    // Process the results to get folders and files
    const folders = new Set();
    const files = [];

    // First, add any common prefixes (folders)
    if (listed.commonPrefixes) {
      for (const prefix of listed.commonPrefixes) {
        const parts = prefix.split('/');
        const folder = parts[parts.length - 2];
        if (folder) {
          folders.add(folder);
          console.log('Added folder from prefix:', folder);
        }
      }
    }

    // Then process all objects to ensure we get everything
    for (const object of allObjects.objects) {
      const path = object.key;
      const parts = path.split('/');
      
      if (parts.length > 2) {
        const folder = parts[1];
        
        if (prefix && path.startsWith(prefix)) {
          const relativePath = path.slice(prefix.length);
          const relativeParts = relativePath.split('/');
          
          if (relativeParts.length === 1) {
            files.push({
              name: relativeParts[0],
              folder,
              size: object.size,
              uploaded: object.uploaded,
            });
            console.log('Added file:', relativeParts[0], 'to folder:', folder);
          } else if (relativeParts.length > 1) {
            const subfolder = relativeParts[0];
            if (subfolder) {
              folders.add(subfolder);
              console.log('Added subfolder:', subfolder);
            }
          }
        }
      }
    }

    const response = {
      folders: Array.from(folders),
      files,
    };
    console.log('Final response:', {
      folders: response.folders,
      fileCount: response.files.length
    });

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('List configs error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Failed to list configs',
      details: error.message,
      stack: error.stack
    }), {
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