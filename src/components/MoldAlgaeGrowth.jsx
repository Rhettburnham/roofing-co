import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';

import {
  FaLeaf,
  FaTint,
  FaBiohazard,
  FaSeedling,
  FaTree,
  FaSkullCrossbones,
} from 'react-icons/fa';

const MoldAlgaeGrowth = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isShrunk, setIsShrunk] = useState(false);
  const [selectedGrowthIndex, setSelectedGrowthIndex] = useState(0);

  useEffect(() => {
    // Trigger the shrinking animation after 1 second
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, []);

  const growthData = [
    {
      title: 'Mold Growth',
      causes:
        'Moisture accumulation under shingles, poor ventilation, or leaks can lead to mold growth.',
      impact:
        'Mold can cause structural weakening and health issues if it spreads into the attic and living spaces.',
      diagnosis: [
        'Visual Inspection: Look for dark green, black, or white spots on the roof or inside the attic.',
        'Check for Musty Odor: A strong musty smell, particularly in the attic, can indicate mold growth.',
        'Use a Moisture Meter: Measure moisture levels in the attic or roof underlayment to confirm conducive conditions for mold.',
        'Mold Test Kits: Collect surface samples from suspected areas and send them to a lab for analysis.',
      ],
      icon: <FaBiohazard className="text-4xl text-green-500" />,
      image: '/assets/images/growth/mold_growth.jpg',
    },
    {
      title: 'Algae Growth',
      causes:
        'Algae growth is common in humid climates, especially on shaded roofs where moisture lingers. Algae feed on organic debris and limestone found in shingles.',
      impact:
        'While algae may not immediately damage the roof, it can cause staining and weaken the roofing material over time.',
      diagnosis: [
        'Visual Inspection: Look for dark streaks or patches, especially on shaded sections of the roof.',
        'Surface Testing: In some cases, samples can be collected and examined under a microscope to confirm the presence of algae.',
        'Check Roof Areas with Persistent Shade: Algae often grow in areas of the roof that receive little direct sunlight.',
      ],
      icon: <FaTint className="text-4xl text-blue-400" />,
      image: '/assets/images/growth/algae_growth.jpg',
    },
    {
      title: 'Moss Growth',
      causes:
        'Moist and shaded environments, especially in humid climates, promote moss growth. Moss tends to grow where moisture accumulates, like roof valleys or under overhanging branches.',
      impact:
        'Moss can retain moisture, causing the shingles to degrade faster and potentially lead to leaks.',
      diagnosis: [
        'Visual Inspection: Look for thick, green moss patches on the roof surface.',
        'Lift Shingles: Gently lift shingles near moss growth to check for moisture retention underneath.',
        'Check for Shingle Displacement: Moss can lift shingles, exposing the roof to water damage.',
      ],
      icon: <FaLeaf className="text-4xl text-green-600" />,
      image: '/assets/images/growth/moss_growth.jpg',
    },
    {
      title: 'Wet Rot',
      causes:
        'Wet rot occurs when wooden roofing components, such as decking or rafters, are consistently exposed to moisture.',
      impact:
        'Wet rot weakens wood and can cause structural damage to the roof if not addressed promptly.',
      diagnosis: [
        'Probe Test: Use a screwdriver to gently press wooden structures; wet rot-affected wood will feel soft and spongy.',
        'Visual Inspection: Look for discoloration or fungal growth on wooden surfaces.',
        'Moisture Meter: Test the moisture levels in wood. Higher readings indicate a higher risk of wet rot.',
      ],
      icon: <FaTree className="text-4xl text-yellow-700" />,
      image: '/assets/images/growth/wet_rot.jpg',
    },
    {
      title: 'Dry Rot',
      causes:
        'Dry rot occurs in damp conditions with poor ventilation. Unlike wet rot, dry rot can spread through wood and even masonry, causing significant structural damage.',
      impact:
        'Dry rot leads to cracking, shrinkage, and weakening of wooden components in the roof structure.',
      diagnosis: [
        'Visual Inspection: Look for cracked, brittle wood and fungal growth that appears powdery or cotton-like.',
        'Tap Test: Wood affected by dry rot may sound hollow when tapped.',
        'Professional Assessment: A roofer or structural expert can determine the extent of dry rot damage.',
      ],
      icon: <FaSkullCrossbones className="text-4xl text-red-500" />,
      image: '/assets/images/growth/dry_rot.jpg',
    },
    {
      title: 'Lichen Growth',
      causes:
        'Lichens form on roofs when algae and fungi grow together in a symbiotic relationship, often on roofs that receive little sunlight.',
      impact:
        'Lichens can adhere strongly to the roof surface, making removal difficult without damaging shingles. Over time, they can degrade roofing materials.',
      diagnosis: [
        'Visual Inspection: Look for light green or gray crusty patches on the roof’s surface.',
        'Surface Testing: Lichens can be confirmed under a microscope after collecting a sample.',
        'Check Shaded Areas: Lichens grow in areas that have persistent moisture and limited sunlight exposure.',
      ],
      icon: <FaSeedling className="text-4xl text-teal-500" />,
      image: '/assets/images/growth/lichen_growth.jpg',
    },
  ];

  return (
    <div className="w-full ">
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
        <div className="absolute inset-0 dark-below-header "></div>

        {/* Flexbox for centering text vertically */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-6xl font-extrabold text-white tracking-wider custom-text-shadow-mini"
          >
            <h1>Mold, Algae, & Rot</h1>
          </motion.h1>
        </div>
      </motion.section>

      <div className="flex justify-center mt-6 mb-4">
        <HashLink
          to="/#book"
          className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
        >
          Schedule an Inspection
        </HashLink>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-6 bg-gradient-to-b from-faint-color to-white">
        {/* Introduction */}
        <section id="types-of-growth" className="mb-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-5xl font-bold mb-8 pt-8 text-center text-gray-800"
          >
            Types of Mold, Algae, and Rot Growth
          </motion.h2>

          {/* Buttons to select growth type */}
          <div className="flex flex-wrap justify-center mb-8">
            {growthData.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedGrowthIndex(index)}
                className={`m-2 px-4 py-2 rounded-full shadow-lg ${
                  selectedGrowthIndex === index
                    ? 'dark_button text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Display selected growth card */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
            <motion.div
              key={selectedGrowthIndex}
              className="group perspective"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-96 w-full transform-style-3d">
                {/* Front Side */}
                <div className="absolute inset-0 bg-gray-800 rounded-xl shadow-lg transform group-hover:rotateY-180 transition-transform duration-700 backface-hidden">
                  <img
                    src={growthData[selectedGrowthIndex].image}
                    alt={growthData[selectedGrowthIndex].title}
                    className="w-full h-full object-cover rounded-xl opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-xl"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center">
                      {growthData[selectedGrowthIndex].icon}
                      <h3 className="text-3xl font-semibold ml-3">
                        {growthData[selectedGrowthIndex].title}
                      </h3>
                    </div>
                  </div>
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 bg-white rounded-xl shadow-lg transform rotateY-180 backface-hidden p-6 overflow-y-auto">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    {growthData[selectedGrowthIndex].title}
                  </h3>
                  <p className="mb-2">
                    <strong>Causes:</strong>{' '}
                    {growthData[selectedGrowthIndex].causes}
                  </p>
                  <p className="mb-2">
                    <strong>Impact:</strong>{' '}
                    {growthData[selectedGrowthIndex].impact}
                  </p>
                  <div>
                    <strong>Diagnosis:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-2">
                      {growthData[selectedGrowthIndex].diagnosis.map(
                        (step, stepIndex) => (
                          <li key={stepIndex} className="text-gray-700">
                            {step}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Call to Action with Animated Background */}
        <section className="mb-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              src="/assets/videos/mold_animation.mp4"
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
              Protect Your Home
            </motion.h2>
            <p className="text-xl text-gray-200 mb-8">
              Expert solutions to eliminate mold and algae threats
            </p>
            <a
              href="/contact"
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition duration-300"
            >
              Contact Us
            </a>
          </div>
        </section>

        {/* Prevention Tips with Interactive Elements */}
        <section>
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-800">
            How to Prevent Growth on Your Roof
          </h2>
          <div className="flex flex-col md:flex-row items-center md:space-x-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <motion.img
                src="/assets/images/mold_removal.webp"
                alt="Prevention Tips"
                className="rounded-3xl shadow-2xl w-full max-h-[55vh]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="md:w-1/2">
              <ul className="space-y-6 text-lg text-gray-700">
                {[
                  {
                    emphasis: 'Improve Ventilation:',
                    text: 'Ensure proper roof ventilation to reduce moisture.',
                  },
                  {
                    emphasis: 'Manage Surroundings:',
                    text: 'Trim overhanging branches to reduce shade and debris.',
                  },
                  {
                    emphasis: 'Maintain Gutters:',
                    text: 'Clean gutters regularly to prevent water buildup.',
                  },
                  {
                    emphasis: 'Use Resistant Materials:',
                    text: 'Install algae-resistant shingles if replacing the roof.',
                  },
                  {
                    emphasis: 'Professional Cleaning:',
                    text: 'Schedule professional cleanings to remove existing growth.',
                  },
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start"
                  >
                    <span className="text-green-600 mr-3">•</span>
                    <div>
                      <strong>{item.emphasis}</strong> {item.text}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MoldAlgaeGrowth;
