// src/components/blocks/PageHeroBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // For internal links
import { HashLink } from 'react-router-hash-link'; // For hash links

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

// Helper for inline editable fields - consider moving to a shared utils if used by many blocks
const EditableField = ({ value, onChange, placeholder, type = 'text', className, style, rows, isEditable }) => {
  if (!isEditable) { // If not editable (readOnly=true for the main block), render as static text
    if (type === 'textarea') {
      return <p className={className} style={style}>{value}</p>;
    }
    return <span className={className} style={style}>{value}</span>;
  }

  // If editable (readOnly=false for the main block)
  if (type === 'textarea') {
    return <textarea value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent focus:outline-none focus:ring-1 focus:ring-white/50 rounded p-1 ${className}`} style={style} rows={rows} />;
  }
  return <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent focus:outline-none focus:ring-1 focus:ring-white/50 rounded p-1 ${className}`} style={style} />;
};

const PageHeroBlock = ({ 
  config: initialConfig, // Renamed to avoid confusion with internal state name
  readOnly = true, // Default to true for safety if not provided
  onConfigChange, 
  getDisplayUrl, // Passed from ServiceEditPage for consistent image URL handling
  onFileChange // Passed from ServiceEditPage for handling file objects if needed
}) => {

  const defaultConfig = {
    title: "Service Title Here",
    subtext: "Optional tagline or brief description.",
    backgroundImage: { url: "/assets/images/growth/hero_growth.jpg", originalUrl: "/assets/images/growth/hero_growth.jpg" }, // Store as object
    textColor: "#FFFFFF",
    overlayColor: "rgba(0, 0, 0, 0.3)", // Default semi-transparent black
    contentAlignment: "center", // 'left', 'center', 'right'
    initialHeight: "50vh",
    finalHeight: "30vh", // Adjusted for potentially more content
    shrinkAfterMs: 1500,
    buttonText: "Get a Quote",
    buttonLink: "/#contact",
    buttonStyle: "primary", // 'primary', 'secondary', 'outline', 'custom'
    buttonTextColor: "#FFFFFF",
    buttonBackgroundColor: "#3B82F6", // Blue-600
    buttonOpenInNewTab: false,
  };
  
  // Initialize localConfig. Prioritize initialConfig, then add defaults for any missing props.
  const [localConfig, setLocalConfig] = useState(() => {
    const merged = { ...defaultConfig, ...initialConfig };
    // Ensure backgroundImage is an object, even if a string was passed in initialConfig
    if (typeof merged.backgroundImage === 'string') {
      merged.backgroundImage = { url: merged.backgroundImage, originalUrl: merged.backgroundImage };
    } else if (!merged.backgroundImage || typeof merged.backgroundImage.url !== 'string') {
        merged.backgroundImage = defaultConfig.backgroundImage;
    }
    return merged;
  });

  // Effect to sync with external config changes, especially when readOnly mode changes
  useEffect(() => {
    const merged = { ...defaultConfig, ...initialConfig };
    if (typeof merged.backgroundImage === 'string') {
      merged.backgroundImage = { url: merged.backgroundImage, originalUrl: merged.backgroundImage };
    } else if (!merged.backgroundImage || typeof merged.backgroundImage.url !== 'string') {
        merged.backgroundImage = defaultConfig.backgroundImage;
    }
    
    // If readOnly is true, always reflect initialConfig.
    // If readOnly is false, preserve local edits unless initialConfig differs significantly (e.g. new block type selected).
    // A simple heuristic: if the title differs, assume it's a new block config load.
    if (readOnly || (initialConfig && initialConfig.title !== localConfig.title)) {
        setLocalConfig(merged);
    }
  }, [initialConfig, readOnly]);


  // Effect for shrinking animation in readOnly mode
  const [isShrunk, setIsShrunk] = useState(false);
  useEffect(() => {
    if (readOnly && localConfig.initialHeight !== localConfig.finalHeight) {
      const timer = setTimeout(() => setIsShrunk(true), localConfig.shrinkAfterMs || 1000);
      return () => clearTimeout(timer);
    } else if (!readOnly) {
      setIsShrunk(false); // Reset if exiting readOnly or no shrink configured
    }
  }, [readOnly, localConfig.initialHeight, localConfig.finalHeight, localConfig.shrinkAfterMs]);

  // When inline fields change in edit mode, update localConfig
  const handleInlineChange = (field, value) => {
    if (!readOnly) {
      setLocalConfig(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // This effect calls onConfigChange when localConfig has been updated by inline edits or panel edits,
  // but only when exiting edit mode (readOnly flips to true).
  const prevReadOnlyRef = useRef(readOnly);
  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        // Prepare backgroundImage for saving: ensure it's the originalUrl if a file was involved
        const configToSave = { ...localConfig };
        if (localConfig.backgroundImage && localConfig.backgroundImage.file) {
          configToSave.backgroundImage = { 
            url: localConfig.backgroundImage.originalUrl || localConfig.backgroundImage.url,
            originalUrl: localConfig.backgroundImage.originalUrl || localConfig.backgroundImage.url,
            // Do not save the File object itself in JSON
          };
        } else if (localConfig.backgroundImage && typeof localConfig.backgroundImage === 'object') {
             configToSave.backgroundImage = {
                url: localConfig.backgroundImage.url,
                originalUrl: localConfig.backgroundImage.originalUrl || localConfig.backgroundImage.url
             }
        } else if (typeof localConfig.backgroundImage === 'string'){
             configToSave.backgroundImage = {
                url: localConfig.backgroundImage,
                originalUrl: localConfig.backgroundImage
             }
        }

        onConfigChange(configToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);


  // Destructure from localConfig for rendering
  const {
    title, subtext, backgroundImage, textColor, overlayColor, contentAlignment,
    initialHeight, finalHeight, shrinkAfterMs, // Animation props still exist
    buttonText, buttonLink, buttonStyle, buttonTextColor, buttonBackgroundColor, buttonOpenInNewTab
  } = localConfig;

  // Use getDisplayUrl if available (passed from ServiceEditPage), otherwise fallback
  const currentBackgroundImageUrl = getDisplayUrl ? getDisplayUrl(backgroundImage) : (backgroundImage?.url || '');

  const textAlignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };
  const currentAlignmentClass = textAlignClasses[contentAlignment] || textAlignClasses.center;

  const heroStyles = {
    height: readOnly ? (isShrunk ? finalHeight : initialHeight) : initialHeight, // Apply shrink effect only in readOnly
    color: textColor || '#FFFFFF',
    transition: readOnly ? 'height 1s ease-in-out' : 'none',
  };
  
  const bgDivStyles = {
    backgroundImage: currentBackgroundImageUrl ? `url('${currentBackgroundImageUrl}')` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    // Animation styles for background (subtle parallax or zoom on shrink)
    // backgroundPosition: readOnly && isShrunk ? 'center 80%' : 'center 50%', // Example parallax
    // transform: readOnly && isShrunk ? 'scale(1.05)' : 'scale(1)', // Example zoom
    // transition: 'background-position 1s ease-in-out, transform 1s ease-in-out',
  };

  const overlayStyles = {
    backgroundColor: overlayColor || 'rgba(0,0,0,0.3)', // Default overlay
  };

  const CTAButtonTag = buttonLink && (buttonLink.startsWith('http') || buttonLink.startsWith('mailto:') || buttonLink.startsWith('tel:')) ? 'a' : HashLink;
  const ctaLinkProps = CTAButtonTag === 'a' ? { href: buttonLink } : { to: buttonLink || '#' };
  if (buttonOpenInNewTab && CTAButtonTag === 'a') {
    ctaLinkProps.target = '_blank';
    ctaLinkProps.rel = 'noopener noreferrer';
  }
   if (CTAButtonTag === HashLink && buttonLink && buttonLink.includes('#')) {
    ctaLinkProps.smooth = true;
  }

  let ctaButtonClasses = 'mt-6 inline-block px-8 py-3 rounded-md font-semibold shadow-lg transition-colors duration-150 ease-in-out hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';
  let ctaInlineStyles = {};

  if (buttonStyle === 'primary') {
    ctaButtonClasses += ` bg-blue-600 text-white`; // Example primary
    if(buttonBackgroundColor) ctaInlineStyles.backgroundColor = buttonBackgroundColor;
    if(buttonTextColor) ctaInlineStyles.color = buttonTextColor;
  } else if (buttonStyle === 'secondary') {
    ctaButtonClasses += ` bg-gray-600 text-white`; // Example secondary
    if(buttonBackgroundColor) ctaInlineStyles.backgroundColor = buttonBackgroundColor;
    if(buttonTextColor) ctaInlineStyles.color = buttonTextColor;
  } else if (buttonStyle === 'outline') {
    ctaButtonClasses += ` border-2 bg-transparent`;
    ctaInlineStyles.borderColor = buttonBackgroundColor || textColor || '#FFFFFF';
    ctaInlineStyles.color = buttonTextColor || textColor || '#FFFFFF';
  } else if (buttonStyle === 'custom') {
    if(buttonBackgroundColor) ctaInlineStyles.backgroundColor = buttonBackgroundColor;
    if(buttonTextColor) ctaInlineStyles.color = buttonTextColor;
     // For custom, user might provide full classes in a separate field or rely on inline styles.
  }


  // When not readOnly, title and subtext are editable inline
  const TitleComponent = () => (
    <EditableField
      value={title}
      onChange={(e) => handleInlineChange('title', e.target.value)}
      placeholder="Hero Title"
      className={`text-4xl md:text-5xl lg:text-6xl font-bold break-words ${readOnly ? '' : 'w-full'}`}
      style={{ color: 'inherit' }} // Inherits from heroStyles
      isEditable={!readOnly}
    />
  );

  const SubtextComponent = () => (
    subtext || !readOnly ? ( // Show if subtext exists or if in edit mode
      <EditableField
        value={subtext}
        onChange={(e) => handleInlineChange('subtext', e.target.value)}
        placeholder="Optional Subtext"
        type="textarea"
        className={`mt-2 text-lg md:text-xl opacity-90 break-words ${readOnly ? '' : 'w-full'}`}
        style={{ color: 'inherit' }}
        rows={2}
        isEditable={!readOnly}
      />
    ) : null
  );

  return (
    <motion.section
      className={`relative w-full flex ${currentAlignmentClass}`}
      style={heroStyles}
      // Animate height for readOnly mode, controlled by isShrunk state
      initial={readOnly ? { height: initialHeight } : false } // No initial animation in edit mode
      animate={readOnly ? { height: isShrunk ? finalHeight : initialHeight } : { height: localConfig.initialHeight } } // Keep initialHeight in edit
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={bgDivStyles}></div>
      <div className="absolute inset-0 z-0" style={overlayStyles}></div>
      <div className={`relative z-10 p-6 md:p-8 max-w-4xl w-full ${currentAlignmentClass.includes('items-start') ? 'mr-auto ml-0 md:ml-12' : currentAlignmentClass.includes('items-end') ? 'ml-auto mr-0 md:mr-12' : 'mx-auto' }`}>
        <TitleComponent />
        <SubtextComponent />
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
    backgroundImage: PropTypes.oneOfType([
      PropTypes.string, // Simple URL string
      PropTypes.shape({ // Object structure for file handling
        url: PropTypes.string,
        originalUrl: PropTypes.string,
        file: PropTypes.object, // Instance of File
        name: PropTypes.string,
      })
    ]),
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
  getDisplayUrl: PropTypes.func, // For ServiceEditPage to pass consistent URL resolving
  onFileChange: PropTypes.func, // For ServiceEditPage to handle file object updates
};

PageHeroBlock.EditorPanel = function PageHeroBlockEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) {
  const [formData, setFormData] = useState(currentConfig || {});

  useEffect(() => {
    // Sync formData when currentConfig changes from parent
    setFormData(prevData => ({...prevData, ...currentConfig}));
  }, [currentConfig]);

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onPanelConfigChange(newFormData); // Propagate changes up immediately
  };
  
  const handleImageFileChange = (file) => {
    if (file && onPanelFileChange) {
      // Let the parent (ServiceEditPage) handle the File object and update the config structure
      onPanelFileChange('backgroundImage', file); 
    }
  };
  
  // Use the getDisplayUrl from props for consistency if available
  const currentBgImageUrl = getDisplayUrl ? getDisplayUrl(formData.backgroundImage) : (formData.backgroundImage?.url || '');

  return (
    <div className="space-y-4 p-3 bg-gray-800 text-white rounded-md shadow-xl text-sm">
      <h4 className="text-base font-semibold border-b border-gray-700 pb-2">Hero Settings</h4>
      
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">Background Image:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => handleImageFileChange(e.target.files[0])} 
          className="block w-full text-xs text-gray-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />
        {currentBgImageUrl && <img src={currentBgImageUrl} alt="Current background" className="mt-2 max-h-28 rounded object-contain border border-gray-600" />}
        <label className="block text-xs font-medium text-gray-300 mt-1.5">Or Image URL:</label>
        <input 
            type="text" 
            placeholder="/assets/image.jpg or https://..."
            value={typeof formData.backgroundImage === 'string' ? formData.backgroundImage : formData.backgroundImage?.originalUrl || formData.backgroundImage?.url || ''}
            onChange={(e) => handleChange('backgroundImage', e.target.value)}
            className="mt-0.5 block w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-xs placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-300">Text Color:</label>
          <input type="color" value={formData.textColor || '#FFFFFF'} onChange={(e) => handleChange('textColor', e.target.value)} className="mt-0.5 h-8 w-full p-0.5 border border-gray-600 rounded-md bg-gray-700" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300">Overlay Color (rgba):</label>
          <input type="text" value={formData.overlayColor || 'rgba(0,0,0,0.3)'} onChange={(e) => handleChange('overlayColor', e.target.value)} placeholder="e.g., rgba(0,0,0,0.5)" className="mt-0.5 panel-text-input-xs" />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-300">Content Alignment:</label>
        <select value={formData.contentAlignment || 'center'} onChange={(e) => handleChange('contentAlignment', e.target.value)} className="mt-0.5 panel-select-xs">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <h5 className="text-sm font-semibold border-t border-gray-700 pt-2 mt-3">Animation (Read-Only Mode)</h5>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-300">Initial Height:</label>
          <input type="text" value={formData.initialHeight || '50vh'} onChange={(e) => handleChange('initialHeight', e.target.value)} placeholder="e.g., 50vh" className="mt-0.5 panel-text-input-xs"/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300">Final Height (Shrunk):</label>
          <input type="text" value={formData.finalHeight || '30vh'} onChange={(e) => handleChange('finalHeight', e.target.value)} placeholder="e.g., 30vh" className="mt-0.5 panel-text-input-xs"/>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-300">Shrink After (ms):</label>
        <input type="number" value={formData.shrinkAfterMs || 1500} onChange={(e) => handleChange('shrinkAfterMs', parseInt(e.target.value, 10) || 1000)} className="mt-0.5 panel-text-input-xs"/>
      </div>

      <h5 className="text-sm font-semibold border-t border-gray-700 pt-2 mt-3">Call to Action Button</h5>
       <div>
        <label className="block text-xs font-medium text-gray-300">Button Text:</label>
        <input type="text" value={formData.buttonText || ''} onChange={(e) => handleChange('buttonText', e.target.value)} placeholder="Optional" className="mt-0.5 panel-text-input-xs"/>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-300">Button Link:</label>
        <input type="text" value={formData.buttonLink || ''} onChange={(e) => handleChange('buttonLink', e.target.value)} placeholder="/contact or #section-id" className="mt-0.5 panel-text-input-xs"/>
      </div>
      <div className="grid grid-cols-2 gap-3">
         <div>
          <label className="block text-xs font-medium text-gray-300">Button Style:</label>
          <select value={formData.buttonStyle || 'primary'} onChange={(e) => handleChange('buttonStyle', e.target.value)} className="mt-0.5 panel-select-xs">
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
            <option value="custom">Custom Colors</option>
          </select>
        </div>
        <div className="flex items-center pt-4">
            <input type="checkbox" id="buttonOpenInNewTabHero" checked={formData.buttonOpenInNewTab || false} onChange={(e) => handleChange('buttonOpenInNewTab', e.target.checked)} className="h-3.5 w-3.5 rounded mr-1.5" />
            <label htmlFor="buttonOpenInNewTabHero" className="text-xs text-gray-300">New Tab</label>
        </div>
      </div>
      {(formData.buttonStyle === 'primary' || formData.buttonStyle === 'secondary' || formData.buttonStyle === 'custom') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300">Button BG Color:</label>
            <input type="color" value={formData.buttonBackgroundColor || (formData.buttonStyle === 'primary' ? '#3B82F6' : '#4B5563')} onChange={(e) => handleChange('buttonBackgroundColor', e.target.value)} className="mt-0.5 h-8 w-full p-0.5 border border-gray-600 rounded-md bg-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300">Button Text Color:</label>
            <input type="color" value={formData.buttonTextColor || '#FFFFFF'} onChange={(e) => handleChange('buttonTextColor', e.target.value)} className="mt-0.5 h-8 w-full p-0.5 border border-gray-600 rounded-md bg-gray-700" />
          </div>
        </div>
      )}
       {formData.buttonStyle === 'outline' && (
        <div className="grid grid-cols-2 gap-3">
           <div>
            <label className="block text-xs font-medium text-gray-300">Button Border/Text Color:</label>
            <input type="color" value={formData.buttonTextColor || '#FFFFFF'} onChange={(e) => handleChange('buttonTextColor', e.target.value)} className="mt-0.5 h-8 w-full p-0.5 border border-gray-600 rounded-md bg-gray-700" />
          </div>
        </div>
      )}
      <style jsx global>{`
        .panel-text-input-xs { display: block; width: 100%; padding: 0.375rem 0.5rem; font-size: 0.75rem; background-color: #4B5563; border: 1px solid #6B7280; border-radius: 0.25rem; color:white; }
        .panel-select-xs { display: block; width: 100%; padding: 0.375rem 0.5rem; font-size: 0.75rem; background-color: #4B5563; border: 1px solid #6B7280; border-radius: 0.25rem; color:white; }
      `}</style>
    </div>
  );
};

PageHeroBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  onPanelFileChange: PropTypes.func, // Expects (fieldKey: string, file: File)
  getDisplayUrl: PropTypes.func,
};

export default PageHeroBlock;
