// src/components/blocks/HeroBlock.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";

// Helper function to get display URL
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.url) return value.url;
  return null;
};

/**
 * HeroBlock
 *
 * Props:
 *  - config: {
 *      images?: Array of image objects,
 *      backgroundImage?: string | object (legacy support),
 *      title?: string (default 'Hero Title'),
 *      titleTextColor?: string (default '#FFFFFF'),
 *      fallbackBackgroundColor?: string (default '#333333'),
 *      styling?: { desktopHeightVH: number, mobileHeightVW: number },
 *      animations?: { shrink: boolean, fadeIn: boolean, slideIn: boolean, scaleIn: boolean },
 *      shrinkAfterMs?: number (default 1000) - legacy support,
 *      initialHeight?: string (default '40vh') - legacy support,
 *      finalHeight?: string (default '20vh') - legacy support,
 *    }
 *  - readOnly: boolean => if true, render "live" version with effects
 *  - onConfigChange: function => called in edit mode to update config
 *  - themeColors: object => for ThemeColorPicker
 */
const HeroBlock = ({ config = {}, readOnly = false, onConfigChange, themeColors }) => {
  const {
    images = [],
    backgroundImage: legacyBackgroundImage,
    title = "Hero Title",
    titleTextColor = "#FFFFFF",
    fallbackBackgroundColor = "#333333",
    styling = { desktopHeightVH: 40, mobileHeightVW: 75 },
    animations = { shrink: true, fadeIn: true, slideIn: true, scaleIn: true },
    // Legacy support
    shrinkAfterMs = 1000,
    initialHeight = "40vh",
    finalHeight = "20vh",
  } = config;

  // Handle legacy backgroundImage prop - convert to images array format
  const getBackgroundImage = () => {
    if (images && images.length > 0) {
      return getDisplayUrlHelper(images[0]);
    }
    if (legacyBackgroundImage) {
      return getDisplayUrlHelper(legacyBackgroundImage);
    }
    return null;
  };

  const [isShrunk, setIsShrunk] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  // Handle shrink animation if enabled
  useEffect(() => {
    if (readOnly && animations.shrink) {
      const timer = setTimeout(() => {
        setIsShrunk(true);
      }, shrinkAfterMs);
      return () => clearTimeout(timer);
    } else {
      setIsShrunk(false);
    }
  }, [readOnly, animations.shrink, shrinkAfterMs]);

  const handleTitleChange = (e) => {
    setEditableTitle(e.target.value);
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
    if (onConfigChange && title !== editableTitle) {
      onConfigChange({ ...config, title: editableTitle });
    }
  };

  const displayBackgroundImage = getBackgroundImage();

  // Calculate heights based on styling or legacy props
  const getInitialHeight = () => {
    if (styling.desktopHeightVH) {
      return `${styling.desktopHeightVH}vh`;
    }
    return initialHeight;
  };

  const getFinalHeight = () => {
    if (styling.desktopHeightVH && animations.shrink) {
      return `${Math.max(20, styling.desktopHeightVH * 0.6)}vh`; // 60% of initial height, minimum 20vh
    }
    return finalHeight;
  };

  const currentHeight = readOnly && isShrunk && animations.shrink ? getFinalHeight() : getInitialHeight();

  const sectionStyle = {
    zIndex: 20,
    height: currentHeight,
    backgroundColor: !displayBackgroundImage ? fallbackBackgroundColor : 'transparent',
    position: 'relative',
  };

  const bgDivStyle = {
    backgroundImage: displayBackgroundImage ? `url('${displayBackgroundImage}')` : 'none',
    backgroundSize: displayBackgroundImage ? (readOnly && isShrunk ? "110%" : "120%") : 'cover',
    backgroundPosition: displayBackgroundImage ? (readOnly && isShrunk ? "center center" : "center left") : 'center center',
  };

  // Animation variants
  const titleVariants = {
    hidden: { y: readOnly && animations.slideIn ? -50 : 0, opacity: readOnly && animations.fadeIn ? 0 : 1 },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: animations.scaleIn ? [0.9, 1] : 1,
      transition: { 
        duration: readOnly ? 1 : 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section
      className="relative bg-banner"
      style={sectionStyle}
      initial={{ height: getInitialHeight() }}
      animate={{ height: currentHeight }}
      transition={{ duration: readOnly ? 1 : 0.3 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center w-full h-full transition-all duration-1000"
        style={bgDivStyle}
      ></div>
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        {isEditingTitle && !readOnly ? (
          <input
            type="text"
            value={editableTitle}
            onChange={handleTitleChange}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") {
                setEditableTitle(title);
                setIsEditingTitle(false);
              }
            }}
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wider bg-transparent outline-none border-b-2 border-gray-400 focus:border-white"
            style={{ color: titleTextColor, width: 'auto', minWidth: '50%' }}
            autoFocus
          />
        ) : (
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wider"
            style={{ color: titleTextColor, cursor: !readOnly ? "pointer" : "default" }}
            onClick={() => {
              if (!readOnly) setIsEditingTitle(true);
            }}
          >
            {editableTitle}
          </motion.h1>
        )}
      </div>
    </motion.section>
  );
};

// Static method for TopStickyEditPanel integration
HeroBlock.tabsConfig = (config, onControlsChange, themeColors, sitePalette) => {
  return {
    images: () => (
      <PanelImagesController
        currentData={{ 
          images: config?.images || (config?.backgroundImage ? [config.backgroundImage] : [])
        }}
        onControlsChange={(updatedData) => {
          const images = updatedData.images || [];
          onControlsChange({ ...config, images });
        }}
        imageArrayFieldName="images"
        getItemName={() => 'Hero Background Image'}
        maxImages={1}
      />
    ),
    
    colors: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Color Settings</h3>
        
        <ThemeColorPicker
          label="Title Text Color"
          fieldName="titleTextColor"
          currentColorValue={config?.titleTextColor || '#FFFFFF'}
          onColorChange={(fieldName, value) => onControlsChange({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
        <ThemeColorPicker
          label="Fallback Background Color"
          fieldName="fallbackBackgroundColor"
          currentColorValue={config?.fallbackBackgroundColor || '#333333'}
          onColorChange={(fieldName, value) => onControlsChange({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
      </div>
    ),
    
    styling: () => (
      <div className="p-4 space-y-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Size & Animation Settings</h3>
        
        {/* Height Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Block Height</h4>
          <PanelStylingController 
            currentData={config} 
            onControlsChange={onControlsChange} 
            blockType="HeroBlock"
            controlType="height"
          />
        </div>

        {/* Animation Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Animation Settings</h4>
          <PanelStylingController 
            currentData={config} 
            onControlsChange={onControlsChange} 
            blockType="HeroBlock"
            controlType="animations"
          />
        </div>

        {/* Shrink Animation Specific Settings */}
        {config?.animations?.shrink && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Shrink Animation Settings</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shrink Delay: {config?.shrinkAfterMs || 1000}ms
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={config?.shrinkAfterMs || 1000}
                onChange={(e) => onControlsChange({ ...config, shrinkAfterMs: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Instant</span>
                <span>5 seconds</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Time before hero section shrinks</p>
            </div>
          </div>
        )}
      </div>
    )
  };
};

export default HeroBlock;
