// src/components/MainPageBlocks/HeroEditor.jsx
import React, { useState } from "react";

/**
 * HeroEditor
 * - Allows editing topLogoSrc, mainTitle, subTitle, BG images, and serviceDetails JSON
 * - Calls onConfigChange(updatedData) when user hits “Save”
 */
export default function HeroEditor({ initialHeroData, onConfigChange }) {
  const [localData, setLocalData] = useState(() => ({
    topLogoSrc: initialHeroData.topLogoSrc || "",
    mainTitle: initialHeroData.mainTitle || "",
    subTitle: initialHeroData.subTitle || "",
    residentialBg: initialHeroData.residentialBg || "",
    commercialBg: initialHeroData.commercialBg || "",
    serviceDetails: JSON.parse(JSON.stringify(initialHeroData.serviceDetails || {})),
  }));

  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Pass updated data back up to parent
    if (onConfigChange) {
      onConfigChange(localData);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded space-y-4">
      <h2 className="text-xl font-bold">Hero Block Editor</h2>

      <label className="block mb-2">
        <span className="font-semibold text-sm">Top Logo Src</span>
        <input
          type="text"
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={localData.topLogoSrc}
          onChange={(e) => handleFieldChange("topLogoSrc", e.target.value)}
        />
      </label>

      <label className="block mb-2">
        <span className="font-semibold text-sm">Main Title</span>
        <input
          type="text"
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={localData.mainTitle}
          onChange={(e) => handleFieldChange("mainTitle", e.target.value)}
        />
      </label>

      <label className="block mb-2">
        <span className="font-semibold text-sm">Sub Title</span>
        <input
          type="text"
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={localData.subTitle}
          onChange={(e) => handleFieldChange("subTitle", e.target.value)}
        />
      </label>

      <label className="block mb-2">
        <span className="font-semibold text-sm">Residential BG</span>
        <input
          type="text"
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={localData.residentialBg}
          onChange={(e) => handleFieldChange("residentialBg", e.target.value)}
        />
      </label>

      <label className="block mb-2">
        <span className="font-semibold text-sm">Commercial BG</span>
        <input
          type="text"
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={localData.commercialBg}
          onChange={(e) => handleFieldChange("commercialBg", e.target.value)}
        />
      </label>

      <label className="block mb-2">
        <span className="font-semibold text-sm">Service Details (JSON)</span>
        <textarea
          rows={10}
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={JSON.stringify(localData.serviceDetails, null, 2)}
          onChange={(e) => {
            // Attempt to parse user-edited JSON
            try {
              const parsed = JSON.parse(e.target.value);
              handleFieldChange("serviceDetails", parsed);
            } catch {
              // If invalid JSON, we simply ignore changes
            }
          }}
        />
      </label>

      <button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
      >
        Save Changes
      </button>
    </div>
  );
}
