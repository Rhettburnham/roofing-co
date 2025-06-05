// src/components/blocks/HeaderBannerBlock.jsx
import React from "react";
import PanelImagesController from "../common/PanelImagesController";
import ThemeColorPicker from "../common/ThemeColorPicker";

// A simple EditableText component
const EditableText = ({ value, onChange, tag: Tag = 'span', className = '', placeholder = 'Enter text', readOnly = false, inputType = 'text' }) => {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    if (value !== inputValue) {
      onChange(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputType === 'text') { // For single line input, Enter confirms.
      if (value !== inputValue) {
        onChange(inputValue);
      }
      e.target.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value); // Revert
      e.target.blur();
    }
  };

  if (readOnly) {
    // Render placeholder if value is empty in readOnly mode for visual consistency
    return <Tag className={className}>{value || placeholder}</Tag>;
  }

  const inputStyles = {
    background: 'transparent',
    border: '1px dashed rgba(255, 255, 255, 0.3)', // Subtle border for editing
    outline: 'none',
    width: '100%',
    padding: '0', // Minimal padding, rely on parent's padding or className
    margin: '0',
    font: 'inherit',
    color: 'inherit',
  };

  if (inputType === 'textarea') {
    return (
      <textarea
        value={inputValue || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className={className} // Apply main styling to textarea directly
        style={inputStyles}
        rows={inputValue?.split('\\n').length || 1}
      />
    );
  } else {
    return (
      <input
        type="text"
        value={inputValue || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className={className} // Apply main styling to input directly
        style={inputStyles}
      />
    );
  }
};


/**
 * HeaderBannerBlock
 *
 * A full width banner with heading and subheading
 *
 * config = {
 *   title: string,
 *   subtitle: string,
 *   backgroundImage: string | { url: string, file?: File },
 *   textColor: string (color hex),
 *   textAlign: string ('left', 'center', 'right'),
 *   titleFontSize: string (Tailwind class e.g. 'text-5xl'),
 *   subtitleFontSize: string (Tailwind class e.g. 'text-xl'),
 *   bannerMinHeight: string (e.g. '300px', '50vh', 'auto'),
 *   paddingClasses: string (Tailwind classes e.g. 'py-8 md:py-12')
 * }
 */
const HeaderBannerBlock = ({ config = {}, readOnly = true, onConfigChange }) => {
  const {
    title = "Welcome",
    subtitle = "Explore our services",
    backgroundImage = "", 
    textColor = "#FFFFFF",
    textAlign = "center",
    titleFontSize = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    subtitleFontSize = "text-base sm:text-lg md:text-xl",
    bannerMinHeight = "auto", 
    paddingClasses = "py-4 md:py-6 lg:py-8", 
    overlayOpacity = 0.5 // Added from old panel logic if needed
  } = config;

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    // Handle new image object structure from PanelImagesController
    if (typeof value === "object" && value.url) return value.url;
    // Handle direct string URL (legacy or manual input)
    if (typeof value === "string") return value;
    return null;
  };

  const displayBackground = getDisplayUrl(backgroundImage) || "/assets/images/default-banner.jpg";

  const handleInlineChange = (field, newValue) => {
    if (onConfigChange) {
        onConfigChange({ ...config, [field]: newValue });
    }
  };

  const sectionStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity + 0.2 > 1 ? 1 : overlayOpacity + 0.2})), url('${displayBackground}')`,
    minHeight: bannerMinHeight !== 'auto' ? bannerMinHeight : undefined,
    color: textColor // Moved text color here for simplicity as it applies to all text
  };

  const textAlignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[textAlign] || 'text-center';

    return (
      <section 
      className={`relative w-full flex ${textAlignClass} bg-cover bg-center bg-no-repeat overflow-hidden ${paddingClasses}`}
      style={sectionStyle}
      >
      <div className={`container mx-auto px-4`}> {/* Removed textAlignClass from here, applied to parent flex */}
        <EditableText
          tag="h1"
          value={title}
          onChange={(val) => handleInlineChange("title", val)}
          readOnly={readOnly}
          className={`font-bold mb-4 md:mb-6 ${titleFontSize}`}
          placeholder="Enter Title"
          // style={{ color: textColor }} // Style inherited from sectionStyle
        />
        { (subtitle || !readOnly) && (
          <EditableText
            tag="p"
            value={subtitle}
            onChange={(val) => handleInlineChange("subtitle", val)}
            readOnly={readOnly}
            className={`max-w-2xl ${textAlign === 'center' ? 'mx-auto' : textAlign === 'left' ? 'mr-auto ml-0' : 'ml-auto mr-0'} ${subtitleFontSize}`}
            placeholder="Enter Subtitle"
            inputType="textarea" 
            // style={{ color: textColor }} // Style inherited from sectionStyle
          />
          )}
        </div>
      </section>
    );
};

HeaderBannerBlock.tabsConfig = (config, onPanelChange, themeColors) => {
  const handlePanelFieldChange = (field, value) => {
    // Ensure overlayOpacity is a number
    if (field === 'overlayOpacity') {
        const numValue = parseFloat(value);
        value = isNaN(numValue) ? 0.5 : Math.max(0, Math.min(1, numValue));
    }
    onPanelChange({ ...config, [field]: value });
  };

  // Prepare data for PanelImagesController (single image)
  const imagesForController = config.backgroundImage && typeof config.backgroundImage === 'object' && config.backgroundImage.url
    ? [{ ...config.backgroundImage, id: 'bgImage', name: 'Background Image' }]
    : (typeof config.backgroundImage === 'string' && config.backgroundImage
        ? [{ url: config.backgroundImage, id: 'bgImage', name: 'Background Image', originalUrl: config.backgroundImage }]
        : []);

  const onImageControllerChange = (updatedData) => {
    const newImageArray = updatedData.images || [];
    if (newImageArray.length > 0) {
      onPanelChange({ ...config, backgroundImage: newImageArray[0] });
    } else {
      onPanelChange({ ...config, backgroundImage: { url: '', name: '', originalUrl: '' } }); // Clear image
    }
  };

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="textAlign" className="block text-sm font-medium text-gray-700">Text Alignment</label>
          <select
            id="textAlign"
            value={config.textAlign || 'center'}
            onChange={(e) => handlePanelFieldChange("textAlign", e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label htmlFor="bannerMinHeight" className="block text-sm font-medium text-gray-700">Banner Min Height</label>
          <input
            type="text"
            id="bannerMinHeight"
            value={config.bannerMinHeight || 'auto'}
            onChange={(e) => handlePanelFieldChange("bannerMinHeight", e.target.value)}
            placeholder="e.g., 300px, 50vh, auto"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
        <div>
            <label htmlFor="overlayOpacity" className="block text-sm font-medium text-gray-700">
                Background Overlay Opacity: {config.overlayOpacity !== undefined ? config.overlayOpacity.toFixed(2) : (0.5).toFixed(2)}
            </label>
            <input 
                type="range" 
                id="overlayOpacity" 
                min="0" 
                max="1" 
                step="0.01" 
                value={config.overlayOpacity !== undefined ? config.overlayOpacity : 0.5} 
                onChange={(e) => handlePanelFieldChange("overlayOpacity", e.target.value)} 
                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
      </div>
    ),
    images: () => (
        <PanelImagesController
            currentData={{ images: imagesForController }}
            onControlsChange={onImageControllerChange} // This function will receive {images: [...]} 
            imageArrayFieldName="images"
            getItemName={() => 'Background Image'}
            maxImages={1} // Only one background image
            allowAdd={imagesForController.length === 0} // Allow add only if no image is set
            allowRemove={imagesForController.length > 0} // Allow remove if an image is set
        />
    ),
    colors: () => (
      <div className="p-4 space-y-4">
        <ThemeColorPicker
          label="Text Color"
          fieldName="textColor"
          currentColorValue={config.textColor || "#FFFFFF"}
          onColorChange={(fieldName, value) => handlePanelFieldChange(fieldName, value)}
          themeColors={themeColors}
        />
      </div>
    ),
    styling: () => (
      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="titleFontSize" className="block text-sm font-medium text-gray-700">Title Font Size (Tailwind)</label>
          <input
            type="text"
            id="titleFontSize"
            value={config.titleFontSize || 'text-5xl'}
            onChange={(e) => handlePanelFieldChange("titleFontSize", e.target.value)}
            placeholder="e.g., text-5xl md:text-6xl"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
        <div>
          <label htmlFor="subtitleFontSize" className="block text-sm font-medium text-gray-700">Subtitle Font Size (Tailwind)</label>
          <input
            type="text"
            id="subtitleFontSize"
            value={config.subtitleFontSize || 'text-xl'}
            onChange={(e) => handlePanelFieldChange("subtitleFontSize", e.target.value)}
            placeholder="e.g., text-xl md:text-2xl"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
        <div>
          <label htmlFor="paddingClasses" className="block text-sm font-medium text-gray-700">Padding Classes (Tailwind)</label>
          <input
            type="text"
            id="paddingClasses"
            value={config.paddingClasses || 'py-8 md:py-16'}
            onChange={(e) => handlePanelFieldChange("paddingClasses", e.target.value)}
            placeholder="e.g., py-8 md:py-16"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 bg-white"
          />
        </div>
      </div>
    ),
  };
};

export default HeaderBannerBlock;
