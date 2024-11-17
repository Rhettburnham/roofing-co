import React, { useState, forwardRef } from 'react';
import ShinglesAsphalt from './ShinglesAsphalt'; // Import the Shingles component
import Qualities from './Qualities'; // Import Qualities

const servicesList = [
  {
    id: 1,
    title: 'Premium Roofing Services',
    description:
      'Elevate your home’s exterior with designer shingles and standing seam metal combining functionality and flair.',
    moreInfo:
      'Premium roofing is necessary when you want to boost the curb appeal of your home while ensuring durability and performance. Ideal for homeowners looking for a stylish, long-lasting roof.',
  },
  {
    id: 2,
    title: 'Elite Siding Solutions',
    description:
      'Elevate your property with our innovative expertise that stands the test of time.',
    moreInfo:
      'Elite siding solutions are necessary for protecting your home from the elements while giving it a refreshed look. Perfect for homeowners looking for aesthetic upgrades with functional benefits.',
  },
  {
    id: 3,
    title: 'Gutter and Covers',
    description:
      'Extensive design and color selection.',
    moreInfo:
      'Gutters and covers are essential for protecting your home’s foundation by directing rainwater away from the structure. Necessary for homes in areas with frequent rainfall or prone to flooding.',
  },
  {
    id: 4,
    title: 'Outdoor Spaces',
    description:
      'Custom outdoor living areas.',
    moreInfo:
      'Custom outdoor spaces are necessary for homeowners who want to create an inviting environment for relaxation and entertainment. Great for those who enjoy spending time outdoors with family and friends.',
  },
  {
    id: 5,
    title: 'Commercial Services',
    description:
      'High-efficiency solutions for your commercial property.',
    moreInfo:
      'Our commercial services are necessary for business owners who want energy-efficient, cost-effective roofing and exterior solutions. Ideal for minimizing maintenance costs while enhancing the property’s value.',
  },
];

const Services = forwardRef(({ onClose }, ref) => {
  const [activeService, setActiveService] = useState(null);

  const toggleService = (id) => {
    setActiveService(activeService === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Main Content Box */}
      <div
        ref={ref} // Set the ref here
        className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full h-4/5 overflow-y-auto relative"
      >
        <h2 className="text-3xl font-bold text-blue-800 mb-4">
          Atlanta Roof Repair & New Roof Replacement Company
        </h2>
        <p className="text-gray-700 mb-4">
          GA Roofing & Repair, Inc., located in Atlanta and Alpharetta, is your
          one-stop shop for residential and commercial roofing as well as
          exterior and interior repairs. Whether it’s an extreme rainstorm,
          hailstorm, tornado, or a hurricane, when the forces of Mother Nature
          rise up against you and your roof, you’re going to need the help of
          the best Atlanta roof repair and new roof replacement company.
        </p>

        {/* Shingles Component Integration */}
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Explore Our Shingle Types</h3>
        <ShinglesAsphalt /> {/* Embedding the Shingles component */}

        {/* Services Section with Horizontal Bars */}
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Our Roofing Services</h3>
        <div className="space-y-4">
          {servicesList.map((service) => (
            <div key={service.id}>
              <div
                onClick={() => toggleService(service.id)}
                className="cursor-pointer bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold text-blue-800">{service.title}</h3>
                  <p className="text-gray-700">{service.description}</p>
                </div>
                <span className="text-blue-800">{activeService === service.id ? '-' : '+'}</span>
              </div>
              {activeService === service.id && (
                <div className="mt-2 p-4 bg-gray-50 text-gray-700 rounded-lg shadow-inner">
                  {service.moreInfo}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Packages Section Integration */}

        {/* Qualities Section */}
        <h3 className="text-2xl font-bold text-blue-800 mt-8 mb-4">Why Choose Us?</h3>
        <Qualities /> {/* Embedding the Qualities component */}

        {/* Close Button within the content */}
        <button
          className="mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {/* Large Centered "X" Button at the Bottom */}
      <button
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-4xl hover:text-gray-300 focus:outline-none z-30"
        onClick={onClose}
      >
        &#10005;
      </button>
    </div>
  );
});

export default Services;
