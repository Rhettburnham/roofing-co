// src/components/blocks/ActionButtonBlock.jsx
import React from "react";
import { HashLink } from "react-router-hash-link";

const ActionButtonBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    buttonText = "Schedule an Inspection",
    buttonLink = "/#book",
    buttonColor = "1", // "1", "2", or "3"
  } = config;

  // Map color label -> tailwind classes
  const colorMap = {
    1: "dark_button text-white", // your existing .dark_button style
    2: "bg-blue-600 text-white hover:bg-blue-500",
    3: "bg-green-600 text-white hover:bg-green-500",
  };
  const chosenColorClass = colorMap[buttonColor] || colorMap[1];

  // READ ONLY RENDER
  if (readOnly) {
    return (
      <div className="flex justify-center my-6">
        <HashLink
          to={buttonLink}
          className={`px-4 py-2 md:px-8 md:py-4 font-semibold rounded-full transition ${chosenColorClass}`}
          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
        >
          {buttonText}
        </HashLink>
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
      <h3 className="font-bold mb-2">Action Button Editor</h3>

      {/* Text */}
      <label className="block text-sm mb-1">
        Button Text:
        <input
          type="text"
          value={buttonText}
          onChange={(e) => handleChange("buttonText", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Link */}
      <label className="block text-sm mb-1">
        Button Link (URL or hash):
        <input
          type="text"
          value={buttonLink}
          onChange={(e) => handleChange("buttonLink", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Color */}
      <label className="block text-sm mb-1">
        Button Color Theme:
        <select
          value={buttonColor}
          onChange={(e) => handleChange("buttonColor", e.target.value)}
          className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
        >
          <option value="1">Theme 1 (dark_button)</option>
          <option value="2">Theme 2 (blue)</option>
          <option value="3">Theme 3 (green)</option>
        </select>
      </label>
    </div>
  );
};

export default ActionButtonBlock;
