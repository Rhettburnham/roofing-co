import React from "react";

const LegalAgreement = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">
        Legal Agreement & Terms of Service
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. General Terms</h2>
        <p className="mb-4">
          Welcome to our website. By accessing and using our services, you
          accept and agree to be bound by the terms and provisions of this
          agreement. Additionally, when using our particular services, you shall
          be subject to any posted guidelines or rules applicable to such
          services.
        </p>
        <p className="mb-4">
          All content included on this site, such as text, graphics, logos,
          images, and software, is the property of the Company or its content
          suppliers and protected by United States and international copyright
          laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Roofing Services and Warranty
        </h2>
        <p className="mb-4">
          Our company provides residential and commercial roofing services
          including repairs, replacements, and maintenance. All workmanship is
          warranted for a period specified in your individual contract,
          typically ranging from 5 to 25 years depending on the service
          provided.
        </p>
        <p className="mb-4">
          Material warranties are provided by the manufacturer and vary by
          product. Warranty coverage may be void if repairs or modifications are
          made by anyone other than our authorized contractors.
        </p>
        <p className="mb-4">
          Regular maintenance is required to maintain warranty coverage. Annual
          inspections are recommended to ensure your roof remains in optimal
          condition.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. Building Codes and Permits
        </h2>
        <p className="mb-4">
          All roofing work performed by our company complies with local building
          codes and regulations. We obtain necessary permits for all major
          roofing projects as required by local municipalities.
        </p>
        <p className="mb-4">
          Homeowners and property managers are responsible for disclosing any
          known building code violations or structural issues before work
          begins. Our company reserves the right to modify quoted work to ensure
          compliance with building codes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          4. Insurance and Liability
        </h2>
        <p className="mb-4">
          Our company maintains comprehensive liability insurance and workers'
          compensation for all employees and subcontractors. Certificates of
          insurance are available upon request.
        </p>
        <p className="mb-4">
          Property owners are responsible for maintaining their own property
          insurance during roofing projects. We recommend notifying your
          insurance provider before major roofing work begins.
        </p>
        <p className="mb-4">
          Our company is not liable for damage to interior furnishings,
          landscaping, or other property damages not directly caused by our
          negligence. Reasonable precautions should be taken by property owners
          to protect sensitive items during construction.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
        <p className="mb-4">
          Payment schedules are outlined in each individual contract. Typically,
          a deposit is required before work begins, with remaining payments due
          upon completion of specified milestones or completion of the project.
        </p>
        <p className="mb-4">
          Late payments may incur additional fees as specified in your contract.
          We reserve the right to file a mechanic's lien on the property if
          payment is not received according to the agreed-upon schedule.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Cancellation Policy</h2>
        <p className="mb-4">
          Contracts may be cancelled within 3 business days of signing without
          penalty. Cancellations after this period may result in forfeiture of
          any deposits or payments for materials already ordered.
        </p>
        <p className="mb-4">
          Weather-related delays do not constitute grounds for contract
          cancellation. Our company will make reasonable efforts to complete
          projects in a timely manner, accounting for seasonal and weather
          constraints.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Dispute Resolution</h2>
        <p className="mb-4">
          Any disputes arising from our services shall first be addressed
          through direct negotiation. If a resolution cannot be reached,
          disputes will be resolved through binding arbitration in accordance
          with the rules of the American Arbitration Association.
        </p>
        <p className="mb-4">
          The laws of the state where services are performed shall govern all
          aspects of our agreement without giving effect to any principles of
          conflicts of law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          8. Environmental Responsibility
        </h2>
        <p className="mb-4">
          Our company is committed to environmentally responsible disposal of
          roofing materials. We recycle materials when possible and dispose of
          non-recyclable materials in accordance with local regulations.
        </p>
        <p className="mb-4">
          We offer energy-efficient roofing options that may qualify for local
          or federal tax incentives. Customers are responsible for determining
          their eligibility for such incentives.
        </p>
      </section>

      <footer className="text-center text-sm text-gray-600 mt-12 border-t pt-4">
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-2">
          This legal agreement is for informational purposes only and does not
          constitute legal advice. For specific legal questions, please consult
          with an attorney.
        </p>
      </footer>
    </div>
  );
};

export default LegalAgreement;
