// src/components/blocks/ImageWrapBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * ImageWrapBlock
 * 
 * config = {
 *   imageUrl: string,
 *   altText: string,
 *   paragraph: string,
 *   floatSide: "left" | "right",
 *   maxWidthPx: number
 * }
 */
const ImageWrapBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
  getDisplayUrl,
  onFileChange,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      imageUrl: "", // Can be string URL or file object
      altText: "Descriptive image text",
      floatSide: "left", // 'left' or 'right'
      maxWidthPx: 300,   // Max width of the image in pixels
      paragraph: "This is a sample paragraph where text will wrap around the image. You can edit this content directly when in edit mode. The image can be floated to the left or right, and its maximum width can be adjusted.",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      imageBorderColor: "#E2E8F0",
    };
    const initialImage = config?.imageUrl ? (getDisplayUrl ? getDisplayUrl(config.imageUrl) : config.imageUrl) : defaultConfig.imageUrl;
    return { ...defaultConfig, ...config, imageUrl: initialImage };
  });

  const paragraphRef = useRef(null);

  useEffect(() => {
    if (readOnly) {
      const currentImage = config?.imageUrl ? (getDisplayUrl ? getDisplayUrl(config.imageUrl) : config.imageUrl) : localConfig.imageUrl;
      setLocalConfig(prev => ({ ...prev, ...config, imageUrl: currentImage }));
    } else {
      if (config?.imageUrl && typeof config.imageUrl === "object" && config.imageUrl.file) {
        setLocalConfig(prev => ({ ...prev, ...config }));
      }
    }
  }, [config, readOnly, getDisplayUrl]);

  useEffect(() => {
    if (!readOnly && paragraphRef.current) {
      paragraphRef.current.style.height = 'auto';
      paragraphRef.current.style.height = `${paragraphRef.current.scrollHeight}px`;
    }
  }, [localConfig.paragraph, readOnly]);

  useEffect(() => {
    if (readOnly && typeof onConfigChange === "function") {
      if (JSON.stringify(localConfig) !== JSON.stringify(config)) {
        onConfigChange(localConfig);
      }
    }
  }, [readOnly, localConfig, onConfigChange, config]);

  const handleInputChange = (field, value) => {
    if (!readOnly) {
      setLocalConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBlur = () => {
    if (!readOnly) onConfigChange(localConfig);
  };

  const handleImageFileChange = (file) => {
    if (!readOnly && file) {
      const newImageState = {
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        originalUrl: localConfig.imageUrl?.originalUrl || (typeof localConfig.imageUrl === "string" ? localConfig.imageUrl : "")
      };
      setLocalConfig(prev => ({ ...prev, imageUrl: newImageState }));
    }
  };

  const {
    imageUrl, altText, floatSide, maxWidthPx, paragraph,
    backgroundColor, textColor, imageBorderColor
  } = localConfig;

  const imageDisplayUrl = getDisplayUrl ? getDisplayUrl(imageUrl) : "";

  const containerClasses = "clearfix py-8 px-4"; // Clearfix for float
  const imageContainerClasses = `mb-4 md:mb-0 ${floatSide === 'left' ? 'md:mr-6 float-left' : 'md:ml-6 float-right'}`;

  return (
    <div className={containerClasses} style={{ backgroundColor, color: textColor }}>
      <div className="max-w-4xl mx-auto">
        {imageDisplayUrl && (
          <div className={imageContainerClasses} style={{ maxWidth: `${maxWidthPx}px` }}>
            <img 
              src={imageDisplayUrl} 
              alt={altText || 'Wrapped image'} 
              className="w-full h-auto rounded-lg shadow-md object-cover"
              style={{ border: !readOnly ? `2px dashed ${imageBorderColor}` : 'none' }}
            />
          </div>
        )}
        {readOnly ? (
          <p className="text-base leading-relaxed whitespace-pre-line">{paragraph}</p>
        ) : (
          <textarea
            ref={paragraphRef}
            value={paragraph}
            onChange={(e) => handleInputChange('paragraph', e.target.value)}
            onBlur={handleBlur}
            className="text-base leading-relaxed bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-2 w-full resize-y min-h-[100px] whitespace-pre-line"
            placeholder="Enter paragraph text here..."
            style={{ color: 'inherit' }}
          />
        )}
      </div>
    </div>
  );
};

ImageWrapBlock.propTypes = {
  config: PropTypes.shape({
    imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    altText: PropTypes.string,
    floatSide: PropTypes.oneOf(['left', 'right']),
    maxWidthPx: PropTypes.number,
    paragraph: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    imageBorderColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func,
  onFileChange: PropTypes.func,
};

ImageWrapBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) => {
  const [formData, setFormData] = useState(currentConfig || {});

  useEffect(() => {
    setFormData(currentConfig || {});
  }, [currentConfig]);

  const handleChange = (field, value) => {
    let parsedValue = value;
    if (field === 'maxWidthPx') {
      parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue) || parsedValue <= 0) parsedValue = 300; // Default/min if invalid
    }
    const newFormData = { ...formData, [field]: parsedValue };
    setFormData(newFormData);
    onPanelConfigChange(newFormData);
  };

  const handleImageFileChange = (file) => {
    if (file && onPanelFileChange) {
      onPanelFileChange('imageUrl', file); // Pass field name and file to parent
    }
  };

  const imageDisplayUrl = getDisplayUrl ? getDisplayUrl(formData.imageUrl) : '';

  return (
    <div className="space-y-4 p-2 bg-gray-50 rounded-md shadow">
      <div>
        <label className="input-label">Paragraph Text (Panel Edit):</label>
        <textarea value={formData.paragraph || ''} onChange={(e) => handleChange('paragraph', e.target.value)} rows={5} className="input-textarea-class" />
      </div>

      <h4 className="h4-style">Image Settings</h4>
      <div>
        <label className="input-label">Image File:</label>
        <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e.target.files[0])} className="input-file-class" />
        {imageDisplayUrl && <img src={imageDisplayUrl} alt="Preview" className="img-preview-sm mt-2" />}
        <label className="input-label mt-2">Or Image URL:</label>
        <input type="text" placeholder="Paste image URL" value={typeof formData.imageUrl === 'string' ? formData.imageUrl : (formData.imageUrl?.originalUrl || formData.imageUrl?.url || '')} onChange={(e) => handleChange('imageUrl', e.target.value)} className="input-text-class" />
      </div>
      <div><label className="input-label">Alt Text:</label><input type="text" value={formData.altText || ''} onChange={(e) => handleChange('altText', e.target.value)} className="input-text-class" /></div>
      <div>
        <label className="input-label">Image Float Side:</label>
        <select value={formData.floatSide || 'left'} onChange={(e) => handleChange('floatSide', e.target.value)} className="input-select-class">
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div><label className="input-label">Image Max Width (px):</label><input type="number" value={formData.maxWidthPx || 300} onChange={(e) => handleChange('maxWidthPx', e.target.value)} className="input-text-class" /></div>

      <h4 className="h4-style">Color Scheme</h4>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="input-label-sm">Background:</label><input type="color" value={formData.backgroundColor || '#FFFFFF'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Text Color:</label><input type="color" value={formData.textColor || '#333333'} onChange={(e) => handleChange('textColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Image Border (Edit):</label><input type="color" value={formData.imageBorderColor || '#E2E8F0'} onChange={(e) => handleChange('imageBorderColor', e.target.value)} className="input-color-sm" /></div>
      </div>
      <style jsx>{`
        .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #4A5568; margin-bottom: 0.25rem; }
        .input-label-sm { font-size: 0.8rem; font-weight: 500; color: #4A5568; }
        .input-text-class, .input-textarea-class, .input-select-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; margin-top: 0.25rem; }
        .input-textarea-class { resize: vertical; min-height: 80px; }
        .input-file-class { display: block; width: 100%; font-size: 0.875rem; margin-top: 0.25rem; }
        .img-preview-sm { max-height: 4rem; border-radius: 0.25rem; border: 1px solid #E5E7EB; }
        .input-color-sm { margin-top: 0.25rem; height: 1.75rem; width: 100%; padding: 0.1rem; border: 1px solid #D1D5DB; border-radius: 0.25rem; }
        .h4-style { font-size: 1.1rem; font-weight: 600; color: #374151; padding-top: 0.75rem; border-top: 1px solid #E5E7EB; margin-top: 1.25rem; margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
};

ImageWrapBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  onPanelFileChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
};

export default ImageWrapBlock;
