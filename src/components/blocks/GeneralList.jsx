// src/components/blocks/GeneralList.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

/**
 * GeneralList
 * 
 * config: {
 *   sectionTitle: string,
 *   items: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       advantages: string[],
 *       colorPossibilities?: string,
 *       installationTime?: string,
 *       pictures: string[]
 *     },
 *     ...
 *   ]
 * }
 */
const GeneralList = ({ config = {}, readOnly = false, onConfigChange }) => {
  const { sectionTitle = "Select a Siding Type", items = [] } = config;

  // For readOnly mode, we track which item is selected
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // ---------- READONLY MODE -----------
  if (readOnly) {
    const activeItem = items[selectedIndex] || {};

    return (
      <section className="my-2 md:my-4 px-4 md:px-16">
        {/* Title */}
        <h2 className="flex justify-center text-[3.5vh] font-semibold mb-0.5 text-center">
          {sectionTitle}
        </h2>

        {/* “Siding selection” buttons */}
        <div className="flex flex-wrap justify-center mt-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`mx-2 my-1 md:px-4 px-2 py-1 md:py-2 text-[3vw] md:text-[2vh] 
                rounded-full font-semibold shadow-lg ${
                  selectedIndex === index
                    ? "dark_button text-white font-semibold shadow-2xl"
                    : "bg-gray-200 text-black"
                }`}
              style={{ transition: "box-shadow 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 0 15px 1px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              {item.name || `Option ${index + 1}`}
            </button>
          ))}
        </div>

        {/* Display selected item */}
        <motion.div
          key={activeItem.id}
          className="flex flex-col items-start bg-white rounded-2xl shadow-lg p-6 transition-all duration-500 mx-4 md:mx-16 md:mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full">
            {/* Name & Description */}
            {activeItem.name && (
              <h3 className="text-[5.5vw] md:text-2xl font-semibold mb-1 md:mb-4 text-gray-800">
                {activeItem.name}
              </h3>
            )}
            {activeItem.description && (
              <p className="text-gray-700 text-[2.9vw] md:text-xl">
                {activeItem.description}
              </p>
            )}

            {/* Advantages */}
            {activeItem.advantages && activeItem.advantages.length > 0 && (
              <div className="mt-2 md:mt-4">
                <h4 className="text-[3.5vw] md:text-2xl font-semibold mb-2 text-gray-800">
                  Advantages:
                </h4>
                <ul className="list-none pl-0">
                  {activeItem.advantages.map((adv, i) => (
                    <li
                      key={i}
                      className="flex items-start text-[3vw] md:text-lg text-gray-700 mb-1"
                    >
                      <FaCheckCircle className="text-green-600 mr-2 mt-[3px]" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Info */}
            {(activeItem.colorPossibilities || activeItem.installationTime) && (
              <div className="mt-2 md:mt-4">
                {activeItem.colorPossibilities && (
                  <p className="text-gray-700 mb-2 text-[3vw] md:text-xl">
                    <strong className="text-[3.5vw] md:text-xl">
                      Color Possibilities:{" "}
                    </strong>
                    {activeItem.colorPossibilities}
                  </p>
                )}
                {activeItem.installationTime && (
                  <p className="text-gray-700 text-[3vw] md:text-xl">
                    <strong className="text-[3.5vw] md:text-xl">
                      Installation Time:{" "}
                    </strong>
                    {activeItem.installationTime}
                  </p>
                )}
              </div>
            )}

            {/* Pictures */}
            {activeItem.pictures && activeItem.pictures.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeItem.pictures.map((pic, picIdx) => (
                  <img
                    key={picIdx}
                    src={typeof pic === "string" ? pic : pic.url}
                    alt={`${activeItem.name} - Image ${picIdx + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    );
  }

  // ---------- EDIT MODE -----------
  const handleFieldChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  // Updaters for items array
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: "",
      description: "",
      advantages: [],
      colorPossibilities: "",
      installationTime: "",
      pictures: [],
    };
    handleFieldChange("items", [...items, newItem]);
  };

  const removeItem = (id) => {
    handleFieldChange(
      "items",
      items.filter((i) => i.id !== id)
    );
  };

  const updateItemField = (id, field, newVal) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, [field]: newVal } : i
    );
    handleFieldChange("items", updated);
  };

  const addAdvantage = (id) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, advantages: [...i.advantages, ""] } : i
    );
    handleFieldChange("items", updated);
  };

  const updateAdvantage = (id, idx, newVal) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const adv = [...i.advantages];
        adv[idx] = newVal;
        return { ...i, advantages: adv };
      }
      return i;
    });
    handleFieldChange("items", updated);
  };

  const removeAdvantage = (id, idx) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const adv = [...i.advantages];
        adv.splice(idx, 1);
        return { ...i, advantages: adv };
      }
      return i;
    });
    handleFieldChange("items", updated);
  };

  const addPicture = (id) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, pictures: [...i.pictures, ""] } : i
    );
    handleFieldChange("items", updated);
  };

  const updatePicture = (id, idx, newVal) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const pics = [...i.pictures];
        pics[idx] = newVal;
        return { ...i, pictures: pics };
      }
      return i;
    });
    handleFieldChange("items", updated);
  };

  const removePicture = (id, idx) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const pics = [...i.pictures];
        pics.splice(idx, 1);
        return { ...i, pictures: pics };
      }
      return i;
    });
    handleFieldChange("items", updated);
  };

  const handleImageUpload = (itemIndex, picIndex, file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Update the pictures array with just the URL
    const updatedItems = [...items];
    if (!updatedItems[itemIndex].pictures) {
      updatedItems[itemIndex].pictures = [];
    }

    if (picIndex === undefined) {
      // Add new image
      updatedItems[itemIndex].pictures.push(fileURL);
    } else {
      // Replace existing image
      updatedItems[itemIndex].pictures[picIndex] = fileURL;
    }

    handleFieldChange("items", updatedItems);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">General List Block Editor</h3>
      {/* Section Title */}
      <label className="block text-sm mb-2">
        Section Title:
        <input
          type="text"
          value={sectionTitle}
          onChange={(e) => handleFieldChange("sectionTitle", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Items Editor */}
      <div className="mt-2 space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="border border-gray-600 rounded p-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Item {index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>

            {/* Name */}
            <label className="block text-sm mb-1">
              Name:
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateItemField(item.id, "name", e.target.value)
                }
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* Description */}
            <label className="block text-sm mb-1">
              Description:
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) =>
                  updateItemField(item.id, "description", e.target.value)
                }
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* Advantages */}
            <div className="mb-1">
              <h4 className="font-semibold">Advantages:</h4>
              {item.advantages.map((adv, advIdx) => (
                <div key={advIdx} className="flex items-center mb-1">
                  <input
                    type="text"
                    value={adv}
                    onChange={(e) =>
                      updateAdvantage(item.id, advIdx, e.target.value)
                    }
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                  />
                  <button
                    onClick={() => removeAdvantage(item.id, advIdx)}
                    className="ml-2 text-red-300 hover:text-red-500"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addAdvantage(item.id)}
                className="px-2 py-1 bg-blue-600 text-white rounded"
              >
                + Add Advantage
              </button>
            </div>

            {/* colorPossibilities */}
            <label className="block text-sm mb-1">
              Color Possibilities:
              <input
                type="text"
                value={item.colorPossibilities}
                onChange={(e) =>
                  updateItemField(item.id, "colorPossibilities", e.target.value)
                }
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* installationTime */}
            <label className="block text-sm mb-1">
              Installation Time:
              <input
                type="text"
                value={item.installationTime}
                onChange={(e) =>
                  updateItemField(item.id, "installationTime", e.target.value)
                }
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* Pictures */}
            <div>
              <h4 className="font-semibold">Pictures:</h4>
              {item.pictures.map((pic, picIdx) => (
                <div key={picIdx} className="flex items-center mb-1">
                  <input
                    type="text"
                    value={pic}
                    onChange={(e) =>
                      updatePicture(item.id, picIdx, e.target.value)
                    }
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
                  />
                  <button
                    onClick={() => removePicture(item.id, picIdx)}
                    className="ml-2 text-red-300 hover:text-red-500"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPicture(item.id)}
                className="px-2 py-1 bg-blue-600 text-white rounded"
              >
                + Add Picture
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
      >
        + Add New Item
      </button>
    </div>
  );
};

export default GeneralList;
