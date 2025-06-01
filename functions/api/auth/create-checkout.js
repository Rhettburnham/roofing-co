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
    const searchResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userSession.email)}`, {
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

    // Create checkout session using REST API
    console.log('Creating checkout session with:', {
      priceId: priceDetails.id,
      customerId: customer.id,
      userId: userSession.user_id,
      configId: userSession.config_id,
      planType,
      email: userSession.email
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[][price]': priceDetails.id,
        'line_items[][quantity]': '1',
        mode: 'subscription',
        'success_url': `${request.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${request.headers.get('origin')}/payment-cancelled`,
        customer: customer.id,
        'subscription_data[metadata][userId]': userSession.user_id,
        'subscription_data[metadata][configId]': userSession.config_id,
        'subscription_data[metadata][planType]': planType || 'monthly',
        'subscription_data[metadata][priceId]': priceDetails.id,
        'subscription_data[metadata][productId]': productDetails.id,
        'subscription_data[metadata][customerId]': customer.id,
        'billing_address_collection': 'required',
        'payment_method_collection': 'always',
        'allow_promotion_codes': 'true'
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
      throw new Error(`Failed to create checkout session: ${errorText}`);
    }

    const checkoutSession = await response.json();
    console.log('Checkout session created successfully:', {
      id: checkoutSession.id,
      url: checkoutSession.url,
      status: checkoutSession.status,
      subscription: checkoutSession.subscription
    });

    return new Response(JSON.stringify({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: 'Failed to create checkout session',
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