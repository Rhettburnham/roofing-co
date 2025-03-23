// src/components/blocks/ThreeGridWithRichTextBlock.jsx
import React from "react";

/**
 * ThreeGridWithRichTextBlock
 * 
 * config = {
 *   paragraphText: string,
 *   items: [
 *     { title, image, alt } // each column
 *   ]
 * }
 */
const ThreeGridWithRichTextBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    paragraphText = "",
    items = [],
  } = config;

  // READ ONLY
  if (readOnly) {
    return (
      <section className="w-full bg-gradient-to-t from-accent to-white">
        <div className="container mx-auto text-center mb-4 px-6 md:px-10">
          {paragraphText && (
            <p className="text-xs md:text-lg text-gray-700 my-4 max-w-full overflow-hidden text-ellipsis font-serif">
              {paragraphText}
            </p>
          )}
        </div>
        <div className="container mx-auto">
          <div className="grid gap-8 grid-cols-3 px-2 md:px-10">
            {items.map((col, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                {col.image && (
                  <img
                    src={col.image}
                    alt={col.alt || col.title || ""}
                    className="w-full h-[15vh] md:h-48 object-cover shadow-md"
                  />
                )}
                {col.title && (
                  <h3 className="text-md md:text-xl font-semibold mt-3 md:mt-6">
                    {col.title}
                  </h3>
                )}
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

  const updateItemField = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx][field] = val;
    handleFieldChange("items", newItems);
  };

  const addColumn = () => {
    const newItems = [...items, { title: "", image: "", alt: "" }];
    handleFieldChange("items", newItems);
  };

  const removeColumn = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    handleFieldChange("items", newItems);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">ThreeGridWithRichText Editor</h3>

      {/* paragraphText */}
      <label className="block text-sm mb-2">
        Paragraph Text:
        <textarea
          rows={2}
          value={paragraphText}
          onChange={(e) => handleFieldChange("paragraphText", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Items */}
      {items.map((col, idx) => (
        <div key={idx} className="border border-gray-600 p-2 rounded mb-2">
          <div className="flex justify-between items-center mb-1">
            <span>Column {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeColumn(idx)}
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
              value={col.title}
              onChange={(e) => updateItemField(idx, "title", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>

          {/* Image URL */}
          <label className="block text-sm mb-1">
            Image URL:
            <input
              type="text"
              value={col.image}
              onChange={(e) => updateItemField(idx, "image", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />
          </label>

          {/* Alt Text */}
          <label className="block text-sm mb-1">
            Alt Text:
            <input
              type="text"
              value={col.alt}
              onChange={(e) => updateItemField(idx, "alt", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
            />le
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={addColumn}
        className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
      >
        + Add Column
      </button>
    </div>
  );
};

export default ThreeGridWithRichTextBlock;
