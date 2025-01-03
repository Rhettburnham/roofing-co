import React from 'react';

const CombinedComponent = () => {
  return (
    <div className="relative dark-below-header ">
      {/* Header Section with adjusted height */}
      <div className="relative w-screen h-[20vh] overflow-hidden">
{/* 
          <img
            src="/assets/images/header_background_img.png"
            alt="Background"
            className="w-full h-full object-cover opacity-70"
          /> */}

        {/* Text Overlay (absolutely centered) */}
        <div className="absolute inset-0 flex items-center justify-center text-center font-bold z-10 text-white text-[13vw] md:text-[7vw]">
          <span className="drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,4.8)]">
            RHETT'S ROOFING
          </span>
        </div>
      </div>
    </div>
  );
};

export default CombinedComponent;
