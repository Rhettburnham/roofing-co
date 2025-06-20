import { createHash } from 'node:crypto';

export async function onRequest(context) {
  try {
    console.log("=== Request Password Reset Handler ===");
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight requests
    if (context.request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (context.request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const { email } = await context.request.json();
    console.log('Password reset request for:', email);
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if email exists in database
    const user = await context.env.DB.prepare(
      'SELECT id, email FROM users WHERE email = ?'
    ).bind(email).first();

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Generate secure reset token
      const resetToken = crypto.randomUUID();
      const tokenHash = createHash('sha256').update(resetToken).digest('hex');
      
      // Store reset token with 1 hour expiration
      await context.env.DB.prepare(
        'INSERT OR REPLACE INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, datetime("now", "+1 hour"))'
      ).bind(user.id, tokenHash).run();

      // Send reset email via SendGrid
      if (context.env.SENDGRID_API_KEY) {
        const resetUrl = `${getBaseUrl(context.request)}/reset-password?token=${resetToken}`;
        
        const emailContent = {
          personalizations: [
            {
              to: [{ email: user.email }],
              subject: 'Password Reset Request'
            }
          ],
          from: { email: 'info@cowboy-vaqueros.com' },
          content: [
            {
              type: 'text/plain',
              value: `
Password Reset Request

You requested a password reset for your account. Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.
              `
            },
            {
              type: 'text/html',
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #333;">Password Reset Request</h2>
                  
                  <p>You requested a password reset for your account.</p>
                  
                  <div style="margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                      Reset Your Password
                    </a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    This link will expire in 1 hour.
                  </p>
                  
                  <p style="color: #666; font-size: 14px;">
                    If you did not request this password reset, please ignore this email.
                  </p>
                  
                  <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    ${resetUrl}
                  </p>
                </div>
              `
            }
          ]
        };

        try {
          const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${context.env.SENDGRID_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailContent),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('SendGrid API error:', response.status, errorText);
            throw new Error(`SendGrid API error: ${response.status}`);
          }

          console.log('Password reset email sent successfully');
        } catch (error) {
          console.error('Error sending password reset email:', error);
          // Don't fail the request if email fails - user won't know the difference
        }
      }
    }

    // Always return success
    return new Response(JSON.stringify({ 
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process password reset request' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
} 