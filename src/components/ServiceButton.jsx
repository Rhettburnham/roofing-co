import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ServiceButton = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleClick = () => {
    navigate("/about"); // Navigate to the /about route
  };

  return (
    <div className="relative w-full h-[10vh] ">
      {/* Centered Button */}
      <div className="flex flex-col items-center justify-center pointer-events-auto z-50">
        <button
          className="text-white dark_button text-4xl font-semibold px-6 py-3 md:px-8 md:py-4 rounded-lg shadow-lg hover:bg-gray-600"
          onClick={handleClick} // Navigate to /about
        >
          <div className="">About Us</div>
        </button>
        {/* Small Text Below the Button */}
      </div>
    </div>
  );
};

export default ServiceButton;
