export async function onRequestGet(context) {
  const { request, env } = context;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // Get domain from query parameters
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');

    if (!domain) {
      return new Response(JSON.stringify({
        success: false,
        message: "Domain parameter is required"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Check if we have the required API keys
    if (!env.GODADDY_API_KEY || !env.GODADDY_API_SECRET) {
      console.error('GoDaddy API credentials are not set in environment variables');
      throw new Error('GoDaddy API credentials are not configured');
    }

    // Check availability of the requested domain
    const availabilityResponse = await fetch(`https://api.godaddy.com/v1/domains/available?domain=${domain}`, {
      headers: {
        'Authorization': `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`,
        'Accept': 'application/json',
      }
    });

    const availabilityData = await availabilityResponse.json();

    // Get similar domain suggestions from GoDaddy
    const baseName = domain.split('.')[0];
    const similarDomainsResponse = await fetch(`https://api.godaddy.com/v1/domains/suggestions?query=${baseName}&limit=10`, {
      headers: {
        'Authorization': `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`,
        'Accept': 'application/json',
      }
    });

    const similarDomains = await similarDomainsResponse.json();
    const similarSuggestions = similarDomains
      .filter(domain => domain.available && domain.price <= 30)
      .map(domain => ({
        name: domain.domain,
        price: domain.price,
        currency: domain.currency || 'USD'
      }))
      .sort((a, b) => a.price - b.price);

    return new Response(JSON.stringify({
      success: true,
      originalDomain: {
        name: availabilityData.domain,
        available: availabilityData.available,
        price: availabilityData.price,
        currency: availabilityData.currency || 'USD',
        message: availabilityData.available ? "Domain is available" : "Domain is not available"
      },
      similarDomains: similarSuggestions,
      message: availabilityData.available 
        ? "Domain is available" 
        : `Domain is not available. Here are ${similarSuggestions.length} similar domains:`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error checking domain:', error);
    return new Response(JSON.stringify({
      success: false,
      message: "Error checking domain availability",
      error: error.message || "Unknown error"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
} 