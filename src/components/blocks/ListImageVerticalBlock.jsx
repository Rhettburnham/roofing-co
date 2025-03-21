// src/components/blocks/ListImageVerticalBlock.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * ListImageVerticalBlock
 * 
 * config = {
 *   title: "Our Installation Process",
 *   items: [
 *     {
 *       number: string,  // e.g. "1"
 *       title: string,
 *       description: string,
 *       image: string,
 *       icon?: maybe an svg or icon name
 *     }
 *   ]
 *   enableAnimation?: boolean
 * }
 */
const ListImageVerticalBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    title = "Our Steps",
    items = [],
    enableAnimation = false,
  } = config;

  // Simple variants if we want a stagger animation
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // READ ONLY
  if (readOnly) {
    return (
      <section className="pb-6">
        <h2 className="text-2xl font-semibold text-center my-4">{title}</h2>

        {enableAnimation ? (
          <motion.div
            className="space-y-8 px-4 md:px-10 pt-6"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            {items.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col md:flex-row items-center md:items-start md:space-x-10"
                variants={itemVariants}
              >
                {/* Step Image */}
                {step.image && (
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full md:w-auto object-cover rounded-md shadow-md mb-2 md:mb-0 h-[22vh] md:h-40"
                  />
                )}
                {/* Step Text */}
                <div className="md:w-2/3">
                  <div className="flex items-center space-x-2 mb-2">
                    {step.number && (
                      <div className="text-lg md:text-2xl font-bold text-gray-700">
                        {step.number}
                      </div>
                    )}
                    <h3 className="text-lg md:text-2xl font-semibold text-gray-700">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-600">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="space-y-8 px-4 md:px-10 pt-6">
            {items.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center md:items-start md:space-x-10"
              >
                {step.image && (
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full md:w-auto object-cover rounded-md shadow-md mb-2 md:mb-0 h-[22vh] md:h-40"
                  />
                )}
                <div className="md:w-2/3">
                  <div className="flex items-center space-x-2 mb-2">
                    {step.number && (
                      <div className="text-lg md:text-2xl font-bold text-gray-700">
                        {step.number}
                      </div>
                    )}
                    <h3 className="text-lg md:text-2xl font-semibold text-gray-700">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // EDIT MODE
  const handleChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  const updateItemField = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx][field] = val;
    handleChange("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...items,
      { number: "", title: "", description: "", image: "" },
    ];
    handleChange("items", newItems);
  };

  const removeItem = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    handleChange("items", newItems);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">ListImageVertical Editor</h3>

      {/* Title */}
      <label className="block text-sm mb-1">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* enableAnimation */}
      <label className="inline-flex items-center text-sm mb-2">
        <input
          type="checkbox"
          checked={enableAnimation}
          onChange={(e) => handleChange("enableAnimation", e.target.checked)}
          className="mr-1"
        />
        Enable Animation
      </label>

      {/* Items */}
      <div className="mt-2 space-y-2">
        {items.map((step, idx) => (
          <div key={idx} className="border border-gray-600 p-2 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Step {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            </div>
            {/* number */}
            <label className="block text-sm mb-1">
              Step Number:
              <input
                type="text"
                value={step.number}
                onChange={(e) => updateItemField(idx, "number", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            {/* title */}
            <label className="block text-sm mb-1">
              Title:
              <input
                type="text"
                value={step.title}
                onChange={(e) => updateItemField(idx, "title", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            {/* description */}
            <label className="block text-sm mb-1">
              Description:
              <textarea
                rows={2}
                value={step.description}
                onChange={(e) => updateItemField(idx, "description", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            {/* image */}
            <label className="block text-sm mb-1">
              Image URL:
              <input
                type="text"
                value={step.image}
                onChange={(e) => updateItemField(idx, "image", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-sm"
      >
        + Add Step
      </button>
    </div>
  );
};

export default ListImageVerticalBlock;
