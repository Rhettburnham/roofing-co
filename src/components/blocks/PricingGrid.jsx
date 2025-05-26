// src/components/blocks/PricingGrid.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Simple Check Icon component (can be moved to a shared utils if used elsewhere)
const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

/**
 * PricingGrid
 * 
 * config = {
 *   showPrice: true,
 *   items: [
 *     {
 *       title: string,
 *       image: string,
 *       alt: string,
 *       description: string,
 *       rate: string
 *     },
 *     ...
 *   ]
 * }
 */
const PricingGrid = ({
  config = {},
  readOnly = false,
  onConfigChange,
  getDisplayUrl,
  onFileChange,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      title: 'Our Pricing Plans',
      items: [
        { id: 1, title: 'Basic Plan', image: '', alt: 'Basic plan image', description: 'Essential features for starters.', rate: '$19/mo', features: ['Feature 1', 'Feature 2'], buttonText: 'Choose Plan', buttonLink: '#basic' },
      ],
      showPrice: true,
      backgroundColor: '#FFFFFF',
      titleColor: '#1A202C',
      itemBackgroundColor: '#F7FAFC',
      itemTitleColor: '#2D3748',
      itemDescriptionColor: '#4A5568',
      itemRateColor: '#2C5282', // Blue for rate
      itemFeatureTextColor: '#718096',
      buttonBgColor: '#3182CE',
      buttonTextColor: '#FFFFFF',
      imageBorderColor: '#E2E8F0',
    };
    return { ...defaultConfig, ...(config || {}) };
  });

  const titleRef = useRef(null);
  const itemRefs = useRef({}); // For item title, desc, rate, features

  useEffect(() => {
    const defaultConfig = { title: 'Pricing', items: [], showPrice: true, backgroundColor: '#fff', titleColor: '#000', /*...other colors*/ };
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
        if (itemRefs.current[index]) {
          Object.values(itemRefs.current[index]).forEach(fieldGroup => {
            if (fieldGroup && typeof fieldGroup === 'object') { // Check if it's the object holding refs
              Object.values(fieldGroup).forEach(ref => {
                if (ref && ref.current) {
                  ref.current.style.height = 'auto';
                  ref.current.style.height = `${ref.current.scrollHeight}px`;
                }
              });
            }
          });
        }
      });
    }
  }, [localConfig.title, localConfig.items, readOnly]);

  const handleInputChange = (field, value, itemIndex = null, subField = null, featureIndex = null) => {
    setLocalConfig(prev => {
      let updatedConfig;
      if (itemIndex !== null) {
        const updatedItems = prev.items.map((item, i) => {
          if (i === itemIndex) {
            if (subField === 'features' && featureIndex !== null) {
              const updatedFeatures = (item.features || []).map((feat, fIdx) => 
                fIdx === featureIndex ? value : feat
              );
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
    if (!itemRefs.current[itemIndex]) itemRefs.current[itemIndex] = {};
    itemRefs.current[itemIndex][field] = { current: el }; 
  };

  const { 
    title, items, showPrice, backgroundColor, titleColor,
    itemBackgroundColor, itemTitleColor, itemDescriptionColor, itemRateColor,
    itemFeatureTextColor, buttonBgColor, buttonTextColor, imageBorderColor
  } = localConfig;
  
  return (
    <div className="py-12" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {readOnly ? (
          <h2 className="text-3xl font-extrabold text-center mb-10" style={{ color: titleColor }}>{title}</h2>
        ) : (
          <textarea
            ref={titleRef}
            value={title}                        
            onChange={(e) => handleInputChange('title', e.target.value)}
            onBlur={handleBlur}
            className="text-3xl font-extrabold text-center mb-10 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full resize-none"
            rows={1} placeholder="Section Title" style={{ color: titleColor }}
          />
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(items || []).map((item, index) => (
            <div key={item.id || index} className="border border-gray-200 rounded-lg shadow-lg flex flex-col" style={{ backgroundColor: itemBackgroundColor }}>
              {item.image && (
                <img 
                  src={getDisplayUrl ? getDisplayUrl(item.image) : item.image} 
                  alt={item.alt || item.title || 'Plan image'} 
                  className="w-full h-48 object-cover rounded-t-lg"
                  style={{ borderBottom: !readOnly ? `2px dashed ${imageBorderColor}` : '' }}
                />
              )}
              <div className="p-6 flex flex-col flex-grow">
                {readOnly ? (
                  <h3 className="text-2xl font-semibold" style={{ color: itemTitleColor }}>{item.title}</h3>
                ) : (
                  <input type="text" value={item.title || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'title')} onBlur={handleBlur} placeholder="Plan Title" className="text-2xl font-semibold bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full" style={{ color: itemTitleColor }} />
                )}
          {readOnly ? (
                  <p className="mt-2 text-sm flex-grow" style={{ color: itemDescriptionColor }}>{item.description}</p>
                ) : (
                  <textarea ref={getItemRef(index, 'description')} value={item.description || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'description')} onBlur={handleBlur} placeholder="Plan Description" rows={3} className="mt-2 text-sm flex-grow bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full resize-none" style={{ color: itemDescriptionColor }} />
                )}
                {showPrice && item.rate && (
                  readOnly ? (
                    <p className="mt-4 text-3xl font-bold" style={{ color: itemRateColor }}>{item.rate}</p>
                  ) : (
                    <input type="text" value={item.rate || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'rate')} onBlur={handleBlur} placeholder="Price/Rate e.g. $XX/mo" className="mt-4 text-3xl font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full" style={{ color: itemRateColor }} />
                  )
                )}
                <ul className="mt-6 space-y-2 text-sm">
                  {(item.features || []).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      {readOnly ? (
                        <span style={{ color: itemFeatureTextColor }}>{feature}</span>
                      ) : (
                        <input type="text" value={feature} onChange={(e) => handleInputChange(null, e.target.value, index, 'features', fIndex)} onBlur={handleBlur} placeholder={`Feature ${fIndex + 1}`} className="bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-0.5 w-full" style={{ color: itemFeatureTextColor }} />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {item.buttonText && item.buttonLink && (
                    <a href={item.buttonLink} className="block w-full text-center px-6 py-3 rounded-md font-semibold shadow-md hover:opacity-90 transition-colors" style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}>
                      {readOnly ? item.buttonText : <input type="text" value={item.buttonText} onChange={(e) => handleInputChange(null, e.target.value, index, 'buttonText')} onBlur={handleBlur} placeholder="Button Text" className="bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-white/50 rounded p-0.5 w-full" style={{ color: buttonTextColor }}/>}
                    </a>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

PricingGrid.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      alt: PropTypes.string,
      description: PropTypes.string,
      rate: PropTypes.string,
      features: PropTypes.arrayOf(PropTypes.string),
      buttonText: PropTypes.string,
      buttonLink: PropTypes.string,
    })),
    showPrice: PropTypes.bool,
    backgroundColor: PropTypes.string,
    titleColor: PropTypes.string,
    itemBackgroundColor: PropTypes.string,
    itemTitleColor: PropTypes.string,
    itemDescriptionColor: PropTypes.string,
    itemRateColor: PropTypes.string,
    itemFeatureTextColor: PropTypes.string,
    buttonBgColor: PropTypes.string,
    buttonTextColor: PropTypes.string,
    imageBorderColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func,
  onFileChange: PropTypes.func,
};

PricingGrid.EditorPanel = function PricingGridEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl: getDisplayUrlFromProp }) {
  const [formData, setFormData] = useState(currentConfig || {});

  useEffect(() => {
    setFormData(currentConfig || {});
  }, [currentConfig]);

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onPanelConfigChange(newFormData);
  };

  const handleItemChange = (itemIndex, field, value) => {
    const updatedItems = (formData.items || []).map((item, i) => i === itemIndex ? { ...item, [field]: value } : item);
    handleChange('items', updatedItems);
  };

  const handleItemFeatureChange = (itemIndex, featureIndex, value) => {
    const updatedItems = (formData.items || []).map((item, i) => {
      if (i === itemIndex) {
        const updatedFeatures = (item.features || []).map((feat, fIdx) => fIdx === featureIndex ? value : feat);
        return { ...item, features: updatedFeatures };
      }
      return item;
    });
    handleChange('items', updatedItems);
  };

  const handleAddItemFeature = (itemIndex) => {
    const updatedItems = (formData.items || []).map((item, i) => {
      if (i === itemIndex) return { ...item, features: [...(item.features || []), 'New Feature'] };
      return item;
    });
    handleChange('items', updatedItems);
  };

  const handleRemoveItemFeature = (itemIndex, featureIndex) => {
    const updatedItems = (formData.items || []).map((item, i) => {
      if (i === itemIndex) return { ...item, features: (item.features || []).filter((_, fIdx) => fIdx !== featureIndex) };
      return item;
    });
    handleChange('items', updatedItems);
  };

  const handleAddItem = () => {
    const newItem = { id: `plan_${Date.now()}`, title: 'New Plan', image: '', description: '', rate: '', features: [], buttonText: 'Sign Up', buttonLink: '#' };
    handleChange('items', [...(formData.items || []), newItem]);
  };

  const handleRemoveItem = (itemIndex) => {
    const itemToRemove = formData.items?.[itemIndex];
    if (itemToRemove?.image && typeof itemToRemove.image === 'object' && itemToRemove.image.url?.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.image.url);
    }
    handleChange('items', (formData.items || []).filter((_, i) => i !== itemIndex));
  };

  const handleItemImageChange = (itemIndex, file) => {
    if (file && onPanelFileChange) {
      onPanelFileChange({ blockItemIndex: itemIndex, field: 'image' }, file);
    }
  };

  return (
    <div className="space-y-4 p-2 bg-gray-50 rounded-md shadow">
      {/* Overall Settings */}
      <div><label className="input-label">Section Title (Panel Edit):</label><input type="text" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="input-text-class" /></div>
      <div className="flex items-center"><input type="checkbox" checked={formData.showPrice || false} onChange={(e) => handleChange('showPrice', e.target.checked)} className="mr-2" /><label className="input-label">Show Price/Rate</label></div>

      {/* Color Scheme */}
      <h4 className="h4-style">Color Scheme</h4>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="input-label-sm">Overall BG:</label><input type="color" value={formData.backgroundColor || '#FFFFFF'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Title Text:</label><input type="color" value={formData.titleColor || '#1A202C'} onChange={(e) => handleChange('titleColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Item BG:</label><input type="color" value={formData.itemBackgroundColor || '#F7FAFC'} onChange={(e) => handleChange('itemBackgroundColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Item Title:</label><input type="color" value={formData.itemTitleColor || '#2D3748'} onChange={(e) => handleChange('itemTitleColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Item Desc:</label><input type="color" value={formData.itemDescriptionColor || '#4A5568'} onChange={(e) => handleChange('itemDescriptionColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Item Rate:</label><input type="color" value={formData.itemRateColor || '#2C5282'} onChange={(e) => handleChange('itemRateColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Item Feature:</label><input type="color" value={formData.itemFeatureTextColor || '#718096'} onChange={(e) => handleChange('itemFeatureTextColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Button BG:</label><input type="color" value={formData.buttonBgColor || '#3182CE'} onChange={(e) => handleChange('buttonBgColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Button Text:</label><input type="color" value={formData.buttonTextColor || '#FFFFFF'} onChange={(e) => handleChange('buttonTextColor', e.target.value)} className="input-color-sm" /></div>
        <div><label className="input-label-sm">Image Border (Edit):</label><input type="color" value={formData.imageBorderColor || '#E2E8F0'} onChange={(e) => handleChange('imageBorderColor', e.target.value)} className="input-color-sm" /></div>
      </div>

      {/* Items Management */}
      <h4 className="h4-style">Manage Pricing Items</h4>
      {(formData.items || []).map((item, itemIndex) => (
        <div key={item.id || itemIndex} className="panel-item-container">
          <div className="flex justify-between items-center"><h5 className="h5-style">Item {itemIndex + 1}: {item.title}</h5><button onClick={() => handleRemoveItem(itemIndex)} className="btn-remove-xs">Remove</button></div>
          <div><label className="input-label-xs">Title:</label><input type="text" value={item.title || ''} onChange={(e) => handleItemChange(itemIndex, 'title', e.target.value)} className="input-text-xs" /></div>
          <div><label className="input-label-xs">Description:</label><textarea value={item.description || ''} onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)} rows={2} className="input-textarea-xs" /></div>
          {formData.showPrice && <div><label className="input-label-xs">Rate:</label><input type="text" value={item.rate || ''} onChange={(e) => handleItemChange(itemIndex, 'rate', e.target.value)} className="input-text-xs" /></div>}
          <div>
            <label className="input-label-xs">Image:</label>
            <input type="file" accept="image/*" onChange={(e) => handleItemImageChange(itemIndex, e.target.files[0])} className="input-file-xs" />
            {(getDisplayUrlFromProp && getDisplayUrlFromProp(item.image)) && <img src={getDisplayUrlFromProp(item.image)} alt="Preview" className="img-preview-xs" />}
            <input type="text" placeholder="Or paste URL" value={typeof item.image === 'string' ? item.image : (item.image?.originalUrl || item.image?.url || '')} onChange={(e) => handleItemChange(itemIndex, 'image', e.target.value)} className="input-text-xs mt-1" />
            </div>
          <div><label className="input-label-xs">Image Alt Text:</label><input type="text" value={item.alt || ''} onChange={(e) => handleItemChange(itemIndex, 'alt', e.target.value)} className="input-text-xs" /></div>
          <div>
            <label className="input-label-xs">Features:</label>
            {(item.features || []).map((feature, fIdx) => (
              <div key={fIdx} className="flex items-center space-x-1 mt-1"><input type="text" value={feature} onChange={(e) => handleItemFeatureChange(itemIndex, fIdx, e.target.value)} className="input-text-xs flex-grow" /><button onClick={() => handleRemoveItemFeature(itemIndex, fIdx)} className="btn-remove-feature-xs">&times;</button></div>
          ))}
            <button onClick={() => handleAddItemFeature(itemIndex)} className="btn-add-xs mt-1">+ Add Feature</button>
          </div>
          <div><label className="input-label-xs">Button Text:</label><input type="text" value={item.buttonText || ''} onChange={(e) => handleItemChange(itemIndex, 'buttonText', e.target.value)} className="input-text-xs" /></div>
          <div><label className="input-label-xs">Button Link:</label><input type="text" value={item.buttonLink || ''} onChange={(e) => handleItemChange(itemIndex, 'buttonLink', e.target.value)} className="input-text-xs" /></div>
        </div>
      ))}
      <button onClick={handleAddItem} className="btn-add-item">+ Add Pricing Item</button>

      {/* Basic styling for panel inputs - can be Tailwind classes or <style jsx> */}
      <style jsx>{`
        .input-label { display: block; text-sm; font-medium; color: #4A5568; margin-bottom: 0.25rem; }
        .input-label-sm { display: block; font-size: 0.8rem; font-medium; color: #4A5568; margin-bottom: 0.1rem; }
        .input-label-xs { display: block; font-size: 0.75rem; font-medium; color: #555; margin-bottom: 0.1rem; }
        .input-text-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
        .input-text-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; }
        .input-textarea-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; resize: vertical; min-height: 40px; }
        .input-color-sm { margin-top: 0.1rem; height: 1.75rem; width: 100%; padding: 0.1rem; border: 1px solid #D1D5DB; border-radius: 0.25rem; }
        .input-file-xs { display:block; width:100%; font-size: 0.8rem; margin-bottom: 0.25rem; }
        .img-preview-xs { height: 3rem; width: 3rem; object-fit: cover; border-radius: 0.25rem; border: 1px solid #E5E7EB; margin-top: 0.25rem; }
        .h4-style { font-size: 1.1rem; font-weight: 600; color: #374151; padding-top: 0.75rem; border-top: 1px solid #E5E7EB; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .h5-style { font-size: 0.95rem; font-weight: 600; color: #4A5568; }
        .panel-item-container { padding: 0.75rem; border: 1px solid #E5E7EB; border-radius: 0.375rem; background-color: white; margin-bottom: 0.75rem; }
        .btn-remove-xs { font-size: 0.75rem; color: #EF4444; font-weight: 500; }
        .btn-remove-feature-xs { font-size: 0.8rem; color: #F87171; padding:0 0.2rem; }
        .btn-add-xs { font-size: 0.8rem; color: #3B82F6; font-weight: 500; }
        .btn-add-item { margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem; background-color: #10B981; color: white; border-radius: 0.375rem; font-weight: 500; }
      `}</style>
    </div>
  );
};

PricingGrid.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  onPanelFileChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
};

export default PricingGrid;
