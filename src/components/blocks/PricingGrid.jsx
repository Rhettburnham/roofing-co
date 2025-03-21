// src/components/blocks/PricingGrid.jsx
import React from "react";

/**
 * PricingGrid
 * 
 * config = {
 *   showPrice: true,
 *   items: [
 *     {
 *       title: string,
 *       image: string,
 *       alt: string,
 *       description: string,
 *       rate: string
 *     },
 *     ...
 *   ]
 * }
 */
const PricingGrid = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    showPrice = true,
    items = [],
  } = config;

  // READ ONLY
  if (readOnly) {
    return (
      <div className="container mx-auto px-4 md:px-10 mb-4 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {items.map((g, idx) => (
            <div
              key={idx}
              className="relative flex flex-col md:flex-row items-center md:space-x-4 p-2 md:p-6 rounded-lg shadow-md bg-gray-50 transition-all duration-300"
            >
              <img
                src={g.image}
                alt={g.alt}
                className={`md:w-32 md:h-32 rounded-lg ${
                  g.title === "Steel Gutters" ? "transform -scale-x-100" : ""
                }`}
              />
              <div className="mt-2 md:mt-0">
                <h3 className="text-lg font-bold">{g.title}</h3>
                <p className="text-sm md:text-base text-gray-700">
                  {g.description}
                </p>
                {showPrice && (
                  <p className="text-sm md:text-base font-semibold mt-1">
                    {g.rate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
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

  const updateItem = (index, field, val) => {
    const newItems = [...items];
    newItems[index][field] = val;
    handleChange("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        title: "",
        image: "",
        alt: "",
        description: "",
        rate: "",
      },
    ];
    handleChange("items", newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    handleChange("items", newItems);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">Pricing Grid Editor</h3>

      {/* Show Price toggle */}
      <label className="block text-sm mb-2">
        <input
          type="checkbox"
          checked={showPrice}
          onChange={(e) => handleChange("showPrice", e.target.checked)}
          className="mr-2"
        />
        Show Price?
      </label>

      {/* Items Editor */}
      {items.map((item, idx) => (
        <div key={idx} className="border border-gray-600 p-2 rounded mb-2">
          <div className="flex justify-between items-center mb-2">
            <span>Item {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="bg-red-600 text-white px-2 py-1 rounded text-sm"
            >
              Remove
            </button>
          </div>

          <label className="block text-sm mb-1">
            Title:
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(idx, "title", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>
          <label className="block text-sm mb-1">
            Image URL:
            <input
              type="text"
              value={item.image}
              onChange={(e) => updateItem(idx, "image", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>
          <label className="block text-sm mb-1">
            Alt Text:
            <input
              type="text"
              value={item.alt}
              onChange={(e) => updateItem(idx, "alt", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>
          <label className="block text-sm mb-1">
            Description:
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>
          <label className="block text-sm mb-1">
            Rate:
            <input
              type="text"
              value={item.rate}
              onChange={(e) => updateItem(idx, "rate", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
      >
        + Add Item
      </button>
    </div>
  );
};

export default PricingGrid;
