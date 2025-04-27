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
const GridImageTextBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const { columns = 4, items = [] } = config;

  // Default image to use when no image is provided
  const defaultImage = "/assets/images/placeholder.jpg";

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // READ ONLY version
  if (readOnly) {
    // Set a reasonable default for columns that's responsive
    // Using template literals for dynamic class generation is not recommended
    // Instead, create conditional logic to determine the class
    const getColClass = () => {
      const safeCols = Math.min(columns, 3);
      switch(safeCols) {
        case 1: return "grid-cols-1";
        case 2: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-2";
        case 3: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3";
        default: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-2";
      }
    };

    return (
      <section className="w-full py-0">
        <div className="container mx-auto px-4">
          <div className={`grid ${getColClass()} gap-4 @container`}>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded overflow-hidden h-full flex flex-col"
              >
                {getDisplayUrl(item.image) && (
                  <div className="w-full aspect-video overflow-hidden">
                    <img
                      src={getDisplayUrl(item.image)}
                      alt={item.alt || item.title || "Feature"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-grow">
                  {item.title && (
                    <h3 className="text-lg @md:text-xl font-semibold mb-2">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-gray-700 text-sm @md:text-base">{item.description}</p>
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
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    handleFieldChange("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...items,
      { title: "", image: "", alt: "", description: "" },
    ];
    handleFieldChange("items", newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    handleFieldChange("items", newItems);
  };

  const handleImageUpload = (idx, file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    updateItem(idx, "image", fileURL);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">GridImageTextBlock Editor</h3>

      {/* Columns */}
      <label className="block text-sm mb-1">
        Number of Columns (1-3):
        <input
          type="number"
          value={columns}
          onChange={(e) =>
            handleFieldChange(
              "columns",
              Math.min(Math.max(parseInt(e.target.value, 10), 1), 3)
            )
          }
          min={1}
          max={3}
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
                value={item.title || ""}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* Image Upload */}
            <label className="block text-sm mb-1">
              Upload Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(idx, e.target.files[0]);
                  }
                }}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            {getDisplayUrl(item.image) && (
              <img
                src={getDisplayUrl(item.image)}
                alt={item.alt || item.title || "Preview"}
                className="mt-2 h-24 object-cover rounded w-full"
              />
            )}

            {/* Alt Text */}
            <label className="block text-sm mb-1">
              Alt Text:
              <input
                type="text"
                value={item.alt || ""}
                onChange={(e) => updateItem(idx, "alt", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>

            {/* Description */}
            <label className="block text-sm mb-1">
              Description:
              <textarea
                rows={2}
                value={item.description || ""}
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
