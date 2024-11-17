import React from "react";

const AsphaltShingleInstallation = () => {
  return (
    <div className="container mx-auto px-6 py-16 bg-faint_color">
      <h1 className="text-5xl font-extrabold mb-8 text-center text-dark-below-header">
        Asphalt Shingle Installation
      </h1>
      <p className="text-lg mb-10 text-gray-800 text-justify leading-relaxed">
        Asphalt shingles are the most popular roofing material in the United States due to their affordability, durability, and wide range of styles. Whether you're building a new home or replacing an old roof, asphalt shingle installation is a cost-effective solution that provides long-lasting protection.
      </p>

      {/* First image, slightly offset */}
      <div className="relative mb-12">
        <img
          src="/assets/images/paramount_logo.png"
          alt="Asphalt shingles"
          className="w-full h-auto rounded-lg shadow-lg transform translate-x-6"
        />
      </div>

      <section className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">Why Choose Asphalt Shingles?</h2>
        <ul className="list-disc list-inside text-lg space-y-4">
          <li><strong>Affordability:</strong> Asphalt shingles are one of the most cost-effective roofing materials available, offering excellent protection at a lower price than other options.</li>
          <li><strong>Durability:</strong> When properly installed and maintained, asphalt shingles can last up to 20-30 years, providing reliable protection for your home.</li>
          <li><strong>Variety of Styles and Colors:</strong> Asphalt shingles come in a wide range of colors and styles, allowing you to customize the look of your roof to complement your home’s architecture.</li>
          <li><strong>Weather Resistance:</strong> Asphalt shingles are designed to withstand harsh weather conditions, including rain, wind, snow, and heat.</li>
          <li><strong>Easy Maintenance:</strong> Asphalt shingles are easy to maintain and repair, making them a low-maintenance option for homeowners.</li>
        </ul>
      </section>

      {/* Two-column grid layout for types */}
      <section className="mb-12 bg-gray-50 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">Types of Asphalt Shingles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">Three-Tab Shingles</h3>
            <p className="text-lg text-gray-700">The most basic and affordable option, featuring a flat appearance with cutouts along the bottom edge, providing a uniform look.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">Architectural Shingles</h3>
            <p className="text-lg text-gray-700">These have a more textured, layered appearance. They are thicker and more durable than three-tab shingles, offering better longevity and enhanced curb appeal.</p>
          </div>
        </div>
      </section>

      {/* Steps to install shingles */}
      <section className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">How Roofers Install Asphalt Shingles</h2>
        <ol className="list-decimal list-inside text-lg space-y-4">
          <li><strong>Initial Roof Inspection:</strong> We inspect your roof to assess its condition and determine if any repairs are needed to the roof deck or existing materials.</li>
          <li><strong>Removing Old Roofing Materials:</strong> If you’re replacing an existing roof, we start by removing the old shingles, underlayment, and flashing to ensure a clean surface for the new installation.</li>
          <li><strong>Repairing or Replacing the Roof Deck:</strong> Any damaged or rotted sections of the roof deck are repaired or replaced to ensure a solid foundation.</li>
          <li><strong>Installing Underlayment:</strong> A new underlayment (typically waterproof) is installed over the roof deck to provide additional protection against water penetration.</li>
          <li><strong>Installing Asphalt Shingles:</strong> We begin laying the shingles from the bottom of the roof upwards, carefully aligning and nailing each row in place to ensure a tight seal.</li>
          <li><strong>Installing Flashing and Vents:</strong> Flashing is installed around roof penetrations like chimneys and skylights to prevent leaks.</li>
          <li><strong>Final Inspection:</strong> After installation, we perform a thorough inspection to ensure everything is done to the highest standards.</li>
        </ol>
      </section>

      {/* Benefits Section */}
      <section className="mb-12 bg-gray-50 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">Benefits of Asphalt Shingle Installation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">Cost-Effective</h3>
            <p className="text-lg text-gray-700">Provides great value for the money, offering long-lasting protection at an affordable price.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">Energy Efficiency</h3>
            <p className="text-lg text-gray-700">Many asphalt shingles reflect sunlight, reducing heat absorption and lowering energy bills.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">Easy Repairs</h3>
            <p className="text-lg text-gray-700">Individual shingles can easily be replaced without the need for a full roof replacement.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">Customizable Appearance</h3>
            <p className="text-lg text-gray-700">Available in a variety of styles and colors, asphalt shingles complement any home’s design.</p>
          </div>
        </div>
      </section>

      {/* Final image */}
      <div className="relative mb-12">
        <img
          src="/assets/images/paramount_logo.png"
          alt="Asphalt Shingle Installation"
          className="w-full h-auto rounded-lg shadow-lg transform translate-x-6"
        />
      </div>

      <footer className="text-center mt-8">
        <p className="text-sm text-gray-600">© 2024 Castle Roofing. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AsphaltShingleInstallation;
