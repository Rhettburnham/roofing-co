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
 *  - readOnly: boolean => if true, render "live" version with the shrinking effect
 *  - onConfigChange: function => called in edit mode to update config
 */
const HeroBlock = ({ config = {}, readOnly = false, onConfigChange }) => {
  // Update destructuring to handle empty strings
  const {
    backgroundImage:
      rawBackgroundImage = "/assets/images/growth/hero_growth.jpg",
    title = "Siding Options",
    shrinkAfterMs = 1000,
    initialHeight = "40vh",
    finalHeight = "20vh",
  } = config;

  // Only use default if backgroundImage is empty string, null, or undefined
  const backgroundImage =
    rawBackgroundImage && rawBackgroundImage.trim() !== ""
      ? rawBackgroundImage
      : "/assets/images/growth/hero_growth.jpg";

  // For the "shrinking" effect
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    if (readOnly) {
      // Start the timer to shrink the hero if in readOnly "live" mode
      const timer = setTimeout(() => {
        setIsShrunk(true);
      }, shrinkAfterMs);
      return () => clearTimeout(timer);
    }
  }, [readOnly, shrinkAfterMs]);

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // Get the actual background image URL to display
  const displayBackgroundImage = getDisplayUrl(backgroundImage);

  // RENDER: READONLY => replicate the snippet
  if (readOnly) {
    return (
      <motion.section
        className="relative bg-banner"
        initial={{ height: initialHeight }}
        animate={{ height: isShrunk ? finalHeight : initialHeight }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${displayBackgroundImage}')`,
            backgroundSize: "120%", // Expanded image size
            backgroundPosition: "center",
            width: "100%",
            height: "100%",
            transition: "background-position 1s ease",
            backgroundPosition: isShrunk ? "center right" : "center left",
          }}
        ></div>
        <div className="relative z-10 h-full flex items-center justify-center custom-circle-shadow">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-[10vw] md:text-[8vh] font-extrabold text-gray-50 tracking-wider"
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

  const handleImageUpload = (field, file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    handleFieldChange(field, fileURL);
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
        Background Image:
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload("backgroundImage", file);
            }
          }}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>
      {displayBackgroundImage && (
        <img
          src={displayBackgroundImage}
          alt="Background Preview"
          className="mt-1 h-24 object-cover rounded w-full"
        />
      )}

      {/* Animation Settings */}
      <div className="mt-4 border-t border-gray-600 pt-2">
        <h4 className="font-semibold mb-2">Animation Settings</h4>

        <label className="block text-sm mb-2">
          Initial Height:
          <input
            type="text"
            value={initialHeight}
            onChange={(e) => handleFieldChange("initialHeight", e.target.value)}
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>

        <label className="block text-sm mb-2">
          Final Height:
          <input
            type="text"
            value={finalHeight}
            onChange={(e) => handleFieldChange("finalHeight", e.target.value)}
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>

        <label className="block text-sm mb-2">
          Shrink After (ms):
          <input
            type="number"
            value={shrinkAfterMs}
            onChange={(e) =>
              handleFieldChange("shrinkAfterMs", parseInt(e.target.value))
            }
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>
      </div>
    </div>
  );
};

export default HeroBlock;
