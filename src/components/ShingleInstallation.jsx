import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';

// Import icons from lucide-react
import { Wrench, ClipboardCheck, Layers, Trash2 } from "lucide-react";

// Example child components (ensure these are correctly implemented)
import ShinglesAsphalt from './ShinglesAsphalt';
import ShinglesSlate from './ShinglesSlate';
import ShinglesTile from './ShinglesTile';
import ShinglesMetal from './ShinglesMetal';

const ShingleInstallation = () => {
  const [isShrunk, setIsShrunk] = useState(false);
  const [selectedShingleIndex, setSelectedShingleIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const shingleOptions = [
    {
      title: 'Asphalt Shingles',
      description: 'Asphalt shingles are the most popular and affordable roofing material. They come in a variety of colors and styles and provide good durability and weather resistance.',
      benefit: 'Cost-effective and easy to install, making them ideal for most residential properties.',
      component: <ShinglesAsphalt />,
    },
    {
      title: 'Metal Shingles',
      description: 'Metal shingles offer superior durability and can withstand harsh weather conditions, including heavy rain, snow, and wind. Available in various finishes, they provide a modern look.',
      benefit: 'Long-lasting and energy-efficient, with a lifespan of 40-70 years.',
      component: <ShinglesMetal />,
    },
    {
      title: 'Slate Shingles',
      description: 'Slate shingles are a premium roofing option known for their natural beauty and exceptional durability. They offer a unique, classic look and can last over a century with proper care.',
      benefit: 'Highly durable and adds significant curb appeal, perfect for high-end homes.',
      component: <ShinglesSlate />,
    },
    {
      title: 'Tile Shingles',
      description: 'Tile shingles, often made of clay or concrete, are a great option for homeowners seeking a Mediterranean or Spanish-style roof. They provide excellent durability and insulation.',
      benefit: 'Resistant to fire, rot, and insects, and offers great thermal performance.',
      component: <ShinglesTile />,
    },
  ];

  // Steps with icons and updated image paths
  const steps = [
    {
      number: '1',
      title: 'Roof Inspection & Preparation',
      description:
        "Before installation, we perform a comprehensive roof inspection to ensure the structure is sound and free from damage. If necessary, we'll repair or replace any damaged areas to provide a solid foundation for your new shingles.",
      icon: <Wrench className="text-blue-600 w-8 h-8" />,
      image: 'assets/images/shingleinstallation/inspection.jpg',
    },
    {
      number: '2',
      title: 'Underlayment Installation',
      description:
        "We install a high-quality underlayment as the first layer of protection against moisture, wind, and other environmental factors. This helps keep your roof watertight and durable.",
      icon: <Layers className="text-blue-600 w-8 h-8" />,
      image: 'assets/images/shingleinstallation/underlayment.jpg',
    },
    {
      number: '3',
      title: 'Shingle Placement',
      description:
        "Our expert roofing technicians carefully place and secure the shingles, ensuring each one is properly aligned and fastened. We follow manufacturer guidelines to guarantee the best possible performance and longevity.",
      icon: <ClipboardCheck className="text-blue-600 w-8 h-8" />,
      image: 'assets/images/shingleinstallation/placement.jpg',
    },
    {
      number: '4',
      title: 'Final Inspection & Cleanup',
      description:
        "After the installation is complete, we conduct a final inspection to ensure everything is in perfect condition. We also perform a thorough cleanup, leaving your property spotless.",
      icon: <Trash2 className="text-blue-600 w-8 h-8" />,
      image: 'assets/images/shingleinstallation/finalinspection.jpg',
    },
  ];

  // Container & item variants for the pop-in animation
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  return (
    <div className="w-full">
      {/* Hero Section that shrinks */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: '100vh' }}
        animate={{ height: isShrunk ? '20vh' : '100vh' }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
            backgroundAttachment: 'fixed',
          }}
        ></div>
        <div className="absolute inset-0 dark-below-header"></div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-[8vw] md:text-[8vh] font-extrabold text-white tracking-wider drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
          >
            Shingle Installation
          </motion.h1>
        </div>
      </motion.section>

      <div className=" bg-gradient-to-t from-faint-color to-white ">
        {/* SHINGLE OPTIONS SECTION */}
        <section className="my-4 px-[6vw] md:px-[10vw] ">
          <h2 className="text-[4vw] md:text-3xl font-bold text-center text-gray-800 pb-2">
            Explore Our Shingle Options
          </h2>

          {/* Shingle Selection Buttons */}
          <div className="flex flex-wrap justify-center">
            {shingleOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedShingleIndex(index)}
                className={`mx-2 my-1 md:px-4 px-2 py-1 md:py-2 text-[3vw] md:text-[2vh] rounded-full font-semibold shadow-lg ${
                  selectedShingleIndex === index
                    ? 'dark_button text-white font-semibold shadow-2xl'
                    : 'text-black'
                }`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                }}
              >
                {option.title}
              </button>
            ))}
          </div>

          {/* Display Selected Shingle Details */}
          <motion.div
            key={selectedShingleIndex}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-[5vw] md:text-2xl font-semibold text-gray-800 mb-4">
              {shingleOptions[selectedShingleIndex].title}
            </h3>
            <div className=" mt-2 md:mt-6">
              {shingleOptions[selectedShingleIndex].component}
            </div>
            <p className="text-[3.5vw] md:text-base text-gray-600 mt-2 md:mt-4">
              {shingleOptions[selectedShingleIndex].description}
            </p>
            <p className="text-[3.5vw] md:text-base mt-2 md:mt-4 text-blue-500 font-semibold">
              {shingleOptions[selectedShingleIndex].benefit}
            </p>
          </motion.div>
        </section>

        {/* CTA BUTTON */}
        <div className="flex justify-center m-6">
          <HashLink
            to="/#book"
            className="px-4 md:px-8 py-2 md:py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "inset 0 0 15px 1px rgba(0,0,0,0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
            }}
          >
            Schedule an Inspection
          </HashLink>
        </div>

        {/* STEPS SECTION WITH POP-IN ANIMATION & HORIZONTAL LAYOUT */}
        <section className="pb-6">
          <div className="relative h-16 ">
            <div
              className="absolute inset-0 bg-cover bg-center "
              style={{
                backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
                backgroundAttachment: 'fixed',
              }}
            ></div>
            <div className="absolute inset-0 dark-below-header opacity-70"></div>
            <div className="relative z-10 h-full flex items-center justify-center">
              <h2 className="text-2xl font-semibold text-white">Our Installation Process</h2>
            </div>
          </div>

          {/* Container for steps (staggered pop-in) */}
          <motion.div
            className="space-y-8 px-[10vw] md:px-[10vw] pt-6"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col md:flex-row items-center md:items-start md:space-x-10 "
                variants={itemVariants}
              >
                {/* Step Image */}
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full  object-cover rounded-md shadow-md mb-2 md:mb-0 h-[22vh]"
                />

                {/* Step Text & Icon */}
                <div className="md:w-2/3">
                  <div className="flex items-center space-x-2 mb-2">
                    {/* Step Number */}
                    <div className="text-lg md:text-2xl font-bold text-gray-700">
                      {step.number}
                    </div>
                    {/* Step Icon */}
                    {/* {step.icon} */}
                    <h3 className="text-lg md:text-2xl font-semibold text-gray-700 ">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-sm md:text-base text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default ShingleInstallation;