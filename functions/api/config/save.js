export async function onRequest(context) {
  console.log("=== Config Save Handler ===");
  try {
    const { request, env } = context;
    const { DB, ROOFING_CONFIGS } = env;

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token, DB);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const data = await request.json();
    const { combined_data, colors, services, aboutPageData, all_blocks_showcase, assets } = data;

    // Save JSON files to R2
    const jsonFiles = {
      'json/combined_data.json': combined_data,
      'json/colors_output.json': colors,
      'json/services.json': services,
      'json/about_page.json': aboutPageData,
      'json/all_blocks_showcase.json': all_blocks_showcase
    };

    for (const [path, content] of Object.entries(jsonFiles)) {
      if (content) {
        await ROOFING_CONFIGS.put(path, JSON.stringify(content, null, 2), {
          httpMetadata: { contentType: 'application/json' }
        });
      }
    }

    // Save assets to R2
    if (assets) {
      for (const [path, content] of Object.entries(assets)) {
        if (content) {
          const contentType = getContentTypeFromPath(path);
          await ROOFING_CONFIGS.put(path, content, {
            httpMetadata: { contentType }
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in save handler:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function getContentTypeFromPath(path) {
  const ext = path.split('.').pop().toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'json': 'application/json'
  };
  return contentTypes[ext] || 'application/octet-stream';
} 