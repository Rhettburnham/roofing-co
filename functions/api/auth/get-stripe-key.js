export async function onRequest(context) {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Handle preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get the public key from environment variables
    const publicKey = context.env.STRIPE_PUBLIC_KEY;
    
    if (!publicKey) {
      throw new Error('Stripe public key not configured');
    }

    // Return the public key
    return new Response(
      JSON.stringify({ publicKey }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error getting Stripe public key:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get Stripe public key' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
} 