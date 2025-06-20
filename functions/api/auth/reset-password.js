import { createHash } from 'node:crypto';

export async function onRequest(context) {
  try {
    console.log("=== Reset Password Handler ===");
    
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

    const { token, newPassword } = await context.request.json();
    console.log('Password reset attempt with token:', token ? 'present' : 'missing');
    
    if (!token || !newPassword) {
      return new Response(JSON.stringify({ error: 'Token and new password are required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Hash the token to compare with stored hash
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    // Find valid reset token
    const resetRecord = await context.env.DB.prepare(
      `SELECT rt.user_id, rt.expires_at, u.email 
       FROM password_reset_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.token_hash = ? AND rt.expires_at > datetime("now")`
    ).bind(tokenHash).first();

    if (!resetRecord) {
      return new Response(JSON.stringify({ error: 'Invalid or expired reset token' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    console.log('Valid reset token found for user:', resetRecord.email);

    // Hash the new password
    const newPasswordHash = hashPassword(newPassword);
    
    // Update user's password
    await context.env.DB.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).bind(newPasswordHash, resetRecord.user_id).run();

    // Delete the used reset token
    await context.env.DB.prepare(
      'DELETE FROM password_reset_tokens WHERE user_id = ?'
    ).bind(resetRecord.user_id).run();

    console.log('Password reset successful for user:', resetRecord.email);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(JSON.stringify({ error: 'Failed to reset password' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
} 