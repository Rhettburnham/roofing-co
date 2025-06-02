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
      console.error('No session ID found in cookie');
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
      console.error('Invalid or expired session:', { sessionId });
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Get request body
    const requestBody = await request.json();
    console.log('Checkout request body:', requestBody);

    const { priceId, planType } = requestBody;
    if (!priceId) {
      console.error('Missing priceId in request:', requestBody);
      return new Response(JSON.stringify({ error: 'Price ID is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Log Stripe key (first few characters) for debugging
    console.log('Using Stripe key:', env.STRIPE_SECRET_KEY.substring(0, 7) + '...');

    // First get the product details
    console.log('Fetching product details for:', priceId);
    const productResponse = await fetch(`https://api.stripe.com/v1/products/${priceId}`, {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!productResponse.ok) {
      const productError = await productResponse.text();
      console.error('Failed to fetch product details:', {
        status: productResponse.status,
        error: productError
      });
      throw new Error(`Failed to fetch product details: ${productError}`);
    }

    const productDetails = await productResponse.json();
    console.log('Product details:', {
      id: productDetails.id,
      name: productDetails.name,
      default_price: productDetails.default_price
    });

    // Now get the price details using the product's default price
    console.log('Fetching price details for:', productDetails.default_price);
    const priceResponse = await fetch(`https://api.stripe.com/v1/prices/${productDetails.default_price}`, {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!priceResponse.ok) {
      const priceError = await priceResponse.text();
      console.error('Failed to fetch price details:', {
        status: priceResponse.status,
        error: priceError
      });
      throw new Error(`Failed to fetch price details: ${priceError}`);
    }

    const priceDetails = await priceResponse.json();
    console.log('Price details:', {
      id: priceDetails.id,
      amount: priceDetails.unit_amount,
      currency: priceDetails.currency,
      type: priceDetails.type
    });

    // First, search for existing customer by email
    console.log('Searching for existing customer with email:', userSession.email);
    const searchResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userSession.email)}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!searchResponse.ok) {
      const searchError = await searchResponse.text();
      console.error('Failed to search for customer:', {
        status: searchResponse.status,
        error: searchError
      });
      throw new Error(`Failed to search for customer: ${searchError}`);
    }

    const searchData = await searchResponse.json();
    let customer;

    if (searchData.data && searchData.data.length > 0) {
      // Customer exists, use the first one found
      customer = searchData.data[0];
      console.log('Found existing customer:', {
        id: customer.id,
        email: customer.email
      });

      // Update customer metadata if needed
      const updateResponse = await fetch(`https://api.stripe.com/v1/customers/${customer.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'metadata[userId]': userSession.user_id,
          'metadata[configId]': userSession.config_id,
          'metadata[planType]': planType || 'monthly'
        })
      });

      if (!updateResponse.ok) {
        const updateError = await updateResponse.text();
        console.error('Failed to update customer metadata:', {
          status: updateResponse.status,
          error: updateError
        });
        // Don't throw here, continue with existing customer
      }
    } else {
      // Create new customer
      console.log('Creating new customer for:', userSession.email);
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          email: userSession.email,
          'metadata[userId]': userSession.user_id,
          'metadata[configId]': userSession.config_id,
          'metadata[planType]': planType || 'monthly'
        })
      });

      if (!customerResponse.ok) {
        const customerError = await customerResponse.text();
        console.error('Failed to create customer:', {
          status: customerResponse.status,
          error: customerError
        });
        throw new Error(`Failed to create customer: ${customerError}`);
      }

      customer = await customerResponse.json();
      console.log('Customer created:', {
        id: customer.id,
        email: customer.email
      });
    }

    // Create subscription directly
    console.log('Creating subscription with:', {
      priceId: priceDetails.id,
      customerId: customer.id,
      userId: userSession.user_id,
      configId: userSession.config_id,
      planType,
      email: userSession.email
    });

    // First create a payment intent using the existing worker
    const paymentIntentResponse = await fetch(`${request.headers.get('origin')}/api/auth/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie')
      },
      body: JSON.stringify({
        priceId: priceDetails.id,
        planType: planType || 'monthly',
        customerId: customer.id
      })
    });

    if (!paymentIntentResponse.ok) {
      const errorText = await paymentIntentResponse.text();
      console.error('Failed to create payment intent:', errorText);
      throw new Error(`Failed to create payment intent: ${errorText}`);
    }

    const { clientSecret, paymentIntentId } = await paymentIntentResponse.json();
    console.log('Payment intent created:', {
      id: paymentIntentId,
      client_secret: clientSecret
    });

    // Now create the subscription
    const response = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        customer: customer.id,
        'items[][price]': priceDetails.id,
        'items[][quantity]': '1',
        'metadata[userId]': userSession.user_id,
        'metadata[configId]': userSession.config_id,
        'metadata[planType]': planType || 'monthly',
        'metadata[priceId]': priceDetails.id,
        'metadata[productId]': productDetails.id,
        'metadata[customerId]': customer.id,
        'payment_behavior': 'default_incomplete',
        'payment_settings[payment_method_types][]': 'card',
        'payment_settings[save_default_payment_method]': 'on_subscription',
        'default_payment_method': paymentIntentId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stripe API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Failed to create subscription: ${errorText}`);
    }

    const subscription = await response.json();
    console.log('Subscription created successfully:', {
      id: subscription.id,
      status: subscription.status
    });

    return new Response(JSON.stringify({ 
      subscriptionId: subscription.id,
      clientSecret
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: 'Failed to create subscription',
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