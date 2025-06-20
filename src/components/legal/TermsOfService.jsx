import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-sm text-gray-600 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you and 
            LinkWare LLC ("Company," "we," "our," or "us") regarding your use of our website 
            customization services. By accessing or using our services, you agree to be bound by 
            these Terms and our Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Service Description</h2>
          <p>
            LinkWare LLC provides custom website design and development services through monthly 
            subscription plans. Our services include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Custom website design and development</li>
            <li>Content management and updates</li>
            <li>Hosting and technical maintenance</li>
            <li>Customer support and assistance</li>
            <li>Domain management (where applicable)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Account Registration and Eligibility</h2>
          <p>To use our services, you must:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Be at least 18 years old or have legal capacity to enter contracts</li>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Use our services for lawful business purposes only</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Subscription and Payment Terms</h2>
          
          <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Payment Processing</h3>
          <p>
            Payments are processed securely through Stripe under the business name "Linked." 
            By subscribing, you authorize us to charge your payment method for monthly subscription fees, 
            setup fees (if applicable), and applicable taxes.
          </p>

          <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Automatic Renewal</h3>
          <p>
            Subscriptions automatically renew monthly unless cancelled. You may cancel your 
            subscription at any time through your account dashboard or by contacting support.
          </p>

          <h3 className="text-xl font-medium text-gray-700 mb-3">4.3 Refunds</h3>
          <p>
            Subscription fees are generally non-refundable. We may provide refunds at our discretion 
            for service interruptions or other exceptional circumstances.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Intellectual Property Rights</h2>
          <p>
            You retain ownership of your content. We retain rights to our platform and technology. 
            Custom designs become your property upon full payment, but we may use general design 
            concepts in future work.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. User Responsibilities</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use our services for illegal purposes</li>
            <li>Upload malicious content or code</li>
            <li>Violate others' intellectual property rights</li>
            <li>Attempt unauthorized access to our systems</li>
            <li>Resell our services without permission</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Service Availability</h2>
          <p>
            We strive to maintain high uptime but cannot guarantee uninterrupted service. 
            We reserve the right to modify or discontinue services with reasonable notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Termination</h2>
          <p>
            Either party may terminate the agreement. Upon termination, access to services will cease, 
            and data may be deleted after a reasonable retention period.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitation of Liability</h2>
          <p>
            Our services are provided "as is" without warranties. Our total liability shall not exceed 
            the amount paid for services in the preceding 12 months. We are not liable for indirect 
            or consequential damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Governing Law</h2>
          <p>
            These Terms are governed by applicable state and federal laws. Disputes shall be resolved 
            through binding arbitration.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Information</h2>
          <p>
            For questions about these Terms, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <p><strong>LinkWare LLC</strong></p>
            <p>Email: legal@linkware.com</p>
            <p>Email: support@linkware.com</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService; 