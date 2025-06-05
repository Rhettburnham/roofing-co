import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import PanelImagesController from "../common/PanelImagesController";
import ThemeColorPicker from "../common/ThemeColorPicker";

// Helper to initialize image state
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

// Helper function to get display URL
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === 'string') return imageValue;
  if (typeof imageValue === 'object' && imageValue.url) return imageValue.url;
  return defaultPath;
};

// A simple EditableText component
const EditableText = ({ value, onChange, tag: Tag = 'span', className = '', placeholder = 'Enter text', readOnly = false, inputType = 'text', style = {} }) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setInputValue(value); }, [value]);

  useEffect(() => {
    if (!readOnly && inputType === 'textarea' && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue, readOnly, inputType]);

  const handleChange = (e) => { if (!readOnly) setInputValue(e.target.value); };
  const handleBlur = () => { if (!readOnly && value !== inputValue) onChange(inputValue); };
  const handleKeyDown = (e) => {
    if (!readOnly) {
      if (e.key === 'Enter' && inputType === 'text') { handleBlur(); e.preventDefault(); }
      else if (e.key === 'Escape') { setInputValue(value); inputRef.current?.blur(); }
    }
  };

  if (readOnly) {
    const displayValue = value || <span className="text-gray-400/70 italic">({placeholder})</span>;
    if (inputType === 'textarea') return <div className={`${className} whitespace-pre-line`} style={style}>{displayValue}</div>;
    return <Tag className={className} style={style}>{displayValue}</Tag>;
  }

  const inputClasses = `bg-transparent border-b-2 border-dashed focus:border-white/70 outline-none w-full ${className}`;
  if (inputType === 'textarea') {
    return <textarea ref={inputRef} value={inputValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} rows={value?.split('\n').length || 1} />;
  }
  return <input ref={inputRef} type="text" value={inputValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} />;
};


