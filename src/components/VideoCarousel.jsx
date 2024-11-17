import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for programmatic navigation

const VideoCarousel = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/services"); // Navigate to the /services page
  };

  return (
    <div className="relative overflow-hidden">
      {/* Fixed Centered Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
        <button
          className="text-white text-4xl font-semibold bg-blue-600 px-8 py-4 rounded-lg shadow-lg hover:scale-105"
          onClick={handleClick} // Trigger navigation on click
        >
          <div className="animate-pulse">Our Service</div>
        </button>
        {/* Small Text Below the Button */}
        <div className="mt-2 text-black text-sm">Click to see our services</div>
      </div>
    </div>
  );
};

export default VideoCarousel;
