export async function onRequestPost(context) {
  try {
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

    // Parse request body
    const body = await context.request.json();
    const { bbbName } = body;
    if (!bbbName || typeof bbbName !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid bbbName' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load the business_listings_multi_search.json file
    // (Assume it's accessible locally for this endpoint)
    const fs = require('fs');
    const path = require('path');
    const listingsPath = path.resolve(__dirname, '../../../public/data/leads/business_listings_multi_search.json');
    let listings = [];
    try {
      listings = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Could not load business listings' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the business by name (case-insensitive, exact match)
    const found = listings.find(entry =>
      typeof entry.BusinessName === 'string' &&
      entry.BusinessName.trim().toLowerCase() === bbbName.trim().toLowerCase()
    );

    // Return the GoogleReviewsLink (or null if not found)
    const link = found && found.GoogleReviewsLink && found.GoogleReviewsLink !== 'N/A'
      ? found.GoogleReviewsLink
      : null;

    return new Response(JSON.stringify({ link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 