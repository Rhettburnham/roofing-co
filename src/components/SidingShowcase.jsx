import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";

// Common class names
const sectionTitleClass =
  "flex justify-center text-[3.5vh] font-semibold mb-0.5 text-center";

// Data for Siding Options
const sidingOptions = [
  {
    name: "Vinyl Siding",
    description:
      "Vinyl siding is one of the most cost-effective options, typically ranging between $2–$4 per square foot. It requires minimal maintenance and is available in numerous colors and styles—some even mimic wood grain.",
    advantages: [
      "Affordability: One of the most budget-friendly choices",
      "Low Maintenance: Occasional cleaning suffices",
      "Versatility: Many colors and styles, including wood-like textures",
      "Durability: Resistant to rot, insects, and moisture",
    ],
    colorPossibilities:
      "Wide range of both light and dark hues to match diverse exteriors",
    installationTime:
      "Lightweight and easy to install, reducing labor costs and time",
  },
  {
    name: "Wood Siding",
    description:
      "Wood siding offers a timeless, natural look that enhances curb appeal. It also provides good insulation. However, it may require regular maintenance, such as painting or staining, to preserve its appearance.",
    advantages: [
      "Aesthetic Appeal: Classic, natural look",
      "Insulation Properties: Contributes to energy efficiency",
    ],
    colorPossibilities:
      "Can be painted or stained in various colors (but requires periodic maintenance)",
    installationTime:
      "More labor-intensive than vinyl, potentially increasing overall installation time",
  },
  {
    name: "Fiber Cement Siding",
    description:
      "Fiber cement siding is highly durable and low-maintenance—resistant to fire, termites, and rot. It can mimic wood, brick, or stone, offering aesthetic versatility without sacrificing durability.",
    advantages: [
      "Durability: Suitable for a range of climates, resists termites and rot",
      "Low Maintenance: Less upkeep compared to wood",
      "Aesthetic Versatility: Mimics wood, brick, or stone",
    ],
    colorPossibilities:
      "Wide variety of styles and textures to achieve your desired look",
    installationTime:
      "Heavier material; professional installation recommended, which may take longer",
  },
  {
    name: "Metal Siding (Aluminum or Steel)",
    description:
      "Metal siding is extremely durable, resisting fire, rot, and insect damage. It provides a sleek, modern aesthetic, though color may fade under harsh conditions over time.",
    advantages: [
      "Durability: Performs well under various weather conditions",
      "Low Maintenance: Generally requires only occasional cleaning",
      "Modern Aesthetic: Ideal for contemporary or industrial designs",
    ],
    colorPossibilities:
      "Various finishes and colors available, though some may fade over time",
    installationTime:
      "Can be time-consuming, adding to labor costs, especially for complex designs",
  },
  {
    name: "Stucco Siding",
    description:
      "Stucco is a durable option that can last 50 to 80 years with proper maintenance. Its breathability allows moisture to evaporate quickly, making it suitable for many climates. However, it's more labor-intensive to install.",
    advantages: [
      "Durability: Long lifespan with appropriate care",
      "Breathability: Helps moisture evaporate rapidly",
    ],
    colorPossibilities:
      "Available in a wide range of textures and colors to suit various architectural styles",
    installationTime:
      "Labor-intensive process involving multiple layers; requires skilled professionals",
  },
  {
    name: "Engineered Wood Siding",
    description:
      "Engineered wood siding is a cost-effective alternative to natural wood, offering similar visual appeal with increased durability. It resists many of the issues that plague real wood, like insect infestations, and is easier to install.",
    advantages: [
      "Cost-Effective: Generally more affordable than natural wood",
      "Durability: Resistant to insect damage and more stable than real wood",
      "Ease of Installation: Straightforward process favored by many contractors",
    ],
    colorPossibilities:
      "Available in diverse colors and textures to match your desired style",
    installationTime:
      "Installation is relatively quick, potentially reducing labor costs",
  },
  {
    name: "Brick Siding",
    description:
      "Brick siding is known for its longevity—often exceeding a century with minimal maintenance. It offers a timeless look and is fire-resistant, but installation requires skilled masonry, which can be time-consuming.",
    advantages: [
      "Longevity: Can last over 100 years with minimal upkeep",
      "Fire Resistance: Non-combustible material",
      "Aesthetic Appeal: Timeless and classic",
    ],
    colorPossibilities:
      "Limited to natural brick tones unless painted to achieve a different aesthetic",
    installationTime:
      "Labor-intensive due to masonry work, resulting in a longer installation period",
  },
];

const SidingShowcase = () => {
  // State for selected siding
  const [selectedSidingIndex, setSelectedSidingIndex] = useState(0);

  // State for Hero section shrinking effect
  const [isShrunk, setIsShrunk] = useState(false);

  // Ref for video element
  const videoRef = useRef(null);

  // Scroll to top when component mounts
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

  // Handle video autoplay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error);
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
            Siding Options
          </motion.h1>
        </div>
      </motion.section>

      {/* Siding Selection Section */}
      <section className="my-4 px-4 md:px-16">
        <h2 className={sectionTitleClass}>Select a Siding Type</h2>

        {/* Siding Selection Buttons */}
        <div className="flex flex-wrap justify-center">
          {sidingOptions.map((siding, index) => (
            <button
              key={index}
              onClick={() => setSelectedSidingIndex(index)}
              className={`m-2 px-4 py-2 rounded-full shadow-lg transition-colors duration-300 ${
                selectedSidingIndex === index
                  ? "dark_button text-white"
                  : "bg-white text-gray-800 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {siding.name}
            </button>
          ))}
        </div>

        {/* Display Selected Siding Details */}
        <motion.div
          key={selectedSidingIndex}
          className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-6 transition-all duration-500 px-4 md:px-16 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Siding Description */}
          <div className="w-full">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              {sidingOptions[selectedSidingIndex].name}
            </h3>
            <p className="text-gray-700">
              {sidingOptions[selectedSidingIndex].description}
            </p>

            {/* Advantages */}
            <div className="mt-4">
              <h4 className="text-xl font-semibold mb-2 text-gray-800">
                Advantages:
              </h4>
              <ul className="list-none space-y-2 pl-0">
                {sidingOptions[selectedSidingIndex].advantages.map(
                  (advantage, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <FaCheckCircle className="text-green-600 mr-2 mt-[3px]" />
                      <span>{advantage}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Additional Info */}
            <div className="mt-4">
              {sidingOptions[selectedSidingIndex].colorPossibilities && (
                <p className="text-gray-700 mb-2">
                  <strong>Color Possibilities: </strong>
                  {sidingOptions[selectedSidingIndex].colorPossibilities}
                </p>
              )}
              {sidingOptions[selectedSidingIndex].installationTime && (
                <p className="text-gray-700">
                  <strong>Installation Time: </strong>
                  {sidingOptions[selectedSidingIndex].installationTime}
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
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            tabIndex={-1}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-[40px]"
            src="/assets/videos/siding_installation.mp4"
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
              Ready to Upgrade Your Siding?
            </motion.h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white">
              Contact us today for a free consultation on the best siding option
              for your home.
            </p>
            <HashLink
              to="/#contact"
              className="px-6 py-3 md:px-8 md:py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
            >
              Schedule a Consultation
            </HashLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SidingShowcase;