import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationCircle, FaTools } from "react-icons/fa";
import Ourwork from "./OurWork";
import Whywork from "./Whywork";

const ServiceIssue = () => {
  // Set "services" as the default active component
  const [activeComponent, setActiveComponent] = useState("services");

  const handleIssuesClick = () => {
    setActiveComponent("issues");
  };

  const handleServicesClick = () => {
    setActiveComponent("services");
  };

  return (
    <div className="w-full flex flex-col items-center mt-6">
      {/* Buttons with improved styling */}
      <div className="flex justify-center space-x-24 md:space-x-40 drop-shadow-xl">
        <button
          onClick={handleIssuesClick}
          className={`flex items-center px-6 py-3 rounded-full font-semibold text-white transition duration-300 transform ${
            activeComponent === "issues"
              ? "dark_button scale-110 opacity-100"
              : "dark-below-header scale-100 opacity-50"
          }`}
        >
          <FaExclamationCircle className="mr-2" />
          Issues
        </button>
        <button
          onClick={handleServicesClick}
          className={`flex items-center px-6 py-3 rounded-full font-semibold text-white transition duration-300 transform ${
            activeComponent === "services"
              ? "dark_button scale-110 opacity-100"
              : "dark-below-header scale-100 opacity-50"
          }`}
        >
          <FaTools className="mr-2" />
          Services
        </button>
      </div>

      {/* Content with smooth transitions */}
      <div className="w-full px-10 drop-shadow-2xl">
        <AnimatePresence mode="wait">
          {activeComponent === "issues" && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <Ourwork />
            </motion.div>
          )}
          {activeComponent === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Whywork />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ServiceIssue;
