import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import Tilt from 'react-parallax-tilt';

import {
  FaHammer,
  FaShieldAlt,
  FaStar,
  FaCheckCircle,
  FaSearch,
  FaClipboardList,
  FaCogs,
  FaThumbsUp,
} from 'react-icons/fa';

const RoofRepair = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    // Trigger the shrinking animation after 1.5 seconds
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1500);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, []);

  // Repair options array
  const repairOptions = [
    {
      title: 'Inspection',
      description:
        'Comprehensive roof inspections to identify existing issues and prevent future problems.',
      image: '/assets/images/inspection/inspection2.webp',
      link: '/inspection',
    },
    {
      title: 'Guttering',
      description:
        'Professional gutter installation and maintenance to ensure proper water drainage.',
      image: '/assets/images/roof-repair/gutter-vinyl.webp',
      link: '/gutterrelated',
    },
    {
      title: 'Ventilation',
      description:
        'Optimizing roof ventilation to maintain a balanced temperature in your attic.',
      image: '/assets/images/roof-repair/vent-vinyl.webp',
      link: '/ventilation',
    },
    {
      title: 'Roof Coating',
      description:
        'High-quality roof coating services that protect your roof from the elements.',
      image: '/assets/images/roof-repair/coating-vinyl.webp',
      link: '/roofcoating',
    },
    {
      title: 'Sagging Roof Line',
      description:
        'Addressing sagging roof lines to restore the structural integrity of your roof.',
      image: '/assets/images/roof-repair/shingle-vinyl.webp',
      link: '/saggingroofline',
    },
  ];

  return (
    <div className="w-full  dark-below-header-gradient">
      {/* Hero Section with Shrinking Effect */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: '100vh' }} // Initial state (full height)
        animate={{ height: isShrunk ? '20vh' : '100vh' }} // Transition to 20vh after the delay
        transition={{ duration: 1 }} // Animation duration
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
            backgroundAttachment: 'fixed',
          }}
        ></div>
        <div className="absolute inset-0 dark-below-header-gradient"></div>

        {/* Flexbox for centering text vertically */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-6xl font-extrabold text-white tracking-wider custom-text-shadow-mini"
          >
            Roof Repair
          </motion.h1>
        </div>
      </motion.section>

      {/* Explore Packages Button */}
      <div className="flex justify-center items-center my-4">
        <Link
          to="/packages" // Use "to" instead of "href" for navigation
          className="px-4 py-2 dark_button text-white font-semibold drop-shadow-xl rounded-full hover:bg-white hover:text-black transition duration-300 text-sm"
        >
          Explore Packages
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-6 pb-16">
        {/* Our Repair Process with Animated Steps */}
        <section className="mb-10">
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-800">
            Our Repair Process
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <Tilt
                className="transform transition-transform duration-500"
                tiltMaxAngleX={15}
                tiltMaxAngleY={15}
                scale={1.05}
              >
                <div className="flex justify-center mb-2">
                  <FaSearch className="text-5xl text-blue-500 drop-shadow-xl" />
                </div>
              </Tilt>
              <h3 className="text-xl font-semibold text-gray-700">
                Inspection & Assessment
              </h3>
            </motion.div>
            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <Tilt
                className="transform transition-transform duration-500"
                tiltMaxAngleX={15}
                tiltMaxAngleY={15}
                scale={1.05}
              >
                <div className="flex justify-center mb-2">
                  <FaClipboardList className="text-5xl text-yellow-500 drop-shadow-xl" />
                </div>
              </Tilt>
              <h3 className="text-xl font-semibold text-gray-700">
                Tailored Repair Plan
              </h3>
            </motion.div>
            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <Tilt
                className="transform transition-transform duration-500"
                tiltMaxAngleX={15}
                tiltMaxAngleY={15}
                scale={1.05}
              >
                <div className="flex justify-center mb-2">
                  <FaCogs className="text-5xl text-gray-400 drop-shadow-xl" />
                </div>
              </Tilt>
              <h3 className="text-xl font-semibold text-gray-700">
                Expert Repairs
              </h3>
            </motion.div>
            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center"
            >
              <Tilt
                className="transform transition-transform duration-500"
                tiltMaxAngleX={15}
                tiltMaxAngleY={15}
                scale={1.05}
              >
                <div className="flex justify-center mb-2">
                  <FaThumbsUp className="text-5xl text-green-700 drop-shadow-xl" />
                </div>
              </Tilt>
              <h3 className="text-xl font-semibold text-gray-700">
                Final Inspection
              </h3>
            </motion.div>
          </div>
        </section>

        {/* Repair Packages with Enhanced Styling */}
        <section id="repair-packages" className="mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
            Choose Your Repair Package
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {repairOptions.map((option, index) => (
              <motion.div
                key={index}
                className="group perspective"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {/* Entire Card Wrapped in Link */}
                <Link
                  to={option.link}
                  className="block h-full bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-700 hover:scale-105"
                >
                  {/* Image Section */}
                  <div className="w-full overflow-hidden aspect-w-16 aspect-h-9">
                    <img
                      src={option.image}
                      alt={option.title}
                      className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  {/* Content Section */}
                  <div className="p-6 flex flex-col justify-center h-32">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {option.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action with Animated Background */}
        <section className="relative overflow-hidden faint-color rounded-lg">
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              src="/assets/videos/repair_animation.mov"
            ></video>
            <div className="absolute inset-0 bg-black opacity-70"></div>
          </div>
          <div className="relative z-10 text-center py-24">
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-5xl font-bold text-white mb-6"
            >
              Ready to Get Started?
            </motion.h2>
            <p className="text-xl mb-8 text-white">
              Contact us today for a free roof inspection and personalized repair plan.
            </p>
            <HashLink
              to="/#booking"
              className="inline-block px-4 py-2 dark_button  text-white font-semibold rounded-full hover:bg-blue-700 transition duration-300 text-sm"
            >
              Schedule an Inspection
            </HashLink>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoofRepair;
