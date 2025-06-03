export async function onRequest(context) {
  console.log("=== Get Subscription Handler ===");

  try {
    const { request, env } = context;
    console.log('Context received:', {
      hasRequest: !!request,
      hasEnv: !!env,
      hasDB: !!env?.DB
    });

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Define common Stripe headers, including API version
    const stripeHeaders = {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20', // Specify a recent Stripe API version for consistent behavior
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
    console.log('Session ID from cookie:', sessionId ? 'present' : 'missing');

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
    console.log('Fetching user session data...');
    const userSession = await env.DB.prepare(
      'SELECT s.*, u.id as user_id, u.email, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    if (!userSession) {
      console.log('Invalid or expired session');
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    console.log('User session found:', {
      userId: userSession.user_id,
      email: userSession.email,
      configId: userSession.config_id
    });

    // Search for customer in Stripe
    console.log('Searching for Stripe customer...');
    const searchRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userSession.email)}&limit=1`, {
      headers: stripeHeaders // Use consistent headers
    });

    if (!searchRes.ok) {
      const error = await searchRes.text();
      console.error('Failed to search for customer:', {
        status: searchRes.status,
        error
      });
      throw new Error(`Failed to search for customer: ${error}`);
    }

    const searchData = await searchRes.json();
    console.log('Stripe customer search results:', {
      found: searchData.data.length > 0,
      totalCustomers: searchData.data.length
    });

    if (!searchData.data || searchData.data.length === 0) {
      console.log('No Stripe customer found');
      return new Response(JSON.stringify({
        hasSubscription: false,
        message: 'No subscription found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const customer = searchData.data[0];
    console.log('Found Stripe customer:', {
      id: customer.id,
      email: customer.email,
      metadata: customer.metadata
    });

    // Get customer's subscriptions, expanding latest_invoice
    console.log('Fetching customer subscriptions, expanding latest_invoice...');
    const subscriptionsRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customer.id}&status=active&expand[]=data.latest_invoice`, {
      headers: stripeHeaders // Use consistent headers
    });

    if (!subscriptionsRes.ok) {
      const error = await subscriptionsRes.text();
      console.error('Failed to fetch subscriptions:', {
        status: subscriptionsRes.status,
        error
      });
      throw new Error(`Failed to fetch subscriptions: ${error}`);
    }

    const subscriptionsData = await subscriptionsRes.json();
    console.log('Subscriptions data:', {
      totalSubscriptions: subscriptionsData.data.length,
      subscriptions: subscriptionsData.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        currentPeriodStart: sub.current_period_start,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        planType: sub.metadata.planType,
        latestInvoiceId: sub.latest_invoice?.id, // Log invoice ID
        latestInvoicePaidAt: sub.latest_invoice?.paid_at, // Log paid_at
        latestInvoiceNextPaymentAttempt: sub.latest_invoice?.next_payment_attempt // Log next_payment_attempt
      }))
    });

    // Get the active subscriptions
    const activeSubscriptions = subscriptionsData.data.filter(sub => sub.status === 'active');

    if (!activeSubscriptions.length) {
      console.log('No active subscriptions found');
      return new Response(JSON.stringify({
        hasSubscription: false,
        message: 'No active subscription found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get product details for all subscriptions and include invoice details
    const subscriptionsWithDetails = await Promise.all(activeSubscriptions.map(async (subscription) => {
      const productRes = await fetch(`https://api.stripe.com/v1/products/${subscription.metadata.productId}`, {
        headers: stripeHeaders // Use consistent headers
      });

      if (!productRes.ok) {
        const error = await productRes.text();
        console.error('Failed to fetch product details:', {
          status: productRes.status,
          error
        });
        throw new Error(`Failed to fetch product details: ${error}`);
      }

      const productDetails = await productRes.json();
      console.log('Product details:', {
        id: productDetails.id,
        name: productDetails.name,
        description: productDetails.description
      });

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        planType: subscription.metadata.planType,
        product: {
          id: productDetails.id,
          name: productDetails.name,
          description: productDetails.description
        },
        // Include latest invoice details
        latestInvoice: subscription.latest_invoice ? {
          id: subscription.latest_invoice.id,
          status: subscription.latest_invoice.status,
          amount_due: subscription.latest_invoice.amount_due,
          paid_at: subscription.latest_invoice.paid_at, // Last payment date (if paid)
          next_payment_attempt: subscription.latest_invoice.next_payment_attempt, // Next payment attempt date
          hosted_invoice_url: subscription.latest_invoice.hosted_invoice_url,
        } : null,
      };
    }));

    // Prepare the response
    const responseData = {
      hasSubscription: true,
      subscriptions: subscriptionsWithDetails
    };

    console.log('Sending subscription data:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Get subscription error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return new Response(JSON.stringify({
      error: 'Failed to get subscription data',
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
