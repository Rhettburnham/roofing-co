import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-600 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
          <p>
            LinkWare LLC ("we," "our," or "us") operates a website customization service that provides 
            businesses with personalized websites through monthly subscriptions. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you visit our 
            website or use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Personal Information</h3>
          <p>We may collect the following personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and contact information (email address, phone number)</li>
            <li>Business information (business name, address, industry)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Account credentials (email and encrypted password)</li>
            <li>Website customization preferences and content</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar tracking technologies</li>
            <li>Log files and server data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing and maintaining our website customization services</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Communicating with you about your account and services</li>
            <li>Customizing and improving our services</li>
            <li>Sending marketing communications (with your consent)</li>
            <li>Complying with legal obligations</li>
            <li>Protecting against fraud and security threats</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Information Sharing and Disclosure</h2>
          <p>We may share your information in the following circumstances:</p>
          
          <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Service Providers</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Stripe:</strong> Payment processing and subscription management</li>
            <li><strong>SendGrid:</strong> Email communications and notifications</li>
            <li><strong>Cloudflare:</strong> Website hosting and security services</li>
            <li><strong>Google Maps:</strong> Location and mapping services</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Legal Requirements</h3>
          <p>We may disclose your information if required by law or to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Comply with legal processes or government requests</li>
            <li>Protect our rights, property, or safety</li>
            <li>Prevent fraud or security threats</li>
            <li>Enforce our Terms of Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Secure password hashing and storage</li>
            <li>Regular security audits and monitoring</li>
            <li>Access controls and authentication measures</li>
            <li>PCI DSS compliant payment processing through Stripe</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience and analyze usage patterns. 
            You can control cookie settings through your browser preferences. Some features may not 
            function properly if cookies are disabled.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and 
            comply with legal obligations. Account data is typically retained for the duration of your 
            subscription and for a reasonable period thereafter for business and legal purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your personal information</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
            <li>Withdrawal of consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us at privacy@linkware.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If we become aware that we have 
            collected such information, we will take steps to delete it promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data in accordance with 
            applicable laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material 
            changes by posting the new Privacy Policy on this page and updating the effective date. 
            Your continued use of our services constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <p><strong>LinkWare LLC</strong></p>
            <p>Email: privacy@linkware.com</p>
            <p>Email: support@linkware.com</p>
          </div>
        </section>
      </div>
    </div>
  );
} 