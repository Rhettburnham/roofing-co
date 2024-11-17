import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';
import { FaExclamationTriangle, FaTools } from 'react-icons/fa';
import Testimonial from './Testimonials';

const RoofMaterialDeterioration = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Data for poor installation jobs
  const poorInstallationData = [
    {
      title: 'Incorrect Shingle Placement',
      description:
        'Improper alignment and spacing can lead to leaks and reduce the roof’s lifespan.',
      image: '/assets/images/deterioration/shingle.webp',
    },
    {
      title: 'Inadequate Nailing',
      description:
        'Using the wrong nailing technique can cause shingles to loosen and blow off.',
      image: '/assets/images/deterioration/nailing.webp',
    },
    {
      title: 'Faulty Flashing Installation',
      description:
        'Poor flashing around chimneys and vents can allow water to seep into the home.',
      image: '/assets/images/deterioration/flashing.webp',
    },
  ];

  return (
    <div className="w-full">
      {/* Introductory Section */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: "100vh" }} // Initial state (full height)
        animate={{ height: isShrunk ? "20vh" : "60vh" }} // Transition to 20vh after the delay
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
            <h1>Deterioration</h1>
          </motion.h1>
        </div>
      </motion.section>

      {/* When to Repair Section */}
      <section className="container mx-auto px-6 py-3">
        <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">
          When is Repair Necessary?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Visible Leaks</h3>
            <p className="text-gray-700">
              Water stains on ceilings or walls indicate that your roof may be compromised.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaTools className="text-6xl text-blue-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Damaged Shingles</h3>
            <p className="text-gray-700">
              Missing, cracked, or curling shingles are a clear sign of roof deterioration.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Moss and Algae Growth</h3>
            <p className="text-gray-700">
              Excessive growth can trap moisture against the roof surface, leading to damage.
            </p>
          </div>
        </div>
      </section>

      {/* Poor Installation Section */}
      <section className=" py-8 px-6 bg-faint-color">
        <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">
          Beware of Poor Installation
        </h2>
        <p className="text-lg text-gray-700 mb-6 text-center">
          A roof is only as good as its installation. Poor workmanship can lead to premature deterioration and costly repairs.
        </p>
        <div className="container mx-auto px-6 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {poorInstallationData.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden py-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/images/deterioration/roof_repair_cta.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-6">
          <h2 className="text-5xl font-bold mb-4">
            Let's Get Your Roof Back to New
          </h2>
          <p className="text-xl mb-6 max-w-2xl">
            Don't wait until it's too late. Our expert team is ready to restore your roof's integrity.
          </p>
          <HashLink
            to="/#book"
            className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
          >
            Schedule an Inspection
          </HashLink>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonial />
    </div>
  );
};

export default RoofMaterialDeterioration;
