export async function onRequestGet(context) {
  const { request, env } = context;
  console.log('Received request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  });

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
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
    console.log('Checking domain:', domain);

    if (!domain) {
      console.log('No domain parameter provided');
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
      console.error('Missing API credentials:', {
        hasKey: !!env.GODADDY_API_KEY,
        hasSecret: !!env.GODADDY_API_SECRET
      });
      throw new Error('GoDaddy API credentials are not configured');
    }

    console.log('Checking domain availability for:', domain);
    // Check availability of the requested domain
    const availabilityResponse = await fetch(`https://api.godaddy.com/v1/domains/available?domain=${domain}`, {
      headers: {
        'Authorization': `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`,
        'Accept': 'application/json',
      }
    });

    const availabilityData = await availabilityResponse.json();
    console.log('Availability response:', {
      status: availabilityResponse.status,
      data: availabilityData
    });

    // Get similar domain suggestions from GoDaddy
    const baseName = domain.split('.')[0];
    console.log('Getting similar domains for base name:', baseName);
    const similarDomainsResponse = await fetch(`https://api.godaddy.com/v1/domains/suggestions?query=${baseName}&limit=10`, {
      headers: {
        'Authorization': `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`,
        'Accept': 'application/json',
      }
    });

    const similarDomains = await similarDomainsResponse.json();
    console.log('Similar domains response:', {
      status: similarDomainsResponse.status,
      count: similarDomains.length
    });

    const similarSuggestions = similarDomains
      .filter(domain => domain.available && domain.price <= 30)
      .map(domain => ({
        name: domain.domain,
        price: domain.price,
        currency: domain.currency || 'USD'
      }))
      .sort((a, b) => a.price - b.price);

    console.log('Filtered similar suggestions:', {
      total: similarDomains.length,
      available: similarSuggestions.length,
      suggestions: similarSuggestions
    });

    const response = {
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
    };

    console.log('Sending response:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error checking domain:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
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