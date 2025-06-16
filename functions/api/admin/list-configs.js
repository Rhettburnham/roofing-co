import { createHash } from 'node:crypto';

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

export async function onRequest(context) {
  console.log("=== List Configs Handler ===");
  
  try {
    const { request, env } = context;
    console.log('Context received:', { 
      hasRequest: !!request,
      hasEnv: !!env,
      hasDB: !!env?.DB,
      hasROOFING_CONFIGS: !!env?.ROOFING_CONFIGS
    });

    const origin = request.headers.get('Origin') || '';
    console.log('Request origin:', origin);
    const cors = getCorsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Verify admin access
    const sessionId = request.cookies.get('session_id')?.value;
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

    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    console.log('Session lookup result:', session ? {
      hasConfigId: !!session.config_id,
      configId: session.config_id,
      expiresAt: session.expires_at
    } : 'No session found');

    if (!session || session.config_id !== 'admin') {
      console.log('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse request body
    const { prefix } = await request.json();
    console.log('Request prefix:', prefix);

    // List all objects with the given prefix
    console.log('Listing objects with prefix:', prefix);
    const listResult = await env.ROOFING_CONFIGS.list({ prefix });
    console.log('List result:', {
      truncated: listResult.truncated,
      cursor: listResult.cursor,
      objectCount: listResult.objects.length
    });

    // Process the results
    const folders = new Set();
    const files = [];

    for (const object of listResult.objects) {
      const key = object.key;
      console.log('Processing object:', key);

      // Remove the prefix from the key
      const relativePath = key.slice(prefix.length);
      console.log('Relative path:', relativePath);

      // Skip if it's the current directory
      if (!relativePath) {
        console.log('Skipping current directory');
        continue;
      }

      // Split the path into parts
      const parts = relativePath.split('/');
      console.log('Path parts:', parts);

      // If it's a file in the current directory
      if (parts.length === 1) {
        console.log('Found file in current directory:', parts[0]);
        files.push({
          name: parts[0],
          size: object.size,
          uploaded: object.uploaded,
          folder: ''
        });
      }
      // If it's in a subdirectory
      else if (parts.length > 1) {
        const folder = parts[0];
        console.log('Found item in subdirectory:', folder);
        folders.add(folder);

        // If it's a file (not a directory)
        if (parts[1]) {
          console.log('Found file in subdirectory:', parts[1]);
          files.push({
            name: parts[1],
            size: object.size,
            uploaded: object.uploaded,
            folder
          });
        }
      }
    }

    const response = {
      folders: Array.from(folders),
      files,
    };

    console.log('Sending response:', {
      folderCount: response.folders.length,
      fileCount: response.files.length
    });

    return new Response(JSON.stringify(response), {
      headers: {
        ...cors,
        'Content-Type': 'application/json',
      },
    });

  } catch (err) {
    console.error('List configs error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      type: err.constructor.name
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to list configs',
      details: err.message
    }), {
      status: 500,
      headers: { 
        ...getCorsHeaders('*'),
        'Content-Type': 'application/json'
      },
    });
  }
} 