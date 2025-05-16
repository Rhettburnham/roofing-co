export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers - allow both localhost and production
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://roofing-www.pages.dev',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'https://roofing-www.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Verify admin access first
      const sessionId = request.headers.get('Cookie')?.split('session=')[1]?.split(';')[0];
      if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const session = await env.DB.prepare(
        'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
      ).bind(sessionId).first();

      if (!session || session.config_id !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Admin routes
      if (path.startsWith('/api/admin/')) {
        const action = path.split('/api/admin/')[1];

        switch (action) {
          case 'list-configs':
            return handleListConfigs(request, env, corsHeaders);
          case 'upload-config':
            return handleUploadConfig(request, env, corsHeaders);
          case 'create-folder':
            return handleCreateFolder(request, env, corsHeaders);
          default:
            return new Response(JSON.stringify({ error: 'Not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Admin worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function handleListConfigs(request, env, corsHeaders) {
  try {
    console.log('=== Starting handleListConfigs ===');
    const { prefix } = await request.json();
    console.log('Request prefix:', prefix);
    
    // List with configs prefix without delimiter first to get all objects
    console.log('\nListing all objects with configs prefix...');
    const allObjects = await env.ROOFING_CONFIGS.list({
      prefix: 'configs/'
    });
    console.log('All objects response:', JSON.stringify({
      objects: allObjects.objects?.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
      })),
      truncated: allObjects.truncated,
      cursor: allObjects.cursor
    }, null, 2));

    // Now list with delimiter to get folder structure
    console.log('\nListing with delimiter for folder structure...');
    const listOptions = {
      prefix: 'configs/',
      delimiter: '/',
    };
    console.log('R2 list options:', JSON.stringify(listOptions, null, 2));

    const listed = await env.ROOFING_CONFIGS.list(listOptions);
    console.log('R2 list response:', JSON.stringify({
      objects: listed.objects?.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
      })),
      commonPrefixes: listed.commonPrefixes,
      truncated: listed.truncated,
      cursor: listed.cursor
    }, null, 2));
    
    // Process the results to get folders and files
    const folders = new Set();
    const files = [];

    // First, add any common prefixes (folders)
    if (listed.commonPrefixes) {
      console.log('Processing common prefixes:', listed.commonPrefixes);
      for (const prefix of listed.commonPrefixes) {
        const folder = prefix.split('/')[1]; // Get the folder name
        console.log('Adding folder from prefix:', folder);
        folders.add(folder);
      }
    }

    // Then process all objects to ensure we get everything
    console.log('Processing all objects:', allObjects.objects?.length || 0, 'objects found');
    for (const object of allObjects.objects) {
      const path = object.key;
      const parts = path.split('/');
      console.log('Processing object:', {
        path,
        parts,
        size: object.size,
        uploaded: object.uploaded
      });
      
      if (parts.length > 2) {
        // This is a file in a folder
        const folder = parts[1];
        folders.add(folder);
        
        // Only add files that are in the current folder
        if (!prefix || path.startsWith(prefix)) {
          files.push({
            name: parts[2],
            folder,
            size: object.size,
            uploaded: object.uploaded,
          });
          console.log('Added file:', parts[2], 'to folder:', folder);
        }
      }
    }

    const response = {
      folders: Array.from(folders),
      files,
    };
    console.log('Final response:', JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleUploadConfig(request, env, corsHeaders) {
  try {
    const { folder, file } = await request.json();
    
    if (!folder || !file) {
      return new Response(JSON.stringify({ error: 'Missing folder or file data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const key = `configs/${folder}/combined_data.json`;
    await env.ROOFING_CONFIGS.put(key, JSON.stringify(file), {
      httpMetadata: {
        contentType: 'application/json',
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload config error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload config' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleCreateFolder(request, env, corsHeaders) {
  try {
    const { folder } = await request.json();
    
    if (!folder) {
      return new Response(JSON.stringify({ error: 'Missing folder name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create an empty folder by adding a placeholder file
    const key = `configs/${folder}/.placeholder`;
    await env.ROOFING_CONFIGS.put(key, '', {
      httpMetadata: {
        contentType: 'text/plain',
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create folder' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
} 