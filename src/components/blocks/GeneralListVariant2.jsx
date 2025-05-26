// src/components/blocks/GeneralListVariant2.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

/**
 * GeneralListVariant2
 *
 * This block is for a "selection row" of items
 * plus a detailed panel for the selected item (image, description, etc.).
 *
 * config = {
 *   title: "Explore Our Single-Ply Membranes",
 *   items: [
 *     {
 *       id: number,
 *       name: string,
 *       description: string,
 *       base?: string,
 *       features?: string[],       // or one big string with line breaks
 *       uses?: string,
 *       limitations?: string,
 *       imageUrl?: string,
 *     },
 *     ...
 *   ]
 * }
 */
const GeneralListVariant2 = ({
  config = {},
  readOnly = false,
  onConfigChange,
  getDisplayUrl,
  onFileChange,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      title: 'Our Features',
      items: [],
      backgroundColor: '#FFFFFF',
      textColor: '#1A202C',         // Default dark gray text
      itemTitleColor: '#2D3748',    // Slightly lighter for item titles
      itemTextColor: '#4A5568',     // Even lighter for item descriptions
      imageBorderColor: '#CBD5E0', // For edit mode image placeholder
    };
    return { ...defaultConfig, ...(config || {}) };
  });

  const titleRef = useRef(null);
  const itemTextareaRefs = useRef({}); // For item name and description

  useEffect(() => {
    const defaultConfig = {
      title: 'Our Features', items: [], backgroundColor: '#FFFFFF', textColor: '#1A202C',
      itemTitleColor: '#2D3748', itemTextColor: '#4A5568', imageBorderColor: '#CBD5E0'
    };
    const newEffectiveConfig = { ...defaultConfig, ...(config || {}) };
    if (readOnly || JSON.stringify(newEffectiveConfig) !== JSON.stringify(localConfig)) {
      setLocalConfig(newEffectiveConfig);
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (!readOnly) {
      if (titleRef.current) {
        titleRef.current.style.height = 'auto';
        titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
      }
      (localConfig.items || []).forEach((_, index) => {
        if (itemTextareaRefs.current[index]) {
          Object.values(itemTextareaRefs.current[index]).forEach(ref => {
            if (ref && ref.current) {
              ref.current.style.height = 'auto';
              ref.current.style.height = `${ref.current.scrollHeight}px`;
            }
          });
        }
      });
    }
  }, [localConfig.title, localConfig.items, readOnly]);

  const handleInputChange = (field, value, itemIndex = null, subField = null) => {
    setLocalConfig(prev => {
      let updatedConfig;
      if (itemIndex !== null && subField) {
        const updatedItems = prev.items.map((item, i) => {
          if (i === itemIndex) {
            if (subField === 'features') { // Assuming features is an array of strings
              const updatedFeatures = item.features.map((feat, fIndex) => fIndex === value.index ? value.text : feat);
              return { ...item, features: updatedFeatures };
            }
            return { ...item, [subField]: value };
          }
          return item;
        });
        updatedConfig = { ...prev, items: updatedItems };
      } else {
        updatedConfig = { ...prev, [field]: value };
      }
      if (!readOnly) onConfigChange(updatedConfig);
      return updatedConfig;
    });
  };

  const handleBlur = () => {
    if (!readOnly) onConfigChange(localConfig);
  };

  const getItemRef = (itemIndex, field) => (el) => {
    if (!itemTextareaRefs.current[itemIndex]) {
      itemTextareaRefs.current[itemIndex] = {};
    }
    itemTextareaRefs.current[itemIndex][field] = { current: el }; 
  };

  const { title, items, backgroundColor, textColor, itemTitleColor, itemTextColor, imageBorderColor } = localConfig;

  // Local state for readOnly selection
  const [selectedIndex, setSelectedIndex] = useState(0);

  // For a simple fade/slide in
  const infoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // READ ONLY RENDER
  if (readOnly) {
    const current = items[selectedIndex] || {};

    return (
      <section className="py-12 md:py-16" style={{ backgroundColor: backgroundColor, color: textColor }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12" style={{ color: 'inherit' }}>
            {title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(items || []).map((item, index) => (
              <div key={item.id || index} className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ backgroundColor: localConfig.itemCardBackgroundColor || 'white'}}>
                {item.imageUrl && (
                  <div className="flex-shrink-0 h-56 w-full overflow-hidden">
                    <img 
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      src={getDisplayUrl ? getDisplayUrl(item.imageUrl) : item.imageUrl}
                      alt={item.name || 'Feature image'}
                      style={{ borderBottom: !readOnly ? `2px dashed ${imageBorderColor}` : ''}}
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: itemTitleColor }}>{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 flex-grow" style={{ color: itemTextColor }}>{item.description}</p>
                  )}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      {item.features?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-1">
                            Features:
                          </h4>
                          <ul className="space-y-0">
                            {item.features.map((feat, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <FaCheckCircle className="text-green-600 mt-1" />
                                <span className="text-gray-700">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.uses && (
                        <p className="text-xs text-gray-500 italic" style={{ color: itemTextColor }}>
                          <strong>Uses:</strong> {item.uses}
                        </p>
                      )}
                      {item.limitations && (
                        <p className="text-xs text-gray-500 italic mt-1" style={{ color: itemTextColor }}>
                          <strong>Limitations:</strong> {item.limitations}
                        </p>
                      )}
                    </div>

                    {item.imageUrl && (
                      <div className="flex-1 flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="max-w-full h-auto object-cover rounded-lg shadow-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // EDIT MODE
  const handleChange = (field, value) => {
    onConfigChange?.({ ...localConfig, [field]: value });
  };

  const updateItemField = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    handleChange("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        id: Date.now(),
        name: "New Option",
        description: "",
        features: [],
        uses: "",
        limitations: "",
        imageUrl: "",
      },
    ];
    handleChange("items", newItems);
  };

  const removeItem = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    handleChange("items", newItems);
  };

  // Return edit form
  return (
    <div className="space-y-6 p-3 bg-gray-50 rounded-md shadow">
      <input
        type="text"
        value={title}
        onChange={(e) => handleChange('title', e.target.value)}
        onBlur={handleBlur}
        className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full resize-none"
        rows={1}
        placeholder="Section Title"
        style={{ color: 'inherit' }}
      />

      <h4 className="text-lg font-semibold text-gray-700 pt-3 border-t mt-5">Color Scheme</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium">Overall BG:</label><input type="color" value={backgroundColor} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="mt-1 h-8 w-full input-color-class" /></div>
        <div><label className="block text-sm font-medium">Overall Text:</label><input type="color" value={textColor} onChange={(e) => handleChange('textColor', e.target.value)} className="mt-1 h-8 w-full input-color-class" /></div>
        <div><label className="block text-sm font-medium">Item Card BG:</label><input type="color" value={localConfig.itemCardBackgroundColor || '#FFFFFF'} onChange={(e) => handleChange('itemCardBackgroundColor', e.target.value)} className="mt-1 h-8 w-full input-color-class" /></div>
        <div><label className="block text-sm font-medium">Item Title Text:</label><input type="color" value={itemTitleColor} onChange={(e) => handleChange('itemTitleColor', e.target.value)} className="mt-1 h-8 w-full input-color-class" /></div>
        <div><label className="block text-sm font-medium">Item Body Text:</label><input type="color" value={itemTextColor} onChange={(e) => handleChange('itemTextColor', e.target.value)} className="mt-1 h-8 w-full input-color-class" /></div>
        <div><label className="block text-sm font-medium">Image Border (Edit):</label><input type="color" value={imageBorderColor} onChange={(e) => handleChange('imageBorderColor', e.target.value)} className="mt-1 h-8 w-full input-color-class" /></div>
      </div>

      <h4 className="text-lg font-semibold text-gray-700 pt-3 border-t mt-5">Manage Items</h4>
      {(items || []).map((item, itemIndex) => (
        <div key={item.id || itemIndex} className="space-y-3 p-3 border border-gray-200 rounded-md bg-white">
          <div className="flex justify-between items-center">
            <h5 className="text-md font-semibold text-gray-600">Item {itemIndex + 1}: {item.name || 'Unnamed'}</h5>
            <button onClick={() => removeItem(itemIndex)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove</button>
          </div>
          <div><label className="text-xs font-medium">Name:</label><input type="text" value={item.name || ''} onChange={(e) => updateItemField(itemIndex, 'name', e.target.value)} className="mt-0.5 input-xs-class" /></div>
          <div><label className="text-xs font-medium">Description:</label><textarea value={item.description || ''} onChange={(e) => updateItemField(itemIndex, 'description', e.target.value)} rows={2} className="mt-0.5 input-xs-class resize-none" /></div>
          <div>
            <label className="text-xs font-medium">Features:</label>
            {(item.features || []).map((feat, fIdx) => (
              <div key={fIdx} className="flex items-center space-x-1 mt-1">
                <input type="text" value={feat} onChange={(e) => {
                  const updatedFeatures = [...item.features];
                  updatedFeatures[fIdx] = e.target.value;
                  updateItemField(itemIndex, 'features', updatedFeatures);
                }} className="flex-grow input-xs-class" />
                <button onClick={() => {
                  const updatedFeatures = [...item.features];
                  updatedFeatures.splice(fIdx, 1);
                  updateItemField(itemIndex, 'features', updatedFeatures);
                }} className="text-2xs text-red-400">&times;</button>
              </div>
            ))}
            <button onClick={() => {
              const updatedFeatures = [...(item.features || []), 'New Feature'];
              updateItemField(itemIndex, 'features', updatedFeatures);
            }} className="mt-1 text-xs text-blue-500">+ Add Feature</button>
          </div>
          <div><label className="text-xs font-medium">Uses:</label><input type="text" value={item.uses || ''} onChange={(e) => updateItemField(itemIndex, 'uses', e.target.value)} className="mt-0.5 input-xs-class" /></div>
          <div><label className="text-xs font-medium">Limitations:</label><input type="text" value={item.limitations || ''} onChange={(e) => updateItemField(itemIndex, 'limitations', e.target.value)} className="mt-0.5 input-xs-class" /></div>
          <div>
            <label className="text-xs font-medium">Image:</label>
            <input type="file" accept="image/*" onChange={(e) => {
              if (onFileChange) {
                onFileChange({ blockItemIndex: itemIndex, field: 'imageUrl' }, e.target.files[0]);
              }
            }} className="mt-0.5 block w-full text-xs file-input-xs-class" />
            {(getDisplayUrl && getDisplayUrl(item.imageUrl)) && <img src={getDisplayUrl(item.imageUrl)} alt="Preview" className="mt-1 h-16 w-16 object-cover rounded" />}
            <input type="text" placeholder="Or paste URL" value={typeof item.imageUrl === 'string' ? item.imageUrl : (item.imageUrl?.originalUrl || item.imageUrl?.url || '')} onChange={(e) => updateItemField(itemIndex, 'imageUrl', e.target.value)} className="mt-1 input-xs-class" />
          </div>
        </div>
      ))}
      <button onClick={addItem} className="mt-4 btn-primary-sm">+ Add Item</button>
      <style jsx>{`
        .input-class { padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; width: 100%; }
        .input-color-class { padding: 0.125rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
        .input-xs-class { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; }
        .file-input-xs-class { /* Tailwindify these for consistency */ }
        .btn-primary-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; background-color: #4F46E5; color: white; border-radius: 0.375rem; font-weight: 500; }
      `}</style>
    </div>
  );
};

GeneralListVariant2.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      description: PropTypes.string,
      features: PropTypes.arrayOf(PropTypes.string),
      uses: PropTypes.string,
      limitations: PropTypes.string,
      imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    })),
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,       // Main title text color
    itemTitleColor: PropTypes.string,  // Item card title color
    itemTextColor: PropTypes.string,   // Item card description/features text color
    imageBorderColor: PropTypes.string, // For edit mode placeholder
    itemCardBackgroundColor: PropTypes.string, // Background for each item card
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func,
  onFileChange: PropTypes.func, 
};

export default GeneralListVariant2;
