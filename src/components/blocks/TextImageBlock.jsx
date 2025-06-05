import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import PanelImagesController from "../common/PanelImagesController";
import ThemeColorPicker from "../common/ThemeColorPicker";

/**
 * TextImageBlock
 * 
 * config = {
 *   imageUrl: string,
 *   altText: string,
 *   paragraph: string,
 *   floatSide: "left" | "right",
 *   maxWidthPx: number
 * }
 */

// Shared image state helpers
const initializeImageState = (imageValue, defaultPath = '') => {
  let fileObject = null;
  let urlToDisplay = defaultPath;
  let nameToStore = defaultPath ? defaultPath.split('/').pop() : 'placeholder.jpg';
  let originalUrlToStore = defaultPath;

  if (imageValue && typeof imageValue === 'object') {
    urlToDisplay = imageValue.url || defaultPath;
    nameToStore = imageValue.name || (urlToDisplay ? urlToDisplay.split('/').pop() : 'image.jpg');
    fileObject = imageValue.file || null;
    originalUrlToStore = imageValue.originalUrl || (typeof imageValue.url === 'string' && !imageValue.url.startsWith('blob:') ? imageValue.url : defaultPath);
  } else if (typeof imageValue === 'string' && imageValue) {
    urlToDisplay = imageValue;
    nameToStore = imageValue.split('/').pop();
    originalUrlToStore = imageValue;
  }
  return { file: fileObject, url: urlToDisplay, name: nameToStore, originalUrl: originalUrlToStore };
};

const getEffectiveDisplayUrl = (imageState, getDisplayUrlProp) => {
  if (getDisplayUrlProp && typeof getDisplayUrlProp === 'function') {
    const propUrl = getDisplayUrlProp(imageState);
    if (propUrl) return propUrl;
  }
  if (imageState && typeof imageState === 'object' && imageState.url) return imageState.url;
  if (typeof imageState === 'string' && imageState) {
    if (imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:')) return imageState;
    return `/${imageState.replace(/^\.\//, "")}`;
  }
  return '';
};

// Reusable EditableField component (similar to other blocks)
const EditableField = ({ value, onChange, placeholder, type = 'text', className = '', style = {}, rows = 1, isEditable = true }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (!isEditable || !inputRef.current) return;
    if (type === 'textarea') {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentValue, isEditable, type]);

  const handleChange = (e) => { if (isEditable) setCurrentValue(e.target.value); };
  const handleBlur = () => { if (isEditable && value !== currentValue) onChange(currentValue); };
  const handleKeyDown = (e) => {
    if (!isEditable) return;
    if (type !== 'textarea' && e.key === 'Enter') { handleBlur(); e.preventDefault(); }
    else if (e.key === 'Escape') { setCurrentValue(value); inputRef.current?.blur(); }
  };

  if (!isEditable) {
    const Tag = type === 'textarea' ? 'div' : 'span';
    const displayValue = value || <span className="text-gray-400/70 italic">({placeholder})</span>;
    return <Tag className={`${className} ${type === 'textarea' ? 'whitespace-pre-line' : ''}`} style={style}>{displayValue}</Tag>;
  }
  const inputClasses = `bg-transparent border-b-2 border-dashed focus:border-gray-400/70 outline-none w-full ${className}`;
  if (type === 'textarea') {
    return <textarea ref={inputRef} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} rows={rows} />;
  }
  return <input ref={inputRef} type={type} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} />;
};

