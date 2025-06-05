// src/components/blocks/PageHeroBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // For internal links
import { HashLink } from 'react-router-hash-link'; // For hash links
import PanelImagesController from "../common/PanelImagesController";
import ThemeColorPicker from "../common/ThemeColorPicker";

/**
 * PageHeroBlock
 *
 * Props:
 *  - config: {
 *      backgroundImage: string (default '/assets/images/growth/hero_growth.jpg'),
 *      title: string (default 'Siding Options'),
 *      shrinkAfterMs?: number (default 1000) -> how soon to shrink
 *      initialHeight?: string (default '40vh')
 *      finalHeight?: string (default '20vh')
 *    }
 *  - readOnly: boolean => if true, render "live" version with the shrinking effect
 *  - onConfigChange: function => called in edit mode to update config
 */

// Helper for inline editable fields
const EditableField = ({ value, onChange, placeholder, type = 'text', className, style, rows, isEditable }) => {
  if (!isEditable) {
    const Tag = type === 'textarea' ? 'div' : 'span'; // Use div for textarea to respect newlines
    const displayValue = value || <span className="text-gray-400/70 italic">({placeholder})</span>;
    return <Tag className={`${className} ${type === 'textarea' ? 'whitespace-pre-wrap' : ''}`} style={style}>{displayValue}</Tag>;
  }
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (type === 'textarea' && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentValue, type]);

  const handleChange = (e) => setCurrentValue(e.target.value);
  const handleBlur = () => { if (value !== currentValue) onChange(currentValue); };
  const handleKeyDown = (e) => {
    if (type !== 'textarea' && e.key === 'Enter') { handleBlur(); e.preventDefault(); }
    else if (e.key === 'Escape') { setCurrentValue(value); inputRef.current?.blur(); }
  };

  const inputClasses = `bg-transparent focus:outline-none focus:ring-1 focus:ring-white/50 rounded p-1 ${className}`;
  if (type === 'textarea') {
    return <textarea ref={inputRef} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} rows={rows} />;
  }
  return <input ref={inputRef} type={type} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} />;
};

