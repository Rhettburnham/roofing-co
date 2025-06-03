// src/components/blocks/ShingleSelectorBlock.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * ShingleSelectorBlock
 * 
 * config = {
 *   sectionTitle: "Explore Our Shingle Options",
 *   shingleOptions: [
 *     {
 *       title: string,
 *       description: string,
 *       benefit: string,
 *       // optionally an array of images, or a single image
 *     },
 *     ...
 *   ]
 * }
 */
const ShingleSelectorBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    sectionTitle = "Explore Our Shingle Options",
    shingleOptions = [],
  } = config;

  // Local state for readOnly "selected index"
  const [selectedIndex, setSelectedIndex] = useState(0);

  // READ ONLY
  if (readOnly) {
    const current = shingleOptions[selectedIndex] || {};

    return (
      <section className="my-4 px-4 sm:px-8 md:px-12 lg:px-16 bg-white">
        <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 pb-2">
          {sectionTitle}
        </h2>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {shingleOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full font-semibold shadow-lg transition-all duration-300 ${
                selectedIndex === idx
                  ? "dark_button text-white font-semibold shadow-xl"
                  : "text-black"
              }`}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 0 15px 1px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              {option.title}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <motion.div
          key={selectedIndex}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
            {current.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {current.description}
          </p>
          <p className="text-sm sm:text-base mt-2 text-blue-500 font-semibold">
            {current.benefit}
          </p>
        </motion.div>
      </section>
    );
  }

  // EDIT MODE
  const handleFieldChange = (field, value) => {
    onConfigChange?.({ ...config, [field]: value });
  };

  const updateOption = (idx, field, val) => {
    const newOptions = [...shingleOptions];
    newOptions[idx][field] = val;
    handleFieldChange("shingleOptions", newOptions);
  };

  const addOption = () => {
    const newOptions = [
      ...shingleOptions,
      {
        title: "New Shingle",
        description: "",
        benefit: "",
      },
    ];
    handleFieldChange("shingleOptions", newOptions);
  };

  const removeOption = (idx) => {
    const newOptions = [...shingleOptions];
    newOptions.splice(idx, 1);
    handleFieldChange("shingleOptions", newOptions);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">Shingle Selector Editor</h3>

      {/* Section Title */}
      <label className="block text-sm mb-1">
        Section Title:
        <input
          type="text"
          value={sectionTitle}
          onChange={(e) => handleFieldChange("sectionTitle", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Options */}
      <div className="mt-2 space-y-2">
        {shingleOptions.map((opt, idx) => (
          <div key={idx} className="border border-gray-600 p-2 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Option {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            </div>
            <label className="block text-sm mb-1">
              Title:
              <input
                type="text"
                value={opt.title}
                onChange={(e) => updateOption(idx, "title", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            <label className="block text-sm mb-1">
              Description:
              <textarea
                rows={2}
                value={opt.description}
                onChange={(e) => updateOption(idx, "description", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            <label className="block text-sm mb-1">
              Benefit:
              <input
                type="text"
                value={opt.benefit}
                onChange={(e) => updateOption(idx, "benefit", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-sm"
      >
        + Add Shingle Option
      </button>
    </div>
  );
};

export default ShingleSelectorBlock;
