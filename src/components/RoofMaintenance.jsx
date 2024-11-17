import React from "react";

const RoofMaintenance = () => {
  return (
    <div className="container mx-auto px-6 py-16 bg-gray-50">
      <h1 className="text-5xl font-extrabold mb-8 text-center text-dark-below-header">
        Roof Maintenance
      </h1>
      <p className="text-lg mb-10 text-gray-700 text-justify leading-relaxed">
        Regular roof maintenance is essential for extending the lifespan of your roof and avoiding costly repairs down the line. A well-maintained roof ensures that your home remains protected from the elements and maintains its structural integrity.
      </p>

      {/* Placeholder Image */}
      <div className="relative mb-12">
        <img
          src="/assets/images/paramount_logo.png"
          alt="Roof maintenance"
          className="w-full h-auto rounded-lg shadow-lg transform translate-x-4"
        />
      </div>

      <section className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
          Why Is Roof Maintenance Important?
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Roofs endure wear and tear from various elements, including rain, wind, snow, and UV rays. Over time, these factors can cause damage to shingles, flashing, and other roofing materials. Without proper maintenance, small issues can escalate into major problems, including leaks, structural damage, and mold growth.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Routine maintenance helps to identify and address potential problems before they become serious, saving you time, money, and stress in the long run.
        </p>
      </section>

      {/* Maintenance Steps Section */}
      <section className="mb-12 bg-gray-100 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
          How Roofers Perform Roof Maintenance
        </h2>
        <ol className="list-decimal list-inside text-lg space-y-4">
          <li><strong>Visual Inspection:</strong> Roofers start by visually inspecting the roof to identify obvious signs of damage like missing shingles or damaged flashing.</li>
          <li><strong>Cleaning the Roof:</strong> Removing debris, such as leaves and dirt, is essential to maintain proper water drainage.</li>
          <li><strong>Checking for Leaks:</strong> Areas prone to leaks are inspected, such as around chimneys, skylights, and roof valleys.</li>
          <li><strong>Inspecting Flashing and Seals:</strong> Flashing around vents and chimneys is checked for damage or wear, as this can lead to water infiltration.</li>
          <li><strong>Gutter Maintenance:</strong> Gutters are inspected and cleaned to ensure proper drainage and avoid water pooling.</li>
          <li><strong>Repairing or Replacing Shingles:</strong> Any damaged or missing shingles are repaired or replaced to maintain the roof's protective layer.</li>
          <li><strong>Final Inspection:</strong> After all tasks are completed, the roof is inspected again to ensure it’s in top condition.</li>
        </ol>
      </section>

      {/* Placeholder Image for Maintenance */}
      <div className="relative mb-12">
        <img
          src="/assets/images/paramount_logo.png"
          alt="Roof maintenance process"
          className="w-3/4 h-auto rounded-lg shadow-md mx-auto"
        />
      </div>


      {/* Roof Maintenance Tips Section */}
      <section className="mb-12 bg-gray-100 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
          Roof Maintenance Tips for Homeowners
        </h2>
        <ul className="list-disc list-inside text-lg space-y-4">
          <li><strong>Clean Gutters Regularly:</strong> Ensure your gutters are clear of leaves and debris to prevent water damage.</li>
          <li><strong>Trim Overhanging Trees:</strong> Keep tree branches away from the roof to avoid damage from falling limbs or debris buildup.</li>
          <li><strong>Check for Missing or Damaged Shingles:</strong> Inspect your roof after a storm for any missing or damaged shingles.</li>
          <li><strong>Inspect Attic Ventilation:</strong> Ensure that your attic is well-ventilated to avoid moisture buildup and damage.</li>
          <li><strong>Monitor for Water Stains:</strong> Keep an eye on your ceiling for signs of leaks and address them immediately.</li>
        </ul>
      </section>

      {/* Final Call to Action */}
      <section className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
          Benefits of Regular Roof Maintenance
        </h2>
        <ul className="list-disc list-inside text-lg space-y-4">
          <li><strong>Extending Roof Lifespan:</strong> Routine maintenance addresses small issues before they become costly repairs.</li>
          <li><strong>Saving Money on Repairs:</strong> Preventing major problems helps you avoid expensive repairs or replacements.</li>
          <li><strong>Improved Energy Efficiency:</strong> A well-maintained roof helps to insulate your home, reducing energy costs.</li>
          <li><strong>Increased Home Value:</strong> A properly maintained roof adds to your home's value and enhances its curb appeal.</li>
        </ul>
      </section>

      {/* Placeholder for Final Image */}
      <div className="relative mb-12">
        <img
          src="/assets/images/paramount_logo.png"
          alt="Well-maintained roof"
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>

      <footer className="text-center mt-8">
        <p className="text-sm text-gray-600">© 2024 Castle Roofing. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RoofMaintenance;
