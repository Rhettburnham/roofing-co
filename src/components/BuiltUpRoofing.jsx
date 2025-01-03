import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";

// Common class names
const sectionTitleClass =
  "flex justify-center text-[3.5vh] font-semibold mb-0.5 text-center";

// Data for Built-Up and Modified Bitumen Roofing
const roofingOptions = [
  {
    name: "Built-Up Roofing (BUR)",
    description:
      "BUR is a traditional roofing system made of multiple layers of bitumen and reinforcing fabrics. The resulting membrane is known for excellent waterproofing and durability, making it a popular choice for flat or low-slope roofs.",
    advantages: [
      "Durability: Lifespans of 15–30+ years with proper maintenance",
      "Waterproofing: Multi-layer design effectively prevents leaks",
      "UV Resistance: Top layer (gravel/mineral) protects against sun damage",
      "Low Maintenance: Requires minimal upkeep over time",
    ],
    colorPossibilities: [
      "Typically gravel or mineral-surfaced finish in neutral tones",
      "Reflective coatings can be applied for enhanced energy efficiency",
    ],
    installationTime:
      "Can be labor-intensive, taking several days to weeks depending on roof size and complexity",
  },
  {
    name: "Modified Bitumen Roofing",
    description:
      "Modified Bitumen improves upon the BUR concept by adding polymers to bitumen, increasing elasticity, weather resistance, and lifespan. Often installed in rolled sheets, it can be torch-applied, cold-adhesive, or self-adhering.",
    advantages: [
      "Enhanced Durability: Polymers protect against extreme weather and punctures",
      "Flexibility: Adapts to temperature changes without cracking",
      "Ease of Installation: Quicker than BUR, with various application methods",
      "Energy Efficiency: Some membranes feature reflective coatings",
    ],
    colorPossibilities: [
      "Available in multiple colors and finishes (including shingle-like options)",
      "Reflective coatings can help lower cooling costs",
    ],
    installationTime:
      "Usually installed in 1–3 days, depending on roof size and chosen application method",
  },
];

const BuiltUpRoofing = () => {
  // State for selected roofing
  const [selectedRoofIndex, setSelectedRoofIndex] = useState(0);

  // State for Hero section shrinking effect
  const [isShrunk, setIsShrunk] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Trigger the shrinking animation after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section with Shrinking Effect */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: "40vh" }} // Initial height
        animate={{ height: isShrunk ? "20vh" : "40vh" }} // Shrinks after 1s
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            // Replace with a relevant flat-roofing image
            backgroundImage: "url('/assets/images/flat_roof/flat_roof_hero.jpg')",
            backgroundAttachment: "fixed",
          }}
        ></div>
        <div className="absolute inset-0 dark-below-header"></div>

        {/* Centered Hero Text */}
        <div className="relative z-10 h-full flex items-center justify-center custom-circle-shadow">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-[8vw] md:text-[8vh] font-extrabold text-white tracking-wider"
          >
            Built-Up Roofing
          </motion.h1>
        </div>
      </motion.section>

      {/* Roofing Selection Section */}
      <section className="my-4 px-4 md:px-16">
        <h2 className={sectionTitleClass}>Choose Your Flat Roofing Option</h2>

        {/* Selection Buttons */}
        <div className="flex flex-wrap justify-center">
          {roofingOptions.map((roof, index) => (
            <button
              key={index}
              onClick={() => setSelectedRoofIndex(index)}
              className={`m-2 px-4 py-2 rounded-full shadow-lg transition-colors duration-300 ${
                selectedRoofIndex === index
                  ? "dark_button text-white"
                  : "bg-white text-gray-800 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {roof.name}
            </button>
          ))}
        </div>

        {/* Display Selected Roofing Details */}
        <motion.div
          key={selectedRoofIndex}
          className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-6 transition-all duration-500 mx-4 md:mx-16 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title / Description */}
          <div className="w-full">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              {roofingOptions[selectedRoofIndex].name}
            </h3>
            <p className="text-gray-700">{roofingOptions[selectedRoofIndex].description}</p>


            {/* Advantages */}
            <div className="mt-4">
              <h4 className="text-xl font-semibold mb-2 text-gray-800">
                Advantages:
              </h4>
              <ul className="list-none space-y-2 pl-0">
                {roofingOptions[selectedRoofIndex].advantages.map(
                  (advantage, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <FaCheckCircle className="text-green-600 mr-2 mt-[4px]" />
                      <span>{advantage}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Color Possibilities */}
            {roofingOptions[selectedRoofIndex].colorPossibilities &&
              roofingOptions[selectedRoofIndex].colorPossibilities.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Color Possibilities: </strong>
                    {roofingOptions[selectedRoofIndex].colorPossibilities.join(
                      " | "
                    )}
                  </p>
                </div>
              )}

            {/* Installation Time */}
            {roofingOptions[selectedRoofIndex].installationTime && (
              <p className="text-gray-700 mt-2">
                <strong>Installation Time: </strong>
                {roofingOptions[selectedRoofIndex].installationTime}
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* Call to Action (No Video) */}
      <section className="mb-10 relative overflow-hidden faint-color mx-4 md:mx-16 rounded-[40px] bg-gradient-to-r from-gray-600 via-gray-700 to-gray-900">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50 rounded-[40px]"></div>

        {/* Content */}
        <div className="relative z-10 text-center py-24 px-4">
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Upgrade Your Flat Roof?
          </motion.h2>
          <p className="text-lg md:text-xl mb-8 text-white">
            Get in touch for a free consultation. Let us help you choose the
            best flat roofing solution for your property.
          </p>
          <HashLink
            to="/#contact"
            className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
          >
            Schedule a Consultation
          </HashLink>
        </div>
      </section>
    </div>
  );
};

export default BuiltUpRoofing;
