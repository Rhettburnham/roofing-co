export async function onRequest(context) {
  try {
    const { request, env } = context;

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

    // Get session ID from cookie
    const sessionId = request.headers.get('cookie')?.match(/session_id=([^;]+)/)?.[1];
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Verify session
    const session = await env.DB.prepare(
      'SELECT s.* FROM sessions s WHERE s.session_id = ? AND s.expires_at > datetime("now")'
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

    // Log Stripe key (first few characters) for debugging
    console.log('Using Stripe key:', env.STRIPE_SECRET_KEY.substring(0, 7) + '...');

    // First fetch the products to get their price IDs
    const [monthlyProductResponse, yearlyProductResponse] = await Promise.all([
      fetch(`https://api.stripe.com/v1/products/prod_SPQCEDY9mS3vI3`, {
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }),
      fetch(`https://api.stripe.com/v1/products/prod_SPQDERFJ8Ve82B`, {
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    ]);

    if (!monthlyProductResponse.ok || !yearlyProductResponse.ok) {
      const monthlyError = await monthlyProductResponse.text();
      const yearlyError = await yearlyProductResponse.text();
      console.error('Stripe API errors:', {
        monthly: monthlyError,
        yearly: yearlyError
      });
      throw new Error(`Failed to fetch products from Stripe: ${monthlyError || yearlyError}`);
    }

    const [monthlyProduct, yearlyProduct] = await Promise.all([
      monthlyProductResponse.json(),
      yearlyProductResponse.json()
    ]);

    // Get the default price IDs from the products
    const monthlyPriceId = monthlyProduct.default_price;
    const yearlyPriceId = yearlyProduct.default_price;

    // Now fetch the actual prices
    const [monthlyPriceResponse, yearlyPriceResponse] = await Promise.all([
      fetch(`https://api.stripe.com/v1/prices/${monthlyPriceId}`, {
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }),
      fetch(`https://api.stripe.com/v1/prices/${yearlyPriceId}`, {
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    ]);

    // Log response details for debugging
    console.log('Monthly price response:', {
      status: monthlyPriceResponse.status,
      statusText: monthlyPriceResponse.statusText,
      headers: Object.fromEntries(monthlyPriceResponse.headers.entries())
    });

    console.log('Yearly price response:', {
      status: yearlyPriceResponse.status,
      statusText: yearlyPriceResponse.statusText,
      headers: Object.fromEntries(yearlyPriceResponse.headers.entries())
    });

    if (!monthlyPriceResponse.ok || !yearlyPriceResponse.ok) {
      const monthlyError = await monthlyPriceResponse.text();
      const yearlyError = await yearlyPriceResponse.text();
      console.error('Stripe API errors:', {
        monthly: monthlyError,
        yearly: yearlyError
      });
      throw new Error(`Failed to fetch prices from Stripe: ${monthlyError || yearlyError}`);
    }

    const [monthlyPrice, yearlyPrice] = await Promise.all([
      monthlyPriceResponse.json(),
      yearlyPriceResponse.json()
    ]);

    // Log successful price data
    console.log('Retrieved prices:', {
      monthly: monthlyPrice,
      yearly: yearlyPrice
    });

    return new Response(JSON.stringify({
      monthly: {
        amount: monthlyPrice.unit_amount,
        currency: monthlyPrice.currency,
      },
      yearly: {
        amount: yearlyPrice.unit_amount,
        currency: yearlyPrice.currency,
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch prices',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
} 