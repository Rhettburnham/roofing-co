import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';

// Import icons from lucide-react (replace or remove as needed)
import { Wrench, ClipboardCheck, Layers, Trash2 } from "lucide-react";

const MetalRoofs = () => {
  /* --------------------
    State & Lifecycle
  -------------------- */
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // After 1.5s, shrink the hero section
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  /* --------------------
    Scrollable Metal Types
  -------------------- */
  const containerRef = useRef(null);

  // Example images/types (Replace with your actual metal roofing images & labels)
  const metalBoxes = [
    { img: "/assets/images/metal_roof/m1.png", type: "Galvanized Steel" },
    { img: "/assets/images/metal_roof/m2.png", type: "Aluminum" },
    { img: "/assets/images/metal_roof/m3.png", type: "Copper" },
    { img: "/assets/images/metal_roof/m4.png", type: "Standing Seam" },
    { img: "/assets/images/metal_roof/m5.png", type: "Metal Type 5" },
    { img: "/assets/images/metal_roof/m6.png", type: "Metal Type 6" },
    { img: "/assets/images/metal_roof/m7.png", type: "Metal Type 7" },
    { img: "/assets/images/metal_roof/m8.png", type: "Metal Type 8" },
    { img: "/assets/images/metal_roof/m9.png", type: "Metal Type 9" },
    { img: "/assets/images/metal_roof/m10.png", type: "Metal Type 10" },
  ];

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -containerRef.current.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: containerRef.current.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  };

  /* --------------------
    Steps Data
  -------------------- */
  const steps = [
    {
      number: '1',
      title: 'Inspection & Measurements',
      description:
        'We begin by inspecting your roof’s structural integrity, measuring for precise panel lengths, and identifying any areas that need repair before installation.',
      icon: <Wrench className="text-blue-600 w-8 h-8" />,
      image: '/assets/images/metal_roof/step1.jpg',
    },
    {
      number: '2',
      title: 'Underlayment & Prep Work',
      description:
        'A high-quality underlayment is crucial for metal roofs. We ensure the surface is smooth and free of debris, then install the underlayment to protect against moisture.',
      icon: <Layers className="text-blue-600 w-8 h-8" />,
      image: '/assets/images/metal_roof/step2.jpg',
    },
    {
      number: '3',
      title: 'Panel Installation & Seaming',
      description:
        'Next, we carefully place and fasten metal panels, ensuring tight seams and proper flashing around edges and penetrations for a watertight seal.',
      icon: <ClipboardCheck className="text-blue-600 w-8 h-8" />,
      image: '/assets/images/metal_roof/step3.jpg',
    },
    {
      number: '4',
      title: 'Final Inspection & Cleanup',
      description:
        'Once installation is complete, we conduct a thorough inspection, check for any loose fasteners or gaps, and perform a full cleanup so your property looks immaculate.',
      icon: <Trash2 className="text-blue-600 w-8 h-8" />,
      image: '/assets/images/metal_roof/step4.jpg',
    },
  ];

  /* --------------------
    Framer Motion Variants
  -------------------- */
  // Container & item variants for the pop-in animation
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // Stagger each child step by 0.2s
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  /* --------------------
    Render
  -------------------- */
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
            className="text-center text-[10vw] md:text-[8vh] font-extrabold text-white tracking-wider"
          >
            Metal Roof
          </motion.h1>
        </div>
      </motion.section>

      {/* Metal Roofing Types (Scrollable) */}
      <section className="my-4 px-[6vw] md:px-[10vw]">
        <h2 className="text-[4vw] md:text-3xl font-bold text-center text-gray-800 mb-4">
          Explore Our Metal Roofing Options
        </h2>
        <div className="relative m-5">
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-full z-10"
            aria-label="Scroll Left"
          >
            &lt;
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-full z-10"
            aria-label="Scroll Right"
          >
            &gt;
          </button>

          <div
            className="overflow-hidden whitespace-nowrap"
            ref={containerRef}
            style={{ position: 'relative' }}
          >
            {metalBoxes.map((box, index) => (
              <div key={index} className="inline-block relative m-2 sm:m-4">
                <img
                  src={box.img}
                  alt={`Metal Roof ${index + 1}`}
                  className="metal-img"
                />
                <p className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {box.type}
                </p>
              </div>
            ))}
          </div>

          {/* Hide scrollbar (optional) */}
          <style jsx>{`
            .scrollbar-thin::-webkit-scrollbar {
              height: 0; /* Hide scrollbar */
            }
            .metal-img {
              width: 200px; /* Adjust as needed */
              height: 120px; /* Adjust as needed */
              object-fit: cover;
              border-radius: 8px;
            }
          `}</style>
        </div>
      </section>

      {/* CTA BUTTON */}
      <div className="flex justify-center m-6">
        <HashLink
          to="/#book"
          className="px=4 py-2 md:px-8 md:py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
        >
          Schedule an Inspection
        </HashLink>
      </div>

      {/* Steps Section */}
      <section className="mb-12 px-[6vw] md:px-[10vw]">
        <h2 className="text-[4vw] md:text-4xl font-bold text-gray-800 mb-8">
          Our Metal Roof Installation Process
        </h2>

        {/* Container for steps (staggered pop-in) */}
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col md:flex-row items-center md:items-start md:space-x-6"
              variants={itemVariants}
            >
              {/* Step Image */}
              <img
                src={step.image}
                alt={step.title}
                className="w-full md:w-1/3 h-auto object-cover rounded-md shadow-md mb-4 md:mb-0"
              />

              {/* Step Text & Icon */}
              <div className="md:w-2/3">
                <div className="flex items-center space-x-2 mb-2">
                  {/* Step Number */}
                  <div className="text[6vw] md:text-2xl font-bold text-blue-600">
                    {step.number}
                </div>
                <p className="text[2vw] md:text-2xl font-semibold text-gray-700 ">
                  {step.title}
                </p>
              </div>
                <p className="md:text-base text-sm text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default MetalRoofs;
