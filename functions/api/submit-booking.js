export async function onRequestPost(context) {
  const { request, env } = context;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
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
    const { firstName, lastName, email, phone, service, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !service) {
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

    // Construct email content
    const emailContent = {
      personalizations: [
        {
          to: [
            { email: 'devinstuddard@gmail.com' },
            { email: 'tiredthoughtles@gmail.com' }
          ],
          subject: `New Booking Request: ${service}`
        }
      ],
      from: { email: 'info@cowboy-vaqueros.com' },
      content: [
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
        },
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
        }
      ]
    };

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
      throw new Error(`SendGrid API error: ${response.status}`);
    }

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