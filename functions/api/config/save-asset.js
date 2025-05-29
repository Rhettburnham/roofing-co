export async function onRequest(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    console.log("=== Asset Save Handler ===");

    // Verify authentication
    const sessionId = request.headers.get('Cookie')?.split('session=')[1]?.split(';')[0];
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    if (!session) {
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

    // Get the asset data from the request
    const formData = await request.formData();
    const file = formData.get('file');
    const path = formData.get('path');
    const contentType = formData.get('contentType');

    if (!file || !path) {
      return new Response(JSON.stringify({ error: 'Missing file or path' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Convert the file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Save to R2
    const assetKey = `configs/${configId}/assets/${path}`;
    console.log('Saving asset to R2:', assetKey);

    await env.ROOFING_CONFIGS.put(assetKey, arrayBuffer, {
      httpMetadata: {
        contentType: contentType || file.type,
      },
    });

    return new Response(JSON.stringify({ 
      success: true,
      path: `assets/${path}` // Return the relative path for use in the UI
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error saving asset:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save asset',
      details: error.message 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
} 