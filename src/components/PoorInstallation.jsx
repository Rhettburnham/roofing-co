import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { HashLink } from 'react-router-hash-link';

import {
  FaWater,
  FaWind,
  FaBolt,
  FaThermometerHalf,
  FaTools,
  FaSadTear,
  FaEyeSlash,
  FaClock,
  FaHardHat,
} from 'react-icons/fa';

const PoorInstallation = () => {

  useEffect(()=>{
    window.scrollTo(0, 0);
  },[])

  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    // Trigger the shrinking animation after 1.5 seconds
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1500);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, []);

  const issuesData = [
    {
      title: 'Leaks and Water Damage',
      causes:
        'Improper shingle placement, poor flashing installation, or insufficient underlayment can result in roof leaks.',
      impact:
        'Water can seep into the attic, walls, and ceilings, causing mold, mildew, and rot.',
      diagnosis: [
        'Check for visible water stains on ceilings and walls.',
        'Look for mold growth in the attic or damp insulation.',
        'Inspect for signs of water pooling or streaking near chimneys and vents.',
      ],
      icon: <FaWater className="text-3xl text-blue-500" />,
      image: '/assets/images/poor_installation/leaks_water_damage.jpg',
    },
    {
      title: 'Improper Ventilation',
      causes:
        'Poor installation may lead to insufficient ventilation, trapping heat and moisture in the attic.',
      impact: 'This accelerates roof deterioration and increases energy costs.',
      diagnosis: [
        'Check for excessive heat in the attic and unusually high energy bills.',
        'Inspect for mold growth, especially in the attic.',
        'Ensure soffit vents, ridge vents, and exhaust fans are working properly.',
      ],
      icon: <FaThermometerHalf className="text-3xl text-red-500" />,
      image: '/assets/images/poor_installation/improper_ventilation.jpg',
    },
    {
      title: 'Shingle Blow-Offs',
      causes:
        'Shingles not properly nailed or sealed can be easily blown off by wind.',
      impact:
        'Exposes the roof to elements, increasing risk of water damage.',
      diagnosis: [
        'Inspect roof and yard for missing or loose shingles after strong winds or storms.',
        'Look for raised shingles that may indicate poor sealing.',
      ],
      icon: <FaWind className="text-3xl text-teal-500" />,
      image: '/assets/images/poor_installation/shingle_blow_offs.jpg',
    },
    {
      title: 'Flashing Failures',
      causes:
        'Improper flashing installation around chimneys, vents, and skylights leads to water seepage.',
      impact: 'Water can enter through gaps and cause leaks.',
      diagnosis: [
        'Inspect flashing for cracks, rust, or gaps.',
        'Check for water stains or leaks around chimneys, skylights, and vents.',
      ],
      icon: <FaBolt className="text-3xl text-yellow-500" />,
      image: '/assets/images/poor_installation/flashing_failures.jpg',
    },
    {
      title: 'Ponding Water',
      causes:
        'Improper roof slope or drainage can lead to water pooling on the roof.',
      impact:
        'Standing water deteriorates roofing materials and leads to leaks.',
      diagnosis: [
        'Check for pooling water after rain.',
        'Look for algae or moss growth, which often thrive in stagnant water areas.',
      ],
      icon: <FaWater className="text-3xl text-blue-400" />,
      image: '/assets/images/poor_installation/ponding_water.jpg',
    },
    {
      title: 'Inconsistent Appearance',
      causes:
        'Poor craftsmanship can result in uneven shingle placement or mismatched materials.',
      impact:
        'Compromises roof aesthetics and could indicate deeper installation problems.',
      diagnosis: [
        'Inspect the roof for uniformity and consistent patterns from a distance.',
        'Look for irregular shingle placement or color mismatches.',
      ],
      icon: <FaEyeSlash className="text-3xl text-purple-500" />,
      image: '/assets/images/poor_installation/inconsistent_appearance.jpg',
    },
    {
      title: 'Premature Roof Aging',
      causes:
        'Improper installation causes materials to age faster due to exposure to moisture and heat.',
      impact:
        'Leads to more frequent repairs and reduced lifespan of the roof.',
      diagnosis: [
        'Inspect shingles for curling, cracking, or buckling.',
        'Look for granule loss from asphalt shingles.',
      ],
      icon: <FaClock className="text-3xl text-gray-500" />,
      image: '/assets/images/poor_installation/premature_aging.jpg',
    },
    {
      title: 'Roof Deck Damage',
      causes:
        'Poor preparation or securing of the roof deck can lead to warping, rot, or premature deterioration.',
      impact:
        'Weakens the roof structure and increases the risk of collapse.',
      diagnosis: [
        'Check the attic for sagging decking or warped beams.',
        'Look for signs of moisture damage or a musty odor in the attic.',
      ],
      icon: <FaHardHat className="text-3xl text-orange-500" />,
      image: '/assets/images/poor_installation/roof_deck_damage.jpg',
    },
    {
      title: 'Gutter Issues',
      causes:
        'Improper installation can affect the alignment and functionality of gutters, leading to water runoff problems.',
      impact:
        'Water can damage the foundation and siding of the home.',
      diagnosis: [
        'Check for overflowing gutters during rainfall.',
        'Inspect for water damage around the foundation or siding.',
      ],
      icon: <FaTools className="text-3xl text-green-500" />,
      image: '/assets/images/poor_installation/gutter_issues.jpg',
    },
  ];

  return (
    <div className="w-full ">
      {/* Hero Section with Parallax Effect */}
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
            className="text-center text-6xl font-extrabold text-white tracking-wider"
          >
            <h1>Poor Installation</h1>

          </motion.h1>     
        </div>
      </motion.section>

      
      <div className="flex justify-center mt-6 mb-4">
            <HashLink to="/#book" className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300">
              Schedule an Inspection
            </HashLink>
        </div>

      {/* Main Content with Creative Container Design */}
      <div className="container mx-auto px-6 pb-6">
        {/* Introduction */}
        <section id="common-issues" className="mb-14">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-5xl font-bold mb-12 text-center text-gray-800"
          >
            Common Issues from Poor Roofing Installation
          </motion.h2>

          {/* Issues Cards with Glassmorphism and Tilt Effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {issuesData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Tilt
                  className="transform transition-transform duration-500"
                  tiltMaxAngleX={15}
                  tiltMaxAngleY={15}
                  scale={1.05}
                >
                  <div className="relative bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
                    {/* Animated SVG Background */}
                    <div className="absolute inset-0">
                      <svg
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <pattern
                            id="pattern"
                            x="0"
                            y="0"
                            width="0.1"
                            height="0.1"
                          >
                            <circle
                              cx="1"
                              cy="1"
                              r="1"
                              fill="rgba(255, 255, 255, 0.1)"
                            />
                          </pattern>
                        </defs>
                        <rect
                          width="800%"
                          height="800%"
                          fill="url(#pattern)"
                          className="animate-pattern"
                        />
                      </svg>
                    </div>
                    {/* Content */}
                    <div className="relative p-6 flex flex-col h-full">
                      <div className="mb-4 flex items-center">
                        {item.icon}
                        <h3 className="text-2xl font-semibold text-gray-800 ml-3">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mb-2 text-gray-700 flex-grow">
                        <strong>Causes:</strong> {item.causes}
                      </p>
                      <p className="mb-4 text-gray-700">
                        <strong>Impact:</strong> {item.impact}
                      </p>
                      <div>
                        <strong>Diagnosis:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                          {item.diagnosis.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </section>



        {/* Prevention Tips with Interactive Elements */}
        <section >
          <h2 className="text-5xl font-bold mb-12 text-center text-gray-800">
            How to Avoid Poor Installation
          </h2>
          <div className="flex flex-col md:flex-row items-center md:space-x-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <motion.img
                src="/assets/images/poor_install.webp"
                alt="Prevention Tips"
                className="rounded-3xl shadow-2xl w-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="md:w-1/2">
              <ul className="space-y-6 text-lg text-gray-700">
                {[
                  {
                    emphasis: 'Choose Qualified Professionals:',
                    text: 'Hire licensed and experienced roofing contractors.',
                  },
                  {
                    emphasis: 'Research Contractors:',
                    text: 'Check references and reviews before hiring.',
                  },
                  {
                    emphasis: 'Verify Compliance:',
                    text: 'Ensure all work complies with local building codes.',
                  },
                  {
                    emphasis: 'Get Documentation:',
                    text: 'Request detailed proposals and warranties.',
                  },
                  {
                    emphasis: 'Ongoing Maintenance:',
                    text: 'Schedule regular inspections to catch issues early.',
                  },
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start"
                  >
                    <span className="text-blue-600 mr-3">•</span>
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

      {/* Footer with Interactive Elements */}

    </div>
  );
};

export default PoorInstallation;