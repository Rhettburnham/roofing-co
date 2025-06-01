// src/components/blocks/VideoCTA.jsx
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HashLink } from "react-router-hash-link";
import { FaPencilAlt, FaVideo, FaTimes } from "react-icons/fa";
import ThemeColorPicker from "../common/ThemeColorPicker";

// Helper function (can be moved to a utils file if used elsewhere)
const getDisplayUrlHelper = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value; // Handles direct URLs or blob URLs
  if (value.url) return value.url; // Handles { url: '...', file: File }
  return null;
};

// EditableText Component (Copied from GeneralList.jsx for now, consider moving to common/ if used by many)
const EditableText = ({ value, onChange, onBlur, tag: Tag = 'p', className = '', inputClassName = '', isTextarea = false, placeholder = "Edit", readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (isTextarea && inputRef.current.scrollHeight > inputRef.current.clientHeight) {
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  }, [isEditing, isTextarea]);
  
  const handleInputChange = (e) => {
    setCurrentValue(e.target.value);
    if (isTextarea && inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Adjust to content
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextarea) {
      handleBlur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value); // Revert
      setIsEditing(false);
      if (onBlur) onBlur();
    }
  };

  const activateEditMode = () => {
    if (!readOnly && !isEditing) {
      setIsEditing(true);
    }
  };

  if (!readOnly && isEditing) {
    const commonInputProps = {
      ref: inputRef,
      value: currentValue,
      onChange: handleInputChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `${className} ${inputClassName} outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-white/70 placeholder-gray-500/70 shadow-inner`, // Slightly transparent bg for editing
      style: { width: '100%' } // Ensure input takes full width of its container
    };
    if (isTextarea) {
      return <textarea {...commonInputProps} rows={Math.max(2, (currentValue || '').split('\n').length)} placeholder={placeholder} />;
    }
    return <input {...commonInputProps} type="text" placeholder={placeholder} />;
  }

  // Apply cursor-pointer only when not readOnly and not editing (to avoid double cue if Tag is button-like)
  const cursorClass = !readOnly && !isEditing ? 'cursor-pointer hover:bg-gray-400/10' : '';

  return (
    <Tag
      className={`${className} ${cursorClass} transition-colors duration-150 ease-in-out p-0 m-0 min-h-[1em] w-full break-words`} // Added w-full and break-words
      onClick={activateEditMode}
      title={!readOnly ? "Click to edit" : ""}
    >
      {value || <span className="text-gray-400/80 italic text-sm">({placeholder})</span>}
    </Tag>
  );
};

