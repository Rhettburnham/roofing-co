// src/components/blocks/ImageWrapBlock.jsx
import React from "react";

/**
 * ImageWrapBlock
 * 
 * config = {
 *   imageUrl: string,
 *   altText: string,
 *   paragraph: string,
 *   floatSide: "left" | "right",
 *   maxWidthPx: number
 * }
 */
const ImageWrapBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    imageUrl = "/assets/images/ventilation/roof_installation.webp",
    altText = "Energy Efficiency",
    paragraph = "Your paragraph text here...",
    floatSide = "left",
    maxWidthPx = 300,
  } = config;

  // READ ONLY
  if (readOnly) {
    // floatSide => sets the image float left or right, add margin
    const floatClass = floatSide === "right" ? "float-right ml-4" : "float-left mr-4";

    return (
      <div className="px-4 md:px-10 py-4 md:py-6">
        <div className="relative">
          <img
            src={imageUrl}
            alt={altText}
            style={{ maxWidth: `${maxWidthPx}px` }}
            className={`${floatClass} mb-2 md:mb-4 rounded-lg shadow-lg`}
          />
          <p className="text-[2vw] md:text-sm text-gray-700">
            {paragraph}
          </p>
        </div>
        {/* CLEARFIX DIV => ensures no overlap after float */}
        <div className="clear-both"></div>
      </div>
    );
  }

  // EDIT MODE
  const handleFieldChange = (field, val) => {
    onConfigChange?.({
      ...config,
      [field]: val,
    });
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">ImageWrapBlock Editor</h3>

      {/* imageUrl */}
      <label className="block text-sm mb-1">
        Image URL:
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>

      {/* altText */}
      <label className="block text-sm mb-1">
        Alt Text:
        <input
          type="text"
          value={altText}
          onChange={(e) => handleFieldChange("altText", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>

      {/* paragraph */}
      <label className="block text-sm mb-1">
        Paragraph:
        <textarea
          rows={3}
          value={paragraph}
          onChange={(e) => handleFieldChange("paragraph", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>

      {/* floatSide */}
      <label className="block text-sm mb-1">
        Float Side:
        <select
          value={floatSide}
          onChange={(e) => handleFieldChange("floatSide", e.target.value)}
          className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </label>

      {/* maxWidthPx */}
      <label className="block text-sm mb-1">
        Max Image Width (px):
        <input
          type="number"
          value={maxWidthPx}
          onChange={(e) => handleFieldChange("maxWidthPx", parseInt(e.target.value, 10))}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>
    </div>
  );
};

export default ImageWrapBlock;