const PageHeroBlock = ({ config: initialConfig, readOnly = true, onConfigChange, getDisplayUrl: getDisplayUrlFromProp }) => {
  const defaultConfig = {
    title: "Service Title Here",
    subtext: "Optional tagline or brief description.",
    backgroundImage: { url: "/assets/images/growth/hero_growth.jpg", originalUrl: "/assets/images/growth/hero_growth.jpg", file: null, name: "hero_growth.jpg" },
    textColor: "#FFFFFF",
    overlayColor: "rgba(0, 0, 0, 0.3)",
    contentAlignment: "center",
    initialHeight: "50vh",
    finalHeight: "30vh",
    shrinkAfterMs: 1500,
    buttonText: "Get a Quote",
    buttonLink: "/#contact",
    buttonStyle: "primary",
    buttonTextColor: "#FFFFFF",
    buttonBackgroundColor: "#3B82F6",
    buttonOpenInNewTab: false,
  };

  const [localConfig, setLocalConfig] = useState(() => {
    const merged = { ...defaultConfig, ...initialConfig };
    if (typeof merged.backgroundImage === 'string') {
      merged.backgroundImage = { url: merged.backgroundImage, originalUrl: merged.backgroundImage, file: null, name: merged.backgroundImage.split('/').pop() };
    } else if (!merged.backgroundImage || typeof merged.backgroundImage.url !== 'string') {
      merged.backgroundImage = defaultConfig.backgroundImage;
    }
    return merged;
  });

  useEffect(() => {
    if (initialConfig) {
        const merged = { ...defaultConfig, ...initialConfig };
        if (typeof merged.backgroundImage === 'string') {
            merged.backgroundImage = { url: merged.backgroundImage, originalUrl: merged.backgroundImage, file: null, name: merged.backgroundImage.split('/').pop() };
        } else if (!merged.backgroundImage || typeof merged.backgroundImage.url !== 'string') {
            merged.backgroundImage = defaultConfig.backgroundImage;
        }
        // Preserve inline edits if not in readOnly mode and title matches (simple heuristic)
        if (!readOnly && initialConfig.title === localConfig.title) {
            setLocalConfig(prev => ({...merged, title: prev.title, subtext: prev.subtext }));
        } else {
            setLocalConfig(merged);
        }
    }
  }, [initialConfig, readOnly]); // Removed localConfig.title from deps to avoid loops

  const [isShrunk, setIsShrunk] = useState(false);
  useEffect(() => {
    if (readOnly && localConfig.initialHeight !== localConfig.finalHeight) {
      const timer = setTimeout(() => setIsShrunk(true), localConfig.shrinkAfterMs || 1000);
      return () => clearTimeout(timer);
    } else if (!readOnly) {
      setIsShrunk(false);
    }
  }, [readOnly, localConfig.initialHeight, localConfig.finalHeight, localConfig.shrinkAfterMs]);

  const prevReadOnlyRef = useRef(readOnly);
  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && typeof onConfigChange === 'function') {
      const configToSave = { ...localConfig };
      if (localConfig.backgroundImage?.file) {
        configToSave.backgroundImage = { 
          ...localConfig.backgroundImage, // includes file, blob url, name, originalUrl
        };
      } else if (localConfig.backgroundImage && typeof localConfig.backgroundImage === 'object'){
           configToSave.backgroundImage = {
              url: localConfig.backgroundImage.url,
              originalUrl: localConfig.backgroundImage.originalUrl || localConfig.backgroundImage.url,
              name: localConfig.backgroundImage.name || localConfig.backgroundImage.url?.split('/').pop()
           }
      } else if (typeof localConfig.backgroundImage === 'string'){
           configToSave.backgroundImage = {
              url: localConfig.backgroundImage,
              originalUrl: localConfig.backgroundImage,
              name: localConfig.backgroundImage.split('/').pop()
           }
      }
      onConfigChange(configToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    const bgImage = localConfig.backgroundImage;
    return () => {
        if(bgImage && typeof bgImage === 'object' && bgImage.file && bgImage.url && bgImage.url.startsWith('blob:')){
            URL.revokeObjectURL(bgImage.url);
        }
    };
  }, [localConfig.backgroundImage]);

  const handleInlineChange = (field, value) => {
    if (!readOnly && typeof onConfigChange === 'function') {
      const newConfig = { ...localConfig, [field]: value };
      setLocalConfig(newConfig);
      onConfigChange(newConfig); // Live update for inline changes
    }
  };

  const {
    title, subtext, backgroundImage, textColor, overlayColor, contentAlignment,
    initialHeight, finalHeight, 
    buttonText, buttonLink, buttonStyle, buttonTextColor, buttonBackgroundColor, buttonOpenInNewTab
  } = localConfig;

  const currentBackgroundImageUrl = getDisplayUrlFromProp ? getDisplayUrlFromProp(backgroundImage) : (backgroundImage?.url || '');
  const textAlignClasses = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' };
  const currentAlignmentClass = textAlignClasses[contentAlignment] || textAlignClasses.center;

  const heroStyles = {
    height: readOnly ? (isShrunk ? finalHeight : initialHeight) : initialHeight,
    color: textColor || '#FFFFFF',
    transition: readOnly ? 'height 1s ease-in-out' : 'none',
  };
  
  const bgDivStyles = {
    backgroundImage: currentBackgroundImageUrl ? `url('${currentBackgroundImageUrl}')` : 'none',
    backgroundColor: !currentBackgroundImageUrl ? '#333' : 'transparent',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const overlayStyles = { backgroundColor: overlayColor || 'rgba(0,0,0,0.3)' };

  const CTAButtonTag = buttonLink && (buttonLink.startsWith('http') || buttonLink.startsWith('mailto:') || buttonLink.startsWith('tel:')) ? 'a' : HashLink;
  const ctaLinkProps = CTAButtonTag === 'a' ? { href: buttonLink } : { to: buttonLink || '#' };
  if (buttonOpenInNewTab && CTAButtonTag === 'a') {
    ctaLinkProps.target = '_blank';
    ctaLinkProps.rel = 'noopener noreferrer';
  }
  if (CTAButtonTag === HashLink && buttonLink && buttonLink.includes('#')) ctaLinkProps.smooth = true;

  let ctaButtonClasses = 'mt-6 inline-block px-8 py-3 rounded-md font-semibold shadow-lg transition-colors duration-150 ease-in-out hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';
  let ctaInlineStyles = {};

  if (buttonStyle === 'primary') {
    ctaButtonClasses += ` bg-blue-600 text-white`;
    if(buttonBackgroundColor) ctaInlineStyles.backgroundColor = buttonBackgroundColor;
    if(buttonTextColor) ctaInlineStyles.color = buttonTextColor;
  } else if (buttonStyle === 'secondary') {
    ctaButtonClasses += ` bg-gray-600 text-white`;
    if(buttonBackgroundColor) ctaInlineStyles.backgroundColor = buttonBackgroundColor;
    if(buttonTextColor) ctaInlineStyles.color = buttonTextColor;
  } else if (buttonStyle === 'outline') {
    ctaButtonClasses += ` border-2 bg-transparent`;
    ctaInlineStyles.borderColor = buttonBackgroundColor || textColor || '#FFFFFF';
    ctaInlineStyles.color = buttonTextColor || textColor || '#FFFFFF';
  } else if (buttonStyle === 'custom') {
    if(buttonBackgroundColor) ctaInlineStyles.backgroundColor = buttonBackgroundColor;
    if(buttonTextColor) ctaInlineStyles.color = buttonTextColor;
  }

  return (
    <motion.section
      className={`relative w-full flex ${currentAlignmentClass}`}
      style={heroStyles}
      initial={readOnly ? { height: initialHeight } : false }
      animate={readOnly ? { height: isShrunk ? finalHeight : initialHeight } : { height: localConfig.initialHeight } }
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={bgDivStyles}></div>
      <div className="absolute inset-0 z-0" style={overlayStyles}></div>
      <div className={`relative z-10 p-6 md:p-8 max-w-4xl w-full ${currentAlignmentClass.includes('items-start') ? 'mr-auto ml-0 md:ml-12' : currentAlignmentClass.includes('items-end') ? 'ml-auto mr-0 md:mr-12' : 'mx-auto' }`}>
        <EditableField value={title} onChange={(val) => handleInlineChange('title', val)} placeholder="Hero Title" className="text-4xl md:text-5xl lg:text-6xl font-bold break-words w-full" style={{ color: 'inherit' }} isEditable={!readOnly} />
        { (subtext || !readOnly) && (
          <EditableField value={subtext} onChange={(val) => handleInlineChange('subtext', val)} placeholder="Optional Subtext" type="textarea" className="mt-2 text-lg md:text-xl opacity-90 break-words w-full" style={{ color: 'inherit' }} rows={2} isEditable={!readOnly} />
        )}
        {(buttonText && buttonLink) && (
          <div className={readOnly ? '' : 'mt-4'}> 
            <CTAButtonTag {...ctaLinkProps} className={ctaButtonClasses} style={ctaInlineStyles}>
              {buttonText}
            </CTAButtonTag>
          </div>
        )}
      </div>
    </motion.section>
  );
};

