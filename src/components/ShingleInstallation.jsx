import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ShinglesAsphalt from './ShinglesAsphalt'; // Import the Shingles component
import ShinglesSlate from './ShinglesSlate'; // Import the Shingles component
import ShinglesTile from './ShinglesTile'; // Import the Shingles component
import ShinglesMetal from './ShinglesMetal'; // Import the Shingles component
import { HashLink } from 'react-router-hash-link';


const ShingleInstallation = () => {
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

  const shingleOptions = [
    {
      title: 'Asphalt Shingles',
      description: 'Asphalt shingles are the most popular and affordable roofing material. They come in a variety of colors and styles and provide good durability and weather resistance.',
      benefit: 'Cost-effective and easy to install, making them ideal for most residential properties.',
      component: <ShinglesAsphalt /> // Add the ShinglesAsphalt component
    },
    {
      title: 'Metal Shingles',
      description: 'Metal shingles offer superior durability and can withstand harsh weather conditions, including heavy rain, snow, and wind. Available in various finishes, they provide a modern look.',
      benefit: 'Long-lasting and energy-efficient, with a lifespan of 40-70 years.',
      component: <ShinglesMetal /> // Add the ShinglesMetal component
    },
    {
      title: 'Slate Shingles',
      description: 'Slate shingles are a premium roofing option known for their natural beauty and exceptional durability. They offer a unique, classic look and can last over a century with proper care.',
      benefit: 'Highly durable and adds significant curb appeal, perfect for high-end homes.',
      component: <ShinglesSlate /> // Add the ShinglesSlate component
    },
    {
      title: 'Tile Shingles',
      description: 'Tile shingles, often made of clay or concrete, are a great option for homeowners seeking a Mediterranean or Spanish-style roof. They provide excellent durability and insulation.',
      benefit: 'Resistant to fire, rot, and insects, and offers great thermal performance.',
      component: <ShinglesTile /> // Add the ShinglesTile component
    }
  ];

    const steps = [
      {
        number: '1',
        title: 'Roof Inspection & Preparation',
        description:
          'Before installation, we perform a comprehensive roof inspection to ensure the structure is sound and free from damage. If necessary, we’ll repair or replace any damaged areas to provide a solid foundation for your new shingles.',
      },
      {
        number: '2',
        title: 'Underlayment Installation',
        description:
          'We install a high-quality underlayment as the first layer of protection against moisture, wind, and other environmental factors. This helps keep your roof watertight and durable.',
      },
      {
        number: '3',
        title: 'Shingle Placement',
        description:
          'Our expert roofing technicians carefully place and secure the shingles, ensuring each one is properly aligned and fastened. We follow manufacturer guidelines to guarantee the best possible performance and longevity.',
      },
      {
        number: '4',
        title: 'Final Inspection & Cleanup',
        description:
          'After the installation is complete, we conduct a final inspection to ensure everything is in perfect condition. We also perform a thorough cleanup, leaving your property spotless.',
      },
    ];
  
    const listVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.2,
        },
      },
    };
  
    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };

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
            <h1>Shingle Installation</h1>

          </motion.h1>
          
        </div>
      </motion.section>      

      {/* Installation Process Section */}
    <div className='px-8'>


      {/* Shingle Options Section */}
      <section className="my-4">  
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Explore Our Shingle Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 shadow-2xl gap-8">
          {shingleOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{option.title}</h3>
              <div className="mt-6">{option.component}</div> {/* Render the corresponding shingle component */}
              <p className="text-gray-600">{option.description}</p>
              <p className="mt-4 text-blue-500 font-semibold">{option.benefit}</p>
            </div>
          ))}
        </div>
      </section>
        <div className="flex justify-center m-6">
            <HashLink to="/#book" className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300">
              Schedule an Inspection
            </HashLink>
        </div>

      <section className="mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">
          Our Roof Shingle Installation Process
        </h2>
        <motion.ol
          className="grid  grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {steps.map((step, index) => (
            <motion.li
              key={index}
              className=" flex items-start space-x-4 "
              variants={itemVariants}
            >
              <div className="text-3xl text-blue-500">{step.number}</div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-700">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </section>


    </div>
    </div>
  );
};

export default ShingleInstallation;
