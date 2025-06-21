// src/components/blocks/ActionButtonBlock.jsx
import React, { useState, useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelStylingController from "../common/PanelStylingController";

const ActionButtonBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
  themeColors,
}) => {
  const [localConfig, setLocalConfig] = useState(config);

  // Sync with external config when readOnly or config changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Propagate changes when not readOnly
  useEffect(() => {
    if (!readOnly && onConfigChange && JSON.stringify(localConfig) !== JSON.stringify(config)) {
      onConfigChange(localConfig);
    }
  }, [localConfig, readOnly, onConfigChange, config]);

  const {
    buttonText = "Schedule an Inspection",
    buttonLink = "/#book",
    buttonColor = "#1F2937", // Default dark color, hex value
    backgroundColor = "transparent",
    buttonSize = "md",
  } = localConfig;

  // Button size classes
  const sizeMap = {
    sm: "px-3 py-1.5 md:px-4 md:py-2 text-sm",
    md: "px-4 py-2 md:px-8 md:py-4 text-base",
    lg: "px-6 py-3 md:px-10 md:py-5 text-lg",
  };
  const chosenSizeClass = sizeMap[buttonSize] || sizeMap.md;

  // READ ONLY RENDER
  if (readOnly) {
    return (
      <div 
        className="flex justify-center my-6"
        style={{ backgroundColor }}
      >
        <HashLink
          to={buttonLink}
          className={`font-semibold rounded-full transition hover:opacity-80 ${chosenSizeClass}`}
          style={{ 
            backgroundColor: buttonColor,
            color: 'white',
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)" 
          }}
        >
          {buttonText}
        </HashLink>
      </div>
    );
  }

  // EDIT MODE - Inline editing support
  const handleChange = (field, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInlineTextChange = (field, newValue) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: newValue,
    }));
  };

  return (
    <div className="p-4 bg-gray-100 rounded border-2 border-blue-300 relative">
      <div className="mb-4">
        <h3 className="font-bold mb-2 text-gray-700">Action Button</h3>
        <p className="text-sm text-gray-600">Click the edit button to access full styling options</p>
      </div>

      {/* Live Preview */}
      <div 
        className="flex justify-center p-4 rounded"
        style={{ backgroundColor }}
      >
        <div
          className={`font-semibold rounded-full transition ${chosenSizeClass} cursor-pointer relative group`}
          style={{ 
            backgroundColor: buttonColor,
            color: 'white',
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)" 
          }}
        >
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleInlineTextChange('buttonText', e.target.innerText)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
              }
            }}
            className="outline-none focus:ring-2 focus:ring-white/50 rounded px-1"
          >
            {buttonText}
          </span>
        </div>
      </div>

      {/* Quick Edit */}
      <div className="mt-4 space-y-2">
        <label className="block text-sm">
          <span className="text-gray-700 font-medium">Button Text:</span>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => handleChange("buttonText", e.target.value)}
            className="mt-1 w-full px-2 py-1 bg-white text-gray-800 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-gray-700 font-medium">Button Link:</span>
          <input
            type="text"
            value={buttonLink}
            onChange={(e) => handleChange("buttonLink", e.target.value)}
            placeholder="e.g., /#contact, /services"
            className="mt-1 w-full px-2 py-1 bg-white text-gray-800 rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
};

// Static method for BottomStickyEditPanel integration
ActionButtonBlock.tabsConfig = (config, onUpdate, themeColors) => {
  return {
    general: (props) => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Button Link</h3>
        <div className="space-y-1">
          <label htmlFor="buttonLinkInput" className="block text-sm font-medium text-gray-600">Link URL (e.g., /#contact, /services):</label>
          <input
            id="buttonLinkInput"
            type="text"
            value={config?.buttonLink || '/#book'}
            onChange={(e) => onUpdate({ ...config, buttonLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    ),
    colors: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Button Colors</h3>
        
        <ThemeColorPicker
          label="Button Background Color"
          fieldName="buttonColor"
          currentColorValue={config?.buttonColor || '#1F2937'}
          onColorChange={(fieldName, value) => onUpdate({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
        <ThemeColorPicker
          label="Section Background Color"
          fieldName="backgroundColor"
          currentColorValue={config?.backgroundColor || 'transparent'}
          onColorChange={(fieldName, value) => onUpdate({ ...config, [fieldName]: value })}
          themeColors={themeColors}
        />
        
      </div>
    ),
    
    styling: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Button Style & Size</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Button Size</label>
          <select
            value={config?.buttonSize || 'md'}
            onChange={(e) => onUpdate({ ...config, buttonSize: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
          <p className="text-xs text-gray-500">Controls the padding and text size of the button</p>
        </div>
        
        <PanelStylingController
          currentData={config}
          onControlsChange={onUpdate}
          blockType="ActionButtonBlock"
          controlType="animations"
        />
      </div>
    )
  };
};

export default ActionButtonBlock;