const TextImageBlock = ({ config = {}, readOnly = false, onConfigChange, getDisplayUrl: getDisplayUrlFromProp }) => {
  // Consolidate local state management
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      image: initializeImageState(null, "/assets/images/placeholder_rect_1.jpg"), 
      alt: "Descriptive image text",
      imagePosition: "left", 
      title: "Image with Wrapping Text",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "#1A202C",
      textColor: "#4A5568",
      imageWidth: "40%", 
      imageBorderRadius: "0.5rem",
      backgroundColor: "#FFFFFF",
      padding: "2rem"
    };
    const initialData = { ...defaultConfig, ...(config || {}) };
    return {
      ...initialData,
      image: initializeImageState(initialData.image, defaultConfig.image.originalUrl),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newImg = initializeImageState(config.image, prevLocal.image?.originalUrl);
        if(prevLocal.image?.file && prevLocal.image.url?.startsWith('blob:') && prevLocal.image.url !== newImg.url) {
            URL.revokeObjectURL(prevLocal.image.url);
        }
        // Preserve inline edits if not in readOnly mode and title/text matches (simple heuristic)
        const preserveInline = !readOnly && config.title === prevLocal.title && config.text === prevLocal.text;
        return {
            ...prevLocal,
            ...config,
            image: newImg,
            title: preserveInline ? prevLocal.title : (config.title || prevLocal.title || 'Title'),
            text: preserveInline ? prevLocal.text : (config.text || prevLocal.text || 'Paragraph text...'),
            alt: preserveInline ? prevLocal.alt : (config.alt || prevLocal.alt || 'Image alt text'),
        };
      });
    }
  }, [config, readOnly]); // Removed localConfig.title/text from deps

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && typeof onConfigChange === 'function') {
      const dataToSave = {
        ...localConfig,
        image: localConfig.image?.file
          ? { ...localConfig.image } // Send full object with file if present
          : { url: localConfig.image?.originalUrl || localConfig.image?.url, name: localConfig.image?.name }, // Otherwise, send original URL
      };
      if(dataToSave.image && !dataToSave.image.file) delete dataToSave.image.file; // Clean up file property if no file
      onConfigChange(dataToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    const currentImg = localConfig.image;
    return () => {
      if (currentImg?.file && currentImg.url?.startsWith('blob:')) {
        URL.revokeObjectURL(currentImg.url);
      }
    };
  }, [localConfig.image]);

  const handleInlineChange = (field, value) => {
    if (!readOnly && typeof onConfigChange === 'function') {
      const newConfig = { ...localConfig, [field]: value };
      setLocalConfig(newConfig);
      onConfigChange(newConfig); // Live update for inline changes
    }
  };

  const {
    image, alt, imagePosition, title, text,
    titleColor, textColor, imageWidth, imageBorderRadius,
    backgroundColor, padding
  } = localConfig;

  const imageUrl = getEffectiveDisplayUrl(image, getDisplayUrlFromProp);

  const containerStyle = {
    backgroundColor: backgroundColor || "transparent",
    padding: padding || "1rem"
  };

  const flexOrderClass = imagePosition === "right" ? "md:flex-row-reverse" : "md:flex-row";
  const imageContainerWidth = imageWidth?.includes('%') ? imageWidth : `${imageWidth}px`;

  return (
    <div style={containerStyle} className={`text-image-block ${!readOnly ? 'bg-slate-50 border-2 border-blue-300/50' : ''}`}>
      <div className={`container mx-auto px-4 flex flex-col ${flexOrderClass} flex-wrap items-center gap-4 md:gap-6`}>
        <div className="image-container w-full md:flex-shrink-0" style={{ width: readOnly ? imageContainerWidth : 'auto', maxWidth: '100%' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={alt || title || "Feature image"} 
              style={{ borderRadius: imageBorderRadius, width: "100%", maxHeight: "400px" }}
              className="object-cover shadow-lg mx-auto md:mx-0"
            />
          ) : (
             !readOnly && <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm rounded-lg" style={{borderRadius: imageBorderRadius}}>Image Missing - Add in Panel</div>
          )}
          {!readOnly && (
            <EditableField 
                value={alt || ""} 
                onChange={(val) => handleInlineChange("alt", val)} 
                placeholder="Image Alt Text (important for accessibility)" 
                className="text-xs mt-1 text-center text-gray-500" 
                isEditable={!readOnly} 
            />
          )}
        </div>

        <div className="text-content flex-1 min-w-0"> {/* Added min-w-0 for flexbox wrapping with long text */} 
          <EditableField 
            value={title} 
            onChange={(val) => handleInlineChange("title", val)} 
            placeholder="Section Title" 
            className="text-2xl md:text-3xl font-semibold mb-2 md:mb-3" 
            style={{ color: titleColor }} 
            isEditable={!readOnly} 
          />
          <EditableField 
            value={text} 
            onChange={(val) => handleInlineChange("text", val)} 
            placeholder="Paragraph text describing the image or feature..." 
            className="text-base leading-relaxed whitespace-pre-line" 
            style={{ color: textColor }} 
            type="textarea" 
            rows={Math.max(5, (text || "").split("\n").length + 1)} 
            isEditable={!readOnly} 
          />
        </div>
      </div>
    </div>
  );
};

