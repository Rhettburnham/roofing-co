// Shared CORS helper
function getCorsHeaders(origin) {
  const allowed = [
    'https://roofing-www.pages.dev',
    'https://roofing-co.pages.dev',
    'https://roofing-co-with-workers.pages.dev',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  const acao = allowed.includes(origin) ? origin : allowed[2];
  return {
    'Access-Control-Allow-Origin': acao,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Set-Cookie',
  };
}

export async function onRequestPost(context) {
  return onRequest(context);
}

export async function onRequest(context) {
  try {
    console.log("=== Admin Status Handler ===");
    console.log('Request details:', {
      method: context.request.method,
      url: context.request.url,
      headers: Object.fromEntries(context.request.headers.entries()),
      cookies: context.request.cookies.getAll().map(c => c.name),
      hasDB: !!context.env?.DB,
      hasROOFING_CONFIGS: !!context.env?.ROOFING_CONFIGS
    });
    
    const origin = context.request.headers.get('Origin') || '';
    console.log('Request origin:', origin);
    const cors = getCorsHeaders(origin);

    // Handle preflight requests
    if (context.request.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { headers: cors });
    }

    // Verify admin access
    const sessionId = context.request.cookies.get('session_id')?.value;
    console.log('Session ID from cookies:', sessionId ? 'Present' : 'Missing');
    
    if (!sessionId) {
      console.log('No session ID found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...cors,
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
          ...cors,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the action from the URL
    const url = new URL(context.request.url);
    const action = url.pathname.split('/api/admin/')[1];
    console.log('Admin action:', action);

    switch (action) {
      case 'list-configs':
        return handleListConfigs(context);
      case 'upload-config':
        return handleUploadConfig(context);
      case 'create-folder':
        return handleCreateFolder(context);
      default:
        console.log('Unknown admin action:', action);
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: {
            ...cors,
            'Content-Type': 'application/json',
          },
        });
    }
  } catch (error) {
    console.error('Admin status error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...cors,
        'Content-Type': 'application/json',
      },
    });
  }
}

async function handleListConfigs(context) {
  try {
    console.log('=== Starting handleListConfigs ===');
    console.log('Request method:', context.request.method);
    
    let prefix;
    if (context.request.method === 'POST') {
      const body = await context.request.json();
      prefix = body.prefix;
      console.log('POST request body:', body);
    } else {
      const url = new URL(context.request.url);
      prefix = url.searchParams.get('prefix');
      console.log('GET request prefix:', prefix);
    }
    
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