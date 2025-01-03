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

  // Steps with icons and images
  const steps = [
    {
      number: '1',
      title: 'Roof Inspection & Preparation',
      description:
        "Before installation, we perform a comprehensive roof inspection to ensure the structure is sound and free from damage. If necessary, we'll repair or replace any damaged areas to provide a solid foundation for your new shingles.",
      icon: <Wrench className="text-blue-600 w-8 h-8" />,
      image: '/assets/images/step1.jpg', // Replace with your actual image paths
    },
    {
      number: '2',
      title: 'Underlayment Installation',
      description:
        "We install a high-quality underlayment as the first layer of protection against moisture, wind, and other environmental factors. This helps keep your roof watertight and durable.",
      icon: <Layers className="text-blue-600 w-8 h-8" />,
      image: '/assets/images/step2.jpg', // Replace with your actual image paths
    },
    {
      number: '3',
      title: 'Shingle Placement',
      description:
        "Our expert roofing technicians carefully place and secure the shingles, ensuring each one is properly aligned and fastened. We follow manufacturer guidelines to guarantee the best possible performance and longevity.",
      icon: <ClipboardCheck className="text-blue-600 w-8 h-8" />,
      image: '/assets/images/step3.jpg', // Replace with your actual image paths
    },
    {
      number: '4',
      title: 'Final Inspection & Cleanup',
      description:
        "After the installation is complete, we conduct a final inspection to ensure everything is in perfect condition. We also perform a thorough cleanup, leaving your property spotless.",
      icon: <Trash2 className="text-blue-600 w-8 h-8" />, // Replaced Broom with Trash2
      image: '/assets/images/step4.jpg', // Replace with your actual image paths
    },
  ];

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

      <div className="px-[6vw] md:px-[10vw]">
        {/* SHINGLE OPTIONS SECTION */}
        <section className="my-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 pb-2">
            Explore Our Shingle Options
          </h2>

          {/* Shingle Selection Buttons */}
          <div className="flex flex-wrap justify-center mb-4">
            {shingleOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedShingleIndex(index)}
                className={`m-2 px-4 py-2 rounded-full shadow-lg transition-colors duration-300 ${
                  selectedShingleIndex === index
                    ? 'dark_button text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-600 hover:text-white'
                }`}
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
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              {shingleOptions[selectedShingleIndex].title}
            </h3>
            <div className="mt-6">
              {shingleOptions[selectedShingleIndex].component}
            </div>
            <p className="text-gray-600 mt-4">
              {shingleOptions[selectedShingleIndex].description}
            </p>
            <p className="mt-4 text-blue-500 font-semibold">
              {shingleOptions[selectedShingleIndex].benefit}
            </p>
          </motion.div>
        </section>

        {/* CTA BUTTON */}
        <div className="flex justify-center m-6">
          <HashLink
            to="/#book"
            className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
          >
            Schedule an Inspection
          </HashLink>
        </div>

        {/* STEPS SECTION WITH POP-IN ANIMATION & HORIZONTAL LAYOUT */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">
            Our Roof Shingle Installation Process
          </h2>

          {/* Container for steps (staggered pop-in) */}
          <motion.div
            className="space-y-8" // vertical spacing between steps
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
                    <div className="text-2xl font-bold text-blue-600">
                      {step.number}
                    </div>
                    {/* Step Icon */}
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
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