TextImageBlock.propTypes = {
  config: PropTypes.shape({
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    alt: PropTypes.string,
    imagePosition: PropTypes.oneOf(["left", "right"]),
    title: PropTypes.string,
    text: PropTypes.string,
    titleColor: PropTypes.string,
    textColor: PropTypes.string,
    imageWidth: PropTypes.string, // Can be % or px
    imageBorderRadius: PropTypes.string,
    backgroundColor: PropTypes.string,
    padding: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

TextImageBlock.tabsConfig = (currentConfig, onPanelChange, themeColors) => {
  const {
    altText = "Descriptive image text", // Fallback if config.alt is used by inline
    paragraph = "Lorem ipsum...", // Fallback if config.text is used by inline
    imagePosition = "left",
    imageWidth = "40%",
    backgroundColor = "#FFFFFF",
    padding = "2rem",
    titleColor = "#1A202C",
    textColor = "#4A5568",
    imageBorderRadius = "0.5rem",
  } = currentConfig;

  // Use config.alt and config.text for panel if they exist (from previous save), else use defaults
  const currentAltText = currentConfig.alt !== undefined ? currentConfig.alt : altText;
  const currentParagraph = currentConfig.text !== undefined ? currentConfig.text : paragraph;

  const handlePanelFieldChange = (field, value) => {
    onPanelChange({ ...currentConfig, [field]: value });
  };

  const imagesForController = currentConfig.image && typeof currentConfig.image === 'object' && currentConfig.image.url
    ? [{ ...currentConfig.image, id: 'textImageUnique', name: currentConfig.image.name || 'Main Image' }]
    : (typeof currentConfig.image === 'string' && currentConfig.image
        ? [{ url: currentConfig.image, id: 'textImageUnique', name: currentConfig.image.split('/').pop() || 'Main Image', originalUrl: currentConfig.image }]
        : []);

  const onImageControllerChange = (updatedData) => {
    const newImageArray = updatedData.images || [];
    if (newImageArray.length > 0) {
      onPanelChange({ ...currentConfig, image: newImageArray[0] });
    } else {
      onPanelChange({ ...currentConfig, image: initializeImageState(null) });
    }
  };
  
  const colorPickerProps = (label, fieldName, defaultColor) => ({
    label,
    fieldName,
    currentColorValue: currentConfig[fieldName] || defaultColor,
    onColorChange: (name, value) => onPanelChange({ ...currentConfig, [name]: value }),
    themeColors,
  });

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Content & Layout</h3>
        <p className="text-xs text-gray-500">Title and main paragraph are editable directly on the block preview.</p>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image Alt Text (for accessibility):</label>
          <input
            type="text"
            value={currentAltText}
            onChange={(e) => handlePanelFieldChange("alt", e.target.value)} // Ensure this updates 'alt'
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image Position:</label>
          <select value={imagePosition} onChange={(e) => handlePanelFieldChange("imagePosition", e.target.value)} className="mt-1 panel-select-sm bg-white">
            <option value="left">Left of Text</option>
            <option value="right">Right of Text</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image Width (e.g., 40%, 300px):</label>
          <input type="text" value={imageWidth} onChange={(e) => handlePanelFieldChange("imageWidth", e.target.value)} className="mt-1 panel-input-sm bg-white" />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700">Overall Block Padding (e.g., 2rem, 10px):</label>
          <input type="text" value={padding} onChange={(e) => handlePanelFieldChange("padding", e.target.value)} className="mt-1 panel-input-sm bg-white" />
        </div>
      </div>
    ),
    images: () => (
      <PanelImagesController
        currentData={{ images: imagesForController }}
        onControlsChange={onImageControllerChange}
        imageArrayFieldName="images"
        getItemName={() => 'Block Image'}
        maxImages={1}
        allowAdd={imagesForController.length === 0}
        allowRemove={imagesForController.length > 0}
      />
    ),
    colors: () => (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Color Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker {...colorPickerProps("Overall Background Color", "backgroundColor", "#FFFFFF")} />
            <ThemeColorPicker {...colorPickerProps("Title Color", "titleColor", "#1A202C")} />
            <ThemeColorPicker {...colorPickerProps("Text Color", "textColor", "#4A5568")} />
        </div>
      </div>
    ),
    styling: () => (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Image Style</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Image Corner Radius (e.g., 0.5rem, 8px):</label>
                <input 
                    type="text" 
                    value={imageBorderRadius || '0.5rem'} 
                    onChange={(e) => handlePanelFieldChange('imageBorderRadius', e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    placeholder="e.g., 0.5rem or 8px"
                />
            </div>
        </div>
    )
  };
};

export default TextImageBlock; 