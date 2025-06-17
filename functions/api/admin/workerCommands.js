import { createHash } from 'node:crypto';

// Shared CORS helper
function getCorsHeaders(origin) {
  const allowed = [
    'https://roofing-www.pages.dev',
    'https://roofing-co.pages.dev',
    'https://roofing-co-with-workers.pages.dev',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  const acao = allowed.includes(origin) ? origin : allowed[2];
  return {
    'Access-Control-Allow-Origin': acao,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Set-Cookie',
  };
}

export async function onRequest(context) {
  console.log("=== Worker Commands Handler ===");
  
  try {
    const { request, env } = context;
    console.log('Context received:', { 
      hasRequest: !!request,
      hasEnv: !!env,
      hasDB: !!env?.DB,
      hasROOFING_CONFIGS: !!env?.ROOFING_CONFIGS
    });

    const origin = request.headers.get('Origin') || '';
    console.log('Request origin:', origin);
    const cors = getCorsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Verify admin access
    const cookieHeader = request.headers.get('Cookie');
    const sessionId = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('session_id='))
      ?.split('=')[1];
    console.log('Session ID from cookies:', sessionId ? 'Present' : 'Missing');
    
    if (!sessionId) {
      console.log('No session ID found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
        },
      });
    }

    const session = await env.DB.prepare(
      'SELECT s.*, u.config_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_id = ? AND s.expires_at > datetime("now")'
    ).bind(sessionId).first();

    console.log('Session lookup result:', session ? {
      hasConfigId: !!session.config_id,
      configId: session.config_id,
      expiresAt: session.expires_at
    } : 'No session found');

    if (!session || session.config_id !== 'admin') {
      console.log('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse request body
    const { command, email, domain, currentFolder } = await request.json();
    console.log('Request body:', { command, email, domain, currentFolder });

    if (command === 'addDomain') {
      // Verify we're in a folder
      if (!currentFolder) {
        return new Response(JSON.stringify({ 
          error: 'Must be in a folder to add domain',
          details: 'Please navigate into a folder first'
        }), {
          status: 400,
          headers: {
            ...cors,
            'Content-Type': 'application/json',
          },
        });
      }

      // Check if domain entry already exists
      const existingDomain = await env.DB.prepare(
        'SELECT * FROM domains WHERE email = ?'
      ).bind(email).first();

      if (existingDomain) {
        return new Response(JSON.stringify({ 
          error: 'Domain entry already exists',
          details: 'This email already has a domain entry'
        }), {
          status: 400,
          headers: {
            ...cors,
            'Content-Type': 'application/json',
          },
        });
      }

      // Add new domain entry
      await env.DB.prepare(`
        INSERT INTO domains (
          email,
          domain,
          config_id,
          is_active,
          is_paid,
          domain_purchased,
          created_at
        ) VALUES (?, ?, ?, 0, 0, 0, datetime('now'))
      `).bind(email, domain, currentFolder).run();

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Domain entry added successfully'
      }), {
        headers: {
          ...cors,
          'Content-Type': 'application/json',
        },
      });
    }

    if (command === 'editBBBData') {
      const {
        id,
        business_name,
        contact_status,
        email: bbbEmail,
        worker,
        config_id,
        rating,
        number_of_reviews,
        category,
        address,
        state,
        phone,
        operational_hours,
        website,
        google_reviews_link,
        notes,
        timer
      } = await request.json();

      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required field: id'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        // Build dynamic update query based on provided fields
        const updateFields = [];
        const updateValues = [];

        if (business_name !== undefined) {
          updateFields.push('business_name = ?');
          updateValues.push(business_name);
        }
        if (contact_status !== undefined) {
          updateFields.push('contact_status = ?');
          updateValues.push(contact_status);
        }
        if (bbbEmail !== undefined) {
          updateFields.push('email = ?');
          updateValues.push(bbbEmail);
        }
        if (worker !== undefined) {
          updateFields.push('worker = ?');
          updateValues.push(worker);
        }
        if (config_id !== undefined) {
          updateFields.push('config_id = ?');
          updateValues.push(config_id);
        }
        if (rating !== undefined) {
          updateFields.push('rating = ?');
          updateValues.push(rating);
        }
        if (number_of_reviews !== undefined) {
          updateFields.push('number_of_reviews = ?');
          updateValues.push(number_of_reviews);
        }
        if (category !== undefined) {
          updateFields.push('category = ?');
          updateValues.push(category);
        }
        if (address !== undefined) {
          updateFields.push('address = ?');
          updateValues.push(address);
        }
        if (state !== undefined) {
          updateFields.push('state = ?');
          updateValues.push(state);
        }
        if (phone !== undefined) {
          updateFields.push('phone = ?');
          updateValues.push(phone);
        }
        if (operational_hours !== undefined) {
          updateFields.push('operational_hours = ?');
          updateValues.push(operational_hours);
        }
        if (website !== undefined) {
          updateFields.push('website = ?');
          updateValues.push(website);
        }
        if (google_reviews_link !== undefined) {
          updateFields.push('google_reviews_link = ?');
          updateValues.push(google_reviews_link);
        }
        if (notes !== undefined) {
          updateFields.push('notes = ?');
          updateValues.push(notes);
        }
        if (timer !== undefined) {
          updateFields.push('timer = ?');
          updateValues.push(timer);
        }

        if (updateFields.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No fields provided to update'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Add the id to the end of values array for WHERE clause
        updateValues.push(id);

        const updateQuery = `
          UPDATE bbb_data 
          SET ${updateFields.join(', ')} 
          WHERE id = ?
        `;

        console.log('Update query:', updateQuery);
        console.log('Update values:', updateValues);

        const result = await env.DB.prepare(updateQuery).bind(...updateValues).run();

        if (result.changes === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: 'No record found with the provided ID or no changes made'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'BBB data entry updated successfully',
          updatedFields: updateFields.length,
          recordId: id
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error updating BBB data:', error);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to update BBB data entry',
          details: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Unknown command' }), {
      status: 400,
      headers: {
        ...cors,
        'Content-Type': 'application/json',
      },
    });

  } catch (err) {
    console.error('Worker commands error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      type: err.constructor.name
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process worker command',
      details: err.message
    }), {
      status: 500,
      headers: { 
        ...getCorsHeaders('*'),
        'Content-Type': 'application/json'
      },
    });
  }
} 