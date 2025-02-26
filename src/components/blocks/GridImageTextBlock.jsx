// src/components/blocks/GridImageTextBlock.jsx
import React from "react";

/**
 * GridImageTextBlock
 * 
 * config = {
 *   columns: number, // number of columns (1-6)
 *   items: [
 *     { title, image, alt, description }
 *   ]
 * }
 */
const GridImageTextBlock = ({ config = {}, readOnly = false, onConfigChange }) => {
  const { columns = 4, items = [] } = config;

  // READ ONLY version
  if (readOnly) {
    const colClass = `grid-cols-${columns >= 1 && columns <= 6 ? columns : 4}`;
    return (
      <section className="w-full">
        <div className="container mx-auto px-6 py-4 md:py-8">
          <div className={`grid gap-4 md:gap-8 ${colClass}`}>
            {items.map((item, idx) => (
              <div key={idx} className="bg-white shadow-md overflow-hidden">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.alt || item.title || ""}
                    className="w-full h-[12vh] md:h-48 object-cover"
                  />
                )}
                <div className="p-2 md:p-4">
                  {item.title && (
                    <h3 className="text-[3vw] md:text-xl font-semibold mb-1">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-[2.5vw] md:text-sm text-gray-700">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // EDIT MODE
  const handleFieldChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    handleFieldChange("items", newItems);
  };

  const addItem = () => {
    const newItems = [...items, { title: "", image: "", alt: "", description: "" }];
    handleFieldChange("items", newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    handleFieldChange("items", newItems);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">GridImageTextBlock Editor</h3>

      {/* Columns */}
      <label className="block text-sm mb-1">
        Number of Columns (1-6):
        <input
          type="number"
          value={columns}
          onChange={(e) => handleFieldChange("columns", parseInt(e.target.value, 10))}
          min={1}
          max={6}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Items */}
      <div className="mt-2 space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="border border-gray-600 p-2 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Item {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            </div>

            {/* Title */}
            <label className="block text-sm mb-1">
              Title:
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* Image Upload (no URL text input) */}
            <label className="block text-sm mb-1">
              Upload Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const fileURL = URL.createObjectURL(e.target.files[0]);
                    updateItem(idx, "image", fileURL);
                  }
                }}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            {item.image && (
              <img
                src={item.image}
                alt={item.alt || item.title}
                className="mt-2 h-24 rounded shadow"
              />
            )}

            {/* Alt Text */}
            <label className="block text-sm mb-1">
              Alt Text:
              <input
                type="text"
                value={item.alt}
                onChange={(e) => updateItem(idx, "alt", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* Description */}
            <label className="block text-sm mb-1">
              Description:
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
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
        + Add Item
      </button>
    </div>
  );
};

export default GridImageTextBlock;
