import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";

const sectionTitleClass = "flex justify-center text-[5vw] md:text-[3.5vh] font-semibold mb-0.5 text-center";

const roofingOptions = [
  {
    name: "Built-Up Roofing (BUR)",
    description: "BUR is a traditional roofing system made of multiple layers of bitumen and reinforcing fabrics. The resulting membrane is known for excellent waterproofing and durability, making it a popular choice for flat or low-slope roofs.",
    advantages: [
      "Durability: Lifespans of 15–30+ years with proper maintenance",
      "Waterproofing: Multi-layer design effectively prevents leaks",
      "UV Resistance: Top layer (gravel/mineral) protects against sun damage",
      "Low Maintenance: Requires minimal upkeep over time",
    ],
    colorPossibilities: [
      "Typically gravel or mineral-surfaced finish in neutral tones. Reflective coatings can be applied for enhanced energy efficiency",
    ],
    installationTime: "Can be labor-intensive, taking several days to weeks depending on roof size and complexity",
    images: [
      {
        src: "/assets/images/builtup/builtupdemo.avif",
        alt: "BUR Installation Process",
        caption: "Step-by-step BUR installation showing multiple layers",
        additionalInfo: {
          title: "Color Possibilities:",
          content: "Typically gravel or mineral-surfaced finish in neutral tones. Reflective coatings can be applied for enhanced energy efficiency",
        },
      },
      {
        src: "/assets/images/builtup/builtuproofing2.jpg",
        alt: "Completed BUR System",
        caption: "Finished BUR system with gravel surface",
        additionalInfo: {
          title: "Installation Time:",
          content: "Can be labor-intensive, taking several days to weeks depending on roof size and complexity",
        },
      },
    ],
  },
  {
    name: "Modified Bitumen Roofing",
    description: "Modified Bitumen improves upon the BUR concept by adding polymers to bitumen, increasing elasticity, weather resistance, and lifespan. Often installed in rolled sheets, it can be torch-applied, cold-adhesive, or self-adhering.",
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
    installationTime: "Usually installed in 1–3 days, depending on roof size and chosen application method",
    images: [
      {
        src: "/assets/images/builtup/modified1.jpg",
        alt: "Modified Bitumen Installation",
        caption: "Torch-down application of modified bitumen",
        additionalInfo: {
          title: "Color Possibilities:",
          content: "Available in multiple colors and finishes (including shingle-like options)",
        },
      },
      {
        src: "/assets/images/builtup/modified2.avif",
        alt: "Modified Bitumen Finish",
        caption: "Completed modified bitumen roof with reflective coating",
        additionalInfo: {
          title: "Installation Time:",
          content: "Usually installed in 1–3 days, depending on roof size and chosen application method",
        },
      },
    ],
  },
];


const BuiltUpRoofing = () => {
  const [selectedRoofIndex, setSelectedRoofIndex] = useState(0);
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const selectedRoof = roofingOptions[selectedRoofIndex];

  return (
    <div className="w-full">
      {/* Header Section */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: "40vh" }}
        animate={{ height: isShrunk ? "20vh" : "40vh" }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "", // Add your background image URL here if needed
            backgroundAttachment: "fixed",
          }}
        />
        <div className="absolute inset-0 dark-below-header" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-6xl md:text-7xl font-extrabold text-white tracking-wider"
          >
            Built-Up Roofing
          </motion.h1>
        </div>
      </motion.section>

      {/* Main Content Section */}
      <section className="py-6 px-[6vw] md:px-[10vw]">
        <h2 className={sectionTitleClass}>Choose Your Flat Roofing Option</h2>

        {/* Roofing Options Buttons */}
        <div className="flex flex-wrap justify-center gap-2 ">
          {roofingOptions.map((roof, index) => (
            <button
              key={index}
              onClick={() => setSelectedRoofIndex(index)}
              className={`mx-2 my-1 md:px-4 px-2 py-1 md:py-2 text-[3vw] md:text-[2vh] rounded-full font-semibold shadow-lg ${
                selectedRoofIndex === index
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
              {roof.name}
            </button>
          ))}
        </div>

        {/* Selected Roofing Option Details */}
        <motion.div
          key={selectedRoofIndex}
          className="bg-white rounded-2xl shadow-lg p-3 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1">
            {/* Roofing Option Description */}
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-[5.5vw] md:text-2xl font-semibold text-gray-800 mb-1">
                {selectedRoof.name}
              </h3>
              <p className="text-[2.9vw] md:text-xl text-center  text-gray-700">
                {selectedRoof.description}
              </p>

              {/* Advantages List */}
              <div>
                <h4 className="text-[3.5vw] md:text-2xl font-semibold  text-gray-800">
                  Advantages:
                </h4>
                <ul className="space-y-2">
                  {selectedRoof.advantages.map((advantage, i) => (
                    <li key={i} className="flex items-start text-[2.6vw] md:text-lg">
                      <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Images with Additional Captions */}
            <div className="flex flex-row justify-around mt-3 flex-wrap">
              {selectedRoof.images.map((image, index) => (
                <div key={index} className="space-y-2 w-1/2 px-2">
                  {/* Additional Caption */}
                  <div className="  rounded-lg">
                    <h4 className="w-full text-left text-[3.5vw] md:text-xl font-semibold text-gray-800">
                      {image.additionalInfo.title}
                    </h4>
                    <p className="text-black text-[2.7vw] md:text-xl">
                      {image.additionalInfo.content}
                    </p>
                  </div>

                  {/* Image */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className=" w-full h-[30vw] md:h-[35vh] object-cover rounded-lg shadow-md mt-2 relative justify-center"
                  />

                  {/* Image Caption */}
                  <p className="text-[2vw] md:text-sm text-gray-600 text-left">
                    {image.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action Section */}
      <section className="mb-10 mx-4 md:mx-16 rounded-3xl bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
        <div className="py-16 px-16 text-center text-white">
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Ready to Upgrade Your Flat Roof?
          </motion.h2>
          <p className="text-lg md:text-xl mb-8">
            Get in touch for a free consultation. Let us help you choose the best flat roofing solution for your property.
          </p>
          <HashLink
            to="/#contact"
            className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition duration-300"
          >
            Schedule a Consultation
          </HashLink>
        </div>
      </section>
    </div>
  );
};

export default BuiltUpRoofing;