const SectionBannerBlock = ({ config, readOnly = true, onConfigChange, getDisplayUrl: getDisplayUrlFromProp }) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      title: 'Default Banner Title',
      subtext: 'Default banner subtext here.',
      overlayOpacity: 0.5,
      textColor: '#FFFFFF',
      height: '40vh',
      backgroundImage: initializeImageState(null, '/assets/images/placeholder_banner.jpg'),
      textAlign: 'center',
      titleFontSize: 'text-3xl md:text-5xl',
      subtextFontSize: 'text-lg md:text-xl',
      paddingClasses: 'py-8 md:py-12'
    };
    const initialData = { ...defaultConfig, ...(config || {}) };
    return {
      ...initialData,
      backgroundImage: initializeImageState(initialData.backgroundImage, defaultConfig.backgroundImage.originalUrl),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newBgImage = initializeImageState(config.backgroundImage, prevLocal.backgroundImage.originalUrl);
        if (prevLocal.backgroundImage?.file && prevLocal.backgroundImage.url?.startsWith('blob:') && prevLocal.backgroundImage.url !== newBgImage.url) {
          URL.revokeObjectURL(prevLocal.backgroundImage.url);
        }
        // Preserve inline edits if not in readOnly mode and some key fields match (simple heuristic)
        const preserveInline = !readOnly && config.title === prevLocal.title;
        return {
          ...prevLocal, // Keep existing local fields as base
          ...config,    // Overlay with incoming config fields
          backgroundImage: newBgImage,
          title: preserveInline ? prevLocal.title : (config.title || prevLocal.title || 'Default Banner Title'),
          subtext: preserveInline ? prevLocal.subtext : (config.subtext || prevLocal.subtext || 'Default subtext'),
        };
      });
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && typeof onConfigChange === 'function') {
      const dataToSave = {
        ...localConfig,
        backgroundImage: localConfig.backgroundImage?.file
          ? { ...localConfig.backgroundImage } 
          : { url: localConfig.backgroundImage?.originalUrl || localConfig.backgroundImage?.url, name: localConfig.backgroundImage?.name }, 
      };
      if (dataToSave.backgroundImage && !dataToSave.backgroundImage.file) delete dataToSave.backgroundImage.file;
      onConfigChange(dataToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    const currentBg = localConfig.backgroundImage;
    return () => {
      if (currentBg?.file && currentBg.url?.startsWith('blob:')) {
        URL.revokeObjectURL(currentBg.url);
      }
    };
  }, [localConfig.backgroundImage]);

  const handleInlineChange = (field, value) => {
    if (!readOnly && typeof onConfigChange === 'function') {
      const newConfig = { ...localConfig, [field]: value };
      setLocalConfig(newConfig);
      onConfigChange(newConfig); // Live update from inline edits
    }
  };
  
  const currentDisplayImageUrl = getDisplayUrlFromProp 
    ? getDisplayUrlFromProp(localConfig.backgroundImage) 
    : getDisplayUrl(localConfig.backgroundImage, '/assets/images/placeholder_banner.jpg');

  const bannerStyle = {
    backgroundImage: currentDisplayImageUrl ? `url("${currentDisplayImageUrl}")` : 'none',
    backgroundColor: !currentDisplayImageUrl ? '#cccccc' : '', 
    height: localConfig.height || '40vh',
    color: localConfig.textColor || '#FFFFFF',
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    // alignItems and justifyContent will be controlled by textAlignClass
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${localConfig.overlayOpacity >= 0 && localConfig.overlayOpacity <= 1 ? localConfig.overlayOpacity : 0.5})`,
    zIndex: 1,
  };

  const textAlignClasses = {
    left: 'text-left items-center justify-start',
    center: 'text-center items-center justify-center',
    right: 'text-right items-center justify-end',
  }[localConfig.textAlign || 'center'] || 'text-center items-center justify-center';

  return (
    <div style={bannerStyle} className={`section-banner-block w-full overflow-hidden ${localConfig.paddingClasses || 'py-8 md:py-12'} ${textAlignClasses} ${!readOnly ? 'border-2 border-blue-300/50' : ''}`}>
      <div style={overlayStyle}></div>
      <div className="relative z-20 container mx-auto px-4 max-w-4xl"> {/* Content alignment via parent flex */}
          <EditableText
            tag="h1"
            value={localConfig.title}
            onChange={(val) => handleInlineChange("title", val)}
            readOnly={readOnly}
            className={`font-bold mb-3 md:mb-4 ${localConfig.titleFontSize || 'text-3xl md:text-5xl'} w-full`}
            placeholder="Banner Title"
            isEditable={!readOnly}
            style={{color: "inherit"}}
          />
        { (localConfig.subtext || !readOnly) && (
          <EditableText
            tag="div" // Use div for textarea content to respect newlines
            value={localConfig.subtext}
            onChange={(val) => handleInlineChange("subtext", val)}
            readOnly={readOnly}
            className={`${localConfig.subtextFontSize || 'text-lg md:text-xl'} w-full`}
            placeholder="Banner Subtext (optional)"
            inputType="textarea"
            rows={3} 
            isEditable={!readOnly}
            style={{color: "inherit"}}
          />
          )}
        </div>
      </div>
  );
};

SectionBannerBlock.propTypes = {
  config: PropTypes.shape({
    backgroundImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.string,
    subtext: PropTypes.string,
    overlayOpacity: PropTypes.number,
    textColor: PropTypes.string,
    height: PropTypes.string,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    titleFontSize: PropTypes.string,
    subtextFontSize: PropTypes.string,
    paddingClasses: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

SectionBannerBlock.tabsConfig = (currentConfig, onPanelChange, themeColors) => {
  const handlePanelFieldChange = (field, value) => {
    let processedValue = value;
    if (field === 'overlayOpacity') {
        processedValue = parseFloat(value);
        if (isNaN(processedValue) || processedValue < 0 || processedValue > 1) processedValue = 0.5;
    }
    onPanelChange({ ...currentConfig, [field]: processedValue });
  };

  const imagesForController = currentConfig.backgroundImage && typeof currentConfig.backgroundImage === 'object' && currentConfig.backgroundImage.url
    ? [{ ...currentConfig.backgroundImage, id: 'sectionBannerBgImage', name: currentConfig.backgroundImage.name || 'Background' }]
    : (typeof currentConfig.backgroundImage === 'string' && currentConfig.backgroundImage
        ? [{ url: currentConfig.backgroundImage, id: 'sectionBannerBgImage', name: currentConfig.backgroundImage.split('/').pop() || 'Background', originalUrl: currentConfig.backgroundImage }]
        : []);

  const onImageControllerChange = (updatedData) => {
    const newImageArray = updatedData.images || [];
    if (newImageArray.length > 0) {
      onPanelChange({ ...currentConfig, backgroundImage: newImageArray[0] });
    } else {
      onPanelChange({ ...currentConfig, backgroundImage: initializeImageState(null, '/assets/images/placeholder_banner.jpg') });
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
        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Layout & Display</h3>
        <div>
          <label htmlFor="textAlignSB" className="block text-sm font-medium text-gray-700">Text Alignment</label>
          <select
            id="textAlignSB"
            value={currentConfig.textAlign || 'center'}
            onChange={(e) => handlePanelFieldChange("textAlign", e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label htmlFor="bannerHeightSB" className="block text-sm font-medium text-gray-700">Banner Height</label>
          <input
            type="text"
            id="bannerHeightSB"
            value={currentConfig.height || '40vh'}
            onChange={(e) => handlePanelFieldChange("height", e.target.value)}
            placeholder="e.g., 300px, 50vh, auto"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
        <div>
            <label htmlFor="overlayOpacitySB" className="block text-sm font-medium text-gray-700">
                Overlay Opacity: {(currentConfig.overlayOpacity !== undefined ? currentConfig.overlayOpacity : 0.5).toFixed(2)}
            </label>
            <input 
                type="range" 
                id="overlayOpacitySB" 
                min="0" 
                max="1" 
                step="0.01" 
                value={currentConfig.overlayOpacity !== undefined ? currentConfig.overlayOpacity : 0.5} 
                onChange={(e) => handlePanelFieldChange("overlayOpacity", e.target.value)} 
                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
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
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Text Color</h3>
        <ThemeColorPicker {...colorPickerProps("Content Text Color", "textColor", "#FFFFFF")} />
      </div>
    ),
    styling: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Typography & Spacing</h3>
        <div>
          <label htmlFor="titleFontSizeSB" className="block text-sm font-medium text-gray-700">Title Font Size (Tailwind)</label>
          <input
            type="text"
            id="titleFontSizeSB"
            value={currentConfig.titleFontSize || 'text-3xl md:text-5xl'}
            onChange={(e) => handlePanelFieldChange("titleFontSize", e.target.value)}
            placeholder="e.g., text-5xl md:text-6xl"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
        <div>
          <label htmlFor="subtextFontSizeSB" className="block text-sm font-medium text-gray-700">Subtext Font Size (Tailwind)</label>
          <input
            type="text"
            id="subtextFontSizeSB"
            value={currentConfig.subtextFontSize || 'text-lg md:text-xl'}
            onChange={(e) => handlePanelFieldChange("subtextFontSize", e.target.value)}
            placeholder="e.g., text-xl md:text-2xl"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
        <div>
          <label htmlFor="paddingClassesSB" className="block text-sm font-medium text-gray-700">Padding Classes (Tailwind)</label>
          <input
            type="text"
            id="paddingClassesSB"
            value={currentConfig.paddingClasses || 'py-8 md:py-12'}
            onChange={(e) => handlePanelFieldChange("paddingClasses", e.target.value)}
            placeholder="e.g., py-8 md:py-16"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
      </div>
    ),
  };
};

export default SectionBannerBlock; 