// src/components/blocks/ShingleSelectorBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

/**
 * ShingleSelectorBlock
 * 
 * config = {
 *   sectionTitle: "Explore Our Shingle Options",
 *   shingleOptions: [
 *     {
 *       id: string,
 *       title: string,
 *       description: string,
 *       benefit: string,
 *       // optionally an array of images, or a single image
 *     },
 *     ...
 *   ]
 * }
 */

// Reusable EditableText Component (Simplified)
const EditableText = ({ value, onChange, tag: Tag = 'p', className = '', placeholder = "Edit", readOnly = false, isTextarea = false, style = {} }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setCurrentValue(value); }, [value]);

  useEffect(() => {
    if (!readOnly && inputRef.current && isTextarea) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentValue, readOnly, isTextarea]);

  const handleChange = (e) => { if (!readOnly) setCurrentValue(e.target.value); };
  const handleBlur = () => { if (!readOnly && value !== currentValue) onChange(currentValue); };
  const handleKeyDown = (e) => {
    if (!readOnly) {
      if (!isTextarea && e.key === 'Enter') { handleBlur(); e.preventDefault(); }
      else if (e.key === 'Escape') { setCurrentValue(value); inputRef.current?.blur(); }
    }
  };

  if (readOnly) {
    const displayValue = value || <span className="text-gray-400/70 italic">({placeholder})</span>;
    return <Tag className={className} style={style}>{displayValue}</Tag>;
  }
  const inputClasses = `bg-transparent border-b border-dashed border-gray-400/60 focus:border-blue-500 focus:ring-0 outline-none w-full ${className}`;
  if (isTextarea) {
    return <textarea ref={inputRef} value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={{...style, resize: 'none'}} rows={2} />;
  }
  return <input ref={inputRef} type="text" value={currentValue || ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className={inputClasses} style={style} />;
};

const ShingleSelectorBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    sectionTitle = "Explore Our Shingle Options",
    shingleOptions = [],
  } = config;

  // Local state for readOnly "selected index"
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleFieldChange = (field, value, itemIndex = null, itemField = null) => {
    if (readOnly || !onConfigChange) return;
    let newConfig = { ...config };
    if (itemIndex !== null && itemField !== null) {
      const newOptions = [...(newConfig.shingleOptions || [])];
      if (newOptions[itemIndex]) {
        newOptions[itemIndex] = { ...newOptions[itemIndex], [itemField]: value };
        newConfig.shingleOptions = newOptions;
      }
    } else {
      newConfig[field] = value;
    }
    onConfigChange(newConfig);
  };

  const current = shingleOptions[selectedIndex] || {};

  return (
    <section className={`my-4 px-4 sm:px-8 md:px-12 lg:px-16 ${!readOnly ? 'bg-slate-50 border-2 border-blue-300/50 py-4' : 'bg-white'}`}>
      <EditableText 
        tag="h2"
        value={sectionTitle}
        onChange={(newVal) => handleFieldChange("sectionTitle", newVal)}
        readOnly={readOnly}
        className="text-2xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 pb-2 mb-4"
        placeholder="Section Title"
      />

      {/* Buttons */} 
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {shingleOptions.map((option, idx) => (
          <button
            key={option.id || idx} 
            onClick={() => setSelectedIndex(idx)}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full font-semibold shadow-lg transition-all duration-300 ${
              selectedIndex === idx
                ? "dark_button text-white font-semibold shadow-xl ring-2 ring-offset-1 ring-blue-500/70"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <EditableText 
              tag="span"
              value={option.title}
              onChange={(newVal) => handleFieldChange("shingleOptions", newVal, idx, "title")}
              readOnly={readOnly}
              className={`font-semibold ${selectedIndex === idx ? 'text-white' : 'text-gray-700'}`}
              inputClassName={`font-semibold ${selectedIndex === idx ? 'text-white bg-blue-600/80' : 'text-gray-700 bg-gray-200/80'} w-auto`}
              placeholder="Option Title"
            />
          </button>
        ))}
      </div>

      {/* Detail panel */} 
      {shingleOptions.length > 0 && (
        <motion.div
          key={current.id || selectedIndex}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8 mt-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EditableText 
            tag="h3"
            value={current.title}
            onChange={(newVal) => handleFieldChange("shingleOptions", newVal, selectedIndex, "title")}
            readOnly={readOnly}
            className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4"
            placeholder="Option Title"
          />
          <EditableText 
            tag="p"
            value={current.description}
            onChange={(newVal) => handleFieldChange("shingleOptions", newVal, selectedIndex, "description")}
            readOnly={readOnly}
            isTextarea
            className="text-sm sm:text-base text-gray-600 leading-relaxed"
            inputClassName="text-sm sm:text-base text-gray-600 leading-relaxed h-24 w-full resize-none"
            placeholder="Option description..."
            rows={3}
          />
          <EditableText 
            tag="p"
            value={current.benefit}
            onChange={(newVal) => handleFieldChange("shingleOptions", newVal, selectedIndex, "benefit")}
            readOnly={readOnly}
            className="text-sm sm:text-base mt-3 text-blue-600 font-semibold"
            inputClassName="text-sm sm:text-base text-blue-600 font-semibold w-full"
            placeholder="Option benefit..."
          />
        </motion.div>
      )}
      {shingleOptions.length === 0 && !readOnly && (
        <div className="text-center text-gray-500 py-6">
          <p>No shingle options defined. Add options using the editor panel.</p>
        </div>
      )}
    </section>
  );
};

ShingleSelectorBlock.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
    shingleOptions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      benefit: PropTypes.string,
    }))
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

ShingleSelectorBlock.tabsConfig = (currentConfig, onPanelChange) => {
  const { shingleOptions = [] } = currentConfig;

  const handleAddItem = () => {
    const newItem = {
      id: `shingle_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      title: "New Shingle Type",
      description: "Description for this shingle type.",
      benefit: "Key benefit of this shingle.",
    };
    onPanelChange({ ...currentConfig, shingleOptions: [...shingleOptions, newItem] });
  };

  const handleRemoveItem = (indexToRemove) => {
    const newOptions = shingleOptions.filter((_, i) => i !== indexToRemove);
    onPanelChange({ ...currentConfig, shingleOptions: newOptions });
  };

  // Note: Item text (title, description, benefit) is editable inline in the preview.
  // The panel's general tab will focus on adding/removing options.
  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Section Title (Also editable inline):</label>
          <input 
            type="text" 
            value={currentConfig.sectionTitle || ''} 
            onChange={(e) => onPanelChange({ ...currentConfig, sectionTitle: e.target.value })} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter section title"
          />
        </div>
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Manage Shingle Options:</h4>
          <p className="text-xs text-gray-500 mb-3">Option titles, descriptions, and benefits are editable directly on the block preview by clicking the text.</p>
          {(shingleOptions || []).map((option, idx) => (
            <div key={option.id || idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2 shadow-sm">
              <span className="text-sm text-gray-600 truncate w-3/4" title={option.title}>{idx + 1}. {option.title || '(Untitled Option)'}</span>
              <button 
                onClick={() => handleRemoveItem(idx)} 
                className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full"
                title="Remove Option"
              >
                ✕ Remove
              </button>
            </div>
          ))}
          <button 
            onClick={handleAddItem} 
            className="mt-3 w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid"
          >
            + Add Shingle Option
          </button>
        </div>
      </div>
    ),
    // No specific images, colors, or styling tabs for this block currently.
  };
};

export default ShingleSelectorBlock;
