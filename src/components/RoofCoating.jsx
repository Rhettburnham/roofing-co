import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { FaTools, FaFan, FaPaintRoller, FaTint } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";

// Common class names
const iconClass = "mb-2 drop-shadow"; // Reduced margin-bottom
const sectionTitleClass =
  "flex justify-center text-[3.5vh] font-semibold mb-0.5 text-center"; // Optional reduced margin-bottom

// Combined data array with individual colors
const services = [
  {
    icon: FaTools,
    title: "Shingle Installation",
    link: "/shingleinstallation",
    color: "#7c7c7c",
  },
  {
    icon: FaFan,
    title: "Ventilation",
    link: "/ventilation",
    color: "#a2c7bf",
  },
  {
    icon: FaPaintRoller,
    title: "Roof Coating",
    link: "/roofcoating",
    color: "#aabbb7",
  },
  {
    icon: FaTint,
    title: "Gutter Options",
    link: "/gutterrelated",
    color: "#64d9c0",
  },
  // Additional services can be added here
];

// Data for Roof Coatings with updated information and no images
const roofCoatings = [
  {
    name: "Acrylic Roof Coating",
    description:
      "Enhance your roof's longevity with our eco-friendly, water-based acrylic coating. Ideal for sloped roofs, it offers superior UV protection, high reflectivity, and cost-effective performance, keeping your property cooler and energy-efficient.",
    base: "Water-based.",
    features: "Highly reflective, UV-resistant, and cost-effective.",
    uses: "Best for sloped roofs and areas with mild weather.",
    limitations: "Not ideal for areas with ponding water.",
  },
  {
    name: "Silicone Roof Coating",
    description:
      "Say goodbye to leaks with our durable silicone coating. Perfect for flat roofs, it excels in waterproofing and UV resistance, making it the best choice for areas with ponding water or extreme weather conditions.",
    base: "Solvent-based.",
    features: "Highly water-resistant and excellent UV stability.",
    uses: "Ideal for flat roofs in rainy or extreme climates.",
    limitations: "Can accumulate dirt, reducing reflectivity over time.",
  },
  {
    name: "Polyurethane Roof Coating",
    description:
      "Protect your roof from heavy wear and tear with our impact-resistant polyurethane coating. Designed for durability, it’s ideal for high-traffic areas or metal roofs that face harsh weather.",
    base: "Solvent-based (aromatic or aliphatic).",
    features: "High durability and resistance to impacts and foot traffic.",
    uses: "Great for flat roofs and metal roofs.",
    limitations: "Higher cost compared to other coatings.",
  },
  {
    name: "Asphaltic Roof Coating",
    description:
      "Revitalize your aging roof with our asphalt-based coating. Affordable and reliable, it provides excellent repair and protection for built-up roofs (BUR) and modified bitumen systems.",
    base: "Asphalt or bitumen, sometimes with aluminum additives for reflectivity.",
    features:
      "Affordable, durable, and effective for asphalt-based roofing systems.",
    uses: "Best for older BUR and modified bitumen systems.",
    limitations:
      "Less reflective and less environmentally friendly compared to other options.",
  },
];

const Packages = () => {
  // Animation variants for services
  const itemVariants = {
    hidden: { scale: 0.7, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "ease",
        duration: 0.5,
      },
    },
  };

  // State for selected roof coating
  const [selectedCoatingIndex, setSelectedCoatingIndex] = useState(0);

  // State for Hero section shrinking effect
  const [isShrunk, setIsShrunk] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Trigger the shrinking animation after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, []);

  return (
    <div className="w-full ">
      {/* Hero Section with Shrinking Effect */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: "100vh" }} // Initial state (full height)
        animate={{ height: isShrunk ? "20vh" : "100vh" }} // Transition to 20vh after the delay
        transition={{ duration: 1 }} // Animation duration
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
            backgroundAttachment: "fixed",
          }}
        ></div>
        <div className="absolute inset-0 dark-below-header "></div>

        {/* Flexbox for centering text vertically */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-6xl font-extrabold text-white tracking-wider custom-text-shadow-mini"
          >
            Roof Coating
          </motion.h1>
        </div>
      </motion.section>

      {/* Roof Coatings Selection Section */}
      <section className="my-4 ">
        <h2 className={sectionTitleClass}>Types of Roof Coatings</h2>

        {/* Coating Selection Buttons */}
        <div className="flex flex-wrap justify-center ">
          {roofCoatings.map((coating, index) => (
            <button
              key={index}
              onClick={() => setSelectedCoatingIndex(index)}
              className={`m-2 px-4 py-2 rounded-full shadow-lg transition-colors duration-300 ${
                selectedCoatingIndex === index
                  ? "dark_button  text-white"
                  : "bg-white text-gray-800 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {coating.name}
            </button>
          ))}
        </div>

        {/* Display Selected Coating Details */}
        <motion.div
          key={selectedCoatingIndex}
          className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-6 transition-all duration-500 mx-16"
          transition={{ duration: 0.5 }}
        >
          {/* Coating Description */}
          <div className="w-full">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              {roofCoatings[selectedCoatingIndex].name}
            </h3>
            <p className="text-gray-700">
              {roofCoatings[selectedCoatingIndex].description}
            </p>
            <ul className="mt-4 text-gray-700 list-disc list-inside">
              <li>
                <strong>Base:</strong> {roofCoatings[selectedCoatingIndex].base}
              </li>
              <li>
                <strong>Features:</strong>{" "}
                {roofCoatings[selectedCoatingIndex].features}
              </li>
              <li>
                <strong>Uses:</strong> {roofCoatings[selectedCoatingIndex].uses}
              </li>
              <li>
                <strong>Limitations:</strong>{" "}
                {roofCoatings[selectedCoatingIndex].limitations}
              </li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="mb-10 relative overflow-hidden faint-color mx-16">
        <div className="absolute inset-0 rounded-[40px]">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
            src="/assets/videos/roof_coating.mp4"
          ></video>
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 text-center py-24 px-4">
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Get Started?
          </motion.h2>
          <p className="text-lg md:text-xl mb-8 text-white">
            Contact us today for a free roof inspection and personalized repair
            plan.
          </p>
          <HashLink
            to="/#book"
            className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
          >
            Schedule an Inspection
          </HashLink>
        </div>
      </section>
    </div>
  );
};

export default Packages;
