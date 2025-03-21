// src/components/blocks/HeaderBannerBlock.jsx
import React from "react";

/**
 * HeaderBannerBlock
 * 
 * config = {
 *   title: "Gutter Options",
 *   textAlign: "center" | "left" | "right",
 *   fontSize: "text-2xl",
 *   textColor: "#ffffff",
 *   bannerHeight: "h-16",
 *   paddingY: "py-4",
 *   backgroundImage: "/assets/images/growth/hero_growth.jpg",
 * }
 */
const HeaderBannerBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    title = "Header Title",
    textAlign = "center",
    fontSize = "text-2xl",
    textColor = "#ffffff",
    bannerHeight = "h-16",
    paddingY = "py-4",
    backgroundImage = "/assets/images/growth/hero_growth.jpg",
  } = config;

  // READ ONLY
  if (readOnly) {
    return (
      <div className={`relative ${bannerHeight} mb-6 ${paddingY}`}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundAttachment: "fixed",
          }}
        ></div>
        {/* Overlay */}
        <div className="absolute inset-0 dark-below-header"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h2
            className={`${fontSize} font-semibold`}
            style={{ color: textColor, textAlign }}
          >
            {title}
          </h2>
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

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">Header Banner Editor</h3>

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

      {/* Text Alignment */}
      <label className="block text-sm mb-1">
        Text Alignment:
        <select
          value={textAlign}
          onChange={(e) => handleChange("textAlign", e.target.value)}
          className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

      {/* Font Size */}
      <label className="block text-sm mb-1">
        Font Size:
        <select
          value={fontSize}
          onChange={(e) => handleChange("fontSize", e.target.value)}
          className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
        >
          <option value="text-lg">text-lg</option>
          <option value="text-xl">text-xl</option>
          <option value="text-2xl">text-2xl</option>
          <option value="text-3xl">text-3xl</option>
          <option value="text-4xl">text-4xl</option>
        </select>
      </label>

      {/* Text Color */}
      <label className="block text-sm mb-1">
        Text Color:
        <input
          type="color"
          value={textColor}
          onChange={(e) => handleChange("textColor", e.target.value)}
          className="mt-1 w-16 h-8 border border-gray-500 rounded"
        />
      </label>

      {/* Banner Height */}
      <label className="block text-sm mb-1">
        Banner Height (Tailwind class):
        <input
          type="text"
          value={bannerHeight}
          onChange={(e) => handleChange("bannerHeight", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          placeholder="e.g. h-16, h-20, etc."
        />
      </label>

      {/* Vertical Padding */}
      <label className="block text-sm mb-1">
        Vertical Padding (Tailwind class):
        <input
          type="text"
          value={paddingY}
          onChange={(e) => handleChange("paddingY", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          placeholder="e.g. py-4"
        />
      </label>

      {/* Background Image */}
      <label className="block text-sm mb-1">
        Background Image URL:
        <input
          type="text"
          value={backgroundImage}
          onChange={(e) => handleChange("backgroundImage", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>
    </div>
  );
};

export default HeaderBannerBlock;
