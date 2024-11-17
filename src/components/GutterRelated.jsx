import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Imported AnimatePresence
import { HashLink } from 'react-router-hash-link';


const GutterRelated = () => {
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

  // List of gutter options with sample rates
  const gutterOptions = [
    {
      title: 'Aluminum Gutters',
      image: '/assets/images/gutter_image/Aluminum_gutter.webp',
      alt: 'Aluminum Gutters',
      description:
        'Aluminum gutters are cost-effective, rust-resistant, and lightweight, making them a popular choice for most homes. They offer easy installation and can last up to 20 years with proper maintenance.',
      rate: '$5 - $8 per linear foot',
    },
    {
      title: 'Seamless Gutters',
      image: '/assets/images/gutter_image/Seamless_gutter.webp',
      alt: 'Seamless Gutters',
      description:
        'Seamless gutters are custom-fitted to your home, which reduces leaks by eliminating joints. They offer a streamlined appearance and are durable over time.',
      rate: '$8 - $12 per linear foot',
    },
    {
      title: 'Steel Gutters',
      image: '/assets/images/gutter_image/steel_gutter.jpeg',
      alt: 'Steel Gutters',
      description:
        'Steel gutters are strong and withstand heavy rainfall and snow. Though prone to rust without maintenance, they offer long-lasting durability in harsh weather.',
      rate: '$9 - $12 per linear foot',
    },
    {
      title: 'Half Round Gutters',
      image: '/assets/images/gutter_image/Half_round_gutters.png',
      alt: 'Half Round Gutters',
      description:
        'Half-round gutters have a semi-circular shape that allows efficient water drainage. They are often used in historic homes to maintain architectural style.',
      rate: '$12 - $25 per linear foot',
    },
    {
      title: 'Copper Gutters',
      image: '/assets/images/gutter_image/Copper_gutter.webp',
      alt: 'Copper Gutters',
      description:
        'Copper gutters are known for their durability and corrosion resistance. Over time, they develop a patina that gives them a distinctive look and can last up to 50 years.',
      rate: '$25 - $40 per linear foot',
    },
    {
      title: 'Vinyl Gutters',
      image: '/assets/images/gutter_image/Vinyl_gutter.webp',
      alt: 'Vinyl Gutters',
      description:
        'Vinyl gutters are lightweight, inexpensive, and easy to install. However, they are less durable than metal gutters and may crack or warp in extreme temperatures.',
      rate: '$3 - $5 per linear foot',
    },
  ];

  // List of gutter issues without image property
  const issuesData = [
    {
      title: 'Clogged Gutters',
      causes: 'Over time, gutters can become clogged with leaves, debris, and dirt. This blockage prevents water from flowing freely, causing it to overflow or back up onto the roof.',
      impact: 'Water that doesn’t drain properly can seep into the roof, walls, and foundation, leading to water damage, mold growth, and erosion around the base of the house.',
      diagnosis: [
        'Inspect gutters after heavy rains to check for overflowing water.',
        'Look for debris buildup in gutters or downspouts.',
        'Examine the foundation for signs of pooling water or erosion near the base of the house.'
      ]
    },
    {
      title: 'Sagging Gutters',
      causes: 'Gutters can sag due to the accumulation of water, debris, or poor installation. The added weight strains the gutter supports, pulling them away from the roofline.',
      impact: 'Sagging gutters cause improper water drainage, leading to roof leaks or damage to the siding and foundation. The gaps created by sagging can also allow water to run down the walls.',
      diagnosis: [
        'Visually inspect the gutters for uneven sections or sagging spots.',
        'Check for loose or missing fasteners along the roofline.',
        'Look for water stains on the siding where water may be spilling over the gutter edge.'
      ]
    },
    {
      title: 'Leaky Gutters',
      causes: 'Over time, gutters can develop leaks due to corrosion, cracked seams, or improper sealing. These leaks usually occur at the joints where sections of the gutter meet.',
      impact: 'Leaky gutters cause water to drip down the side of the house, damaging siding, windows, and even the foundation. Over time, it can lead to interior water damage and mold growth.',
      diagnosis: [
        'Inspect gutters during rainfall to spot leaks or dripping water.',
        'Check for rust, corrosion, or cracks at gutter joints.',
        'Look for water stains on the siding or around windows.'
      ]
    },
    {
      title: 'Improper Gutter Slope',
      causes: 'Gutters must be installed with a slight slope to allow water to flow toward the downspouts. An improper slope can cause water to pool inside the gutter.',
      impact: 'Standing water in the gutters can lead to corrosion, leaks, and gutter damage over time. It also creates an environment for mosquitoes and pests to breed.',
      diagnosis: [
        'After a rainstorm, inspect the gutters for standing water.',
        'Check the slope of the gutters by pouring water into them and observing the flow toward the downspouts.',
        'Look for sections of the gutter where water is pooling or slow to drain.'
      ]
    },
    {
      title: 'Damaged Downspouts',
      causes: 'Downspouts can become damaged due to clogs, poor installation, or physical impact. If downspouts are blocked or disconnected, water cannot drain away from the foundation.',
      impact: 'Damaged downspouts cause water to pool near the foundation, increasing the risk of basement flooding, erosion, and foundation damage.',
      diagnosis: [
        'Check for water pooling near the foundation after rainfall.',
        'Inspect downspouts for clogs, cracks, or disconnections.',
        'Ensure downspouts extend far enough from the house to direct water away from the foundation.'
      ]
    },
    {
      title: 'Rust and Corrosion',
      causes: 'Metal gutters, particularly those made from steel, can rust or corrode over time due to exposure to moisture and the elements.',
      impact: 'Corroded gutters may fail to channel water properly, resulting in leaks that damage the roof, walls, and foundation. Rusted sections may eventually break apart.',
      diagnosis: [
        'Look for rust spots or orange discoloration along the gutters.',
        'Check for signs of metal degradation or holes in the gutter system.',
        'Run water through the gutters and inspect for leaks in corroded areas.'
      ]
    },
    {
      title: 'Ice Dams',
      causes: 'In colder climates, snow and ice can accumulate in gutters, forming ice dams that prevent water from draining properly.',
      impact: 'Ice dams cause water to back up under the roof shingles, leading to leaks, roof damage, and gutter warping. The added weight of the ice can also cause gutters to pull away from the roofline.',
      diagnosis: [
        'Check gutters and downspouts for ice buildup in the winter.',
        'Inspect the roof eaves for icicles or water stains after a freeze.',
        'Look for sagging or deformed gutters due to ice accumulation.'
      ]
    }
  ];
  
  const [openItems, setOpenItems] = useState([]);
  
  const toggleItem = (index) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter((i) => i !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  return (
    <div className="w-full">
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
        <div className="absolute inset-0 dark-below-header"></div> {/* Replaced 'dark-below-header' with standard classes */}
  
        {/* Flexbox for centering text vertically */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-6xl font-extrabold text-white tracking-wider"
            // Removed 'custom-text-shadow-mini' or ensure it's defined in your CSS
          >
            Gutter Options
          </motion.h1>
        </div>
      </motion.section>

      {/* Call to Action */}
      <div className="flex justify-center mt-6">
        <HashLink
          to="/#book"
          className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
        >
          Schedule an Inspection
        </HashLink>
      </div>

      {/* Gutter Options Section */}
      <div className="container mx-auto px-6 mt-6 faint-color py-4"> {/* Changed 'bg-faint_color' to 'bg-gray-100' */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Types of Guttering Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gutterOptions.map((gutter, index) => (
              <div
                key={index}
                className="relative flex items-center space-x-4 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gray-50 overflow-hidden group"
              >
                <img
                  src={gutter.image}
                  alt={gutter.alt}
                  className={`w-24 h-24 rounded-lg ${
                    gutter.title === 'Steel Gutters' ? 'transform -scale-x-100' : ''
                  }`}
                />
                <div>
                  <h3 className="text-xl font-bold">{gutter.title}</h3>
                  <p>{gutter.description}</p>
                </div>
                {/* Overlay for rate on hover */}
                <div
                  className="absolute inset-y-0 left-full w-1/2 bg-white transform group-hover:-translate-x-full transition-transform duration-300 ease-in-out flex items-center justify-center"
                >
                  <div className="text-center px-4">
                    <p className="text-2xl font-bold text-black">{gutter.rate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Common Gutter Issues Section */}
      <div className="container mx-auto px-4 py-2">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Common Gutter Issues and Diagnosis Methods
        </h1>
        <div className="space-y-4">
          {issuesData.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left px-6 py-4 dark_button hover:bg-gray-600 focus:outline-none"
                aria-expanded={openItems.includes(index)}
                aria-controls={`section-${index}`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
                  <svg
                    className={`w-6 h-6 transform transition-transform duration-200 ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true" // Accessibility improvement
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    id={`section-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 py-4 bg-white">
                      {/* Removed the image tag since 'item.image' is undefined */}
                      {/* If you have images, add an 'image' property to each issue and uncomment the img tag */}
                      {/* <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      /> */}
                      <p className="mt-2 text-gray-700">
                        <strong>Causes:</strong> {item.causes}
                      </p>
                      <p className="mt-2 text-gray-700">
                        <strong>Impact:</strong> {item.impact}
                      </p>
                      <div className="mt-4">
                        <strong className="text-gray-700">Diagnosis:</strong>
                        <ul className="list-disc list-inside mt-2 text-gray-700">
                          {item.diagnosis.map((step, stepIndex) => (
                            <li key={stepIndex} className="mt-1">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Icons Section */}
      
    </div>
  );
};

export default GutterRelated;
