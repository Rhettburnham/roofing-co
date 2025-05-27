import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ListImageVerticalBlock = ({ config, readOnly, onConfigChange, getDisplayUrl, onFileChange }) => {
    const [localConfig, setLocalConfig] = useState(() => {
        const defaultConfig = {
            title: 'Our Process',
            items: [
                { id: 1, number: '1', title: 'Consultation', description: 'We start with a detailed consultation.', image: '' },
            ],
            enableAnimation: true,
            backgroundColor: '#FFFFFF',
            titleColor: '#1A202C',
            itemNumberColor: '#3B82F6', // Blue for numbers
            itemTitleColor: '#2D3748',
            itemDescriptionColor: '#4A5568',
            lineColor: '#D1D5DB', // Connecting line color
            imageBorderColor: '#E2E8F0'
        };
        return { ...defaultConfig, ...(config || {}) };
    });

    const sectionTitleRef = useRef(null);
    const itemRefs = useRef({});

    useEffect(() => {
        const defaultConfig = { 
            title: 'Our Process', items: [], enableAnimation: true, backgroundColor: '#FFFFFF', 
            titleColor: '#1A202C', itemNumberColor: '#3B82F6', itemTitleColor: '#2D3748', 
            itemDescriptionColor: '#4A5568', lineColor: '#D1D5DB', imageBorderColor: '#E2E8F0'
        };
        const newEffectiveConfig = { ...defaultConfig, ...(config || {}) };
        if (readOnly || JSON.stringify(newEffectiveConfig) !== JSON.stringify(localConfig)) {
            setLocalConfig(newEffectiveConfig);
        }
    }, [config, readOnly]);

    useEffect(() => {
        if (!readOnly) {
            if (sectionTitleRef.current) {
                sectionTitleRef.current.style.height = 'auto';
                sectionTitleRef.current.style.height = `${sectionTitleRef.current.scrollHeight}px`;
            }
            (localConfig.items || []).forEach((_, index) => {
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
    }, [localConfig.title, localConfig.items, readOnly]);

    const handleInputChange = (field, value, itemIndex = null, subField = null) => {
        setLocalConfig(prev => {
            let updatedConfig;
            if (itemIndex !== null && subField) {
                const updatedItems = prev.items.map((item, i) => 
                    i === itemIndex ? { ...item, [subField]: value } : item
                );
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
        title, items, enableAnimation, backgroundColor, titleColor, 
        itemNumberColor, itemTitleColor, itemDescriptionColor, lineColor, imageBorderColor
    } = localConfig;

  return (
        <div className="py-12" style={{ backgroundColor }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {readOnly ? (
                    title && <h2 className="text-3xl font-extrabold text-center mb-12" style={{ color: titleColor }}>{title}</h2>
                ) : (
                    title && <textarea
                        ref={sectionTitleRef}
                        value={title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        onBlur={handleBlur}
                        className="text-3xl font-extrabold text-center mb-12 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full resize-none"
                        rows={1} placeholder="Section Title" style={{ color: titleColor }}
                    />
                )}

                <div className="relative">
                    {(items || []).length > 1 && (
                        <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: lineColor, zIndex: 0, marginLeft:'-1px' }}></div>
                    )}
                    {(items || []).map((item, index) => (
                        <div 
              key={item.id || index}
                            className={`flex items-start mb-10 last:mb-0 relative pl-16`}
                        >
                            <div className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold z-10" style={{ backgroundColor: itemNumberColor, color: 'white' }}>
                                {readOnly ? (
                                    <span>{item.number}</span>
                                ) : (
                                    <input type="text" value={item.number || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'number')} onBlur={handleBlur} placeholder="#" className="w-8 text-center bg-transparent focus:outline-none text-white placeholder-gray-200 text-xl font-bold" />
                                )}
                            </div>

                            <div className="flex-grow">
                                <div className="flex flex-col md:flex-row md:items-center">
                                    {item.image && (
                                        <div className="md:w-1/3 md:pr-6 mb-4 md:mb-0 flex-shrink-0">
                                            <img 
                                                src={getDisplayUrl ? getDisplayUrl(item.image) : item.image} 
                                                alt={item.title || 'Step image'} 
                                                className="w-full h-auto rounded-lg shadow-md object-cover aspect-video"
                                                style={{ border: !readOnly ? `2px dashed ${imageBorderColor}` : 'none'}}
                  />
                </div>
              )}
                                    <div className={item.image ? 'md:w-2/3' : 'w-full'}>
                {readOnly ? (
                                            <h3 className="text-xl font-semibold" style={{ color: itemTitleColor }}>{item.title}</h3>
                ) : (
                                            <input type="text" value={item.title || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'title')} onBlur={handleBlur} placeholder="Item Title" className="text-xl font-semibold bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full" style={{ color: itemTitleColor }}/>
                )}
                {readOnly ? (
                                            <p className="mt-1 text-sm" style={{ color: itemDescriptionColor }}>{item.description}</p>
                                        ) : (
                                            <textarea ref={getItemRef(index, 'description')} value={item.description || ''} onChange={(e) => handleInputChange(null, e.target.value, index, 'description')} onBlur={handleBlur} placeholder="Item Description" rows={2} className="mt-1 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full resize-none" style={{ color: itemDescriptionColor }}/>
                                        )}
                  </div>
              </div>
      </div>
      </div>
            ))}
          </div>
        </div>
    </div>
  );
};

ListImageVerticalBlock.propTypes = {
    config: PropTypes.shape({
        title: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            number: PropTypes.string,
            title: PropTypes.string,
            description: PropTypes.string,
            image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        })),
        enableAnimation: PropTypes.bool,
        backgroundColor: PropTypes.string,
        titleColor: PropTypes.string,
        itemNumberColor: PropTypes.string,
        itemTitleColor: PropTypes.string,
        itemDescriptionColor: PropTypes.string,
        lineColor: PropTypes.string,
        imageBorderColor: PropTypes.string,
    }),
    readOnly: PropTypes.bool,
    onConfigChange: PropTypes.func.isRequired,
    getDisplayUrl: PropTypes.func,
    onFileChange: PropTypes.func,
};

ListImageVerticalBlock.EditorPanel = function ListImageVerticalBlockEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl: getDisplayUrlFromProp }) {
    const [formData, setFormData] = useState(currentConfig || {});

    useEffect(() => { setFormData(currentConfig || {}); }, [currentConfig]);

    const handleChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        onPanelConfigChange(newFormData);
    };

    const handleItemChange = (itemIndex, field, value) => {
        const updatedItems = (formData.items || []).map((item, i) => i === itemIndex ? { ...item, [field]: value } : item);
        handleChange('items', updatedItems);
    };

    const handleAddItem = () => {
        const newItem = { id: `vert_${Date.now()}`, number: ((formData.items || []).length + 1).toString(), title: 'New Step', description: '', image: '' };
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
            <div><label className="input-label">Section Title (Panel Edit):</label><input type="text" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="input-text-class input-section-title-liv" /></div>
            <div className="flex items-center"><input type="checkbox" checked={formData.enableAnimation || false} onChange={(e) => handleChange('enableAnimation', e.target.checked)} className="mr-2" /><label className="input-label">Enable Animation (if applicable)</label></div>

            <h4 className="h4-style">Color Scheme</h4>
            <div className="grid grid-cols-2 gap-2">
                <div><label className="input-label-sm">Overall BG:</label><input type="color" value={formData.backgroundColor || '#FFFFFF'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Section Title:</label><input type="color" value={formData.titleColor || '#1A202C'} onChange={(e) => handleChange('titleColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Item Number BG/Text:</label><input type="color" value={formData.itemNumberColor || '#3B82F6'} onChange={(e) => handleChange('itemNumberColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Item Title:</label><input type="color" value={formData.itemTitleColor || '#2D3748'} onChange={(e) => handleChange('itemTitleColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Item Desc:</label><input type="color" value={formData.itemDescriptionColor || '#4A5568'} onChange={(e) => handleChange('itemDescriptionColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Connecting Line:</label><input type="color" value={formData.lineColor || '#D1D5DB'} onChange={(e) => handleChange('lineColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Image Border (Edit):</label><input type="color" value={formData.imageBorderColor || '#E2E8F0'} onChange={(e) => handleChange('imageBorderColor', e.target.value)} className="input-color-sm" /></div>
            </div>

            <h4 className="h4-style">Manage Vertical List Items</h4>
            {(formData.items || []).map((item, itemIndex) => (
                <div key={item.id || itemIndex} className="panel-item-container">
                    <div className="flex justify-between items-center"><h5 className="h5-style">Item {itemIndex + 1} (Number: {item.number})</h5><button onClick={() => handleRemoveItem(itemIndex)} className="btn-remove-xs">Remove</button></div>
                    <div><label className="input-label-xs">Number Text:</label><input type="text" value={item.number || ''} onChange={(e) => handleItemChange(itemIndex, 'number', e.target.value)} className="input-text-xs input-item-number-liv-panel" /></div>
                    <div><label className="input-label-xs">Title:</label><input type="text" value={item.title || ''} onChange={(e) => handleItemChange(itemIndex, 'title', e.target.value)} className="input-text-xs input-item-title-liv-panel" /></div>
                    <div><label className="input-label-xs">Description:</label><textarea value={item.description || ''} onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)} rows={2} className="input-textarea-xs" /></div>
                    <div>
                        <label className="input-label-xs">Image:</label>
                        <input type="file" accept="image/*" onChange={(e) => handleItemImageChange(itemIndex, e.target.files[0])} className="input-file-xs" />
                        {(getDisplayUrlFromProp && getDisplayUrlFromProp(item.image)) && <img src={getDisplayUrlFromProp(item.image)} alt="Preview" className="img-preview-xs" />}
                        <input type="text" placeholder="Or paste URL" value={typeof item.image === 'string' ? item.image : (item.image?.originalUrl || item.image?.url || '')} onChange={(e) => handleItemChange(itemIndex, 'image', e.target.value)} className="input-text-xs mt-1" />
                    </div>
                </div>
            ))}
            <button onClick={handleAddItem} className="btn-add-item">+ Add Item</button>
            <style jsx>{`
                .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #4A5568; margin-bottom: 0.25rem; }
                .input-label-sm { display: block; font-size: 0.8rem; font-weight: 500; color: #4A5568; margin-bottom: 0.1rem; }
                .input-label-xs { display: block; font-size: 0.75rem; font-weight: 500; color: #555; margin-bottom: 0.1rem; }
                .input-text-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; color: #374151; }
                .input-text-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; color: #374151; }
                .input-textarea-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; resize: vertical; min-height: 40px; color: #374151; }
                
                .input-section-title-liv { font-size: 1.875rem; line-height: 2.25rem; font-weight: 800; /* extrabold */ }
                .input-item-number-liv-panel { font-size: 1.25rem; line-height: 1.75rem; font-weight: 700; /* text-xl font-bold */ }
                .input-item-title-liv-panel { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; /* text-xl font-semibold */ }

                .input-color-sm { margin-top: 0.1rem; height: 1.75rem; width: 100%; padding: 0.1rem; border: 1px solid #D1D5DB; border-radius: 0.25rem; }
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

ListImageVerticalBlock.EditorPanel.propTypes = {
    currentConfig: PropTypes.object.isRequired,
    onPanelConfigChange: PropTypes.func.isRequired,
    onPanelFileChange: PropTypes.func.isRequired,
    getDisplayUrl: PropTypes.func.isRequired,
};

export default ListImageVerticalBlock;