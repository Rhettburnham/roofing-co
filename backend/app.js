const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables
const sgMail = require('@sendgrid/mail');

// Get SendGrid API key from environment
const sendgridApiKey = process.env.SENDGRID_API_KEY || process.env.CLOUDFLARE_SENDGRID_API_KEY;
if (!sendgridApiKey) {
  console.error('SendGrid API key not found in environment variables');
  process.exit(1);
}

// Initialize SendGrid with your API key
sgMail.setApiKey(sendgridApiKey);

const app = express();

// Allow all CORS origins
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Endpoint to handle booking form submissions
 * 
 * This endpoint:
 * 1. Receives booking data from the frontend form
 * 2. Validates required fields
 * 3. Constructs an email with the booking details
 * 4. Sends the email using SendGrid
 * 5. Returns a success or error response
 */
app.post("/submit-booking", async (req, res) => {
  try {
    // Extract form data from request body
    const { firstName, lastName, email, phone, service, message } = req.body;
    
    // Get the origin URL from the request headers
    const originUrl = req.headers.origin || 'Unknown Origin';
    console.log('Booking request received from:', originUrl);
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !service) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Construct email content with HTML formatting
    const msg = {
      to: 'devinstuddard@gmail.com', // Recipient email
      from: 'info@cowboy-vaqueros.com', // Verified sender email in SendGrid
      subject: `New Booking Request: ${service}`,
      html: `
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
      `,
      // Also include plain text version for email clients that don't support HTML
      text: `
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
    };

    // Send first email
    await sgMail.send(msg);
    
    // Send second email to rhettburnham64@gmail.com
    const secondMsg = {
      ...msg,
      to: 'tiredthoughtles@gmail.com',
    };
    await sgMail.send(secondMsg);
    
    // Log success and return response
    console.log('Booking emails sent successfully');
    res.status(200).json({
      success: true,
      message: "Booking submitted successfully"
    });
  } catch (error) {
    // Log error details and return error response
    console.error('Error submitting booking:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message || "Unknown error"
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using SendGrid for email delivery`);
});

