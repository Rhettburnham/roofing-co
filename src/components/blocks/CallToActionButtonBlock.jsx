import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { HashLink } from "react-router-hash-link";
import ThemeColorPicker from "../common/ThemeColorPicker";

const renderIcon = (iconConfig, baseClassName = "w-6 h-6 mr-2", isEditing) => {
  if (!iconConfig) return null;
  let iconElement = null;
  if (typeof iconConfig === 'string') {
    iconElement = <span dangerouslySetInnerHTML={{ __html: iconConfig }} />;
  } else if (typeof iconConfig === 'object' && iconConfig.svgString) {
    iconElement = <span dangerouslySetInnerHTML={{ __html: iconConfig.svgString }} />;
  } else if (iconConfig.name === 'defaultArrow') {
    iconElement = (
      <svg className={baseClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
      </svg>
    );
  }
  if (isEditing && iconElement) {
    return <div className="inline-block border border-dashed border-blue-500 p-1">{iconElement}</div>;
  }
  return iconElement;
};

const CallToActionButtonBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    text = "Learn More",
    link = "#",
    style = "primary",
    alignment = "center",
    icon = null,
    backgroundColor = '#007bff',
    textColor = '#ffffff',
    openInNewTab = false,
  } = config;

  const [localConfig, setLocalConfig] = useState(config); 

  useEffect(() => {
    if (readOnly || JSON.stringify(config) !== JSON.stringify(localConfig)) {
       const mergedConfig = { 
        text: config.text !== undefined ? config.text : localConfig.text, 
        link: config.link !== undefined ? config.link : localConfig.link, 
        style: config.style !== undefined ? config.style : localConfig.style, 
        alignment: config.alignment !== undefined ? config.alignment : localConfig.alignment, 
        icon: config.icon !== undefined ? config.icon : localConfig.icon, 
        backgroundColor: config.backgroundColor !== undefined ? config.backgroundColor : localConfig.backgroundColor, 
        textColor: config.textColor !== undefined ? config.textColor : localConfig.textColor, 
        openInNewTab: config.openInNewTab !== undefined ? config.openInNewTab : localConfig.openInNewTab,
      };
      setLocalConfig(mergedConfig);
    }
  }, [config, readOnly]);
  
  useEffect(() => {
    if (!readOnly && onConfigChange) {
      onConfigChange(localConfig);
    }
  }, [localConfig, readOnly]);

  const handleInputChange = (field, value) => {
    if (!readOnly) {
      setLocalConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const current = readOnly ? config : localConfig;

  const buttonStyles = {
    primary: `bg-blue text-white`,
    secondary: `bg-gray-500 text-white`,
    outline: `border border-blue text-blue`,
    custom: '' 
  };

  const alignmentStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  let appliedButtonClass = `${buttonStyles[current.style] || buttonStyles.primary} py-3 px-6 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105 inline-flex items-center`;
  let inlineStyle = {};

  if (current.style === 'custom') {
    if (current.backgroundColor) inlineStyle.backgroundColor = current.backgroundColor;
    if (current.textColor) inlineStyle.color = current.textColor;
  }

  const isExternalLink = current.link && (current.link.startsWith('http') || current.link.startsWith('mailto:') || current.link.startsWith('tel:'));
  const Tag = isExternalLink ? 'a' : (current.link && current.link.includes('#') ? HashLink : Link);
  
  const linkProps = isExternalLink ? { href: current.link } : { to: current.link || '#' };
  if (current.openInNewTab && isExternalLink) {
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }
  if (Tag === HashLink) {
    linkProps.smooth = true;
  }

  if (readOnly) {
    return (
      <div className={`py-8 md:py-12 ${alignmentStyles[current.alignment] || alignmentStyles.center}`}>
        <Tag {...linkProps} className={appliedButtonClass} style={inlineStyle}>
          {renderIcon(current.icon, "w-5 h-5 mr-2", false)}
          {current.text}
        </Tag>
      </div>
    );
  }

  return (
    <div className={`py-8 md:py-12 ${alignmentStyles[current.alignment] || alignmentStyles.center} border-2 border-dashed border-gray-400 p-4`}>
      <Tag {...linkProps} className={appliedButtonClass} style={inlineStyle} onClick={(e) => e.preventDefault()}
      >
        {renderIcon(current.icon, "w-5 h-5 mr-2", true)}
        <span 
          contentEditable 
          suppressContentEditableWarning
          onBlur={(e) => handleInputChange('text', e.target.innerText)}
          className="outline-none focus:ring-1 focus:ring-blue-300 p-1 rounded"
        >
          {current.text}
        </span>
      </Tag>
      <p className="text-xs text-gray-500 mt-2">Edit in panel for more options.</p>
    </div>
  );
};

CallToActionButtonBlock.propTypes = {
  config: PropTypes.shape({
    text: PropTypes.string,
    link: PropTypes.string,
    style: PropTypes.oneOf(['primary', 'secondary', 'outline', 'custom']),
    alignment: PropTypes.oneOf(['left', 'center', 'right']),
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), 
    backgroundColor: PropTypes.string, 
    textColor: PropTypes.string, 
    openInNewTab: PropTypes.bool,
  }), 
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

CallToActionButtonBlock.tabsConfig = (config, onPanelChange, themeColors) => {
  const handlePanelInputChange = (field, value) => {
    const updatedValue = (field === 'openInNewTab') ? (value === true || value === 'true') : value;
    onPanelChange({ ...config, [field]: updatedValue });
  };

  const handleSvgIconChangeForPanel = (e) => {
    const newSvgString = e.target.value;
    onPanelChange({ ...config, icon: { svgString: newSvgString } });
  };

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Button Link (URL or path):</label>
          <input 
            type="text" 
            value={config.link || ''} 
            onChange={(e) => handlePanelInputChange('link', e.target.value)} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Icon (Paste SVG Code or leave empty):</label>
          <textarea 
              value={typeof config.icon === 'object' ? config.icon.svgString || '' : (typeof config.icon === 'string' ? config.icon : '')} 
              onChange={handleSvgIconChangeForPanel} 
              rows="3"
              placeholder="<svg>...</svg> or keep empty for no icon" 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
          />
          {config.icon && (
            <div className="mt-2 p-2 bg-gray-100 rounded border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Current Icon Preview:</p>
              <div className="w-8 h-8 text-gray-700">
                {renderIcon(config.icon, "w-full h-full", false)}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id={`openInNewTab-${config.text?.replace(/\s+/g, '') || 'actionbutton'}`} 
            checked={config.openInNewTab || false} 
            onChange={(e) => handlePanelInputChange('openInNewTab', e.target.checked)} 
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor={`openInNewTab-${config.text?.replace(/\s+/g, '') || 'actionbutton'}`} className="ml-2 block text-sm font-medium text-gray-700">Open link in new tab</label>
        </div>
      </div>
    ),
    colors: () => (
      <div className="p-4 space-y-4">
        {(config.style === 'custom') && (
          <>
            <h3 className="text-lg font-semibold text-gray-700">Custom Button Colors</h3>
            <ThemeColorPicker
              label="Background Color:"
              fieldName="backgroundColor"
              currentColorValue={config.backgroundColor || '#007bff'} // Default custom blue
              onColorChange={(name, value) => onPanelChange({ ...config, [name]: value })}
              themeColors={themeColors}
            />
            <ThemeColorPicker
              label="Text Color:"
              fieldName="textColor"
              currentColorValue={config.textColor || '#ffffff'} // Default custom white
              onColorChange={(name, value) => onPanelChange({ ...config, [name]: value })}
              themeColors={themeColors}
            />
          </>
        )}
        {(config.style !== 'custom') && (
            <p className="text-sm text-gray-500">Custom color options are available when 'Custom Colors' style is selected in the Styling tab.</p>
        )}
      </div>
    ),
    styling: () => (
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Button Style:</label>
          <select 
            value={config.style || 'primary'} 
            onChange={(e) => handlePanelInputChange('style', e.target.value)} 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="primary">Primary (Theme Blue)</option>
            <option value="secondary">Secondary (Theme Gray)</option>
            <option value="outline">Outline (Theme Blue Border)</option>
            <option value="custom">Custom Colors</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alignment:</label>
          <select 
            value={config.alignment || 'center'} 
            onChange={(e) => handlePanelInputChange('alignment', e.target.value)} 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    ),
  };
};

export default CallToActionButtonBlock; 