PageHeroBlock.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    subtext: PropTypes.string,
    backgroundImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    textColor: PropTypes.string,
    overlayColor: PropTypes.string,
    contentAlignment: PropTypes.oneOf(['left', 'center', 'right']),
    initialHeight: PropTypes.string,
    finalHeight: PropTypes.string,
    shrinkAfterMs: PropTypes.number,
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    buttonStyle: PropTypes.oneOf(['primary', 'secondary', 'outline', 'custom']),
    buttonTextColor: PropTypes.string,
    buttonBackgroundColor: PropTypes.string,
    buttonOpenInNewTab: PropTypes.bool,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

PageHeroBlock.tabsConfig = (currentConfig, onPanelChange, themeColors) => {
  const handlePanelFieldChange = (field, value) => {
    let processedValue = value;
    if (field === 'overlayOpacity') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) processedValue = 0.3;
      processedValue = Math.max(0, Math.min(1, processedValue));
    } else if (field === 'shrinkAfterMs') {
      processedValue = parseInt(value, 10) || 1000;
    }
    onPanelChange({ ...currentConfig, [field]: processedValue });
  };

  const imagesForController = currentConfig.backgroundImage && typeof currentConfig.backgroundImage === 'object' && currentConfig.backgroundImage.url
    ? [{ ...currentConfig.backgroundImage, id: 'pageHeroBgImage', name: currentConfig.backgroundImage.name || 'Background Image' }]
    : (typeof currentConfig.backgroundImage === 'string' && currentConfig.backgroundImage
        ? [{ url: currentConfig.backgroundImage, id: 'pageHeroBgImage', name: currentConfig.backgroundImage.split('/').pop() || 'Background Image', originalUrl: currentConfig.backgroundImage }]
        : []);

  const onImageControllerChange = (updatedData) => {
    const newImageArray = updatedData.images || [];
    if (newImageArray.length > 0) {
      onPanelChange({ ...currentConfig, backgroundImage: newImageArray[0] });
    } else {
      onPanelChange({ ...currentConfig, backgroundImage: { url: '', name: '', originalUrl: '', file: null } });
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
        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Button & Layout</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Button Text:</label>
          <input type="text" value={currentConfig.buttonText || ''} onChange={(e) => handlePanelFieldChange('buttonText', e.target.value)} placeholder="Optional" className="mt-1 panel-input-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Button Link:</label>
          <input type="text" value={currentConfig.buttonLink || ''} onChange={(e) => handlePanelFieldChange('buttonLink', e.target.value)} placeholder="/contact or #section-id" className="mt-1 panel-input-sm"/>
        </div>
        <div className="flex items-center">
            <input type="checkbox" id="buttonOpenInNewTabHeroPage" checked={currentConfig.buttonOpenInNewTab || false} onChange={(e) => handlePanelFieldChange('buttonOpenInNewTab', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="buttonOpenInNewTabHeroPage" className="ml-2 block text-sm font-medium text-gray-700">Open Button Link in New Tab</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content Alignment:</label>
          <select value={currentConfig.contentAlignment || 'center'} onChange={(e) => handlePanelFieldChange('contentAlignment', e.target.value)} className="mt-1 panel-select-sm">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    ),
    images: () => (
      <PanelImagesController
        currentData={{ images: imagesForController }}
        onControlsChange={onImageControllerChange}
        imageArrayFieldName="images"
        getItemName={() => 'Background Image'}
        maxImages={1}
        allowAdd={imagesForController.length === 0}
        allowRemove={imagesForController.length > 0}
      />
    ),
    colors: () => (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Hero Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ThemeColorPicker {...colorPickerProps("Text Color", "textColor", "#FFFFFF")} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Overlay Color (rgba):</label>
            <input type="text" value={currentConfig.overlayColor || 'rgba(0,0,0,0.3)'} onChange={(e) => handlePanelFieldChange('overlayColor', e.target.value)} placeholder="e.g., rgba(0,0,0,0.5)" className="mt-1 panel-input-sm"/>
          </div>
        </div>
        <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1 pt-2">Button Colors</h4>
        {(currentConfig.buttonStyle === 'primary' || currentConfig.buttonStyle === 'secondary' || currentConfig.buttonStyle === 'custom') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <ThemeColorPicker {...colorPickerProps("Button Background", "buttonBackgroundColor", currentConfig.buttonStyle === 'primary' ? '#3B82F6' : '#4B5563')} />
             <ThemeColorPicker {...colorPickerProps("Button Text", "buttonTextColor", "#FFFFFF")} />
          </div>
        )}
        {currentConfig.buttonStyle === 'outline' && (
             <ThemeColorPicker {...colorPickerProps("Button Border/Text", "buttonTextColor", "#FFFFFF")} />
        )}
        {(currentConfig.buttonStyle !== 'custom' && currentConfig.buttonStyle !== 'outline') && <p className="text-xs text-gray-500">Select 'Custom' or 'Outline' style in Styling tab for more color options.</p> }
      </div>
    ),
    styling: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Sizing & Animation</h3>
        <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Height:</label>
              <input type="text" value={currentConfig.initialHeight || '50vh'} onChange={(e) => handlePanelFieldChange('initialHeight', e.target.value)} placeholder="e.g., 50vh" className="mt-1 panel-input-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Final Height (Shrunk):</label>
              <input type="text" value={currentConfig.finalHeight || '30vh'} onChange={(e) => handlePanelFieldChange('finalHeight', e.target.value)} placeholder="e.g., 30vh" className="mt-1 panel-input-sm"/>
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Shrink After (ms):</label>
          <input type="number" value={currentConfig.shrinkAfterMs || 1500} onChange={(e) => handlePanelFieldChange('shrinkAfterMs', e.target.value)} className="mt-1 panel-input-sm"/>
        </div>
        <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1 pt-2">Button Style</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700">Button Visual Style:</label>
          <select value={currentConfig.buttonStyle || 'primary'} onChange={(e) => handlePanelFieldChange('buttonStyle', e.target.value)} className="mt-1 panel-select-sm">
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
            <option value="custom">Custom Colors</option>
          </select>
        </div>
      </div>
    ),
  };
};

export default PageHeroBlock;
