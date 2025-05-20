export async function onRequest(context) {
  try {
    console.log("=== Admin Status Handler ===");
    
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
      return new Response(null, { headers: corsHeaders });
    }

    // Verify admin access
    const sessionId = context.request.cookies.get('session_id')?.value;
    if (!sessionId) {
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

    if (!session || session.config_id !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the action from the URL
    const url = new URL(context.request.url);
    const action = url.pathname.split('/api/admin/')[1];

    switch (action) {
      case 'list-configs':
        return handleListConfigs(context);
      case 'upload-config':
        return handleUploadConfig(context);
      case 'create-folder':
        return handleCreateFolder(context);
      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
    }
  } catch (error) {
    console.error('Admin status error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
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

async function handleListConfigs(context) {
  try {
    console.log('=== Starting handleListConfigs ===');
    const { prefix } = await context.request.json();
    console.log('Request prefix:', prefix);
    
    // List with configs prefix without delimiter first to get all objects
    console.log('\nListing all objects with configs prefix...');
    const allObjects = await context.env.ROOFING_CONFIGS.list({
      prefix: 'configs/'
    });

    // Now list with delimiter to get folder structure
    console.log('\nListing with delimiter for folder structure...');
    const listOptions = {
      prefix: prefix || 'configs/',
      delimiter: '/',
    };

    const listed = await context.env.ROOFING_CONFIGS.list(listOptions);
    
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
          } else if (relativeParts.length > 1) {
            const subfolder = relativeParts[0];
            if (subfolder) {
              folders.add(subfolder);
            }
          }
        }
      }
    }

    const response = {
      folders: Array.from(folders),
      files,
    };

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
    return new Response(JSON.stringify({ error: 'Failed to list configs' }), {
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

async function handleUploadConfig(context) {
  try {
    const { configId, data } = await context.request.json();
    
    if (!configId || !data) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Cookie',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    const configKey = `configs/${configId}/combined_data.json`;
    await context.env.ROOFING_CONFIGS.put(configKey, JSON.stringify(data, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('Upload config error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload config' }), {
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

async function handleCreateFolder(context) {
  try {
    const { folderName } = await context.request.json();
    
    if (!folderName) {
      return new Response(JSON.stringify({ error: 'Missing folder name' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Cookie',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    const folderKey = `configs/${folderName}/.placeholder`;
    await context.env.ROOFING_CONFIGS.put(folderKey, '', {
      httpMetadata: {
        contentType: 'text/plain',
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create folder' }), {
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