// src/components/blocks/HeaderBannerBlock.jsx
import React from "react";

/**
 * HeaderBannerBlock
 *
 * A full width banner with heading and subheading
 *
 * config = {
 *   title: string,
 *   subtitle: string,
 *   backgroundImage: string
 * }
 */
const HeaderBannerBlock = ({ config = {}, readOnly = false, onConfigChange }) => {
  const {
    title = "Welcome",
    subtitle = "Explore our services",
    backgroundImage = "",
  } = config;

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // Get the actual background image URL to display
  const displayBackground = getDisplayUrl(backgroundImage) || "/assets/images/default-banner.jpg";

  // READONLY
  if (readOnly) {
    return (
      <section 
        className="relative w-full py-4 md:py-6 lg:py-8 flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('${displayBackground}')`,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
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

  const handleImageUpload = (field, file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    handleFieldChange(field, fileURL);
  };

  return (
    <div className="p-4 bg-gray-700 rounded text-white">
      <h3 className="font-bold text-lg mb-4">Header Banner Editor</h3>

      {/* Title */}
      <label className="block text-sm mb-3">
        Banner Title:
        <input
          type="text"
          value={title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Subtitle */}
      <label className="block text-sm mb-3">
        Banner Subtitle:
        <textarea
          rows={2}
          value={subtitle}
          onChange={(e) => handleFieldChange("subtitle", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Background Image */}
      <label className="block text-sm mb-3">
        Background Image:
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleImageUpload("backgroundImage", e.target.files[0]);
            }
          }}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Image Preview */}
      {displayBackground && (
        <div className="mt-2">
          <p className="text-sm mb-1">Background Preview:</p>
          <img
            src={displayBackground}
            alt="Banner background preview"
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
};

export default HeaderBannerBlock;
