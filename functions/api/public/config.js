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

    // Fetch both combined_data.json and colors_output.json from R2
    console.log('Fetching configs from R2...');
    const [combinedDataObject, colorsObject] = await Promise.all([
      env.ROOFING_CONFIGS.get(`configs/${configId}/combined_data.json`),
      env.ROOFING_CONFIGS.get(`configs/${configId}/colors_output.json`)
    ]);
    
    if (!combinedDataObject) {
      console.log('No combined_data.json found in R2');
      return new Response(JSON.stringify({ error: 'Configuration not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse the combined data
    const combinedData = await combinedDataObject.json();
    
    // Parse colors if available
    let colors = null;
    if (colorsObject) {
      try {
        colors = await colorsObject.json();
      } catch (error) {
        console.error('Error parsing colors_output.json:', error);
      }
    }

    // Return both configs
    console.log('Successfully retrieved configs from R2');
    return new Response(JSON.stringify({
      success: true,
      combined_data: combinedData,
      colors: colors
    }), {
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