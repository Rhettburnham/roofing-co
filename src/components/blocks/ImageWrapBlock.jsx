// src/components/blocks/ImageWrapBlock.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

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
  getDisplayUrl,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      image: "", // URL or path to image, or file object
      alt: "Descriptive image text",
      imagePosition: "left", // 'left' or 'right'
      title: "Image with Wrapping Text",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "#1A202C",
      textColor: "#4A5568",
      imageWidth: "40%", // e.g., '50%', '200px'
      imageBorderRadius: "0.5rem",
      backgroundColor: "#FFFFFF",
      padding: "2rem" // Overall padding for the block
    };
    const initialImage = config?.image ? (getDisplayUrl ? getDisplayUrl(config.image) : config.image) : defaultConfig.image;
    return { ...defaultConfig, ...config, image: initialImage };
  });

  useEffect(() => {
    if (readOnly) {
      const currentImage = config?.image ? (getDisplayUrl ? getDisplayUrl(config.image) : config.image) : localConfig.image;
      setLocalConfig(prev => ({ ...prev, ...config, image: currentImage }));
    } else {
      if (config?.image && typeof config.image === "object" && config.image.file) {
        setLocalConfig(prev => ({ ...prev, ...config }));
      }
    }
  }, [config, readOnly, getDisplayUrl]);

  useEffect(() => {
    if (readOnly && typeof onConfigChange === "function") {
      if (JSON.stringify(localConfig) !== JSON.stringify(config)) {
        onConfigChange(localConfig);
      }
    }
  }, [readOnly, localConfig, onConfigChange, config]);

  const handleInputChange = (field, value) => {
    if (!readOnly) {
      setLocalConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageFileChange = (file) => {
    if (!readOnly && file) {
      const newImageState = {
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        originalUrl: localConfig.image?.originalUrl || (typeof localConfig.image === "string" ? localConfig.image : "")
      };
      setLocalConfig(prev => ({ ...prev, image: newImageState }));
    }
  };

  const {
    image, alt, imagePosition, title, text,
    titleColor, textColor, imageWidth, imageBorderRadius,
    backgroundColor, padding
  } = localConfig;

  const imageUrl = getDisplayUrl ? getDisplayUrl(image) : image;

  const containerStyle = {
    backgroundColor: backgroundColor || "transparent",
    padding: padding || "1rem"
  };

  const flexOrderClass = imagePosition === "right" ? "flex-row-reverse" : "flex-row";

  return (
    <div style={containerStyle} className="image-wrap-block">
      <div className={`container mx-auto px-4 flex ${flexOrderClass} flex-wrap items-center`}>
        <div className="image-container relative group" style={{ width: readOnly ? imageWidth : "auto", flexShrink: 0, padding: "0.5rem" }}>
          {readOnly || !imageUrl ? (
            imageUrl && <img
              src={imageUrl}
              alt={alt || title}
              style={{ borderRadius: imageBorderRadius, width: "100%" }}
              className="object-cover shadow-lg"
            />
          ) : (
            <div className="relative group" style={{ width: imageWidth || "200px" }}> {/* Ensure image maintains some size in edit mode */}
              <img
                src={imageUrl}
                alt={alt || title}
                style={{ borderRadius: imageBorderRadius, width: "100%" }}
                className="object-cover shadow-lg group-hover:opacity-75 transition-opacity"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderRadius: imageBorderRadius }}>
                <span>Change Image</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageFileChange(e.target.files[0])} />
              </label>
            </div>
          )}
          {!readOnly && !imageUrl && (
            <label className="w-full h-48 mx-auto flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" style={{ width: imageWidth || "200px", borderRadius: imageBorderRadius }}>
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-600">Upload Image</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageFileChange(e.target.files[0])} />
              </div>
            </label>
          )}
        </div>

        <div className="text-content flex-1" style={{ padding: "0.5rem" }}>
          {readOnly ? (
            <h2 className="text-2xl md:text-3xl font-semibold mb-3" style={{ color: titleColor }}>{title}</h2>
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="text-2xl md:text-3xl font-semibold mb-3 bg-transparent border-b-2 border-dashed border-gray-400 focus:border-gray-600 outline-none w-full"
              style={{ color: titleColor }}
            />
          )}
          {readOnly ? (
            <p className="text-base leading-relaxed" style={{ color: textColor }}>{text}</p>
          ) : (
            <textarea
              value={text}
              onChange={(e) => handleInputChange("text", e.target.value)}
              className="text-base leading-relaxed bg-transparent border-b-2 border-dashed border-gray-400 focus:border-gray-600 outline-none w-full resize-none"
              style={{ color: textColor }}
              rows={Math.max(3, (text || "").split("\n").length + 1)}
            />
          )}
          {!readOnly && (
            <input
              type="text"
              value={alt || ""}
              placeholder="Image Alt Text (required)"
              onChange={(e) => handleInputChange("alt", e.target.value)}
              className="text-sm mt-3 bg-transparent border-b border-dashed border-gray-300 focus:border-gray-500 outline-none w-full text-gray-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};

ImageWrapBlock.propTypes = {
  config: PropTypes.shape({
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    alt: PropTypes.string,
    imagePosition: PropTypes.oneOf(["left", "right"]),
    title: PropTypes.string,
    text: PropTypes.string,
    titleColor: PropTypes.string,
    textColor: PropTypes.string,
    imageWidth: PropTypes.string,
    imageBorderRadius: PropTypes.string,
    backgroundColor: PropTypes.string,
    padding: PropTypes.string,
  }).isRequired,
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func.isRequired,
};

ImageWrapBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) => {
  const [panelData, setPanelData] = useState(currentConfig);

  useEffect(() => {
    setPanelData(currentConfig);
  }, [currentConfig]);

  const handlePanelInputChange = (field, value) => {
    setPanelData(prev => ({ ...prev, [field]: value }));
  };

  const commitChanges = () => {
    onPanelConfigChange(panelData);
  };

  const handlePanelImageAction = (fileOrUrl) => {
    // This function now directly calls onPanelFileChange, which ServiceEditPage will handle.
    // ServiceEditPage is responsible for creating the {file, url, name, originalUrl} object.
    onPanelFileChange("image", fileOrUrl); // Pass the raw file or URL string
  };

  const currentImageUrlDisplay = getDisplayUrl ? getDisplayUrl(panelData.image) : panelData.image;

  return (
    <div className="space-y-4 p-1">
      <div>
        <label className="block text-sm font-medium text-gray-300">Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePanelImageAction(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 cursor-pointer"
        />
        {currentImageUrlDisplay && (
          <div className="mt-2"><img src={currentImageUrlDisplay} alt="Preview" className="max-h-32 rounded object-contain" /></div>
        )}
        <label className="block text-sm font-medium text-gray-300 mt-2">Or Image URL:</label>
        <input
          type="text"
          value={typeof panelData.image === "string" ? panelData.image : (panelData.image?.url || "")}
          onChange={(e) => handlePanelImageAction(e.target.value)}
          onBlur={commitChanges}
          className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
          placeholder="e.g., /assets/images/image.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Image Position:</label>
        <select value={panelData.imagePosition || "left"} onChange={(e) => handlePanelInputChange("imagePosition", e.target.value)} onBlur={commitChanges} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-600 border-gray-500 rounded-md text-white">
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Title Color:</label>
          <input type="color" value={panelData.titleColor || "#1A202C"} onChange={(e) => handlePanelInputChange("titleColor", e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md bg-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Text Color:</label>
          <input type="color" value={panelData.textColor || "#4A5568"} onChange={(e) => handlePanelInputChange("textColor", e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md bg-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Background Color:</label>
          <input type="color" value={panelData.backgroundColor || "#FFFFFF"} onChange={(e) => handlePanelInputChange("backgroundColor", e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md bg-gray-600" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Image Width (e.g., 50%, 200px):</label>
        <input type="text" value={panelData.imageWidth || "40%"} onChange={(e) => handlePanelInputChange("imageWidth", e.target.value)} onBlur={commitChanges} className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Image Corner Radius (e.g., 0.5rem):</label>
        <input type="text" value={panelData.imageBorderRadius || "0.5rem"} onChange={(e) => handlePanelInputChange("imageBorderRadius", e.target.value)} onBlur={commitChanges} className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Overall Block Padding (e.g., 2rem):</label>
        <input type="text" value={panelData.padding || "2rem"} onChange={(e) => handlePanelInputChange("padding", e.target.value)} onBlur={commitChanges} className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white" />
      </div>
    </div>
  );
};

ImageWrapBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  onPanelFileChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
};

export default ImageWrapBlock;
