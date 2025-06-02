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
  
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }
  
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      // Extract session ID
      const sessionId = request.headers.get('cookie')?.match(/session_id=([^;]+)/)?.[1];
      if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      const userSession = await env.DB.prepare(
        'SELECT s.*, u.id as user_id, u.email, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
      ).bind(sessionId).first();
  
      if (!userSession) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      const requestBody = await request.json();
      const { priceId, planType } = requestBody;
      if (!priceId) {
        return new Response(JSON.stringify({ error: 'Price ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      // Get product details
      const productRes = await fetch(`https://api.stripe.com/v1/products/${priceId}`, {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      if (!productRes.ok) {
        const error = await productRes.text();
        throw new Error(`Failed to fetch product details: ${error}`);
      }
  
      const product = await productRes.json();
  
      // Get price details
      const priceRes = await fetch(`https://api.stripe.com/v1/prices/${product.default_price}`, {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      if (!priceRes.ok) {
        const error = await priceRes.text();
        throw new Error(`Failed to fetch price details: ${error}`);
      }
  
      const price = await priceRes.json();
  
      // Search for existing Stripe customer
      const searchRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userSession.email)}&limit=1`, {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      let customer;
  
      if (!searchRes.ok) {
        const error = await searchRes.text();
        throw new Error(`Failed to search for customer: ${error}`);
      }
  
      const searchData = await searchRes.json();
  
      if (searchData.data && searchData.data.length > 0) {
        customer = searchData.data[0];
  
        await fetch(`https://api.stripe.com/v1/customers/${customer.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'metadata[userId]': userSession.user_id,
            'metadata[configId]': userSession.config_id,
            'metadata[planType]': planType || 'monthly',
          }),
        });
      } else {
        const createRes = await fetch('https://api.stripe.com/v1/customers', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email: userSession.email,
            'metadata[userId]': userSession.user_id,
            'metadata[configId]': userSession.config_id,
            'metadata[planType]': planType || 'monthly',
          }),
        });
  
        if (!createRes.ok) {
          const error = await createRes.text();
          throw new Error(`Failed to create customer: ${error}`);
        }
  
        customer = await createRes.json();
      }
  
      // Create subscription (only)
      const subRes = await fetch('https://api.stripe.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customer.id,
          'items[0][price]': price.id,
          'items[0][quantity]': '1',
          'metadata[userId]': userSession.user_id,
          'metadata[configId]': userSession.config_id,
          'metadata[planType]': planType || 'monthly',
          'metadata[priceId]': price.id,
          'metadata[productId]': product.id,
          'metadata[customerId]': customer.id,
          'payment_behavior': 'default_incomplete',
          'payment_settings[payment_method_types][]': 'card',
          'payment_settings[save_default_payment_method]': 'on_subscription',
          'expand[]': 'latest_invoice.payment_intent',
        }),
      });
  
      if (!subRes.ok) {
        const error = await subRes.text();
        throw new Error(`Failed to create subscription: ${error}`);
      }
  
      const subscription = await subRes.json();
      console.log('Subscription created:', {
        id: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      });
  
      if (!subscription.latest_invoice?.payment_intent?.client_secret) {
        throw new Error('No client secret found in subscription response');
      }
  
      return new Response(JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error('Error creating subscription:', error);
      return new Response(JSON.stringify({
        error: 'Failed to create subscription',
        details: error.message,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
  