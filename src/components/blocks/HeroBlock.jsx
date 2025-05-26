// src/components/blocks/HeroBlock.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IconSelectorModal from '../common/IconSelectorModal';
import * as LucideIcons from 'lucide-react';

/**
 * HeroBlock
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

// Helper to render dynamic icons (can be moved to a shared util if used more widely)
const renderDynamicIcon = (pack, iconName, fallback = null, props = {}) => {
    const IconsSet = pack === 'lucide' ? LucideIcons : {}; // Add other packs if needed
    const IconComponent = IconsSet[iconName];
    return IconComponent ? <IconComponent {...props} /> : fallback;
};

const HeroBlock = ({ config = {}, readOnly = false, onConfigChange }) => {
  // Update destructuring to handle empty strings
  const {
    backgroundImage:
      rawBackgroundImage = "/assets/images/growth/hero_growth.jpg",
    title = "Siding Options",
    shrinkAfterMs = 1000,
    initialHeight = "40vh",
    finalHeight = "20vh",
  } = config;

  // Only use default if backgroundImage is empty string, null, or undefined
  const backgroundImage =
    rawBackgroundImage && rawBackgroundImage.trim() !== ""
      ? rawBackgroundImage
      : "/assets/images/growth/hero_growth.jpg";

  // For the "shrinking" effect
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    if (readOnly) {
      // Start the timer to shrink the hero if in readOnly "live" mode
      const timer = setTimeout(() => {
        setIsShrunk(true);
      }, shrinkAfterMs);
      return () => clearTimeout(timer);
    }
  }, [readOnly, shrinkAfterMs]);

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  // Get the actual background image URL to display
  const displayBackgroundImage = getDisplayUrl(backgroundImage);

  // RENDER: READONLY => replicate the snippet
  if (readOnly) {
    return (
      <div 
        className="relative w-full flex items-center justify-center text-center bg-cover bg-center p-8"
        style={{
          backgroundImage: `url('${displayBackgroundImage}')`,
          backgroundSize: "120%", // Expanded image size
          backgroundPosition: isShrunk ? "center right" : "center left",
          minHeight: isShrunk ? finalHeight : initialHeight,
        }}
      >
        {displayBackgroundImage && (
          <div 
            className="absolute inset-0 z-0"
            style={{ backgroundColor: `rgba(0,0,0,0.3)` }}
          ></div>
        )}
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 break-words" style={{color: 'inherit'}}>{title}</h1>
        </div>
      </div>
    );
  }

  // RENDER: EDIT MODE => simple form
  const handleFieldChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  const handleImageUpload = (field, file) => {
    if (!file) return;

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    handleFieldChange(field, fileURL);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">Hero Block Editor</h3>

      {/* Title */}
      <label className="block text-sm mb-2">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>

      {/* Background Image */}
      <label className="block text-sm mb-2">
        Background Image:
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload("backgroundImage", file);
            }
          }}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>
      {displayBackgroundImage && (
        <img
          src={displayBackgroundImage}
          alt="Background Preview"
          className="mt-1 h-24 object-cover rounded w-full"
        />
      )}

      {/* Animation Settings */}
      <div className="mt-4 border-t border-gray-600 pt-2">
        <h4 className="font-semibold mb-2">Animation Settings</h4>

        <label className="block text-sm mb-2">
          Initial Height:
          <input
            type="text"
            value={initialHeight}
            onChange={(e) => handleFieldChange("initialHeight", e.target.value)}
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>

        <label className="block text-sm mb-2">
          Final Height:
          <input
            type="text"
            value={finalHeight}
            onChange={(e) => handleFieldChange("finalHeight", e.target.value)}
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>

        <label className="block text-sm mb-2">
          Shrink After (ms):
          <input
            type="number"
            value={shrinkAfterMs}
            onChange={(e) =>
              handleFieldChange("shrinkAfterMs", parseInt(e.target.value))
            }
            className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
          />
        </label>
      </div>
    </div>
  );
};

HeroBlock.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    backgroundImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    buttonBgColor: PropTypes.string,
    buttonTextColor: PropTypes.string,
    buttonIconPack: PropTypes.string,
    buttonIconName: PropTypes.string,
    buttonIconColor: PropTypes.string,
    overlayOpacity: PropTypes.number,
    minHeight: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func,
  onFileChange: PropTypes.func,
};

