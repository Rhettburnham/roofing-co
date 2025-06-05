// src/components/blocks/ImageWrapBlock.jsx
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import PanelImagesController from "../common/PanelImagesController"; // Assuming this path is correct

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

// Helper to initialize image state
const initializeImageState = (imageValue, defaultPath = '') => {
  let fileObject = null;
  let urlToDisplay = defaultPath;
  let nameToStore = defaultPath.split('/').pop();
  let originalUrlToStore = defaultPath;

  if (imageValue && typeof imageValue === 'object') {
    urlToDisplay = imageValue.url || defaultPath;
    nameToStore = imageValue.name || urlToDisplay.split('/').pop();
    fileObject = imageValue.file || null;
    originalUrlToStore = imageValue.originalUrl || (typeof imageValue.url === 'string' && !imageValue.url.startsWith('blob:') ? imageValue.url : defaultPath);
  } else if (typeof imageValue === 'string') {
    urlToDisplay = imageValue;
    nameToStore = imageValue.split('/').pop();
    originalUrlToStore = imageValue;
  }
  return { file: fileObject, url: urlToDisplay, name: nameToStore, originalUrl: originalUrlToStore };
};

// Helper to get display URL
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === 'string') return imageValue;
  if (typeof imageValue === 'object' && imageValue.url) return imageValue.url;
  return defaultPath;
};

const ImageWrapBlock = ({ config = {} }) => {
  const {
    imageUrl = "/assets/images/ventilation/roof_installation.webp",
    altText = "Energy Efficiency",
    paragraph = "Your paragraph text here...",
    floatSide = "left",
    maxWidthPx = 300,
  } = config;

  const displayImageUrl = getDisplayUrl(imageUrl);
  const floatClass = floatSide === "right" ? "float-right ml-4 md:ml-6" : "float-left mr-4 md:mr-6";

  return (
    <div className="px-4 md:px-10 py-4 md:py-6 text-gray-700">
      <div className="clearfix"> {/* Clearfix for float containment */}
        {displayImageUrl && (
          <img
            src={displayImageUrl}
            alt={altText}
            style={{ maxWidth: `${maxWidthPx}px` }}
            className={`${floatClass} mb-2 md:mb-4 rounded-lg shadow-lg max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg`}
          />
        )}
        <div className="text-sm md:text-base leading-relaxed whitespace-pre-line">
          {paragraph.split('\n').map((line, index, array) => (
            <React.Fragment key={index}>
              {line}
              {index < array.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

ImageWrapBlock.propTypes = {
  config: PropTypes.shape({
    imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    altText: PropTypes.string,
    paragraph: PropTypes.string,
    floatSide: PropTypes.oneOf(["left", "right"]),
    maxWidthPx: PropTypes.number,
  }),
  // readOnly and onConfigChange are no longer direct props for block rendering
};

ImageWrapBlock.tabsConfig = (currentConfig, onPanelChange, themeColors, sitePalette) => {
  const {
    imageUrl, // This will be an object from PanelImagesController {url, name, file, originalUrl} or string
    altText = "Energy Efficiency",
    paragraph = "Your paragraph text here...",
    floatSide = "left",
    maxWidthPx = 300,
  } = currentConfig;

  const handlePanelFieldChange = (field, value) => {
    onPanelChange({ ...currentConfig, [field]: value });
  };

  // Prepare data for PanelImagesController (single image)
  const imageForController = imageUrl 
    ? (typeof imageUrl === 'string' 
        ? [{ url: imageUrl, id: 'wrappedImage', name: 'Image', originalUrl: imageUrl }]
        : [{ ...imageUrl, id: 'wrappedImage', name: imageUrl.name || 'Image'}]) 
    : [];

  const onImageControllerChange = (updatedData) => {
    const newImageArray = updatedData.images || [];
    if (newImageArray.length > 0) {
      // If a file was uploaded, newImageArray[0] will have {file, url (blob), name, originalUrl}
      // If URL was pasted, newImageArray[0] will have {url, name, originalUrl}
      onPanelChange({ ...currentConfig, imageUrl: newImageArray[0] });
    } else {
      // Clear image
      onPanelChange({ ...currentConfig, imageUrl: { url: '', name: '', originalUrl: '', file: null } }); 
    }
  };

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="paragraphInput" className="block text-sm font-medium text-gray-700">Paragraph Text:</label>
          <textarea
            id="paragraphInput"
            rows={5}
            value={paragraph}
            onChange={(e) => handlePanelFieldChange("paragraph", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter paragraph text..."
          />
        </div>
        <div>
          <label htmlFor="altTextInput" className="block text-sm font-medium text-gray-700">Image Alt Text:</label>
          <input
            id="altTextInput"
            type="text"
            value={altText}
            onChange={(e) => handlePanelFieldChange("altText", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Descriptive alt text for the image"
          />
        </div>
        <div>
          <label htmlFor="floatSideSelect" className="block text-sm font-medium text-gray-700">Image Float Side:</label>
          <select
            id="floatSideSelect"
            value={floatSide}
            onChange={(e) => handlePanelFieldChange("floatSide", e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label htmlFor="maxWidthInput" className="block text-sm font-medium text-gray-700">Max Image Width (px):</label>
          <input
            id="maxWidthInput"
            type="number"
            value={maxWidthPx}
            onChange={(e) => handlePanelFieldChange("maxWidthPx", parseInt(e.target.value, 10) || 300)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    ),
    images: () => (
      <PanelImagesController
        currentData={{ images: imageForController }}
        onControlsChange={onImageControllerChange}
        imageArrayFieldName="images"
        getItemName={() => 'Wrapped Image'}
        maxImages={1}
        allowAdd={imageForController.length === 0}
        allowRemove={imageForController.length > 0}
      />
    ),
  };
};

export default ImageWrapBlock;
