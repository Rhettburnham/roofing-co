import React, { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRightCircle } from "lucide-react";

// Tailwind classes that can be reused or modified
const sectionTitleClass =
  "flex justify-center text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-800";
const subTitleClass = "text-gray-600 text-center mx-auto max-w-3xl mb-6";
const baseListClass = "list-none space-y-2 mt-4";
const listItemClass = "flex items-start space-x-2";

const SinglePlySystems = () => {
  // State for selected membrane index
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Hero section shrinking effect
  const [isShrunk, setIsShrunk] = useState(false);

  // Background video ref
  const bgVideoRef = useRef(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Trigger the shrinking animation after 1s
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Handle video autoplay
    if (bgVideoRef.current) {
      bgVideoRef.current.play().catch((error) => {
        console.error("Background video autoplay failed:", error);
      });
    }
  }, []);

  /* --------------------
     Single-Ply Membranes
  -------------------- */
  const singlePlyMembranes = [
    {
      name: "Thermoplastic TPO (Thermoplastic Polyolefin)",
      description:
        "TPO is a single-ply reflective roofing membrane made from polypropylene and ethylene-propylene rubber polymerized together. It stands out for its energy efficiency, UV and heat resistance, and durability—helping reduce cooling costs in hot climates.",
      base: "Composition: Polypropylene & ethylene-propylene rubber.",
      features: `• Energy Efficiency: The white reflective surface reduces heat absorption.
• UV & Heat Resistance: Resists degradation from intense sunlight & high temps.
• Durability: Resistant to punctures, tears, and impact damage.
• Color: Usually white, gray, or tan; some manufacturers offer custom colors.
• Installation Time: Can be installed relatively quickly, depending on roof size & complexity.`,
      uses: "Well-suited for commercial buildings requiring a reflective, energy-efficient system.",
      limitations:
        "Proper installation is crucial; can accumulate dirt affecting reflectivity over time.",
      image: "/assets/images/ply/Tpo.jpg",
    },
    {
      name: "Thermoplastic PVC (Polyvinyl Chloride)",
      description:
        "PVC is a durable single-ply roofing material known for its resistance to chemicals, fire, and environmental factors. It is especially favored for roofs exposed to grease or other chemicals.",
      base: "Composition: Polyvinyl chloride with plasticizers.",
      features: `• Chemical Resistance: Withstands exposure to oils & industrial byproducts.
• Fire Resistance: Inherently fire-resistant composition.
• Durability: Provides excellent tensile strength & longevity.
• Color: Often white or light-colored, enhancing reflective properties.
• Installation Time: Installed at a pace similar to TPO, depending on roof conditions.`,
      uses: "Ideal for commercial roofs with potential chemical exposure or high-heat zones.",
      limitations:
        "Generally more expensive than EPDM; may require specialized installation methods.",
      image: "/assets/images/ply/pvc.jpg",
    },
    {
      name: "EPDM (Ethylene Propylene Diene Monomer)",
      description:
        "EPDM is a synthetic rubber membrane revered for its durability, flexibility, and resistance to extreme weather conditions. It remains flexible in cold temperatures and can last up to 30 years or more with proper maintenance.",
      base: "Composition: Synthetic rubber.",
      features: `• Weather Resistance: Performs well in both extreme heat & cold.
• Flexibility: Adapts to building movement without cracking.
• Longevity: Potential lifespan of 30+ years with proper care.
• Color: Typically black, but white variants are available for greater reflectivity.
• Installation Time: Straightforward to install, reducing labor costs.`,
      uses: "Common in commercial and industrial settings demanding proven, long-term performance.",
      limitations:
        "Black variants can absorb heat; white EPDM can cost more but offers reflectivity benefits.",
      image: "/assets/images/ply/epdm.jpg",
    },
  ];

  // Animation variants for the info card
  const infoVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: "40vh" }}
        animate={{ height: isShrunk ? "20vh" : "40vh" }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
            backgroundAttachment: "fixed",
          }}
        ></div>
        <div className="absolute inset-0 dark-below-header"></div>

        <div className="relative z-10 h-full flex items-center justify-center custom-circle-shadow">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-[8vw] md:text-[8vh] font-extrabold text-white tracking-wider"
          >
            Single Ply
          </motion.h1>
        </div>
      </motion.section>

      {/* Membrane Selection Section */}
      <section className="my-4 px-4 md:px-16">
        <h2 className={sectionTitleClass}>Explore Our Single-Ply Membranes</h2>

        {/* Selection Buttons */}
        <div className="flex flex-wrap justify-center">
          {singlePlyMembranes.map((membrane, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`m-2 px-4 py-2 rounded-full font-semibold shadow-lg ${
                selectedIndex === index
                  ? "dark_button text-white font-semibold shadow-2xl"
                  : "text-black"
              }`}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 0 15px 1px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              {membrane.name.split("(")[0].trim()}
            </button>
          ))}
        </div>

        {/* Selected Membrane Details */}
        <motion.div
          key={selectedIndex}
          className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-4 md:p-6 max-w-5xl mx-auto"
          variants={infoVariants}
          initial="initial"
          animate="animate"
          exit="initial"
        >
          {/* Membrane Description */}
          <h3 className="text-[3.3vw] md:text-2xl font-semibold mb-1 md:mb-2 text-gray-800">
            {singlePlyMembranes[selectedIndex].name}
          </h3>
          <p className="text-[2.6vw] md:text-lg text-gray-700 mb-2 leading-relaxed">
            {singlePlyMembranes[selectedIndex].description}
          </p>


          <div className="grid md:grid-cols-2 gap-4 w-full">
            {/* Left column (Base, Features) */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="text-[3.5vw] md:text-xl font-semibold text-gray-800 mb-2">
                Technical Details
              </h4>
              <div>
                <p className="text-[3vw] md:text-lg text-gray-700 mb-1 md:mb-2">
                  <strong>Base:</strong>{" "}
                  {singlePlyMembranes[selectedIndex].base}
                </p>
                <p className="text-[3vw] md:text-lg text-gray-700 mb-1 md:mb-2">
                  <strong>Features:</strong>
                </p>
                {/* Transform bullet features into a nicer list */}
                <ul className="list-disc list-inside text-gray-700  space-y-1">
                  {singlePlyMembranes[selectedIndex].features
                    .split("•")
                    .filter(Boolean)
                    .map((feat, i) => (
                      <li key={i}>{feat.trim()}</li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Right column (Uses, Limitations) */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">

              {/* Membrane Image */}
              <div className="w-full flex justify-center mb-6">
                <img
                  src={singlePlyMembranes[selectedIndex].image}
                  alt={singlePlyMembranes[selectedIndex].name}
                  className="max-w-md w-full h-auto rounded-lg shadow-md"
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Practical Application
              </h4>
              <p className="text-gray-700 mb-2">
                <strong>Uses:</strong> {singlePlyMembranes[selectedIndex].uses}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Limitations:</strong>{" "}
                {singlePlyMembranes[selectedIndex].limitations}
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      {/* Intro / Advantages Section */}
      <section className="my-8 px-4 md:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
          Overview & Advantages
        </h2>

        <p className={subTitleClass}>
          Single-ply membranes like TPO, PVC, and EPDM have gained popularity for
          commercial and industrial roofs. Below are some reasons why these
          systems may be ideal for your property:
        </p>

        {/* Enhanced Bullet List with icons */}
        <ul className="grid sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {[
            {
              title: "Durability",
              desc: "Resistant to punctures, tears, and impact damage.",
            },
            {
              title: "Flexibility",
              desc: "Accommodate building movements and temperature changes.",
            },
            {
              title: "UV Resistance",
              desc: "Excellent protection from ultraviolet radiation.",
            },
            {
              title: "Energy Efficiency",
              desc: "Reflective options help lower cooling costs.",
            },
            {
              title: "Ease of Installation",
              desc: "Often installed more quickly than multi-layer systems.",
            },
          ].map((adv, i) => (
            <li
              key={i}
              className="flex bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500"
            >
              <CheckCircle className="text-blue-500 w-8 h-8 mr-3" />
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">
                  {adv.title}
                </h4>
                <p className="text-gray-600">{adv.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-center text-gray-600 mt-6 max-w-3xl mx-auto">
          Depending on roof size, complexity, and weather, installation can
          typically be completed in just a few days—often faster than
          traditional, multi-layered systems.
        </p>
      </section>

      {/* CTA Section */}
      <section className="mb-10 relative overflow-hidden px-4 md:px-16 rounded-[40px]">
        {/* Video Container with responsive height */}
        <div className="relative w-full h-[30vh] md:h-[40vh] lg:h-[50vh]">
          {/* Background Video with object-fit cover */}
          <video
            ref={bgVideoRef}
            autoPlay
            loop
            muted
            playsInline
            tabIndex={-1}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-[40px]"
            src="/assets/videos/single_ply.mp4"
            style={{
              pointerEvents: "none",
            }}
          ></video>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 rounded-[40px]"></div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6"
            >
              Ready to Get Started?
            </motion.h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white max-w-2xl mx-auto leading-relaxed">
              Contact us today for a free roof inspection and a personalized plan
              for your commercial property.
            </p>
            <HashLink
              to="/#book"
              className="px-6 py-3 md:px-8 md:py-4 bg-white text-blue-700 font-semibold rounded-full hover:bg-blue-50 transition duration-300 inline-flex items-center"
            >
              Schedule an Inspection
              <ArrowRightCircle className="w-5 h-5 ml-2" />
            </HashLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SinglePlySystems;
