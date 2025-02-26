import React from "react";

/** 
 * The icons you allow for card icons 
 * Expand or customize as needed
 */
const ICON_OPTIONS = [
  "Star",
  "BadgeCheck",
  "CheckCircle2",
  "Tool",
  "Shield",
  "Sun",
  "Moon"
];

export default function RichTextEditor({ initialConfig, onConfigChange }) {
  const {
    heroText = "We Provide Quality Roofing Services",
    accredited = false,
    years_in_business = "14 Years in Business",
    cards = [],
    images = [],
  } = initialConfig;

  // Helper to shallow-merge updated fields
  const handleFieldChange = (field, value) => {
    onConfigChange?.({
      ...initialConfig,
      [field]: value,
    });
  };

  // Cards
  const updateCardField = (idx, field, value) => {
    const updated = [...cards];
    updated[idx] = { ...updated[idx], [field]: value };
    handleFieldChange("cards", updated);
  };

  const addCard = () => {
    handleFieldChange("cards", [
      ...cards,
      { title: "New Title", desc: "Description...", icon: ICON_OPTIONS[0] },
    ]);
  };

  const removeCard = (idx) => {
    const updated = [...cards];
    updated.splice(idx, 1);
    handleFieldChange("cards", updated);
  };

  // Images
  const updateImage = (idx, newUrl) => {
    const updated = [...images];
    updated[idx] = newUrl;
    handleFieldChange("images", updated);
  };

  const addImage = () => {
    handleFieldChange("images", [...images, ""]);
  };

  const removeImage = (idx) => {
    const updated = [...images];
    updated.splice(idx, 1);
    handleFieldChange("images", updated);
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded space-y-4">
      <h3 className="text-lg font-bold">Rich Text Block Editor</h3>

      {/* HeroText */}
      <label className="block mb-2">
        <span className="font-semibold text-sm">Hero Text</span>
        <input
          type="text"
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={heroText}
          onChange={(e) => handleFieldChange("heroText", e.target.value)}
        />
      </label>

      {/* Accredited */}
      <label className="flex items-center space-x-2 mb-2">
        <input
          type="checkbox"
          checked={accredited}
          onChange={(e) => handleFieldChange("accredited", e.target.checked)}
        />
        <span className="text-sm">BBB Accredited</span>
      </label>

      {/* Years in Business */}
      <label className="block mb-2">
        <span className="font-semibold text-sm">Years in Business</span>
        <input
          type="text"
          className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
          value={years_in_business}
          onChange={(e) =>
            handleFieldChange("years_in_business", e.target.value)
          }
        />
      </label>

      {/* Cards */}
      <div className="border border-gray-700 p-3 rounded mb-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm">Cards</h4>
          <button
            type="button"
            onClick={addCard}
            className="bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded text-sm"
          >
            + Add Card
          </button>
        </div>
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-gray-700 p-2 mb-2 rounded space-y-2 relative"
          >
            <button
              type="button"
              onClick={() => removeCard(idx)}
              className="absolute top-2 right-2 text-xs bg-red-600 px-2 py-1 rounded"
            >
              Remove
            </button>

            <label className="block">
              <span className="text-xs">Title</span>
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateCardField(idx, "title", e.target.value)}
                className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs">Description</span>
              <textarea
                rows={2}
                value={card.desc}
                onChange={(e) => updateCardField(idx, "desc", e.target.value)}
                className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs">Icon</span>
              <select
                value={card.icon}
                onChange={(e) => updateCardField(idx, "icon", e.target.value)}
                className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm mt-1"
              >
                {ICON_OPTIONS.map((iconName) => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      {/* Images (Slideshow) */}
      <div className="border border-gray-700 p-3 rounded mb-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm">Slideshow Images</h4>
          <button
            type="button"
            onClick={addImage}
            className="bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded text-sm"
          >
            + Add Image
          </button>
        </div>
        {images.map((imgUrl, iIdx) => (
          <div key={iIdx} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={imgUrl}
              onChange={(e) => updateImage(iIdx, e.target.value)}
              className="flex-1 bg-gray-600 text-white rounded px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => removeImage(iIdx)}
              className="bg-red-600 px-2 py-1 rounded text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
 