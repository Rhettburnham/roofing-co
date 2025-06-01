// src/components/blocks/HeaderBannerBlock.jsx
import React from "react";

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
    backgroundImage = "", // Can be a string URL or an object { url: string, file?: File }
    textColor = "#FFFFFF",
    textAlign = "center",
    titleFontSize = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    subtitleFontSize = "text-base sm:text-lg md:text-xl",
    bannerMinHeight = "auto", // e.g., '300px', 'auto'
    paddingClasses = "py-4 md:py-6 lg:py-8", // Default padding classes
  } = config;

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  const displayBackground = getDisplayUrl(backgroundImage) || "/assets/images/default-banner.jpg";

  const handleInlineChange = (field, newValue) => {
    onConfigChange?.({ ...config, [field]: newValue });
  };

  const sectionStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('${displayBackground}')`,
    minHeight: bannerMinHeight !== 'auto' ? bannerMinHeight : undefined,
  };

  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign] || 'text-center';

    return (
      <section 
      className={`relative w-full flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden ${paddingClasses}`}
      style={sectionStyle}
      >
      <div className={`container mx-auto px-4 ${textAlignClass}`}>
        <EditableText
          tag="h1"
          value={title}
          onChange={(val) => handleInlineChange("title", val)}
          readOnly={readOnly}
          className={`font-bold mb-4 md:mb-6 ${titleFontSize}`}
          placeholder="Enter Title"
          style={{ color: textColor }} // Apply text color directly
        />
        { (subtitle || !readOnly) && (
          <EditableText
            tag="p"
            value={subtitle}
            onChange={(val) => handleInlineChange("subtitle", val)}
            readOnly={readOnly}
            className={`max-w-2xl mx-auto ${subtitleFontSize} ${textAlign === 'center' ? 'mx-auto' : textAlign === 'left' ? 'mr-auto' : 'ml-auto'}`}
            placeholder="Enter Subtitle"
            inputType="textarea" // Subtitle can be multi-line
            style={{ color: textColor }} // Apply text color directly
          />
          )}
        </div>
      </section>
    );
};

export const HeaderBannerBlockEditorPanel = ({ config = {}, onPanelConfigChange, onPanelFileChange }) => {
  const {
    backgroundImage, // Handled by file input
    textColor = "#FFFFFF",
    textAlign = "center",
    titleFontSize = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    subtitleFontSize = "text-base sm:text-lg md:text-xl",
    bannerMinHeight = "auto",
    paddingClasses = "py-4 md:py-6 lg:py-8",
  } = config;

  const handleFieldChange = (field, value) => {
    onPanelConfigChange?.({ ...config, [field]: value });
  };

  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };
  const currentBgUrl = getDisplayUrl(backgroundImage);

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onPanelFileChange?.("backgroundImage", e.target.files[0]);
            }
          }}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {currentBgUrl && (
        <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Current Background Preview:</p>
          <img
              src={currentBgUrl}
            alt="Banner background preview"
              className="w-full h-32 object-cover rounded border"
          />
        </div>
      )}
      </div>

      <div>
        <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">Text Color</label>
        <input
          type="color"
          id="textColor"
          value={textColor}
          onChange={(e) => handleFieldChange("textColor", e.target.value)}
          className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="textAlign" className="block text-sm font-medium text-gray-700">Text Alignment</label>
        <select
          id="textAlign"
          value={textAlign}
          onChange={(e) => handleFieldChange("textAlign", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label htmlFor="titleFontSize" className="block text-sm font-medium text-gray-700">Title Font Size (Tailwind)</label>
        <input
          type="text"
          id="titleFontSize"
          value={titleFontSize}
          onChange={(e) => handleFieldChange("titleFontSize", e.target.value)}
          placeholder="e.g., text-5xl"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>
      
      <div>
        <label htmlFor="subtitleFontSize" className="block text-sm font-medium text-gray-700">Subtitle Font Size (Tailwind)</label>
        <input
          type="text"
          id="subtitleFontSize"
          value={subtitleFontSize}
          onChange={(e) => handleFieldChange("subtitleFontSize", e.target.value)}
          placeholder="e.g., text-xl"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="bannerMinHeight" className="block text-sm font-medium text-gray-700">Banner Min Height</label>
        <input
          type="text"
          id="bannerMinHeight"
          value={bannerMinHeight}
          onChange={(e) => handleFieldChange("bannerMinHeight", e.target.value)}
          placeholder="e.g., 300px, 50vh, auto"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="paddingClasses" className="block text-sm font-medium text-gray-700">Padding Classes (Tailwind)</label>
        <input
          type="text"
          id="paddingClasses"
          value={paddingClasses}
          onChange={(e) => handleFieldChange("paddingClasses", e.target.value)}
          placeholder="e.g., py-8 md:py-16"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>
    </div>
  );
};

export default HeaderBannerBlock;
