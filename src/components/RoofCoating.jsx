import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";

const sectionTitleClass =
  "flex justify-center text-[3.5vh] font-semibold mb-0.5 text-center";

// Updated roofCoatings data to include image slots
const roofCoatings = [
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
    colorPossibilities:
      "Available in various colors, with light colors enhancing reflectivity.",
    installationTime:
      "Quick drying times allow for efficient application (weather permitting).",
    image: {
      src: "/assets/images/coating/acrylic.webp",
      alt: "Acrylic Coating Application",
      caption: "Application of acrylic roof coating",
    },
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
    image: {
      src: "/assets/images/coating/silicone.jpg",
      alt: "Silicone Coating Installation",
      caption: "Silicone coating being applied to a commercial roof",
    },
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
    image: {
      src: "/assets/images/coating/polyurethane.jpg",
      alt: "Polyurethane Coating Process",
      caption: "Application of polyurethane roof coating",
    },
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
    image: {
      src: "/assets/images/coating/elastomeric.jpg",
      alt: "Elastomeric Coating Application",
      caption: "Elastomeric coating being applied to extend roof life",
    },
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
    image: {
      src: "/assets/images/coating/spf.jpg",
      alt: "SPF Roofing Installation",
      caption: "Spray foam roofing application process",
    },
  },
];

const RoofCoating = () => {
  const [selectedCoatingIndex, setSelectedCoatingIndex] = useState(0);
  const [isShrunk, setIsShrunk] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <motion.section
        className="relative overflow-hidden w-full"
        initial={{ height: "40vh" }}
        animate={{ height: isShrunk ? "20vh" : "40vh" }}
        transition={{ duration: 1 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/api/placeholder/1920/1080')",
            backgroundAttachment: "fixed",
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 dark-below-header" />
        {/* Text Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
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

      {/* TYPES OF ROOF COATINGS SECTION */}
      <section className="my-8 px-4 md:px-16">
        <h2 className={sectionTitleClass}>Types of Roof Coatings</h2>

        {/* Coating Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-1 mb-3 md:mb-6">
          {roofCoatings.map((coating, index) => (
            <button
              key={index}
              onClick={() => setSelectedCoatingIndex(index)}
              className={`mx-2 my-1 md:px-4 px-2 py-1 md:py-2 text-[3vw] md:text-[2vh] rounded-full font-semibold shadow-lg ${
                selectedCoatingIndex === index
                  ? "dark_button text-white font-semibold shadow-2xl"
                  : "bg-gray-200 text-gray-800"
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
              {coating.name}
            </button>
          ))}
        </div>

        {/* Selected Coating Details */}
        <motion.div
          key={selectedCoatingIndex}
          className="bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left Column: Description and Advantages */}
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-[5vw] md:text-2xl font-semibold text-gray-800">
                {roofCoatings[selectedCoatingIndex].name}
              </h3>
              <p className="z-10 text-[3vw] md:text-md text-gray-700">
                {roofCoatings[selectedCoatingIndex].description}
              </p>

              {/* Advantages Section */}
              <div className="relative w-full">
                {/* Dark Overlay */}
                <div className="absolute inset-0 dark-below-header" />
                {/* Text Content */}
                <div className="relative z-10 text-white p-4 rounded">
                  <h4 className="text-sm md:text-xl font-semibold">
                    Advantages:
                  </h4>
                  <ul>
                    {roofCoatings[selectedCoatingIndex].advantages.map(
                      (advantage, i) => (
                        <li key={i} className="flex items-start">
                          <FaCheckCircle className="text-green-600 mt-1 mr-1 md:mr-3 flex-shrink-0 text-sm" />
                          <span className="text-[2.5vw] md:text-base mt-1">
                            {advantage}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-col space-y-4 mt-4">
                <div>
                  <h4 className="text-sm md:text-lg font-semibold text-gray-800">
                    Color Possibilities:
                  </h4>
                  <p className="text-gray-700 text-[2.7vw] md:text-lg">
                    {roofCoatings[selectedCoatingIndex].colorPossibilities}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm md:text-lg font-semibold text-gray-800">
                    Installation Time:
                  </h4>
                  <p className="text-gray-700 text-[2.7vw] md:text-lg">
                    {roofCoatings[selectedCoatingIndex].installationTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="space-y-4">
              <img
                src={roofCoatings[selectedCoatingIndex].image.src}
                alt={roofCoatings[selectedCoatingIndex].image.alt}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <p className="text-sm text-gray-600 text-center">
                {roofCoatings[selectedCoatingIndex].image.caption}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="mb-10 mx-4 md:mx-16 rounded-3xl bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
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
            src="/assets/videos/roof_coating.mp4"
            style={{
              pointerEvents: "none",
            }}
          ></video>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-70 rounded-[40px]"></div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 ">
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6"
            >
              Ready to Get Started?
            </motion.h2>
            <p className="text-lg md:text-xl mb-8 text-white">
              Contact us today for a free roof inspection and personalized repair plan.
            </p>
            <HashLink
              to="/#contact"
              className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition duration-300"
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