HeroBlock.EditorPanel = function HeroBlockEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl: getDisplayUrlFromProp }) {
  const [formData, setFormData] = useState(currentConfig || {});
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  useEffect(() => { setFormData(currentConfig || {}); }, [currentConfig]);

  const handleChange = (field, value) => {
    let parsedValue = value;
    if (field === 'overlayOpacity') parsedValue = parseFloat(value) || 0;
    const newFormData = { ...formData, [field]: parsedValue };
    setFormData(newFormData);
    onPanelConfigChange(newFormData);
  };

  const handleImageFileChange = (file) => {
    if (file && onPanelFileChange) {
      onPanelFileChange('backgroundImage', file);
    }
  };

  const handleIconSelect = (pack, iconName) => {
    handleChange('buttonIconPack', pack);
    handleChange('buttonIconName', iconName);
    setIsIconModalOpen(false);
  };

  const bgImageUrl = getDisplayUrlFromProp ? getDisplayUrlFromProp(formData.backgroundImage) : '';

  return (
    <div className="space-y-4 p-2 bg-gray-50 rounded-md shadow">
      <h4 className="h4-style">Content (Panel Edit)</h4>
      <div><label className="input-label">Title:</label><input type="text" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="input-text-class" /></div>
      <div><label className="input-label">Subtitle:</label><textarea value={formData.subtitle || ''} onChange={(e) => handleChange('subtitle', e.target.value)} rows={2} className="input-textarea-class" /></div>
      
      <h4 className="h4-style">Call to Action Button</h4>
      <div><label className="input-label">Button Text:</label><input type="text" value={formData.buttonText || ''} onChange={(e) => handleChange('buttonText', e.target.value)} className="input-text-class" /></div>
      <div><label className="input-label">Button Link URL:</label><input type="text" value={formData.buttonLink || ''} onChange={(e) => handleChange('buttonLink', e.target.value)} className="input-text-class" placeholder="e.g., /contact" /></div>
      <div className="flex items-center space-x-2">
        <label className="input-label">Button Icon:</label>
        <button type="button" onClick={() => setIsIconModalOpen(true)} className="btn-secondary-sm">
          {formData.buttonIconName ? `Change (${formData.buttonIconPack} - ${formData.buttonIconName})` : 'Select Icon'}
        </button>
        {formData.buttonIconName && (
          <button type="button" onClick={() => { handleChange('buttonIconName', null); handleChange('buttonIconPack', null);}} className="btn-danger-xs">Remove</button>
        )}
      </div>

      <h4 className="h4-style">Appearance & Background</h4>
      <div>
        <label className="input-label">Background Image:</label>
        <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e.target.files[0])} className="input-file-class" />
        {bgImageUrl && <img src={bgImageUrl} alt="BG Preview" className="img-preview-sm mt-2" />}
        <input type="text" placeholder="Or paste BG Image URL" value={typeof formData.backgroundImage === 'string' ? formData.backgroundImage : (formData.backgroundImage?.originalUrl || formData.backgroundImage?.url || '')} onChange={(e) => handleChange('backgroundImage', e.target.value)} className="input-text-class mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="input-label-sm">Overlay Opacity (0-1):</label><input type="number" min="0" max="1" step="0.05" value={formData.overlayOpacity || 0} onChange={(e) => handleChange('overlayOpacity', e.target.value)} className="input-text-xs" /></div>
        <div><label className="input-label-sm">Min Height (e.g., 60vh):</label><input type="text" value={formData.minHeight || '60vh'} onChange={(e) => handleChange('minHeight', e.target.value)} className="input-text-xs" /></div>
      </div>

      <h4 className="h4-style">Color Scheme</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div><label>BG (No Image):</label><input type="color" value={formData.backgroundColor || ''} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-xs" /></div>
        <div><label>Text Color:</label><input type="color" value={formData.textColor || ''} onChange={(e) => handleChange('textColor', e.target.value)} className="input-color-xs" /></div>
        <div><label>Button BG:</label><input type="color" value={formData.buttonBgColor || ''} onChange={(e) => handleChange('buttonBgColor', e.target.value)} className="input-color-xs" /></div>
        <div><label>Button Text:</label><input type="color" value={formData.buttonTextColor || ''} onChange={(e) => handleChange('buttonTextColor', e.target.value)} className="input-color-xs" /></div>
        <div><label>Button Icon:</label><input type="color" value={formData.buttonIconColor || ''} onChange={(e) => handleChange('buttonIconColor', e.target.value)} className="input-color-xs" /></div>
      </div>

      {isIconModalOpen && (
        <IconSelectorModal 
          isOpen={isIconModalOpen} 
          onClose={() => setIsIconModalOpen(false)} 
          onIconSelect={handleIconSelect} 
          currentIconPack={formData.buttonIconPack || 'lucide'} 
          currentIconName={formData.buttonIconName}
        />
      )}
      <style jsx>{`
        .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #4A5568; margin-bottom: 0.25rem; }
        .input-label-sm { font-size: 0.75rem; font-weight: 500; color: #4A5568; }
        .input-text-class, .input-textarea-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; margin-top: 0.25rem; }
        .input-text-xs {display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; margin-top: 0.25rem;}
        .input-textarea-class { resize: vertical; min-height: 60px; }
        .input-file-class { display: block; width: 100%; font-size: 0.875rem; margin-top: 0.25rem; }
        .img-preview-sm { max-height: 4rem; border-radius: 0.25rem; border: 1px solid #E5E7EB; margin-top: 0.25rem; }
        .input-color-xs { margin-top: 0.1rem; height: 1.5rem; width: 100%; padding: 0.1rem; border: 1px solid #D1D5DB; border-radius: 0.25rem; }
        .h4-style { font-size: 1.1rem; font-weight: 600; color: #374151; padding-top: 0.75rem; border-top: 1px solid #E5E7EB; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .btn-secondary-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; background-color: #6B7280; color: white; border-radius: 0.375rem; font-weight: 500; }
        .btn-danger-xs { font-size: 0.75rem; color: #EF4444; padding: 0.25rem 0.5rem; border: 1px solid #FCA5A5; border-radius: 0.25rem; }
      `}</style>
    </div>
  );
};

HeroBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  onPanelFileChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
};

export default HeroBlock;
