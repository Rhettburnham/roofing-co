export async function onRequestPost(context) {
  const { request, env } = context;
  console.log('Booking request received');

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // Get the origin URL from the request headers
    const originUrl = request.headers.get('origin') || 'Unknown Origin';
    console.log('Booking request received from:', originUrl);

    // Parse the request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    const { firstName, lastName, email, phone, service, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !service) {
      console.log('Missing required fields:', { firstName, lastName, email, phone, service });
      return new Response(JSON.stringify({
        success: false,
        message: "Missing required fields"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Check if SendGrid API key is available
    if (!env.SENDGRID_API_KEY) {
      console.error('SendGrid API key is not set in environment variables');
      throw new Error('SendGrid API key is not configured');
    }

    // Determine recipient email based on origin
    let primaryRecipient;
    if (originUrl.includes('cowboy-vaqueros.com')) {
      primaryRecipient = 'devinstuddard@gmail.com';
    } else if (originUrl.includes('roofing-co.pages.dev')) {
      primaryRecipient = 'tiredthoughtles@gmail.com';
    } else {
      // Default recipient for any other domains
      primaryRecipient = 'devinstuddard@gmail.com';
    }

    console.log('Sending email to:', primaryRecipient, 'and vmpatton@gmail.com');

    // Construct email content
    const emailContent = {
      personalizations: [
        {
          to: [{ email: primaryRecipient }],
          subject: `New Booking Request: ${service}`
        },
        {
          to: [{ email: 'vmpatton@gmail.com' }],
          subject: `New Booking Request: ${service}`
        }
      ],
      from: { email: 'info@cowboy-vaqueros.com' },
      content: [
        {
          type: 'text/plain',
          value: `
New Booking Request

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Service: ${service}
Message: ${message || "No message provided"}
Submitted from: ${originUrl}

This booking request was submitted from your website.
Please respond to the client via email or phone. CC if necessary.
          `
        },
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">New Booking Request</h2>
              
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Message:</strong> ${message || "No message provided"}</p>
              <p><strong>Submitted from:</strong> ${originUrl}</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">This booking request was submitted from your website.</p>
              <p style="color: #666; font-size: 14px;">Please respond to the client via email or phone. CC if necessary.</p>
            </div>
          `
        }
      ]
    };

    console.log('Sending email to SendGrid...');
    // Send email using SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        requestBody: emailContent
      });
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }

    console.log('Email sent successfully');
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: "Booking submitted successfully"
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    return new Response(JSON.stringify({
      success: false,
      message: "Server error",
      error: error.message || "Unknown error"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
} 