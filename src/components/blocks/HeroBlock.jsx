// src/components/blocks/HeroBlock.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ThemeColorPicker from "../common/ThemeColorPicker"; // Assuming a common color picker

// Helper function (can be moved to a utils file if used elsewhere)
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value; // Handles direct URLs or blob URLs
  if (value.url) return value.url; // Handles { url: '...', file: File }
  return null;
};

/**
 * HeroBlock
 *
 * Props:
 *  - config: {
 *      backgroundImage?: string | { url: string, file?: File, name?: string, originalUrl?: string },
 *      title?: string (default 'Siding Options'),
 *      icon?: string (Font Awesome class or emoji),
 *      subList?: string[] (array of sub items),
 *      shrinkAfterMs?: number (default 1000),
 *      initialHeight?: string (default '40vh'),
 *      finalHeight?: string (default '20vh'),
 *      titleTextColor?: string (default '#FFFFFF'),
 *      subListTextColor?: string (default '#FFFFFF'),
 *      fallbackBackgroundColor?: string (default '#333333')
 *    }
 *  - readOnly: boolean => if true, render "live" version with the shrinking effect
 *  - onConfigChange: function => called in edit mode to update config
 *  - themeColors: object => for ThemeColorPicker
 */
const HeroBlock = ({ config = {}, readOnly = false, onConfigChange, themeColors }) => {
  const {
    backgroundImage: rawBackgroundImage,
    title = "Siding Options",
    icon = "🏠",
    subList = ["Professional Installation", "Quality Materials", "Expert Service"],
    shrinkAfterMs = 1000,
    initialHeight = "40vh",
    finalHeight = "20vh",
    titleTextColor = "#FFFFFF",
    subListTextColor = "#FFFFFF",
    fallbackBackgroundColor = "#333333", // A dark fallback
  } = config;

  const [isShrunk, setIsShrunk] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  useEffect(() => {
    if (readOnly) {
      const timer = setTimeout(() => {
        setIsShrunk(true);
      }, shrinkAfterMs);
      return () => clearTimeout(timer);
    } else {
      setIsShrunk(false); // Ensure it's not shrunk when in edit mode preview
    }
  }, [readOnly, shrinkAfterMs]);

  const handleTitleChange = (e) => {
    setEditableTitle(e.target.value);
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
    if (onConfigChange && title !== editableTitle) {
      onConfigChange({ ...config, title: editableTitle });
    }
  };
  
  const displayBackgroundImage = getDisplayUrlHelper(rawBackgroundImage);

  const currentHeight = readOnly && isShrunk ? finalHeight : initialHeight;

  const sectionStyle = {
    zIndex: 20,
    height: currentHeight,
    backgroundColor: !displayBackgroundImage ? fallbackBackgroundColor : 'transparent',
    position: 'relative', // Ensure relative positioning for absolute children
  };

  const bgDivStyle = {
    backgroundImage: displayBackgroundImage ? `url('${displayBackgroundImage}')` : 'none',
    backgroundSize: displayBackgroundImage ? (readOnly && isShrunk ? "110%" : "120%") : 'cover', // Slightly different zoom for shrunk state
    backgroundPosition: displayBackgroundImage ? (readOnly && isShrunk ? "center center" : "center left") : 'center center',
  };

  return (
    <motion.section
      className="relative bg-banner" // bg-banner might be overridden by fallbackBackgroundColor or image
      style={sectionStyle}
      initial={{ height: initialHeight }}
      animate={{ height: currentHeight }}
      transition={{ duration: readOnly ? 1 : 0.3 }} // Faster transition if not in live readOnly mode
    >
      <div
        className="absolute inset-0 bg-cover bg-center w-full h-full transition-all duration-1000"
        style={bgDivStyle}
      ></div>
      
      {/* Main content container - perfectly centered vertically and horizontally */}
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          {icon && (
            <motion.div
              initial={{ scale: readOnly ? 0 : 1, opacity: readOnly ? 0 : 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: readOnly ? 0.8 : 0.3, delay: readOnly ? 0.2 : 0 }}
              className="text-4xl sm:text-5xl md:text-6xl mb-2"
              style={{ color: titleTextColor }}
            >
              {icon.startsWith('fa-') ? (
                <i className={`fas ${icon}`}></i>
              ) : (
                icon
              )}
            </motion.div>
          )}

          {/* Title */}
          {isEditingTitle && !readOnly ? (
            <input
              type="text"
              value={editableTitle}
              onChange={handleTitleChange}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setEditableTitle(title); // Revert
                  setIsEditingTitle(false);
                }
              }}
              className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider bg-transparent outline-none border-b-2 border-gray-400 focus:border-white"
              style={{ color: titleTextColor, width: 'auto', minWidth: '50%' }}
              autoFocus
            />
          ) : (
            <motion.h1
              initial={{ y: readOnly ? -30 : 0, opacity: readOnly ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: readOnly ? 0.8 : 0.3, delay: readOnly ? 0.4 : 0 }}
              className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider"
              style={{ color: titleTextColor, cursor: !readOnly ? "pointer" : "default" }}
              onClick={() => {
                if (!readOnly) setIsEditingTitle(true);
              }}
            >
              {editableTitle}
            </motion.h1>
          )}

          {/* Sub List */}
          {subList && subList.length > 0 && (
            <motion.div
              initial={{ y: readOnly ? 30 : 0, opacity: readOnly ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: readOnly ? 0.8 : 0.3, delay: readOnly ? 0.6 : 0 }}
              className="mt-4 space-y-2"
            >
              {subList.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: readOnly ? (index % 2 === 0 ? -20 : 20) : 0, opacity: readOnly ? 0 : 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: readOnly ? 0.6 : 0.3, delay: readOnly ? 0.8 + (index * 0.1) : 0 }}
                  className="text-center text-sm sm:text-base md:text-lg font-medium"
                  style={{ color: subListTextColor }}
                >
                  • {item}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

HeroBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl, themeColors }) => {
  const {
    backgroundImage: rawBackgroundImage,
    icon = "🏠",
    subList = ["Professional Installation", "Quality Materials", "Expert Service"],
    shrinkAfterMs = 1000,
    initialHeight = "40vh",
    finalHeight = "20vh",
    titleTextColor = "#FFFFFF",
    subListTextColor = "#FFFFFF",
    fallbackBackgroundColor = "#333333",
  } = currentConfig;

  const handleFieldChange = (field, value) => {
    onPanelConfigChange({ ...currentConfig, [field]: value });
  };

  const handleFileEvent = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const newFileObject = {
        file: file,
        url: fileURL,
        name: file.name,
        originalUrl: typeof rawBackgroundImage === 'object' ? rawBackgroundImage.originalUrl : (typeof rawBackgroundImage === 'string' ? rawBackgroundImage : '')
      };
      // Use onPanelFileChange for the background image specifically
      onPanelFileChange('backgroundImage', newFileObject);
    }
  };

  const handleSubListChange = (index, value) => {
    const newSubList = [...subList];
    newSubList[index] = value;
    handleFieldChange('subList', newSubList);
  };

  const addSubListItem = () => {
    handleFieldChange('subList', [...subList, 'New Item']);
  };

  const removeSubListItem = (index) => {
    const newSubList = subList.filter((_, i) => i !== index);
    handleFieldChange('subList', newSubList);
  };
  
  const displayImageUrl = getDisplayUrl(rawBackgroundImage);

  return (
    <div className="p-3 space-y-3 bg-gray-800 text-gray-200 rounded-b-md">
      <div>
        <label className="block text-xs font-medium mb-1">Background Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileEvent}
          className="w-full text-sm p-1.5 bg-gray-700 border border-gray-600 rounded-md file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        {displayImageUrl && (
          <img
            src={displayImageUrl}
            alt="Background Preview"
            className="mt-2 h-20 w-full object-cover rounded bg-gray-700 border border-gray-600"
          />
        )}
         <input
          type="text"
          placeholder="Or paste image URL"
          value={(typeof rawBackgroundImage === 'string' && !rawBackgroundImage.startsWith('blob:')) ? rawBackgroundImage : (displayImageUrl && displayImageUrl.startsWith('blob:')) ? '' : (rawBackgroundImage?.url || '')}
          onChange={(e) => {
             const newFileObject = {
                file: null, // Pasted URL means no local file initially
                url: e.target.value,
                name: e.target.value.split('/').pop() || 'pasted_image',
                originalUrl: e.target.value
             };
             // For pasted URLs, it's simpler to just update the config directly via onPanelConfigChange
             // as onPanelFileChange is more for actual File objects.
             // However, to keep consistency with how file objects are structured:
             onPanelConfigChange({ ...currentConfig, backgroundImage: newFileObject });
          }}
          className="mt-1 w-full p-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Icon (emoji or Font Awesome class):</label>
        <input
          type="text"
          value={icon}
          onChange={(e) => handleFieldChange('icon', e.target.value)}
          placeholder="🏠 or fa-home"
          className="w-full p-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Sub List Items:</label>
        {subList.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleSubListChange(index, e.target.value)}
              className="flex-1 p-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm"
            />
            <button
              onClick={() => removeSubListItem(index)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addSubListItem}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          Add Item
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Title Text Color:</label>
          <ThemeColorPicker
            label=""
            fieldName="titleTextColor"
            currentColorValue={titleTextColor}
            onColorChange={(fieldName, value) => handleFieldChange(fieldName, value)}
            themeColors={themeColors || { accent: '#007bff', text: '#ffffff', background: '#333333' }} // Provide some defaults
            className="mt-0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Sub List Text Color:</label>
          <ThemeColorPicker
            label=""
            fieldName="subListTextColor"
            currentColorValue={subListTextColor}
            onColorChange={(fieldName, value) => handleFieldChange(fieldName, value)}
            themeColors={themeColors || { accent: '#007bff', text: '#ffffff', background: '#333333' }}
            className="mt-0"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium mb-1">Fallback Background Color (if no image):</label>
         <ThemeColorPicker
          label=""
          fieldName="fallbackBackgroundColor"
          currentColorValue={fallbackBackgroundColor}
          onColorChange={(fieldName, value) => handleFieldChange(fieldName, value)}
          themeColors={themeColors || { accent: '#007bff', text: '#ffffff', background: '#333333' }}
          className="mt-0"
        />
      </div>
    </div>
  );
};

export default HeroBlock;
