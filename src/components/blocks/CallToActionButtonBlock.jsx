import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { HashLink } from "react-router-hash-link";

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

CallToActionButtonBlock.EditorPanel = ({ currentConfig, onPanelConfigChange }) => {
  const [localPanelData, setLocalPanelData] = useState(currentConfig);

  useEffect(() => {
    setLocalPanelData(currentConfig);
  }, [currentConfig]);

  const handlePanelChange = (field, value) => {
    const updatedValue = (field === 'openInNewTab') ? (value === true || value === 'true') : value;
    const newConfig = { ...localPanelData, [field]: updatedValue };
    setLocalPanelData(newConfig);
    onPanelConfigChange(newConfig);
  };
  
  const handleSvgIconChange = (e) => {
    const newSvgString = e.target.value;
    handlePanelChange('icon', { svgString: newSvgString });
  };

  return (
    <div className="space-y-4 p-1">
      <div>
        <label className="block text-sm font-medium text-gray-300">Button Text (Panel):</label>
        <input 
          type="text" 
          value={localPanelData.text || ''} 
          onChange={(e) => handlePanelChange('text', e.target.value)} 
          className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Button Link (URL or path):</label>
        <input 
          type="text" 
          value={localPanelData.link || ''} 
          onChange={(e) => handlePanelChange('link', e.target.value)} 
          className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Button Style:</label>
        <select 
          value={localPanelData.style || 'primary'} 
          onChange={(e) => handlePanelChange('style', e.target.value)} 
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
            <input type="color" value={localPanelData.backgroundColor || '#000000'} onChange={(e) => handlePanelChange('backgroundColor', e.target.value)} className="mt-1 h-10 w-full border-gray-500 rounded-md"/>
            <input type="text" placeholder="Or Tailwind class e.g. bg-red-500" value={localPanelData.backgroundColor || ''} onChange={(e) => handlePanelChange('backgroundColor', e.target.value)} className="mt-1 text-xs block w-full px-2 py-1 bg-gray-600 border-gray-500 rounded-md text-white"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Text Color:</label>
            <input type="color" value={localPanelData.textColor || '#FFFFFF'} onChange={(e) => handlePanelChange('textColor', e.target.value)} className="mt-1 h-10 w-full border-gray-500 rounded-md"/>
            <input type="text" placeholder="Or Tailwind class e.g. text-yellow-300" value={localPanelData.textColor || ''} onChange={(e) => handlePanelChange('textColor', e.target.value)} className="mt-1 text-xs block w-full px-2 py-1 bg-gray-600 border-gray-500 rounded-md text-white"/>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300">Alignment:</label>
        <select 
          value={localPanelData.alignment || 'center'} 
          onChange={(e) => handlePanelChange('alignment', e.target.value)} 
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
            rows="3"
            placeholder="<svg>...</svg> or keep empty for no icon" 
            className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white placeholder-gray-400"
        />
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
          id={`openInNewTab-${currentConfig.text?.replace(/\s+/g, '') || 'actionbutton'}`} 
          checked={localPanelData.openInNewTab || false} 
          onChange={(e) => handlePanelChange('openInNewTab', e.target.checked)} 
          className="h-4 w-4 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500 bg-gray-600"
        />
        <label htmlFor={`openInNewTab-${currentConfig.text?.replace(/\s+/g, '') || 'actionbutton'}`} className="ml-2 block text-sm font-medium text-gray-300">Open link in new tab</label>
      </div>
    </div>
  );
};

CallToActionButtonBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
};

export default CallToActionButtonBlock; 