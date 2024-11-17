import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWater, FaBolt, FaCloudRain, FaSnowflake, FaTint, FaExclamationTriangle, FaSkullCrossbones } from 'react-icons/fa';
import { HashLink } from 'react-router-hash-link';




const LeaksWaterDamage = () => {
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

  const waterDamageData = [
    {
      title: 'Roof Leaks from Missing or Damaged Shingles',
      causes: 'Storms, heavy winds, or aging can cause shingles to become loose, cracked, or completely missing, exposing the underlayment to moisture.',
      impact: 'Water can seep into the roof, causing water stains on ceilings and walls, and can lead to internal water damage, mold growth, or wood rot.',
      diagnosis: [
        'Visual Inspection: Look for missing or damaged shingles, especially after storms or heavy winds.',
        'Check the Attic: Look for signs of water damage such as water stains, damp insulation, or a musty smell in the attic.',
        'Water Test: Gently spray water over the roof and check inside for any leaks or moisture penetration.'
      ],
      icon: <FaTint className="text-blue-600 text-4xl" />,
      image: '/assets/images/water_damage/missing_shingles.webp'
    },
    {
      title: 'Flashing Leaks',
      causes: 'Flashing can crack, corrode, or become loose over time due to poor installation or weather exposure, especially around roof penetrations like chimneys, vents, and skylights.',
      impact: 'Leaking around roof penetrations can allow water into the home, damaging the ceilings, walls, and roofing material.',
      diagnosis: [
        'Visual Inspection: Check the flashing around chimneys, skylights, and vents for any visible cracks, corrosion, or looseness.',
        'Look for Water Stains: Water stains on ceilings or walls near roof penetrations indicate potential flashing leaks.',
        'Water Test: Use a garden hose to direct water around flashing areas and check for any leaks inside the home.'
      ],
      icon: <FaBolt className="text-yellow-500 text-4xl" />,
      image: '/assets/images/water_damage/flash.webp'
    },
    {
      title: 'Gutter and Downspout Issues',
      causes: 'Clogged or damaged gutters and downspouts can cause water to overflow and back up onto the roof, leading to water damage near the roofline, fascia, or soffits.',
      impact: 'Water overflow can lead to roof rot, damage to the fascia boards, and water seepage into the roof deck or interior of the home.',
      diagnosis: [
        'Gutter Inspection: Check for debris buildup (leaves, twigs) in gutters or downspouts and ensure they are properly connected.',
        'Look for Water Pooling: After heavy rain, inspect for water pooling near the roofline or around the fascia and soffit.',
        'Check for Overflow Marks: Water streaks or discoloration on the siding or exterior walls indicate water overflow from clogged gutters.'
      ],
      icon: <FaCloudRain className="text-blue-400 text-4xl" />,
      image: '/assets/images/water_damage/clogged_gutter.webp'
    },
    {
      title: 'Ice Dams',
      causes: 'Ice dams form when snow on the roof melts and refreezes at the roof’s edge due to poor insulation or ventilation, blocking proper drainage and causing water to pool behind the ice.',
      impact: 'Ice dams can force water under the shingles, leading to roof leaks and water damage inside the attic or ceiling.',
      diagnosis: [
        'Look for Ice Build-Up: Inspect the roof’s edges for ice build-up or icicles during winter, which are signs of ice dams.',
        'Check Attic for Water Damage: Look for water stains, damp insulation, or moisture during or after winter.',
        'Roofline Inspection: Look for roof leaks or damage along the roof edges where ice dams may form.'
      ],
      icon: <FaSnowflake className="text-blue-300 text-4xl" />,
      image: '/assets/images/water_damage/ice_dams.webp'
    },
    {
      title: 'Valley Leaks',
      causes: 'Roof valleys are prone to leaks if shingles or valley flashing are damaged. Water flows naturally through valleys, and damaged areas can create a path for water to seep into the roof.',
      impact: 'Water can damage the underlayment, roof decking, and the interior of the home, leading to water stains and potential mold or wood rot.',
      diagnosis: [
        'Visual Inspection: Look for worn or damaged shingles along the roof valley. Check for rust or corrosion on metal flashing.',
        'Interior Inspection: Inspect the attic and ceiling for water stains, especially near valleys.',
        'Water Test: Use a garden hose to simulate rain and check for leaks in the attic along the valleys.'
      ],
      icon: <FaWater className="text-teal-500 text-4xl" />,
      image: '/assets/images/water_damage/valley.webp'
    },
    {
      title: 'Soffit and Fascia Damage',
      causes: 'Damaged or rotting soffit and fascia often result from overflowing gutters or poor ventilation. This can cause water to seep into the roof deck and structure.',
      impact: 'Water damage to the soffit and fascia can lead to further leaks, sagging gutters, and damage to the roof deck and attic.',
      diagnosis: [
        'Visual Check: Look for signs of rotting, cracking, or warping on the soffit and fascia.',
        'Attic Inspection: Check for signs of water damage or mold in the attic near the roof edges.',
        'Water Streaks: Inspect the siding for water streaks or staining, which indicates poor gutter drainage or fascia damage.'
      ],
      icon: <FaExclamationTriangle className="text-red-500 text-4xl" />,
      image: '/assets/images/water_damage/fascia.webp'
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
      <div className="absolute inset-0 dark-below-header"></div>

      {/* Flexbox for centering text vertically */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <motion.h1
        initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center text-6xl font-extrabold text-white tracking-wider custom-text-shadow-mini"
        >
          <h1>Water Damage and Leaks</h1>

        </motion.h1>
        
      </div>
    </motion.section>      
      <div className="flex justify-center mt-6 mb-4">
            <HashLink to="/#book" className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300">
              Schedule an Inspection
            </HashLink>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-16">
        {/* Introduction */}
        <section id="types-of-water-damage" className="">
          <h2 className="text-4xl font-semibold mb-6 text-center text-dark-below-header">
            Types of Water Damage and Leaks
          </h2>

          {/* Water Damage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {waterDamageData.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {item.icon}
                    <h3 className="text-2xl font-semibold text-gray-800 ml-3">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-2">
                    <strong>Causes:</strong> {item.causes}
                  </p>
                  <p className="mt-2">
                    <strong>Impact:</strong> {item.impact}
                  </p>
                  <div className="mt-4">
                    <strong>Diagnosis:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-2">
                      {item.diagnosis.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-gray-700">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-16 bg-blue-600 text-black p-12 rounded-lg shadow-lg text-center">
          <h2 className="text-4xl font-semibold mb-6">
            Worried About Roof Leaks?
          </h2>
          <p className="text-lg leading-relaxed mb-6">
            Don't wait until minor leaks become major problems. Contact us today for a comprehensive roof inspection.
          </p>
          <HashLink to="/#book" className="px-8 py-4 faint-color text-blue-600 font-semibold rounded-full hover:bg-gray-100">
            Schedule an Inspection
          </HashLink>          
        </section>

        {/* Prevention Tips */}
        <section>
          <h2 className="text-4xl font-semibold mb-6 text-center text-dark-below-header">
            How to Prevent Roof Leaks and Water Damage
          </h2>
          <div className="flex flex-col md:flex-row items-center md:space-x-6">
            <div className="md:w-1/2 mb-8 md:mb-0">

              <motion.img
                src = "/assets/images/water_damage/inspection_img.webp"
                alt="Prevention Tips"
                className="rounded-3xl shadow-2xl w-auto max-h-[55vh]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="md:w-1/2">
                <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                  {[
                    {
                      text: 'Schedule annual roof inspections to catch issues early.',
                      emphasis: 'Regular Inspections:',
                    },
                    {
                      text: 'Keep gutters and downspouts clean to ensure proper drainage.',
                      emphasis: 'Maintain Gutters:',
                    },
                    {
                      text: 'Prevent damage from falling branches and debris.',
                      emphasis: 'Trim Overhanging Branches:',
                    },
                    {
                      text: 'Adequate attic ventilation prevents moisture buildup.',
                      emphasis: 'Ensure Proper Ventilation:',
                    },
                    {
                      text: 'Fix minor issues before they escalate.',
                      emphasis: 'Address Repairs Promptly:',
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

export default LeaksWaterDamage;
