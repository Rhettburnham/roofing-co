import { getDomainByDomain } from '../../utils/domains.js';

export async function onRequest(context) {
  console.log("=== Public Config Handler ===");
  try {
    const { request, env } = context;
    console.log('Context received:', { 
      hasRequest: !!request,
      hasEnv: !!env,
      hasDB: !!env?.DB,
      hasROOFING_CONFIGS: !!env?.ROOFING_CONFIGS
    });

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    // Get the host from the request headers
    const host = request.headers.get('host');
    console.log('Request host:', host);

    // Extract domain from host
    let domain;
    try {
      const url = new URL(`https://${host}`);
      domain = url.hostname;
      // Remove 'www.' if present
      domain = domain.replace(/^www\./, '');
      console.log('Extracted domain:', domain);
    } catch (error) {
      console.error('Error parsing host:', error);
      domain = host;
    }

    // Look up domain in database
    console.log('Looking up domain in database:', domain);
    const domainEntry = await getDomainByDomain(env.DB, domain);
    console.log('Domain lookup result:', domainEntry ? {
      email: domainEntry.email,
      config_id: domainEntry.config_id,
      is_active: domainEntry.is_active,
      is_paid: domainEntry.is_paid
    } : 'Not found');

    if (!domainEntry) {
      console.log('No domain mapping found in database');
      return new Response(JSON.stringify({ error: 'Configuration not found for this domain' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the config ID from the domain entry
    const configId = domainEntry.config_id;
    console.log('Config ID from domain entry:', configId);

    // Fetch the config from R2
    const configKey = `configs/${configId}/combined_data.json`;
    console.log('Fetching config from R2:', configKey);
    const configObject = await env.ROOFING_CONFIGS.get(configKey);
    
    if (!configObject) {
      console.log('No config found in R2');
      return new Response(JSON.stringify({ error: 'Configuration not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Return the config
    console.log('Successfully retrieved config from R2');
    return new Response(configObject.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Public config error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
} 