// src/components/blocks/ActionButtonBlock.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // Assuming you use React Router for internal links
import { HashLink } from "react-router-hash-link";
import IconSelectorModal from '../common/IconSelectorModal';
import * as LucideIcons from 'lucide-react';

// Helper to render an SVG icon dynamically if 'icon' prop is an object { name, style, etc. }
// This is a placeholder; you'll need a more robust SVG rendering solution or library.
const renderIcon = (iconConfig, baseClassName = "w-6 h-6 mr-2", isEditing) => {
  if (!iconConfig) return null;

  let iconElement = null;

  if (typeof iconConfig === 'string') { // Simple case: iconConfig is just the SVG string
    // In a real app, you'd sanitize this SVG string before rendering.
    iconElement = <span dangerouslySetInnerHTML={{ __html: iconConfig }} />;
  } else if (typeof iconConfig === 'object' && iconConfig.svgString) {
    // For editable SVG strings
    iconElement = <span dangerouslySetInnerHTML={{ __html: iconConfig.svgString }} />;
  } else if (iconConfig.name === 'defaultArrow') { // Example: a predefined icon
    iconElement = (
      <svg className={baseClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
      </svg>
    );
  }
  // Add more predefined icons or logic to fetch/render SVGs by name from a library

  if (isEditing && iconElement) {
    // When editing, wrap the icon to make it clear it's part of the editable content.
    // This is a simple visual cue; actual editing of SVG might need a modal or special input.
    return <div className="inline-block border border-dashed border-blue-500 p-1">{iconElement}</div>;
  }
  return iconElement;
};

// Helper to render dynamic icons
const renderDynamicIcon = (pack, iconName, fallback = null, props = {}) => {
    const icons = pack === 'lucide' ? LucideIcons : {}; // Add other packs if needed
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent {...props} /> : fallback;
};

const ActionButtonBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
  onFileChange,
  getDisplayUrl,
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

  // Initialize localConfig from props, ensuring defaults
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      text: 'Learn More',
      link: '#',
      style: 'primary',
      alignment: 'center',
      icon: null, // Can be a string (SVG), an object { name: 'iconName', ... }, or null
      backgroundColor: '', // For custom style
      textColor: '', // For custom style
      openInNewTab: false,
    };
    return { ...defaultConfig, ...config }; // Merge with incoming config
  });

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const textInputRef = useRef(null);

  // Sync localConfig with prop changes if not in edit mode (readOnly = true)
  useEffect(() => {
    if (readOnly) {
      setLocalConfig(prevConfig => ({ ...prevConfig, ...config }));
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (!readOnly && textInputRef.current) {
      textInputRef.current.style.height = "auto";
      textInputRef.current.style.height = `${textInputRef.current.scrollHeight}px`;
    }
  }, [localConfig.buttonText, readOnly]);

  // When editing finishes (readOnly becomes true), call onConfigChange with the local state
  useEffect(() => {
    if (readOnly && typeof onConfigChange === 'function') {
      // Check if localConfig is actually different from the prop `config` before calling onConfigChange
      // This prevents unnecessary updates if no changes were made.
      // A deep comparison might be too complex; a simple stringify or checking key fields is often enough.
      if (JSON.stringify(localConfig) !== JSON.stringify(config)) {
         onConfigChange(localConfig);
      }
    }
  }, [readOnly, localConfig, onConfigChange, config]);

  const handleInputChange = (field, value) => {
    const updatedConfig = { ...localConfig, [field]: value };
    setLocalConfig(updatedConfig);
    if (readOnly) { // Should ideally only call onConfigChange when edit mode is exited or explicitly saved
      onConfigChange(updatedConfig);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setLocalConfig(prev => ({...prev, buttonText: newText}));
    // Live update to parent if not readOnly
    if(!readOnly) {
      onConfigChange({...localConfig, buttonText: newText});
    }
  };

  const handleIconSelect = (pack, iconName) => {
    const updatedConfig = { ...localConfig, iconPack: pack, iconName: iconName };
    setLocalConfig(updatedConfig);
    onConfigChange(updatedConfig); // Propagate change immediately
    setIsIconModalOpen(false);
  };

  const { text, link, style, alignment, icon, backgroundColor, textColor, openInNewTab } = localConfig;

  const buttonStyles = {
    primary: `bg-blue text-white`,
    secondary: `bg-gray-500 text-white`,
    outline: `border border-blue text-blue`,
    custom: '' // Custom styles will be applied inline
  };

  const alignmentStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  let appliedButtonClass = `${buttonStyles[style] || buttonStyles.primary} py-3 px-6 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105`;
  let inlineStyle = {};

  if (style === 'custom') {
    if (backgroundColor) inlineStyle.backgroundColor = backgroundColor;
    if (textColor) inlineStyle.color = textColor;
  }

  const Tag = link && link.startsWith('http') ? 'a' : Link;
  const linkProps = Tag === 'a' ? { href: link } : { to: link };
  if (openInNewTab && Tag === 'a') {
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }

  // READ ONLY RENDER
  if (readOnly) {
    return (
      <div className={`py-8 md:py-12 ${alignmentStyles[alignment] || alignmentStyles.center}`}>
        <Tag {...linkProps} className={appliedButtonClass} style={inlineStyle}>
          {renderIcon(icon, "w-6 h-6 mr-2 inline-block", false)}
          {text}
        </Tag>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">Action Button Editor</h3>

      {/* Text */}
      <label className="block text-sm mb-1">
        Button Text:
        <textarea
          ref={textInputRef}
          value={text}
          onChange={handleTextChange}
          onBlur={() => onConfigChange(localConfig)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          rows={1}
          placeholder="Button Text"
        />
      </label>

      {/* Link */}
      <label className="block text-sm mb-1">
        Button Link (URL or hash):
        <input
          type="text"
          value={link}
          onChange={(e) => handleInputChange("link", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Style */}
      <label className="block text-sm mb-1">
        Button Style:
        <select
          value={style}
          onChange={(e) => handleInputChange("style", e.target.value)}
          className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
        >
          <option value="primary">Primary (Blue)</option>
          <option value="secondary">Secondary (Gray)</option>
          <option value="outline">Outline (Blue Border)</option>
          <option value="custom">Custom Colors</option>
        </select>
      </label>

      {/* Alignment */}
      <label className="block text-sm mb-1">
        Button Alignment:
        <select
          value={alignment}
          onChange={(e) => handleInputChange("alignment", e.target.value)}
          className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

      {/* Icon */}
      <label className="block text-sm mb-1">
        Button Icon (Paste SVG Code or leave empty):
        <textarea
          value={typeof icon === 'object' ? icon.svgString || '' : (typeof icon === 'string' ? icon : '')}
          onChange={(e) => handleInputChange("icon", { svgString: e.target.value })}
          rows="3"
          placeholder="<svg>...</svg> or keep empty for no icon"
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Background Color */}
      {style === 'custom' && (
        <label className="block text-sm mb-1">
          Background Color:
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
            className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>
      )}

      {/* Text Color */}
      {style === 'custom' && (
        <label className="block text-sm mb-1">
          Text Color:
          <input
            type="color"
            value={textColor}
            onChange={(e) => handleInputChange("textColor", e.target.value)}
            className="mt-1 w-full bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>
      )}

      {/* Open in New Tab */}
      <label className="block text-sm mb-1">
        <input
          type="checkbox"
          checked={openInNewTab}
          onChange={(e) => handleInputChange("openInNewTab", e.target.checked)}
          className="mt-1 h-4 w-4 text-white bg-gray-600 rounded border border-gray-500 focus:ring-2 focus:ring-blue-500"
        />
        Open link in new tab
      </label>
    </div>
  );
};

ActionButtonBlock.propTypes = {
  config: PropTypes.shape({
    text: PropTypes.string,
    link: PropTypes.string,
    style: PropTypes.oneOf(['primary', 'secondary', 'outline', 'custom']),
    alignment: PropTypes.oneOf(['left', 'center', 'right']),
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // string for SVG, object for config
    backgroundColor: PropTypes.string, // For custom style
    textColor: PropTypes.string, // For custom style
    openInNewTab: PropTypes.bool,
  }).isRequired,
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  onFileChange: PropTypes.func, // Not used in this block but good for consistency
  getDisplayUrl: PropTypes.func, // Though not used directly by button, good to keep consistent
};

// Define the EditorPanel as a static property of ActionButtonBlock
ActionButtonBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange }) => {
  const [localPanelData, setLocalPanelData] = useState(currentConfig);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  useEffect(() => {
    setLocalPanelData(currentConfig);
  }, [currentConfig]);

  const handlePanelChange = (field, value) => {
    const updatedValue = (field === 'openInNewTab') ? (value === true || value === 'true') : value;
    setLocalPanelData(prev => ({ ...prev, [field]: updatedValue }));
  };

  const handleIconSelect = (pack, iconName) => {
    handlePanelChange('iconPack', pack);
    handlePanelChange('iconName', iconName);
    setIsIconModalOpen(false);
  };

  // Debounce or onBlur to call onPanelConfigChange to avoid too frequent updates
  const commitChanges = () => {
    onPanelConfigChange(localPanelData);
  };

  const handleSvgIconChange = (e) => {
    const newSvgString = e.target.value;
    // For simplicity, storing SVG as a string in an object: { svgString: "<svg>..." }
    // Or, if icon is just the string: handlePanelChange('icon', newSvgString);
    handlePanelChange('icon', { svgString: newSvgString });
  };

  return (
    <div className="space-y-4 p-1">
      <div>
        <label className="block text-sm font-medium text-gray-300">Button Link (URL or path):</label>
        <input 
          type="text" 
          value={localPanelData.link || ''} 
          onChange={(e) => handlePanelChange('link', e.target.value)} 
          onBlur={commitChanges}
          className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Button Style:</label>
        <select 
          value={localPanelData.style || 'primary'} 
          onChange={(e) => handlePanelChange('style', e.target.value)} 
          onBlur={commitChanges}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-600 border-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
        >
          <option value="primary">Primary (Blue)</option>
          <option value="secondary">Secondary (Gray)</option>
          <option value="outline">Outline (Blue Border)</option>
          <option value="custom">Custom Colors</option>
        </select>
      </div>

      {localPanelData.style === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Background Color:</label>
            <input type="color" value={localPanelData.backgroundColor || '#000000'} onChange={(e) => handlePanelChange('backgroundColor', e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md"/>
            <input type="text" placeholder="Or Tailwind class e.g. bg-red-500" value={localPanelData.backgroundColor || ''} onChange={(e) => handlePanelChange('backgroundColor', e.target.value)} onBlur={commitChanges} className="mt-1 text-xs block w-full px-2 py-1 bg-gray-600 border-gray-500 rounded-md text-white"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Text Color:</label>
            <input type="color" value={localPanelData.textColor || '#FFFFFF'} onChange={(e) => handlePanelChange('textColor', e.target.value)} onBlur={commitChanges} className="mt-1 h-10 w-full border-gray-500 rounded-md"/>
            <input type="text" placeholder="Or Tailwind class e.g. text-yellow-300" value={localPanelData.textColor || ''} onChange={(e) => handlePanelChange('textColor', e.target.value)} onBlur={commitChanges} className="mt-1 text-xs block w-full px-2 py-1 bg-gray-600 border-gray-500 rounded-md text-white"/>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300">Alignment:</label>
        <select 
          value={localPanelData.alignment || 'center'} 
          onChange={(e) => handlePanelChange('alignment', e.target.value)} 
          onBlur={commitChanges}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-600 border-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300">Icon (Paste SVG Code or leave empty):</label>
        <textarea 
            value={typeof localPanelData.icon === 'object' ? localPanelData.icon.svgString || '' : (typeof localPanelData.icon === 'string' ? localPanelData.icon : '')} 
            onChange={handleSvgIconChange} 
            onBlur={commitChanges}
            rows="3"
            placeholder="<svg>...</svg> or keep empty for no icon" 
            className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white placeholder-gray-400"
        />
         {/* Display current icon for reference */}
        {localPanelData.icon && (
          <div className="mt-2 p-2 bg-gray-700 rounded">
            <p className="text-xs text-gray-400 mb-1">Current Icon Preview:</p>
            <div className="w-8 h-8 text-white">
              {renderIcon(localPanelData.icon, "w-full h-full", false)}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input 
          type="checkbox" 
          id={`openInNewTab-${currentConfig.text?.replace(/\s+/g, '') || 'actionbutton'}`} // Unique ID for label association
          checked={localPanelData.openInNewTab || false} 
          onChange={(e) => handlePanelChange('openInNewTab', e.target.checked)} 
          onBlur={commitChanges}
          className="h-4 w-4 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500 bg-gray-600"
        />
        <label htmlFor={`openInNewTab-${currentConfig.text?.replace(/\s+/g, '') || 'actionbutton'}`} className="ml-2 block text-sm font-medium text-gray-300">Open link in new tab</label>
      </div>

      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-gray-300">Icon:</label>
        <button 
          type="button" 
          onClick={() => setIsIconModalOpen(true)} 
          className="px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-md shadow-sm"
        >
          {localPanelData.iconName ? `Change Icon (${localPanelData.iconPack} - ${localPanelData.iconName})` : 'Select Icon'}
        </button>
        {localPanelData.iconName && (
          <button 
            type="button" 
            onClick={() => { handlePanelChange('iconName', null); handlePanelChange('iconPack', null); }} 
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove Icon
          </button>
        )}
      </div>
    </div>
  );
};

ActionButtonBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  onPanelFileChange: PropTypes.func, // Not used here but good practice for consistency
};

export default ActionButtonBlock;

