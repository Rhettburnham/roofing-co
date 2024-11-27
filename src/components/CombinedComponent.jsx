import React from 'react';

// PhotoTransition Component
const CombinedComponent = () => {
  return (
    <div className="relative dark-below-header flex flex-col mb-4">
      
      {/* Header Section with adjusted height */}
      <div
        className="relative w-screen h-[28vh] flex items-center justify-center overflow-hidden"
      >
        {/* 
          You can add background images or other content here if needed.
          For example:
          <img src="your-image-url.jpg" alt="Background" className="w-full h-full object-cover" />
        */}
      </div>
      {/* Text Overlay */}
      <div
        className="absolute w-full h-full flex items-center justify-center text-center font-bold z-10 text-white text-[13vw] md:text-[9vw] "
      >
        <span className="custom-text-shadow">Duane & Sons Roofing</span>
      </div>
    </div>
  );
};


export default CombinedComponent;
