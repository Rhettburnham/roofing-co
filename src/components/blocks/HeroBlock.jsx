// src/components/blocks/HeroBlock.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * HeroBlock
 * 
 * Props:
 *  - config: {
 *      backgroundImage: string (default '/assets/images/growth/hero_growth.jpg'),
 *      title: string (default 'Siding Options'),
 *      shrinkAfterMs?: number (default 1000) -> how soon to shrink
 *      initialHeight?: string (default '40vh')
 *      finalHeight?: string (default '20vh')
 *    }
 *  - readOnly: boolean => if true, render “live” version with the shrinking effect
 *  - onConfigChange: function => called in edit mode to update config
 */
const HeroBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    backgroundImage = "/assets/images/growth/hero_growth.jpg",
    title = "Siding Options",
    shrinkAfterMs = 1000,
    initialHeight = "40vh",
    finalHeight = "20vh",
  } = config;

  // For the “shrinking” effect
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    if (readOnly) {
      // Start the timer to shrink the hero if in readOnly “live” mode
      const timer = setTimeout(() => {
        setIsShrunk(true);
      }, shrinkAfterMs);
      return () => clearTimeout(timer);
    }
  }, [readOnly, shrinkAfterMs]);

  // RENDER: READONLY => replicate the snippet
  if (readOnly) {
    return (
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: initialHeight }}
        animate={{ height: isShrunk ? finalHeight : initialHeight }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundAttachment: "fixed",
          }}
        ></div>
        {/* Could map a dark overlay class here if you have one, e.g. .dark-below-header */}
        <div className="absolute inset-0 dark-below-header"></div>

        <div className="relative z-10 h-full flex items-center justify-center custom-circle-shadow">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-[10gvw] md:text-[8vh] font-extrabold text-white tracking-wider"
          >
            {title}
          </motion.h1>
        </div>
      </motion.section>
    );
  }

  // RENDER: EDIT MODE => simple form
  const handleFieldChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">Hero Block Editor</h3>

      {/* Title */}
      <label className="block text-sm mb-2">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Background Image */}
      <label className="block text-sm mb-2">
        Background Image URL:
        <input
          type="text"
          value={backgroundImage}
          onChange={(e) => handleFieldChange("backgroundImage", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Shrink Timing */}
      <label className="block text-sm mb-2">
        Shrink After (ms):
        <input
          type="number"
          value={shrinkAfterMs}
          onChange={(e) =>
            handleFieldChange("shrinkAfterMs", parseInt(e.target.value, 10))
          }
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Initial & Final Heights */}
      <div className="flex space-x-2">
        <label className="block text-sm flex-1">
          Initial Height:
          <input
            type="text"
            value={initialHeight}
            onChange={(e) => handleFieldChange("initialHeight", e.target.value)}
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>

        <label className="block text-sm flex-1">
          Final Height:
          <input
            type="text"
            value={finalHeight}
            onChange={(e) => handleFieldChange("finalHeight", e.target.value)}
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>
      </div>
    </div>
  );
};

export default HeroBlock;
