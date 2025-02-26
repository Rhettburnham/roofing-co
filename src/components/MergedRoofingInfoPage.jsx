import React from "react";

const MergedRoofingInfoPage = () => {
  return (
    <div className="bg-white text-gray-800">
      {/* ========== 1. Asphalt Shingle Installation ========== */}
      <section id="asphalt-shingle-installation" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Asphalt Shingle Installation
            </h2>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-5xl font-extrabold mb-8 text-center text-dark-below-header">
          Asphalt Shingle Installation
        </h1>
        <p className="text-lg mb-10 text-justify leading-relaxed">
          Asphalt shingles are the most popular roofing material in the United States
          due to their affordability, durability, and wide range of styles.
          Whether you're building a new home or replacing an old roof, asphalt
          shingle installation is a cost-effective solution that provides
          long-lasting protection.
        </p>

        <div className="relative mb-12 w-full">
          {/* Optional Image Slot */}
          <img
            src="/assets/images/paramount_logo.png"
            alt="Asphalt shingles"
            className="w-full max-w-2xl h-auto rounded-lg shadow-lg mx-auto"
          />
        </div>

        <section className="mb-12 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
            Why Choose Asphalt Shingles?
          </h2>
          <ul className="list-disc list-inside text-lg space-y-4">
            <li>
              <strong>Affordability:</strong> Asphalt shingles are one of the
              most cost-effective roofing materials available, offering excellent
              protection at a lower price than other options.
            </li>
            <li>
              <strong>Durability:</strong> When properly installed and maintained,
              asphalt shingles can last up to 20-30 years.
            </li>
            <li>
              <strong>Variety of Styles and Colors:</strong> Asphalt shingles
              come in many colors and styles, letting you customize your roof’s
              look.
            </li>
            <li>
              <strong>Weather Resistance:</strong> They’re built to withstand
              harsh conditions like rain, wind, snow, and heat.
            </li>
            <li>
              <strong>Easy Maintenance:</strong> They’re relatively easy to
              maintain and repair, making them a low-maintenance choice.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
            Types of Asphalt Shingles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Three-Tab Shingles</h3>
              <p className="text-lg">
                The most basic and affordable option, featuring a flat appearance
                with cutouts along the bottom edge, for a uniform look.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Architectural Shingles</h3>
              <p className="text-lg">
                These have a more textured, layered appearance. They are thicker
                and more durable than three-tab shingles and offer enhanced curb
                appeal.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
            How Roofers Install Asphalt Shingles
          </h2>
          <ol className="list-decimal list-inside text-lg space-y-4">
            <li>
              <strong>Initial Roof Inspection:</strong> We assess the roof’s
              condition to see if any repairs are needed.
            </li>
            <li>
              <strong>Removing Old Materials:</strong> Old shingles, underlayment,
              and flashing are removed to ensure a clean surface.
            </li>
            <li>
              <strong>Repairing/Replacing Roof Deck:</strong> Damaged areas of
              the deck are fixed to provide a solid foundation.
            </li>
            <li>
              <strong>Underlayment Installation:</strong> A waterproof layer is
              applied for extra protection against water infiltration.
            </li>
            <li>
              <strong>Installing Asphalt Shingles:</strong> Shingles are laid from
              the bottom up, nailed carefully to ensure a tight seal.
            </li>
            <li>
              <strong>Flashing and Vents:</strong> Flashing is installed around
              roof penetrations to prevent leaks.
            </li>
            <li>
              <strong>Final Inspection:</strong> We do a thorough check to ensure
              everything meets the highest standards.
            </li>
          </ol>
        </section>

        <section className="mb-12 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
            Benefits of Asphalt Shingle Installation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Cost-Effective</h3>
              <p className="text-lg">
                Great value for the money, offering long-lasting protection at an
                affordable price.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Energy Efficiency</h3>
              <p className="text-lg">
                Many asphalt shingles reflect sunlight, reducing heat absorption
                and lowering energy bills.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Easy Repairs</h3>
              <p className="text-lg">
                Individual shingles can easily be replaced without needing a full
                roof overhaul.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-2">Customizable Appearance</h3>
              <p className="text-lg">
                With many styles and colors, asphalt shingles complement any
                home’s design.
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* ========== 2. Diagnosing Your Roof ========== */}
      <section id="diagnose-roof" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Diagnosing Your Roof
            </h2>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold mb-6">Diagnosing Your Roof</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Signs to Look For</h2>
          <p className="text-lg mb-4">
            Your roof is one of the most important parts of your home. It keeps
            the elements out, provides insulation, and protects your home from
            damage. But like all parts of your home, it needs regular maintenance
            and can wear out over time. Here are key indicators:
          </p>
          <ul className="list-disc list-inside">
            <li>Missing or damaged shingles</li>
            <li>Water stains on ceilings or walls</li>
            <li>Mold or mildew buildup</li>
            <li>Excessive granules in gutters</li>
            <li>Sagging roof areas</li>
            <li>Leaks after rain</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Common Roof Problems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Leaks</h3>
              <p>
                Leaks are one of the most obvious signs of trouble. Check your
                attic or ceilings for water damage.
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Shingle Damage</h3>
              <p>
                Missing, curled, or cracked shingles can allow water infiltration
                and further damage.
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Mold and Mildew</h3>
              <p>
                Growth on your roof may indicate poor ventilation or moisture
                buildup.
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Clogged Gutters</h3>
              <p>
                Debris-filled gutters prevent water drainage and lead to roof
                damage over time.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            When to Call a Professional
          </h2>
          <p className="text-lg mb-4">
            While you can spot some issues on your own, it’s important to know
            when to call in an expert:
          </p>
          <ul className="list-disc list-inside">
            <li>Extensive shingle damage or missing shingles</li>
            <li>Multiple leaks or widespread water damage</li>
            <li>Visible sagging or structural damage</li>
            <li>Signs of rot or mold</li>
          </ul>
        </section>
      </section>

      {/* ========== 3. Water Damage & Leaks ========== */}
      <section id="leaks-water-damage" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Water Damage and Leaks
            </h2>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-4xl font-semibold mb-6 text-center text-dark-below-header">
          Types of Water Damage and Leaks
        </h2>
        <p className="text-center mb-8">
          Learn about the most common leak and water intrusion issues that can
          compromise your roof’s integrity.
        </p>

        {/* Example Water Damage Items (Shortened) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Example of a single card, replicate for your data */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src="/assets/images/water_damage/missing_shingles.webp"
              alt="Roof Leaks from Missing or Damaged Shingles"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center mb-4">
                {/* Example Icon */}
                <span className="text-2xl text-blue-600 mr-2">💧</span>
                <h3 className="text-2xl font-semibold text-gray-800">
                  Missing Shingles
                </h3>
              </div>
              <p>
                <strong>Causes:</strong> Storms, heavy winds, or aging can loosen
                or remove shingles, exposing the underlayment to moisture.
              </p>
              <p className="mt-2">
                <strong>Impact:</strong> Water can seep in, causing stains,
                mold, or wood rot.
              </p>
              <div className="mt-4">
                <strong>Diagnosis:</strong>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Look for missing shingles, especially after storms.</li>
                  <li>
                    Check the attic for water stains, damp insulation, or musty
                    smell.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* ... replicate for more water damage examples */}
        </div>
      </section>

      {/* ========== 4. Mold, Algae, & Rot ========== */}
      <section id="mold-algae-rot" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Mold, Algae, & Rot
            </h2>
          </div>
        </div>

        <h2 className="text-5xl font-bold mb-8 pt-8 text-center">
          Types of Mold, Algae, and Rot Growth
        </h2>
        <p className="text-center mb-8">
          Moisture can lead to various forms of biological growth, each posing
          its own risks to your roof.
        </p>

        {/* Example Single Growth Card */}
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <img
            src="/assets/images/growth/mold_growth.jpg"
            alt="Mold Growth"
            className="w-full md:w-1/3 h-64 object-cover"
          />
          <div className="p-6 md:w-2/3">
            <h3 className="text-2xl font-bold mb-2">Mold Growth</h3>
            <p>
              <strong>Causes:</strong> Moisture accumulation under shingles,
              poor ventilation, or leaks can trigger mold.
            </p>
            <p>
              <strong>Impact:</strong> Mold can cause structural weakening and
              health issues if it spreads into living spaces.
            </p>
            <div>
              <strong>Diagnosis:</strong>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Look for dark or white spots in the attic or on shingles.</li>
                <li>Check for musty odors, especially in the attic.</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Repeat for Algae, Moss, etc. */}
      </section>

      {/* ========== 5. Poor Installation ========== */}
      <section id="poor-installation" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Poor Installation
            </h2>
          </div>
        </div>

        <h2 className="text-5xl font-bold mb-12 text-center">Common Issues</h2>
        <p className="text-center mb-8 max-w-2xl mx-auto">
          A roof is only as good as its installation. Poor workmanship can cause
          numerous problems, from leaks to shingle blow-offs.
        </p>

        {/* Example issue listing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Leaks and Water Damage</h3>
            <p>
              <strong>Causes:</strong> Improper shingle placement or flashing
              can lead to water intrusion.
            </p>
            <p className="mt-2">
              <strong>Impact:</strong> Water seepage can cause mold, rot, and
              compromised structural integrity.
            </p>
          </div>
          {/* ... replicate for each common poor installation issue */}
        </div>
      </section>

      {/* ========== 6. Roof Material Deterioration ========== */}
      <section id="roof-material-deterioration" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Roof Material Deterioration
            </h2>
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-6 text-center">When is Repair Necessary?</h2>
        <p className="text-lg mb-6 text-center">
          Roofs deteriorate with age and exposure to harsh weather. Know the
          signs before it’s too late:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4 rounded-lg shadow-md bg-white">
            <span className="text-6xl text-red-500 mb-4">⚠️</span>
            <h3 className="text-2xl font-semibold mb-2">Visible Leaks</h3>
            <p>Water stains on ceilings or walls indicate compromised roofing.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg shadow-md bg-white">
            <span className="text-6xl text-blue-500 mb-4">🛠️</span>
            <h3 className="text-2xl font-semibold mb-2">Damaged Shingles</h3>
            <p>Missing, cracked, or curling shingles warrant attention.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg shadow-md bg-white">
            <span className="text-6xl text-yellow-500 mb-4">⚠️</span>
            <h3 className="text-2xl font-semibold mb-2">Moss & Algae</h3>
            <p>Trapped moisture accelerates deterioration.</p>
          </div>
        </div>
      </section>

      {/* ========== 7. Roof Maintenance ========== */}
      <section id="roof-maintenance" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Roof Maintenance
            </h2>
          </div>
        </div>

        <h1 className="text-5xl font-extrabold mb-8 text-center text-dark-below-header">
          Roof Maintenance
        </h1>
        <p className="text-lg mb-10 text-justify leading-relaxed">
          Regular roof maintenance is crucial for extending the life of your roof
          and avoiding costly repairs. A well-maintained roof ensures your home
          remains protected from the elements.
        </p>

        <div className="relative mb-12">
          {/* Optional Image */}
          <img
            src="/assets/images/paramount_logo.png"
            alt="Roof maintenance"
            className="w-full max-w-xl h-auto rounded-lg shadow-lg mx-auto"
          />
        </div>

        <section className="mb-12 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
            Why Is Roof Maintenance Important?
          </h2>
          <p className="text-lg leading-relaxed mb-6">
            Roofs endure wear from rain, wind, snow, and UV rays. Over time,
            these factors can cause small issues that grow into major problems if
            ignored.
          </p>
        </section>

        <section className="mb-12 p-8 rounded-lg shadow-md bg-gray-50">
          <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
            How Roofers Perform Roof Maintenance
          </h2>
          <ol className="list-decimal list-inside text-lg space-y-4">
            <li>Visual Inspection</li>
            <li>Cleaning the Roof</li>
            <li>Checking for Leaks</li>
            <li>Inspecting Flashing and Seals</li>
            <li>Gutter Maintenance</li>
            <li>Repairing or Replacing Shingles</li>
            <li>Final Inspection</li>
          </ol>
        </section>

        <section className="mb-12 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-4 text-dark-below-header">
            Roof Maintenance Tips
          </h2>
          <ul className="list-disc list-inside text-lg space-y-4">
            <li>Clean Gutters Regularly</li>
            <li>Trim Overhanging Trees</li>
            <li>Check for Missing or Damaged Shingles</li>
            <li>Inspect Attic Ventilation</li>
            <li>Monitor for Water Stains</li>
          </ul>
        </section>
      </section>

      {/* ========== 8. Shingle Damage (Sagging RoofLine) ========== */}
      <section id="shingle-damage" className="py-16 px-6 md:px-12">
        {/* Header */}
        <div className="relative h-24 mb-8">
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-2xl font-semibold text-white">
              Shingle Damage
            </h2>
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">
          Recognizing Signs of Shingle Damage
        </h2>
        <p className="text-lg mb-10 text-justify leading-relaxed text-center max-w-3xl mx-auto">
          Damaged shingles can lead to serious roofing issues if not addressed
          quickly. Below are some common warning signs.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <li className="flex flex-col md:flex-row items-start bg-white p-4 shadow-md rounded-lg">
            <img
              src="/assets/images/roof-repair/missing_shingles.webp"
              alt="Missing or Broken Shingles"
              className="w-full md:w-40 h-auto rounded-lg mb-4 md:mr-4 object-cover"
            />
            <div>
              <strong className="text-xl">Missing or Broken Shingles</strong>
              <p>
                Exposes underlying structure to weather damage, leading to
                leaks or faster deterioration.
              </p>
            </div>
          </li>
          {/* ... replicate for other shingle damage signs */}
        </ul>
      </section>

      {/* ========== Footer / Conclusion ========== */}
      <footer className="bg-white text-center py-8 mt-8">
        <p className="text-sm text-gray-600">
          © 2024 Castle Roofing. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default MergedRoofingInfoPage;
