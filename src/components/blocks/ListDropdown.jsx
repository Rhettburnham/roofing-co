// src/components/blocks/ListDropdown.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown'; // Make sure this is installed or comment it out if not

/**
 * ListDropdown
 * 
 * config = {
 *   title: string,
 *   items: [
 *     {
 *       title: string,
 *       content: string,
 *       // Legacy properties still supported:
 *       causes?: string,
 *       impact?: string,
 *       diagnosis?: string[],
 *     },
 *     ...
 *   ],
 *   textColor: "#000000"
 * }
 */
const ListDropdown = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    title = "Maintenance Guide",
    items = [],
    textColor = "#000000",
  } = config;

  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleIndex = (i) => {
    if (openIndexes.includes(i)) {
      setOpenIndexes(openIndexes.filter((x) => x !== i));
    } else {
      setOpenIndexes([...openIndexes, i]);
    }
  };

  // READ ONLY
  if (readOnly) {
    return (
      <div className="container mx-auto w-full px-4 pb-4 md:pb-8">
        {title && (
          <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
        )}
        
        {items.map((item, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden shadow-lg mb-2">
            <button
              onClick={() => toggleIndex(idx)}
              className="w-full text-left px-3 py-2 md:px-6 md:py-4 dark_button group hover:bg-white transition-all duration-300 focus:outline-none"
              style={{ color: "#fff" }}
              aria-expanded={openIndexes.includes(idx)}
            >
              <div className="flex justify-between items-center">
                <h2
                  className="text-base md:text-2xl font-semibold transition-colors duration-300"
                  style={{ color: openIndexes.includes(idx) ? "#000" : "#fff" }}
                >
                  {item.title}
                </h2>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    openIndexes.includes(idx) ? "rotate-180" : "-rotate-90"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ color: openIndexes.includes(idx) ? "#000" : "#fff" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>
            <AnimatePresence>
              {openIndexes.includes(idx) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="px-4 md:px-6 py-2 md:py-4 bg-white text-sm md:text-base"
                    style={{ color: textColor }}
                  >
                    {/* Content section - try to use markdown rendering if available */}
                    {item.content && (
                      <div className="content">
                        {typeof ReactMarkdown !== 'undefined' ? (
                          <ReactMarkdown>{item.content}</ReactMarkdown>
                        ) : (
                          <p>{item.content}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Legacy properties support */}
                    {!item.content && (
                      <>
                        {item.causes && (
                          <p className="mt-1">
                            <strong>Causes:</strong> {item.causes}
                          </p>
                        )}
                        {item.impact && (
                          <p className="mt-1">
                            <strong>Impact:</strong> {item.impact}
                          </p>
                        )}
                        {item.diagnosis?.length > 0 && (
                          <div className="mt-1">
                            <strong>Diagnosis:</strong>
                            <ul className="list-disc list-inside ml-5 mt-1">
                              {item.diagnosis.map((d, dIdx) => (
                                <li key={dIdx}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  }

  // EDIT MODE
  const handleChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  const addItem = () => {
    const newItem = {
      title: "",
      content: "",
      causes: "",
      impact: "",
      diagnosis: [],
    };
    handleChange("items", [...items, newItem]);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    handleChange("items", updated);
  };

  const updateItemField = (index, field, val) => {
    const updated = [...items];
    updated[index][field] = val;
    handleChange("items", updated);
  };

  const addDiagnosis = (index) => {
    const updated = [...items];
    if (!updated[index].diagnosis) {
      updated[index].diagnosis = [];
    }
    updated[index].diagnosis.push("");
    handleChange("items", updated);
  };

  const updateDiagnosis = (index, dIndex, val) => {
    const updated = [...items];
    if (!updated[index].diagnosis) {
      updated[index].diagnosis = [];
    }
    updated[index].diagnosis[dIndex] = val;
    handleChange("items", updated);
  };

  const removeDiagnosis = (index, dIndex) => {
    const updated = [...items];
    if (!updated[index].diagnosis) {
      updated[index].diagnosis = [];
    }
    updated[index].diagnosis.splice(dIndex, 1);
    handleChange("items", updated);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">ListDropdown Editor</h3>

      {/* Title */}
      <label className="block text-sm mb-2">
        Block Title:
        <input
          type="text"
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* textColor */}
      <label className="block text-sm mb-2">
        Content Text Color:
        <input
          type="color"
          value={textColor}
          onChange={(e) => handleChange("textColor", e.target.value)}
          className="mt-1 w-16 h-8 border border-gray-600 rounded"
        />
      </label>

      {/* items */}
      {items.map((item, idx) => (
        <div key={idx} className="border border-gray-600 p-2 rounded mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold">Item {idx + 1}</span>
            <button
              className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              onClick={() => removeItem(idx)}
            >
              Remove
            </button>
          </div>

          {/* Title */}
          <label className="block text-sm mb-1">
            Title:
            <input
              type="text"
              value={item.title || ""}
              onChange={(e) => updateItemField(idx, "title", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>

          {/* Content */}
          <label className="block text-sm mb-1">
            Content:
            <textarea
              rows={4}
              value={item.content || ""}
              onChange={(e) => updateItemField(idx, "content", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              placeholder="Enter content with markdown support"
            />
          </label>

          {/* Legacy Fields - show collapsible section */}
          <details className="mt-2 mb-2">
            <summary className="text-sm font-semibold cursor-pointer">Legacy Fields (Optional)</summary>
            <div className="pl-2 mt-2 border-l-2 border-gray-600">
              {/* Causes */}
              <label className="block text-sm mb-1">
                Causes:
                <textarea
                  rows={2}
                  value={item.causes || ""}
                  onChange={(e) => updateItemField(idx, "causes", e.target.value)}
                  className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                />
              </label>

              {/* Impact */}
              <label className="block text-sm mb-1">
                Impact:
                <textarea
                  rows={2}
                  value={item.impact || ""}
                  onChange={(e) => updateItemField(idx, "impact", e.target.value)}
                  className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                />
              </label>

              {/* Diagnosis */}
              <label className="block text-sm font-semibold mb-1 mt-2">Diagnosis:</label>
              {(item.diagnosis || []).map((d, dIndex) => (
                <div key={dIndex} className="flex mb-1">
                  <input
                    type="text"
                    value={d}
                    onChange={(e) => updateDiagnosis(idx, dIndex, e.target.value)}
                    className="flex-grow px-2 py-1 bg-gray-600 text-white rounded-l border border-gray-500"
                  />
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded-r border border-red-700"
                    onClick={() => removeDiagnosis(idx, dIndex)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                onClick={() => addDiagnosis(idx)}
              >
                Add Diagnosis
              </button>
            </div>
          </details>
        </div>
      ))}

      <button
        className="bg-blue-600 text-white px-3 py-2 rounded font-semibold"
        onClick={addItem}
      >
        Add Item
      </button>
    </div>
  );
};

export default ListDropdown;
