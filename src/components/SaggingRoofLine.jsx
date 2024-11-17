import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { HashLink } from "react-router-hash-link";

const SaggingRoofLine = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    // Trigger the shrinking animation after 1 second
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, []);

  const listItemRefs = useRef([]);

  useEffect(() => {
    // GSAP staggered slide-in animation from the left
    gsap.fromTo(
      listItemRefs.current,
      { x: -300, opacity: 0 }, // Start from -300px left and opacity 0
      { x: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" } // Slide to x=0, opacity=1
    );
  }, []);

  return (
    <div className="w-full">
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
            <h1>Shingle Damage</h1>
          </motion.h1>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-2 bg-gray-50 pb-16 rounded-t-md">
        {/* Introduction */}
        <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">
          Recognizing Signs of Shingle Damage
        </h2>
        <p className="text-lg mb-10 text-gray-700 leading-relaxed text-center">
          Damaged shingles can lead to serious roofing issues if not addressed promptly. Here are common signs that indicate your shingles may need repair or replacement:
        </p>

        {/* Signs of Shingle Damage */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <li
            ref={(el) => (listItemRefs.current[0] = el)}
            className="flex md:flex-row flex-col items-center bg-white p-4 shadow-md rounded-lg"
          >
            <img
              src="/assets/images/roof-repair/missing_shingles.webp"
              alt="Missing or Broken Shingles"
              className="w-32 h-32 rounded-lg md:mr-4 mb-4 md:mb-0"
            />
            <div className="text-center md:text-left">
              <strong className="text-xl">Missing or Broken Shingles:</strong>
              <p className="text-gray-700">
                Gaps on your roof where shingles are missing can expose the underlying structure to weather damage.
              </p>
            </div>
          </li>
          <li
            ref={(el) => (listItemRefs.current[1] = el)}
            className="flex md:flex-row flex-col items-center bg-white p-4 shadow-md rounded-lg"
          >
            <img
              src="/assets/images/signs_of_sag/rafter_warp.jpg"
              alt="Curling or Buckling Shingles"
              className="w-32 h-32 rounded-lg md:mr-4 mb-4 md:mb-0"
            />
            <div className="text-center md:text-left">
              <strong className="text-xl">Curling or Buckling Shingles:</strong>
              <p className="text-gray-700">
                Shingles that are curling or buckling can allow water to seep underneath, leading to leaks.
              </p>
            </div>
          </li>
          <li
            ref={(el) => (listItemRefs.current[2] = el)}
            className="flex md:flex-row flex-col items-center bg-white p-4 shadow-md rounded-lg"
          >
            <img
              src="/assets/images/roof-repair/granules_in_gutters.webp"
              alt="Granules in Gutters"
              className="w-32 h-32 rounded-lg md:mr-4 mb-4 md:mb-0"
            />
            <div className="text-center md:text-left">
              <strong className="text-xl">Granules in Gutters:</strong>
              <p className="text-gray-700">
                Finding shingle granules in your gutters indicates that your shingles are deteriorating.
              </p>
            </div>
          </li>
          <li
            ref={(el) => (listItemRefs.current[3] = el)}
            className="flex md:flex-row flex-col items-center bg-white p-4 shadow-md rounded-lg"
          >
            <img
              src="/assets/images/roof-repair/cracked_shingles.webp"
              alt="Cracked Shingles"
              className="w-32 h-32 rounded-lg md:mr-4 mb-4 md:mb-0"
            />
            <div className="text-center md:text-left">
              <strong className="text-xl">Cracked Shingles:</strong>
              <p className="text-gray-700">
                Cracks can occur due to wind damage or aging, compromising the shingle's ability to protect your roof.
              </p>
            </div>
          </li>
          <li
            ref={(el) => (listItemRefs.current[4] = el)}
            className="flex md:flex-row flex-col items-center bg-white p-4 shadow-md rounded-lg"
          >
            <img
              src="/assets/images/roof-repair/moss_algae.webp"
              alt="Moss or Algae Growth"
              className="w-32 h-32 rounded-lg md:mr-4 mb-4 md:mb-0"
            />
            <div className="text-center md:text-left">
              <strong className="text-xl">Moss or Algae Growth:</strong>
              <p className="text-gray-700">
                Excessive growth can retain moisture, leading to shingle deterioration.
              </p>
            </div>
          </li>
          <li
            ref={(el) => (listItemRefs.current[5] = el)}
            className="flex md:flex-row flex-col items-center bg-white p-4 shadow-md rounded-lg"
          >
            <img
              src="/assets/images/roof-repair/sagging_roof_line.webp"
              alt="Sagging Roof Line"
              className="w-32 h-32 rounded-lg md:mr-4 mb-4 md:mb-0"
            />
            <div className="text-center md:text-left">
              <strong className="text-xl">Sagging Roof Line:</strong>
              <p className="text-gray-700">
                A sagging roof can indicate structural issues possibly related to damaged shingles allowing water ingress.
              </p>
            </div>
          </li>
        </ul>

        {/* Image Section */}
        <div className="mt-16 flex justify-center">
          <img
            src="/assets/images/roof-repair/shingle-vinyl.webp"
            alt="Roof Shingle Damage"
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </div>

        {/* Schedule Inspection Button */}
        <div className="flex justify-center mt-10">
          <HashLink
            to="/#book"
            className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
          >
            Schedule an Inspection
          </HashLink>
        </div>
      </div>
    </div>
  );
};

export default SaggingRoofLine;