const VideoCTADisplay = ({ config = {}, isPreview = false, readOnly = false, onConfigChange }) => {
  const {
    videoSrc: rawVideoSrc,
    title = "Ready to Upgrade Your Siding?",
    description = "Contact us today for a free consultation on the best siding option for your home.",
    buttonText = "Schedule a Consultation",
    buttonLink = "/#contact",
    textColor = "1", // "1", "2", or "3"
    textAlignment = "center", // left, center, right
    overlayOpacity = 0.5,
  } = config;

  const displayVideoSrc = getDisplayUrlHelper(rawVideoSrc);

  // Map "1,2,3" -> tailwind colors
  const colorMap = {
    1: "text-white",
    2: "text-black",
    3: "text-gray-800", // This was text-gray-800, ensure themeColors could override this
  };
  // If textColor is a hex code (e.g. from ThemeColorPicker), use it directly. Otherwise, use map.
  const chosenTextClass = textColor.startsWith("#") ? "" : (colorMap[textColor] || "text-white");
  const dynamicTextColorStyle = textColor.startsWith("#") ? { color: textColor } : {};

  // Map alignment
  const alignMap = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };
  const chosenAlign = alignMap[textAlignment] || alignMap.center;

  const videoRef = useRef(null);

  useEffect(() => {
    if (!isPreview && videoRef.current && displayVideoSrc) {
      videoRef.current.play().catch(() => {
         console.warn("Video autoplay was prevented by the browser.");
      });
    }
  }, [isPreview, displayVideoSrc]);
  
  const handleLocalChange = (field, value) => {
    if (onConfigChange) {
      onConfigChange({ ...config, [field]: value });
    }
  };

  const sectionClasses = `relative overflow-hidden rounded-[40px] px-4 md:px-[10vw] my-3 ${!readOnly ? 'shadow-lg border-2 border-blue-300/50' : ''}`;
  const videoContainerClasses = "relative w-full h-[30vh] md:h-[40vh] lg:h-[50vh]";

  return (
    <section className={sectionClasses}>
      <div className={videoContainerClasses}>
        {displayVideoSrc ? (
          <video
            ref={videoRef}
            autoPlay={!isPreview && !readOnly} // Autoplay if not in editor preview AND not in readonly page view
            loop
            muted
            playsInline
            tabIndex={-1}
            src={displayVideoSrc}
            key={displayVideoSrc} // Re-render if src changes
            className="absolute top-0 left-0 w-full h-full object-cover rounded-[40px]"
            style={{ pointerEvents: "none" }}
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full object-cover rounded-[40px] bg-gray-700 flex items-center justify-center text-white">
            {readOnly ? "Video Not Available" : "No Video Source - Add in Editor Panel"}
          </div>
        )}
        <div
          className="absolute inset-0 bg-black rounded-[40px]"
          style={{ opacity: overlayOpacity }}
        ></div>

        <div
          className={`absolute inset-0 flex flex-col justify-center px-4 ${chosenAlign} z-10`}
        >
           <EditableText
            value={title}
            onChange={(newVal) => handleLocalChange("title", newVal)}
            tag="h2"
            className={`text-[5vw] md:text-4xl font-bold mb-2 md:mb-6 ${chosenTextClass}`}
            inputClassName={`text-[5vw] md:text-4xl font-bold ${chosenTextClass}`}
            placeholder="Section Title"
            readOnly={readOnly}
            style={dynamicTextColorStyle} // Apply dynamic style here for EditableText's wrapper
          />
          <EditableText
            value={description}
            onChange={(newVal) => handleLocalChange("description", newVal)}
            tag="p"
            className={`text-[3.5vw] md:text-xl font-semibold mb-5 md:mb-4 px-12 md:px-12 ${chosenTextClass}`}
            inputClassName={`text-[3.5vw] md:text-xl font-semibold ${chosenTextClass}`}
            isTextarea={true}
            placeholder="Section Description"
            readOnly={readOnly}
            style={dynamicTextColorStyle}
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2" style={{ minWidth: '200px' }}> {/* Container for button text editing */}
          <HashLink
              to={!readOnly ? "javascript:void(0)" : buttonLink} // Prevent navigation in edit mode
              className={`block px-3 py-2 md:px-8 md:py-4 bg-accent hover:bg-banner hover:text-white font-semibold rounded-full text-black transition duration-300 whitespace-nowrap text-center ${readOnly ? '' : 'pointer-events-none'}`}
              onClick={(e) => { if (!readOnly) e.preventDefault(); }} // Further prevent navigation
            >
              <EditableText
                value={buttonText}
                onChange={(newVal) => handleLocalChange("buttonText", newVal)}
                tag="span"
                className="font-semibold text-black" // Ensure this matches button's base text color
                inputClassName="font-semibold text-black bg-accent/80" // Style for input
                placeholder="Button Text"
                readOnly={readOnly}
              />
          </HashLink>
          </div>
        </div>
      </div>
    </section>
  );
};

const VideoCTA = ({
  config = {},
  readOnly = false,
  onConfigChange, // This is the callback to update the whole config object
  onToggleEditor, // Callback to open/close the EditorPanel (from ServiceEditPage)
  themeColors, // Passed from ServiceEditPage/OneForm
  onFileChange, // Passed from ServiceEditPage/OneForm for file uploads
}) => {

  // When not in readOnly mode (i.e., editor is active for this block)
  if (!readOnly) {
  return (
      <div className="relative group border-2 border-blue-400/50 p-1 bg-slate-50"> {/* Visual cue for active edit state */}
        <VideoCTADisplay
          config={config}
          isPreview={false} // in-place editing, not a separate preview
          readOnly={false}  // activate editable fields
          onConfigChange={onConfigChange} // Pass down to allow EditableText to update config
        />
        {/* The onToggleEditor button is managed by ServiceEditPage to open the external panel */}
      {onToggleEditor && (
        <button
          onClick={onToggleEditor}
            className="absolute top-2 right-2 z-30 p-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors opacity-50 group-hover:opacity-100"
            title="Open Editor Panel for Styles & Video Source"
        >
          <FaPencilAlt size={16} />
        </button>
      )}
    </div>
  );
  }

  // READ-ONLY (Live Page View)
  return <VideoCTADisplay config={config} isPreview={false} readOnly={true} />;
};

