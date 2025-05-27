import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ShingleSelectorBlock = ({ config, readOnly, onConfigChange, getDisplayUrl, onFileChange }) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
            sectionTitle: 'Explore Our Shingle Options',
            shingleOptions: [
                { id: 1, title: 'Asphalt Shingles', description: 'Popular and affordable.', benefit: 'Cost-effective.', image: '' },
            ],
            selectedShingleIndex: 0,
            // Colors
            backgroundColor: '#F9FAFB', // Overall background
            sectionTitleColor: '#111827',
            // Selector (inactive shingle option in the list)
            selectorBackgroundColor: '#FFFFFF',
            selectorTitleColor: '#1F2937',
            selectorDescriptionColor: '#4B5563',
            // Active Selector (the selected shingle in the list)
            activeSelectorBackgroundColor: '#EBF4FF', // Light blue
            activeSelectorTitleColor: '#1D4ED8', // Darker blue
            activeSelectorDescriptionColor: '#1E3A8A',
            activeSelectorBorderColor: '#2563EB', // Blue border for active
            // Detail View (the expanded view of the selected shingle)
            detailBackgroundColor: '#FFFFFF',
            detailTitleColor: '#111827',
            detailDescriptionColor: '#374151',
            detailBenefitColor: '#059669', // Green for benefit text
            imageBorderColor: '#E2E8F0', // For image edit mode placeholder
        };
        return { ...defaultConfig, ...(config || {}) };
    });

    const sectionTitleRef = useRef(null);
    const itemRefs = useRef({}); // For shingle option text fields

  useEffect(() => {
        const defaultConfig = { 
            sectionTitle: 'Explore Our Shingle Options', shingleOptions: [], selectedShingleIndex: 0,
            backgroundColor: '#F9FAFB', sectionTitleColor: '#111827',
            selectorBackgroundColor: '#FFFFFF', selectorTitleColor: '#1F2937', selectorDescriptionColor: '#4B5563',
            activeSelectorBackgroundColor: '#EBF4FF', activeSelectorTitleColor: '#1D4ED8', activeSelectorDescriptionColor: '#1E3A8A', activeSelectorBorderColor: '#2563EB',
            detailBackgroundColor: '#FFFFFF', detailTitleColor: '#111827', detailDescriptionColor: '#374151', detailBenefitColor: '#059669',
            imageBorderColor: '#E2E8F0',
        };
        const newEffectiveConfig = { ...defaultConfig, ...(config || {}) };
        if (readOnly || JSON.stringify(newEffectiveConfig) !== JSON.stringify(localConfig)) {
            setLocalConfig(newEffectiveConfig);
            if (newEffectiveConfig.selectedShingleIndex >= (newEffectiveConfig.shingleOptions || []).length) {
                // If current selection is out of bounds, reset (e.g. after item removal)
                 setLocalConfig(prev => ({...prev, selectedShingleIndex: 0}));
                 if(!readOnly) onConfigChange({...newEffectiveConfig, selectedShingleIndex: 0});
            }
        }
    }, [config, readOnly, localConfig, onConfigChange]);


  useEffect(() => {
        if (!readOnly) {
            if (sectionTitleRef.current) {
                sectionTitleRef.current.style.height = 'auto';
                sectionTitleRef.current.style.height = `${sectionTitleRef.current.scrollHeight}px`;
            }
            (localConfig.shingleOptions || []).forEach((_, index) => {
                if (itemRefs.current[index]) {
                    Object.values(itemRefs.current[index]).forEach(ref => {
                        if (ref && ref.current) {
                            ref.current.style.height = 'auto';
                            ref.current.style.height = `${ref.current.scrollHeight}px`;
                        }
                    });
                }
            });
        }
    }, [localConfig.sectionTitle, localConfig.shingleOptions, readOnly]);

    const handleInputChange = (field, value, itemIndex = null, subField = null) => {
        setLocalConfig(prev => {
            let updatedConfig;
            if (itemIndex !== null && subField) {
                const updatedItems = prev.shingleOptions.map((item, i) => 
                    i === itemIndex ? { ...item, [subField]: value } : item
                );
                updatedConfig = { ...prev, shingleOptions: updatedItems };
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

    const handleShingleSelect = (index) => {
        // This will be primarily driven by the panel in edit mode for selectedShingleIndex
        // but direct click on preview should also work.
        setLocalConfig(prev => ({...prev, selectedShingleIndex: index}));
        if (!readOnly) { // If in edit mode, propagate this selection for consistency
             onConfigChange({...localConfig, selectedShingleIndex: index});
        }
    };

    const getItemRef = (itemIndex, field) => (el) => {
        if (!itemRefs.current[itemIndex]) itemRefs.current[itemIndex] = {};
        itemRefs.current[itemIndex][field] = { current: el }; 
    };

    const { 
        sectionTitle, shingleOptions, selectedShingleIndex,
        backgroundColor, sectionTitleColor, selectorBackgroundColor, selectorTitleColor, selectorDescriptionColor,
        activeSelectorBackgroundColor, activeSelectorTitleColor, activeSelectorDescriptionColor, activeSelectorBorderColor,
        detailBackgroundColor, detailTitleColor, detailDescriptionColor, detailBenefitColor, imageBorderColor
    } = localConfig;

    const currentShingle = (shingleOptions || [])[selectedShingleIndex] || shingleOptions?.[0] || {};

  return (
        <div className="py-12" style={{ backgroundColor }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {readOnly ? (
                    sectionTitle && <h2 className="text-3xl font-extrabold text-center mb-10" style={{ color: sectionTitleColor }}>{sectionTitle}</h2>
                ) : (
                    sectionTitle && <textarea
                        ref={sectionTitleRef}
                        value={sectionTitle}
                        onChange={(e) => handleInputChange('sectionTitle', e.target.value)}
                        onBlur={handleBlur}
                        className="text-3xl font-extrabold text-center mb-10 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full resize-none"
                        rows={1} placeholder="Section Title" style={{ color: sectionTitleColor }}
                    />
                )}

                <div className="md:flex md:space-x-8">
                    <div className="md:w-1/3 space-y-3 mb-8 md:mb-0 max-h-[60vh] md:overflow-y-auto pr-2">
                        {(shingleOptions || []).map((option, index) => (
                            <div 
                                key={option.id || index}
                                onClick={() => handleShingleSelect(index)} 
                                className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ease-in-out ${selectedShingleIndex === index ? 'ring-2' : 'hover:shadow-lg'}`}
                                style={{
                                    backgroundColor: selectedShingleIndex === index ? activeSelectorBackgroundColor : selectorBackgroundColor,
                                    borderColor: selectedShingleIndex === index ? activeSelectorBorderColor : 'transparent',
                                }}
                            >
          {readOnly ? (
                                    <h3 className="text-lg font-semibold" style={{ color: selectedShingleIndex === index ? activeSelectorTitleColor : selectorTitleColor }}>{option.title}</h3>
                                ) : (
                                    <input type="text" value={option.title || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'title')} onBlur={handleBlur} placeholder="Shingle Title" className="text-lg font-semibold bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full" style={{ color: selectedShingleIndex === index ? activeSelectorTitleColor : selectorTitleColor }} />
                                )}
                                {readOnly ? (
                                    <p className="text-sm mt-1" style={{ color: selectedShingleIndex === index ? activeSelectorDescriptionColor : selectorDescriptionColor }}>{option.description}</p>
                                ) : (
                                    <textarea ref={getItemRef(index, 'description')} value={option.description || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'description')} onBlur={handleBlur} placeholder="Short Description" rows={2} className="text-sm mt-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full resize-none" style={{ color: selectedShingleIndex === index ? activeSelectorDescriptionColor : selectorDescriptionColor }} />
                                )}
                      </div>
                    ))}
                  </div>

                    <div className="md:w-2/3 p-6 rounded-lg shadow-xl" style={{ backgroundColor: detailBackgroundColor }}>
                        {currentShingle.image && (
                            <img 
                                src={getDisplayUrl ? getDisplayUrl(currentShingle.image) : currentShingle.image} 
                                alt={currentShingle.title || 'Shingle image'} 
                                className="w-full h-64 object-cover rounded-md mb-6 shadow-md"
                                style={{ border: !readOnly ? `2px dashed ${imageBorderColor}` : 'none'}}
                            />
                        )}
                        {readOnly ? (
                            <h2 className="text-2xl font-bold mb-2" style={{ color: detailTitleColor }}>{currentShingle.title}</h2>
                        ) : (
                            <input type="text" value={currentShingle.title || ''} onChange={(e) => handleInputChange(null, e.target.value, selectedShingleIndex, 'title')} onBlur={handleBlur} placeholder="Shingle Title (Detail)" className="text-2xl font-bold mb-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full" style={{ color: detailTitleColor }} />
                        )}
                        {readOnly ? (
                             <p className="text-base mb-4" style={{ color: detailDescriptionColor }}>{currentShingle.description}</p>
                        ) : (
                            <textarea value={currentShingle.description || ''} onChange={(e) => handleInputChange(null, e.target.value, selectedShingleIndex, 'description')} onBlur={handleBlur} placeholder="Detailed Description" rows={3} className="text-base mb-4 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full resize-none" style={{ color: detailDescriptionColor }} />
                        )}
                        {readOnly ? (
                            currentShingle.benefit && <p className="text-base font-semibold" style={{ color: detailBenefitColor }}>Benefit: {currentShingle.benefit}</p>
                        ) : (
                           currentShingle.hasOwnProperty('benefit') && <div className="flex items-center"><span className="text-base font-semibold mr-2" style={{color: detailBenefitColor}}>Benefit:</span><input type="text" value={currentShingle.benefit || ''} onChange={(e) => handleInputChange(null, e.target.value, selectedShingleIndex, 'benefit')} onBlur={handleBlur} placeholder="Benefit Statement" className="text-base font-semibold bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 flex-grow" style={{ color: detailBenefitColor }} /></div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

ShingleSelectorBlock.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
        shingleOptions: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
      description: PropTypes.string,
            benefit: PropTypes.string,
            image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        })),
        selectedShingleIndex: PropTypes.number,
        // Color Props
        backgroundColor: PropTypes.string, sectionTitleColor: PropTypes.string,
        selectorBackgroundColor: PropTypes.string, selectorTitleColor: PropTypes.string, selectorDescriptionColor: PropTypes.string,
        activeSelectorBackgroundColor: PropTypes.string, activeSelectorTitleColor: PropTypes.string, activeSelectorDescriptionColor: PropTypes.string, activeSelectorBorderColor: PropTypes.string,
        detailBackgroundColor: PropTypes.string, detailTitleColor: PropTypes.string, detailDescriptionColor: PropTypes.string, detailBenefitColor: PropTypes.string,
        imageBorderColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
    onConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func,
    onFileChange: PropTypes.func,
};

ShingleSelectorBlock.EditorPanel = function ShingleSelectorEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl: getDisplayUrlFromProp }) {
    const [formData, setFormData] = useState(currentConfig || {});

    useEffect(() => { setFormData(currentConfig || {}); }, [currentConfig]);

    const handleChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        onPanelConfigChange(newFormData);
    };

    const handleItemChange = (itemIndex, field, value) => {
        const updatedItems = (formData.shingleOptions || []).map((item, i) => i === itemIndex ? { ...item, [field]: value } : item);
        handleChange('shingleOptions', updatedItems);
    };

    const handleAddItem = () => {
        const newItem = { id: `shingle_${Date.now()}`, title: 'New Shingle', description: '', benefit: '', image: '' };
        handleChange('shingleOptions', [...(formData.shingleOptions || []), newItem]);
    };

    const handleRemoveItem = (itemIndex) => {
        const itemToRemove = formData.shingleOptions?.[itemIndex];
        if (itemToRemove?.image && typeof itemToRemove.image === 'object' && itemToRemove.image.url?.startsWith('blob:')) {
            URL.revokeObjectURL(itemToRemove.image.url);
        }
        let newSelectedShingleIndex = formData.selectedShingleIndex || 0;
        const updatedItems = (formData.shingleOptions || []).filter((_, i) => i !== itemIndex);
        
        if (updatedItems.length === 0) {
            newSelectedShingleIndex = 0; // No items left
        } else if (itemIndex === newSelectedShingleIndex) {
            newSelectedShingleIndex = 0; // If selected was removed, select first
        } else if (itemIndex < newSelectedShingleIndex) {
            newSelectedShingleIndex--; // Adjust if item before current selected was removed
        }
        // No change if item after current selected was removed, or if list empty previously.
        
        const newFormState = {...formData, shingleOptions: updatedItems, selectedShingleIndex: newSelectedShingleIndex};
        setFormData(newFormState);
        onPanelConfigChange(newFormState);
    };

    const handleItemImageChange = (itemIndex, file) => {
        if (file && onPanelFileChange) {
            onPanelFileChange({ blockItemIndex: itemIndex, field: 'image' }, file);
        }
    };

  return (
        <div className="space-y-4 p-2 bg-gray-50 rounded-md shadow">
            <div><label className="input-label">Section Title (Panel Edit):</label><input type="text" value={formData.sectionTitle || ''} onChange={(e) => handleChange('sectionTitle', e.target.value)} className="input-text-class input-section-title-ss" /></div>
            
            <h4 className="h4-style">Color Scheme</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div><label className="input-label-sm">Overall BG:</label><input type="color" value={formData.backgroundColor || '#F9FAFB'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Section Title:</label><input type="color" value={formData.sectionTitleColor || '#111827'} onChange={(e) => handleChange('sectionTitleColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Selector BG:</label><input type="color" value={formData.selectorBackgroundColor || '#FFFFFF'} onChange={(e) => handleChange('selectorBackgroundColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Selector Title:</label><input type="color" value={formData.selectorTitleColor || '#1F2937'} onChange={(e) => handleChange('selectorTitleColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Selector Desc:</label><input type="color" value={formData.selectorDescriptionColor || '#4B5563'} onChange={(e) => handleChange('selectorDescriptionColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Active Sel. BG:</label><input type="color" value={formData.activeSelectorBackgroundColor || '#EBF4FF'} onChange={(e) => handleChange('activeSelectorBackgroundColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Active Sel. Title:</label><input type="color" value={formData.activeSelectorTitleColor || '#1D4ED8'} onChange={(e) => handleChange('activeSelectorTitleColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Active Sel. Desc:</label><input type="color" value={formData.activeSelectorDescriptionColor || '#1E3A8A'} onChange={(e) => handleChange('activeSelectorDescriptionColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Active Sel. Border:</label><input type="color" value={formData.activeSelectorBorderColor || '#2563EB'} onChange={(e) => handleChange('activeSelectorBorderColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Detail BG:</label><input type="color" value={formData.detailBackgroundColor || '#FFFFFF'} onChange={(e) => handleChange('detailBackgroundColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Detail Title:</label><input type="color" value={formData.detailTitleColor || '#111827'} onChange={(e) => handleChange('detailTitleColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Detail Desc:</label><input type="color" value={formData.detailDescriptionColor || '#374151'} onChange={(e) => handleChange('detailDescriptionColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Detail Benefit:</label><input type="color" value={formData.detailBenefitColor || '#059669'} onChange={(e) => handleChange('detailBenefitColor', e.target.value)} className="input-color-xs" /></div>
                <div><label className="input-label-sm">Image Border (Edit):</label><input type="color" value={formData.imageBorderColor || '#E2E8F0'} onChange={(e) => handleChange('imageBorderColor', e.target.value)} className="input-color-xs" /></div>
      </div>

            <h4 className="h4-style">Manage Shingle Options</h4>
            {(formData.shingleOptions || []).map((item, itemIndex) => (
                <div key={item.id || itemIndex} className="panel-item-container">
                    <div className="flex justify-between items-center"><h5 className="h5-style">Option {itemIndex + 1}</h5><button onClick={() => handleRemoveItem(itemIndex)} className="btn-remove-xs">Remove</button></div>
                    <div><label className="input-label-xs">Title:</label><input type="text" value={item.title || ''} onChange={(e) => handleItemChange(itemIndex, 'title', e.target.value)} className="input-text-xs input-item-title-ss-panel" /></div>
                    <div><label className="input-label-xs">Description (for selector list):</label><textarea value={item.description || ''} onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)} rows={2} className="input-textarea-xs" /></div>
                    <div><label className="input-label-xs">Benefit Statement (for detail view):</label><input type="text" value={item.benefit || ''} onChange={(e) => handleItemChange(itemIndex, 'benefit', e.target.value)} className="input-text-xs input-item-benefit-ss-panel" /></div>
                <div>
                        <label className="input-label-xs">Image:</label>
                        <input type="file" accept="image/*" onChange={(e) => handleItemImageChange(itemIndex, e.target.files[0])} className="input-file-xs" />
                        {(getDisplayUrlFromProp && getDisplayUrlFromProp(item.image)) && <img src={getDisplayUrlFromProp(item.image)} alt="Preview" className="img-preview-xs" />}
                        <input type="text" placeholder="Or paste URL" value={typeof item.image === 'string' ? item.image : (item.image?.originalUrl || item.image?.url || '')} onChange={(e) => handleItemChange(itemIndex, 'image', e.target.value)} className="input-text-xs mt-1" />
                </div>
            </div>
            ))}
            <button onClick={handleAddItem} className="btn-add-item">+ Add Shingle Option</button>
      <style jsx>{`
                .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #4A5568; margin-bottom: 0.25rem; }
                .input-label-sm { /* For color section labels */ font-size: 0.75rem; font-weight: 500; color: #4A5568; margin-bottom: 0.1rem; }
                .input-label-xs { display: block; font-size: 0.75rem; font-weight: 500; color: #555; margin-bottom: 0.1rem; }
                .input-text-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; color: #374151; }
                .input-text-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; color: #374151; }
                .input-textarea-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; resize: vertical; min-height: 40px; color: #374151; }
                
                .input-section-title-ss { font-size: 1.875rem; line-height: 2.25rem; font-weight: 800; /* extrabold */ }
                .input-item-title-ss-panel { font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; /* text-lg font-semibold */ }
                .input-item-benefit-ss-panel { font-size: 1rem; line-height: 1.5rem; font-weight: 600; /* text-base font-semibold */ }

                .input-color-xs { margin-top: 0.1rem; height: 1.5rem; width: 100%; padding: 0.1rem; border: 1px solid #D1D5DB; border-radius: 0.25rem; }
                .input-file-xs { display:block; width:100%; font-size: 0.8rem; margin-bottom: 0.25rem; }
                .img-preview-xs { height: 3rem; width: 3rem; object-fit: cover; border-radius: 0.25rem; border: 1px solid #E5E7EB; margin-top: 0.25rem; }
                .h4-style { font-size: 1.1rem; font-weight: 600; color: #374151; padding-top: 0.75rem; border-top: 1px solid #E5E7EB; margin-top: 1.25rem; margin-bottom: 0.5rem; }
                .h5-style { font-size: 0.95rem; font-weight: 600; color: #4A5568; }
                .panel-item-container { padding: 0.75rem; border: 1px solid #E5E7EB; border-radius: 0.375rem; background-color: white; margin-bottom: 0.75rem; }
                .btn-remove-xs { font-size: 0.75rem; color: #EF4444; font-weight: 500; }
                .btn-add-item { margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem; background-color: #10B981; color: white; border-radius: 0.375rem; font-weight: 500; }
      `}</style>
    </div>
  );
};

ShingleSelectorBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
    onPanelFileChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
};

export default ShingleSelectorBlock;