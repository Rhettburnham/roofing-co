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

    // Check if we have the required API token
    if (!env.CLOUDFLARE_API_TOKEN) {
      console.error('Cloudflare API token is not set in environment variables');
      throw new Error('Cloudflare API token is not configured');
    }

    // First get the account ID
    const accountsResponse = await fetch('https://api.cloudflare.com/client/v4/accounts', {
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    const accountsData = await accountsResponse.json();
    
    if (!accountsData.success || !accountsData.result.length) {
      throw new Error('Failed to get account information');
    }

    const accountId = accountsData.result[0].id;

    // Check domain availability using account-specific endpoint
    const domainCheckResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/registrar/domains/${domain}`, {
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    const domainCheckData = await domainCheckResponse.json();

    // If domain is already registered, return that information
    if (domainCheckData.success) {
      return new Response(JSON.stringify({
        success: true,
        available: false,
        message: "Domain is already registered",
        details: domainCheckData.result
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Generate alternative domain suggestions
    const baseName = domain.split('.')[0];
    const suggestions = [
      `${baseName}roofing.com`,
      `${baseName}roofs.com`,
      `${baseName}contractor.com`,
      `${baseName}roof.com`,
      `${baseName}roofingco.com`,
      `${baseName}roofingpro.com`,
      `${baseName}roofingpros.com`,
      `${baseName}roofingcompany.com`,
      `${baseName}roofingcontractor.com`,
      `${baseName}roofingcontractors.com`
    ];

    // Check availability for all suggestions using the availability endpoint
    const registrarResponse = await fetch(`https://api.cloudflare.com/client/v4/registrar/domains/availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domains: [domain, ...suggestions]
      })
    });

    const registrarData = await registrarResponse.json();

    if (!registrarData.success) {
      throw new Error(`Registrar API error: ${JSON.stringify(registrarData.errors)}`);
    }

    // Process results
    const results = registrarData.result;
    const originalDomain = results[0];
    const alternatives = results.slice(1)
      .filter(domain => domain.available && domain.price <= 20)
      .map(domain => ({
        name: domain.name,
        price: domain.price,
        currency: domain.currency
      }))
      .sort((a, b) => a.price - b.price);

    return new Response(JSON.stringify({
      success: true,
      originalDomain: {
        name: originalDomain.name,
        available: originalDomain.available,
        price: originalDomain.price,
        currency: originalDomain.currency,
        message: originalDomain.available ? "Domain is available" : "Domain is not available"
      },
      alternatives: alternatives,
      message: originalDomain.available 
        ? "Domain is available" 
        : `Domain is not available. Here are ${alternatives.length} affordable alternatives:`
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