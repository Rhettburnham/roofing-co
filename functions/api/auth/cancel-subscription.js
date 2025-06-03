export async function onRequest(context) {
  console.log("=== Cancel Subscription Handler ===");
  
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
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
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
        success: false,
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
      email: customer.email
    });

    const requestBody = await request.json();
    const { subscriptionId } = requestBody;

    if (!subscriptionId) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Subscription ID is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get customer's active subscriptions
    console.log('Fetching active subscriptions...');
    const activeSubscriptionsRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customer.id}&status=active`, {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!activeSubscriptionsRes.ok) {
      const error = await activeSubscriptionsRes.text();
      console.error('Failed to fetch active subscriptions:', {
        status: activeSubscriptionsRes.status,
        error
      });
      throw new Error(`Failed to fetch active subscriptions: ${error}`);
    }

    // Get customer's trialing subscriptions
    console.log('Fetching trialing subscriptions...');
    const trialingSubscriptionsRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customer.id}&status=trialing`, {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!trialingSubscriptionsRes.ok) {
      const error = await trialingSubscriptionsRes.text();
      console.error('Failed to fetch trialing subscriptions:', {
        status: trialingSubscriptionsRes.status,
        error
      });
      throw new Error(`Failed to fetch trialing subscriptions: ${error}`);
    }

    const activeData = await activeSubscriptionsRes.json();
    const trialingData = await trialingSubscriptionsRes.json();

    // Combine both subscription lists
    const allSubscriptions = [...activeData.data, ...trialingData.data];
    
    console.log('Found subscriptions:', {
      activeCount: activeData.data.length,
      trialingCount: trialingData.data.length,
      totalSubscriptions: allSubscriptions.length,
      subscriptions: allSubscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        planType: sub.metadata.planType
      }))
    });

    // Find the specific subscription to cancel
    const subscriptionToCancel = allSubscriptions.find(sub => sub.id === subscriptionId);
    
    if (!subscriptionToCancel) {
      console.log(`Subscription ${subscriptionId} not found`);
      return new Response(JSON.stringify({
        success: false,
        message: 'Subscription not found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Cancel the selected subscription
    console.log(`Cancelling subscription ${subscriptionId} (${subscriptionToCancel.status})...`);
    const cancelRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        cancel_at_period_end: 'true'
      })
    });

    if (!cancelRes.ok) {
      const error = await cancelRes.text();
      console.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw new Error(`Failed to cancel subscription: ${error}`);
    }

    const cancelledSubscription = await cancelRes.json();
    console.log(`Subscription ${subscriptionId} cancelled:`, {
      id: cancelledSubscription.id,
      cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
      status: cancelledSubscription.status
    });

    // Update domain status if this was the last active subscription
    const remainingActiveSubscriptions = allSubscriptions.filter(sub => 
      sub.id !== subscriptionId && (sub.status === 'active' || sub.status === 'trialing')
    );

    if (remainingActiveSubscriptions.length === 0) {
      console.log('No remaining active subscriptions, updating domain status...');
      await env.DB.prepare(
        'UPDATE domains SET is_paid = 0 WHERE user_email = ?'
      ).bind(userSession.email).run();
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: cancelledSubscription.id,
        status: cancelledSubscription.status,
        cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
        currentPeriodEnd: cancelledSubscription.current_period_end
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Cancel subscription error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to cancel subscription',
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