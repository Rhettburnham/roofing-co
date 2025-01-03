import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { FaTools, FaFan, FaPaintRoller, FaTint, FaCheckCircle } from "react-icons/fa";
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

// Updated data for Roof Coatings
const roofCoatings = [
  {
    name: "Cool Roofing",
    description:
      "Cool roofing solutions are designed to reflect more sunlight and absorb less heat, thereby enhancing building energy efficiency and reducing cooling costs. They can help mitigate the urban heat island effect and provide a more comfortable indoor environment. Cool roofing coatings are available in various colors, typically light shades, to maximize reflectivity.",
    advantages: [
      "Reduced cooling costs by reflecting sunlight and heat",
      "Lower rooftop temperatures, mitigating urban heat island effects",
      "Quick and straightforward installation for most roof sizes",
    ],
    colorPossibilities: "Generally light or white shades for maximum reflectivity.",
    installationTime:
      "Installation time varies by roof size and condition but is generally fast.",
  },
  {
    name: "Acrylic Coatings",
    description:
      "Acrylic coatings are water-based and cost-effective, known for their reflectivity and UV resistance. They are suitable for a variety of climates but may not perform as well in areas with ponding water.",
    advantages: [
      "Cost-Effective: Generally more affordable than other options",
      "Reflectivity: Good reflective properties to help reduce heat absorption",
      "Ease of Application: Easy to apply and quick drying time",
      "Versatility: Adheres to metal, asphalt, single-ply membranes, etc.",
      "UV Resistance: Helps prevent premature degradation from sun exposure",
    ],
    colorPossibilities: "Available in various colors, with light colors enhancing reflectivity.",
    installationTime:
      "Quick drying times allow for efficient application (weather permitting).",
  },
  {
    name: "Silicone Coatings",
    description:
      "Silicone coatings are highly reflective and excellent for roofs with ponding water issues, offering superior UV stability and weather resistance. They are particularly effective in extreme temperatures and are resistant to mold and mildew.",
    advantages: [
      "Exceptional Water Resistance: Ideal for flat roofs with ponding water",
      "UV Stability: Prevents degradation from continuous sun exposure",
      "Durability: Withstand extreme temperatures and resist mold & mildew",
    ],
    colorPossibilities: "Typically white or light colors to maximize reflectivity.",
    installationTime:
      "Straightforward application; curing times vary with humidity and temperature.",
  },
  {
    name: "Polyurethane Coatings",
    description:
      "Polyurethane coatings are known for their durability and resistance to impact and foot traffic, suitable for areas with high mechanical stress. They come in aromatic (less UV stable) and aliphatic (more UV stable) formulations.",
    advantages: [
      "High Durability: Resistant to impact and mechanical damage",
      "Flexibility: Adaptable to temperature fluctuations without cracking",
      "Chemical Resistance: Suitable for industrial applications",
    ],
    colorPossibilities: "A wide range available; aliphatic versions retain color better.",
    installationTime:
      "Requires careful application; curing depends on formulation and environment.",
  },
  {
    name: "Elastomeric Coatings",
    description:
      "Elastomeric coatings are flexible and can expand and contract with the roof surface, providing a durable, weather-resistant seal. They are often used to extend the life of existing roofs and are an excellent choice for variable climates.",
    advantages: [
      "Flexibility: Accommodates structural movement without cracking",
      "Weather Resistance: Protects against a range of environmental conditions",
      "Longevity: Extends the lifespan of existing roofing systems",
    ],
    colorPossibilities:
      "Typically available in white and pastel colors to enhance reflectivity.",
    installationTime:
      "Relatively quick application; sufficient drying time is needed for optimal performance.",
  },
  {
    name: "Commercial Foam Roofing (SPF)",
    description:
      "Commercial Foam Roofing (Spray Polyurethane Foam - SPF) involves spraying a foam material that expands into a solid, seamless layer across an existing roof. This provides excellent insulation and waterproofing.",
    advantages: [
      "Seamless Application: Minimizes the likelihood of leaks",
      "High Insulation: Superior R-value per inch for enhanced energy efficiency",
      "Lightweight: Adds minimal weight to existing structures",
    ],
    colorPossibilities:
      "Foam is typically covered with a protective coating in various colors for UV resistance and aesthetics.",
    installationTime:
      "Rapid installation, but foam and protective coatings require proper curing.",
  },
];

const RoofCoating = () => {
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

  // Ref for background video to control playback if needed
  const bgVideoRef = useRef(null);

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

  // Optionally, handle autoplay for background video with proper attributes
  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.play().catch((error) => {
        // Handle autoplay errors, possibly due to browser restrictions
        console.error("Background video autoplay failed:", error);
      });
    }
  }, []);

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
            Roof Coating
          </motion.h1>
        </div>
      </motion.section>

      {/* Roof Coatings Selection Section */}
      <section className="my-4 px-4 md:px-16">
        <h2 className={sectionTitleClass}>Types of Roof Coatings</h2>

        {/* Coating Selection Buttons */}
        <div className="flex flex-wrap justify-center">
          {roofCoatings.map((coating, index) => (
            <button
              key={index}
              onClick={() => setSelectedCoatingIndex(index)}
              className={`m-2 px-4 py-2 rounded-full shadow-lg transition-colors duration-300 ${
                selectedCoatingIndex === index
                  ? "dark_button text-white"
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
          className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-6 transition-all duration-500 px-4 md:px-16 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

            {/* Advantages List */}
            <div className="mt-4">
              <h4 className="text-xl font-semibold mb-2 text-gray-800">
                Advantages:
              </h4>
              <ul className="list-none space-y-2 pl-0">
                {roofCoatings[selectedCoatingIndex].advantages.map(
                  (advantage, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <FaCheckCircle className="text-green-600 mr-2 mt-[4px]" />
                      <span>{advantage}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Additional Info */}
            <div className="mt-4">
              {roofCoatings[selectedCoatingIndex].colorPossibilities && (
                <p className="text-gray-700 mb-2">
                  <strong>Color Possibilities: </strong>
                  {roofCoatings[selectedCoatingIndex].colorPossibilities}
                </p>
              )}
              {roofCoatings[selectedCoatingIndex].installationTime && (
                <p className="text-gray-700">
                  <strong>Installation Time: </strong>
                  {roofCoatings[selectedCoatingIndex].installationTime}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="mb-10 relative overflow-hidden faint-color mx-4 md:mx-16 rounded-[40px]">
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
            src="/assets/videos/roof_coating.mp4"
            style={{
              pointerEvents: "none",
            }}
          ></video>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-50 rounded-[40px]"></div>

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
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white">
              Contact us today for a free roof inspection and personalized repair plan.
            </p>
            <HashLink
              to="/#book"
              className="px-6 py-3 md:px-8 md:py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
            >
              Schedule an Inspection
            </HashLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoofCoating;
