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
  
      // Extract session ID from cookie
      const sessionId = request.headers.get('cookie')?.match(/session_id=([^;]+)/)?.[1];
      if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Session ID missing' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      // Fetch user session from database
      const userSession = await env.DB.prepare(
        'SELECT s.*, u.id as user_id, u.email, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
      ).bind(sessionId).first();
  
      if (!userSession) {
        return new Response(JSON.stringify({ error: 'Invalid session or session expired' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      const requestBody = await request.json();
      const { priceId, planType, billingDetails } = requestBody;
      if (!priceId) {
        return new Response(JSON.stringify({ error: 'Price ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      if (!billingDetails?.name || !billingDetails?.address) {
        return new Response(JSON.stringify({ error: 'Billing details are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      // Define common Stripe headers, including API version
      const stripeHeaders = {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2024-06-20', // Specify a recent Stripe API version for consistent behavior
      };
  
      // Get product details from Stripe
      const productRes = await fetch(`https://api.stripe.com/v1/products/${priceId}`, {
        headers: stripeHeaders,
      });
  
      if (!productRes.ok) {
        const error = await productRes.text();
        throw new Error(`Failed to fetch product details: ${error}`);
      }
      const product = await productRes.json();
  
      // Get price details from Stripe
      const priceRes = await fetch(`https://api.stripe.com/v1/prices/${product.default_price}`, {
        headers: stripeHeaders,
      });
  
      if (!priceRes.ok) {
        const error = await priceRes.text();
        throw new Error(`Failed to fetch price details: ${error}`);
      }
      const price = await priceRes.json();
  
      // Search for existing Stripe customer by email
      const searchRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userSession.email)}&limit=1`, {
        headers: stripeHeaders,
      });
  
      let customer;
  
      if (!searchRes.ok) {
        const error = await searchRes.text();
        throw new Error(`Failed to search for customer: ${error}`);
      }
      const searchData = await searchRes.json();
  
      // If customer exists, update metadata; otherwise, create new customer
      if (searchData.data && searchData.data.length > 0) {
        customer = searchData.data[0];
        // Update customer metadata and billing details
        await fetch(`https://api.stripe.com/v1/customers/${customer.id}`, {
          method: 'POST',
          headers: stripeHeaders,
          body: new URLSearchParams({
            'metadata[userId]': userSession.user_id,
            'metadata[configId]': userSession.config_id,
            'metadata[planType]': planType || 'monthly',
            'name': billingDetails.name,
            'address[line1]': billingDetails.address.line1,
            'address[city]': billingDetails.address.city,
            'address[state]': billingDetails.address.state,
            'address[postal_code]': billingDetails.address.postal_code,
            'address[country]': billingDetails.address.country,
          }),
        });
      } else {
        // Create new customer with billing details
        const createRes = await fetch('https://api.stripe.com/v1/customers', {
          method: 'POST',
          headers: stripeHeaders,
          body: new URLSearchParams({
            email: userSession.email,
            'metadata[userId]': userSession.user_id,
            'metadata[configId]': userSession.config_id,
            'metadata[planType]': planType || 'monthly',
            'name': billingDetails.name,
            'address[line1]': billingDetails.address.line1,
            'address[city]': billingDetails.address.city,
            'address[state]': billingDetails.address.state,
            'address[postal_code]': billingDetails.address.postal_code,
            'address[country]': billingDetails.address.country,
          }),
        });
  
        if (!createRes.ok) {
          const error = await createRes.text();
          throw new Error(`Failed to create customer: ${error}`);
        }
        customer = await createRes.json();
      }
  
      // Create a new Stripe subscription
      const subRes = await fetch('https://api.stripe.com/v1/subscriptions', {
        method: 'POST',
        headers: stripeHeaders,
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
          'payment_behavior': 'default_incomplete', // Recommended for client-side payment confirmation
          'payment_settings[payment_method_types][]': 'card',
          'payment_settings[save_default_payment_method]': 'on_subscription',
          'expand[]': 'latest_invoice.payment_intent', // Attempt to expand latest_invoice and its nested payment_intent
          'trial_period_days': '30' // Add 30-day free trial
        }),
      });
  
      if (!subRes.ok) {
        const error = await subRes.text();
        console.error('Stripe subscription creation error response:', error);
        throw new Error(`Failed to create subscription: ${error}`);
      }
  
      const subscription = await subRes.json();
  
      // Log the full subscription response for debugging purposes
      console.log('Stripe Subscription created (raw response):', JSON.stringify(subscription, null, 2));
      console.log('Subscription Status:', subscription.status);
      console.log('Latest Invoice ID:', subscription.latest_invoice?.id);
      console.log('Payment Intent ID on Latest Invoice (from subscription response):', subscription.latest_invoice?.payment_intent?.id);
  
      let clientSecret = null;
      let finalStatus = subscription.status;
  
      // Check if payment_intent and client_secret are directly available from the subscription response
      if (subscription.latest_invoice?.payment_intent?.client_secret) {
        clientSecret = subscription.latest_invoice.payment_intent.client_secret;
        console.log('Client Secret obtained directly from subscription response.');
      } else if (subscription.latest_invoice?.id && (subscription.status === 'incomplete' || subscription.status === 'past_due')) {
        // If not directly available, but subscription is incomplete/past_due, try fetching the invoice separately
        console.log('Payment Intent not directly expanded. Attempting to fetch invoice separately to get client secret...');
        const invoiceFetchRes = await fetch(`https://api.stripe.com/v1/invoices/${subscription.latest_invoice.id}?expand[]=payment_intent`, {
          headers: stripeHeaders,
        });
  
        if (!invoiceFetchRes.ok) {
          const error = await invoiceFetchRes.text();
          console.error('Failed to fetch invoice separately:', error);
          throw new Error(`Failed to retrieve invoice for payment intent: ${error}`);
        }
        const invoice = await invoiceFetchRes.json();
        console.log('Invoice fetched separately (raw response):', JSON.stringify(invoice, null, 2));
  
        if (invoice.payment_intent?.client_secret) {
          clientSecret = invoice.payment_intent.client_secret;
          console.log('Client Secret obtained from separate invoice fetch.');
        } else {
          console.warn('Invoice fetched, but no payment_intent or client_secret found on it.');
        }
      }
  
      // Determine the response based on clientSecret availability and subscription status
      if (clientSecret) {
        return new Response(JSON.stringify({
          subscriptionId: subscription.id,
          clientSecret: clientSecret,
          status: finalStatus,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // If no client secret, it means either:
        // 1. The subscription is active/trialing and no immediate payment is needed.
        // 2. There's an issue and a client secret should have been present but wasn't found.
        if (finalStatus === 'active' || finalStatus === 'trialing') {
          console.log('Subscription is active or trialing, no immediate payment intent/client secret needed.');
          return new Response(JSON.stringify({
            subscriptionId: subscription.id,
            status: finalStatus,
            message: 'Subscription created successfully, no immediate payment required.'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // This case should ideally not be reached if the logic is correct,
          // but acts as a fallback for unexpected scenarios.
          throw new Error('Subscription status is incomplete/past_due but no client secret could be retrieved.');
        }
      }
  
    } catch (error) {
      console.error('Error in onRequest function:', error);
      return new Response(JSON.stringify({
        error: 'Failed to process subscription request',
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
