export async function onRequest(context) {
  try {
    const { request, env } = context;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
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

    // Verify session and get user data
    const userSession = await env.DB.prepare(
      'SELECT s.*, u.id as user_id, u.email, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    if (!userSession) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get request body
    const { priceId, planType } = await request.json();
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Price ID is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Initialize Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: planType === 'monthly' ? 2499 : 24000, // Amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userSession.user_id,
        configId: userSession.config_id,
        planType: planType || 'monthly',
      },
    });

    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret 
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create payment intent',
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