export async function onRequest(context) {
  try {
    const { request, env, params } = context;
    const path = params.path.join('/');

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

    // Get the asset from R2
    const object = await env.ROOFING_CONFIGS.get(`configs/${path}`);
    if (!object) {
      return new Response('Asset not found', { status: 404 });
    }

    // Get the content type
    const contentType = object.httpMetadata?.contentType || getContentType(path);

    // Return the asset
    return new Response(object.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
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