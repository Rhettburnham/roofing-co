export async function onRequest(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    const version = url.searchParams.get('v'); // Get version parameter

    if (!path) {
      return new Response('Missing path parameter', { status: 400 });
    }

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

    // Get the config ID from the path
    const pathParts = path.split('/');
    let configId = null;
    let assetPath = path;

    // If the path starts with configs/, extract the config ID
    if (pathParts[0] === 'configs' && pathParts.length > 2) {
      configId = pathParts[1];
      assetPath = pathParts.slice(2).join('/');
    }

    // If no config ID in path, try to get it from the session
    if (!configId) {
      const sessionId = request.headers.get('cookie')?.match(/session=([^;]+)/)?.[1];
      if (sessionId) {
        const session = await env.DB.prepare(
          'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
        ).bind(sessionId).first();
        if (session) {
          configId = session.config_id;
        }
      }
    }

    // If still no config ID, try to get it from the domain
    if (!configId) {
      const domain = url.hostname;
      const domainEntry = await env.DB.prepare(
        'SELECT config_id FROM domains WHERE domain = ?'
      ).bind(domain).first();
      if (domainEntry) {
        configId = domainEntry.config_id;
      }
    }

    if (!configId) {
      return new Response('Config not found', { status: 404 });
    }

    // Get the asset from R2
    const object = await env.ROOFING_CONFIGS.get(`configs/${configId}/${assetPath}`);
    if (!object) {
      return new Response('Asset not found', { status: 404 });
    }

    // Get the content type
    const contentType = object.httpMetadata?.contentType || getContentType(path);

    // Get the last modified time from R2 metadata or use current time
    const lastModified = object.uploaded || new Date().toISOString();

    // Set cache control based on environment and version
    const isDevelopment = process.env.NODE_ENV === 'development';
    const cacheControl = isDevelopment
      ? 'no-cache, no-store, must-revalidate' // No caching in development
      : version
        ? 'public, max-age=31536000, immutable' // Long cache for versioned assets
        : 'public, max-age=3600, must-revalidate'; // 1 hour cache for unversioned assets

    // Return the asset with appropriate cache headers
    return new Response(object.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Last-Modified': lastModified,
        'ETag': `"${version || lastModified}"`,
      },
    });
  } catch (error) {
    console.error('Error serving asset:', error);
    return new Response('Internal Server Error', { status: 500 });
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