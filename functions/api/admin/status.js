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
  try {
    console.log("=== Admin Status Handler (POST) ===");
    console.log('Request details:', {
      method: context.request.method,
      url: context.request.url,
      headers: Object.fromEntries(context.request.headers.entries()),
      cookies: context.request.cookies.getAll().map(c => c.name),
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

    // Verify admin access
    const sessionId = context.request.cookies.get('session_id')?.value;
    console.log('Session ID from cookies:', sessionId ? 'Present' : 'Missing');
    
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

    // Get the action from the URL
    const url = new URL(context.request.url);
    const action = url.pathname.split('/api/admin/')[1];
    console.log('Admin action:', action);

    switch (action) {
      case 'upload-config':
        return handleUploadConfig(context);
      case 'create-folder':
        return handleCreateFolder(context);
      default:
        console.log('Unknown admin action:', action);
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
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}

// Keep the existing onRequest for GET requests
export async function onRequest(context) {
  return onRequestPost(context);
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