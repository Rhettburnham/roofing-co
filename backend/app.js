const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !service) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Construct email content with HTML formatting
    const msg = {
      to: 'rhettburnham64@gmail.com', // Recipient email
      from: 'rhettburnham@gmail.com', // Verified sender email in SendGrid
      subject: `New Booking Request: ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Booking Request</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:${phone}">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${service}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Message:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${message || "No message provided"}</td>
            </tr>
          </table>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This booking request was submitted from your website.</p>
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

This booking request was submitted from your website.
      `
    };

    // Send email using SendGrid
    await sgMail.send(msg);
    
    // Log success and return response
    console.log('Booking email sent successfully');
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