VideoCTA.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange, themeColors, getDisplayUrl }) => {
  const {
    videoSrc: rawVideoSrc,
    // title, description, buttonText are edited inline
    buttonLink = "/#contact",
    textColor = "#FFFFFF", // Default to white, expecting hex from ThemeColorPicker
    textAlignment = "center",
    overlayOpacity = 0.5,
  } = currentConfig;

  const currentGetDisplayUrl = typeof getDisplayUrl === 'function' ? getDisplayUrl : getDisplayUrlHelper;
  const displayVideoUrlForPreview = currentGetDisplayUrl(rawVideoSrc);

  const handleFieldChange = (field, value) => {
    let processedValue = value;
    if (field === "overlayOpacity") {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) processedValue = 0.5;
      processedValue = Math.max(0, Math.min(1, processedValue));
    }
    // onPanelConfigChange updates specific fields in the block's config
    onPanelConfigChange({ [field]: processedValue });
  };

  const handleVideoFileEvent = (e) => {
    const file = e.target.files?.[0];
    if (file && onPanelFileChange) {
      // onPanelFileChange expects (configKey, fileObject)
      // The ServiceEditPage will handle creating the { file, url, name, originalUrl } structure
      onPanelFileChange('videoSrc', file);
    }
  };
  
  const handleVideoUrlChange = (url) => {
    if (onPanelFileChange) {
        // For pasted URLs, send the URL string. ServiceEditPage will format it.
        onPanelFileChange('videoSrc', url);
    } else {
        // Fallback if onPanelFileChange is not provided (e.g. older setup)
        onPanelConfigChange({ videoSrc: url });
    }
  };
  
  const inputBaseClass = "mt-1 w-full px-2 py-1.5 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelBaseClass = "block text-xs font-medium text-gray-300 mb-0.5";

  return (
    <div className="p-3 space-y-3 bg-gray-800 text-gray-200 rounded-b-md max-h-[70vh] overflow-y-auto">
      <h3 className="text-base font-semibold mb-3 text-center border-b border-gray-700 pb-2">Video & Style Settings</h3>
      
      <div>
        <label className={labelBaseClass}>Video Source:</label>
        <div className="flex items-center space-x-1 mb-1 p-1 bg-gray-700 rounded">
            {displayVideoUrlForPreview && (
                 <video key={displayVideoUrlForPreview} className="h-10 w-14 object-cover rounded" controls={false} muted loop playsInline>
                     <source src={displayVideoUrlForPreview} type={rawVideoSrc?.file?.type || 'video/mp4'} />
                 </video>
            )}
            <input 
                type="text" 
                placeholder="Paste video URL" 
                value={(typeof rawVideoSrc === 'string' && !rawVideoSrc.startsWith('blob:')) ? rawVideoSrc : (rawVideoSrc?.originalUrl || '')}
                onChange={(e) => handleVideoUrlChange(e.target.value)} 
                className="flex-grow p-1 bg-gray-600 border-gray-500 rounded text-xs" 
            />
            <label className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-1.5 py-1 rounded cursor-pointer">
                <FaVideo size={10} className="inline"/>
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoFileEvent} />
            </label>
            {rawVideoSrc && (rawVideoSrc.url || typeof rawVideoSrc === 'string') && (
                 <button onClick={() => handleVideoUrlChange('')} className="text-red-500 hover:text-red-400 p-0.5" title="Remove Video">
                     <FaTimes size={10}/>
                 </button>
            )}
      </div>
        {displayVideoUrlForPreview && !displayVideoUrlForPreview.startsWith('blob:') && (typeof rawVideoSrc === 'object' && rawVideoSrc.name) && (
             <p className="text-xs text-gray-400 italic mt-0.5">Using video: {rawVideoSrc.name}</p>
        )}
        {displayVideoUrlForPreview && displayVideoUrlForPreview.startsWith('blob:') && (typeof rawVideoSrc === 'object' && rawVideoSrc.name) && (
             <p className="text-xs text-gray-400 italic mt-0.5">Uploaded: {rawVideoSrc.name}</p>
        )}
      </div>

      <div>
        <label className={labelBaseClass}>Button Link (e.g., /#contact or /services):</label>
        <input type="text" value={buttonLink} onChange={(e) => handleFieldChange("buttonLink", e.target.value)} className={inputBaseClass} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-700 mt-3">
        <div>
            <label className={labelBaseClass}>Text Color:</label>
            <ThemeColorPicker
                label="" // No main label needed here
                fieldName="textColor"
                currentColorValue={textColor}
                onColorChange={(fieldName, value) => handleFieldChange(fieldName, value)} // handleFieldChange directly takes (field, value)
                themeColors={themeColors || { accent: '#007bff', text: '#ffffff', background: '#333333' }}
                className="mt-0" // Remove top margin from picker itself
            />
        </div>
        <div>
            <label className={labelBaseClass}>Text Alignment:</label>
            <select value={textAlignment} onChange={(e) => handleFieldChange("textAlignment", e.target.value)} className={inputBaseClass}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            </select>
        </div>
        </div>
        <div>
            <label className={labelBaseClass}>Overlay Opacity (0-1): Current: {overlayOpacity}</label>
            <input 
                type="range" // Changed to range slider
                value={overlayOpacity} 
                step="0.01"  // Finer control for opacity
                min="0" 
                max="1" 
                onChange={(e) => handleFieldChange("overlayOpacity", e.target.value)} 
                className={`${inputBaseClass} p-0 h-2 appearance-none bg-gray-600 rounded-full cursor-pointer focus:ring-0 focus:outline-none slider-thumb`} 
            />
      </div>
    </div>
  );
};

export default VideoCTA;

<style>
{`
  .slider-thumb::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #3b82f6; /* Tailwind blue-500 */
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
  }

  .slider-thumb::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
  }
`}
</style>
