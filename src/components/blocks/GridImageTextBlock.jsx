import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const GridImageTextBlock = ({ config, readOnly, onConfigChange, getDisplayUrl, onFileChange }) => {
    const [localConfig, setLocalConfig] = useState(() => {
        const defaultConfig = {
            title: 'Our Core Features',
            columns: 3, // Default to 3 columns
            items: [
                { id: 1, title: 'Feature 1', description: 'Description for feature 1', image: '', alt: 'Feature 1' },
            ],
            backgroundColor: '#FFFFFF',
            titleColor: '#1A202C',
            itemTitleColor: '#2D3748',
            itemDescriptionColor: '#4A5568',
            itemBackgroundColor: 'transparent', // Or specific item card color like '#F9FAFB'
            imageBorderColor: '#E2E8F0',
        };
        return { ...defaultConfig, ...(config || {}) };
    });

    const sectionTitleRef = useRef(null);
    const itemRefs = useRef({}); // For item title and description

    useEffect(() => {
        const defaultConfig = {
            title: 'Our Core Features', columns: 3, items: [], backgroundColor: '#FFFFFF',
            titleColor: '#1A202C', itemTitleColor: '#2D3748', itemDescriptionColor: '#4A5568',
            itemBackgroundColor: 'transparent', imageBorderColor: '#E2E8F0',
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
        title, columns, items, backgroundColor, titleColor, 
        itemTitleColor, itemDescriptionColor, itemBackgroundColor, imageBorderColor
    } = localConfig;

    const gridColsClass = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    }[columns] || 'md:grid-cols-3'; // Default to 3 if columns value is invalid

  return (
        <div className="py-12" style={{ backgroundColor }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {readOnly ? (
                    title && <h2 className="text-3xl font-extrabold text-center mb-10" style={{ color: titleColor }}>{title}</h2>
                ) : (
                    title && <textarea
                        ref={sectionTitleRef}
                        value={title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        onBlur={handleBlur}
                        className="text-3xl font-extrabold text-center mb-10 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full resize-none"
                        rows={1} placeholder="Section Title" style={{ color: titleColor }}
                    />
                )}
                <div className={`grid grid-cols-1 gap-8 ${gridColsClass}`}>
                    {(items || []).map((item, index) => (
                        <div key={item.id || index} className="flex flex-col rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: itemBackgroundColor }}>
                            {item.image && (
                                <div className="flex-shrink-0">
                                    <img 
                                        className="h-48 w-full object-cover"
                                        src={getDisplayUrl ? getDisplayUrl(item.image) : item.image} 
                                        alt={item.alt || item.title || 'Grid item image'}
                                        style={{ borderBottom: !readOnly ? `2px dashed ${imageBorderColor}` : '' }}
                                    />
                                </div>
                            )}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="flex-1">
                {readOnly ? (
                                        <h3 className="mt-2 text-xl font-semibold" style={{ color: itemTitleColor }}>{item.title}</h3>
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => handleInputChange(null, e.target.value, index, 'title')}
                                            onBlur={handleBlur}
                    placeholder="Item Title"
                                            className="mt-2 text-xl font-semibold bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full"
                                            style={{ color: itemTitleColor }}
                  />
                )}
                {readOnly ? (
                                        <p className="mt-3 text-base" style={{ color: itemDescriptionColor }}>{item.description}</p>
                                    ) : (
                                        <textarea
                                            ref={getItemRef(index, 'description')}
                                            value={item.description || ''}
                                            onChange={(e) => handleInputChange(null, e.target.value, index, 'description')}
                                            onBlur={handleBlur}
                    placeholder="Item Description"
                    rows={3}
                                            className="mt-3 text-base bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded p-1 w-full resize-none"
                                            style={{ color: itemDescriptionColor }}
                  />
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

GridImageTextBlock.propTypes = {
    config: PropTypes.shape({
        title: PropTypes.string,
        columns: PropTypes.oneOf([1, 2, 3, 4]),
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            description: PropTypes.string,
            image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
            alt: PropTypes.string,
        })),
        backgroundColor: PropTypes.string,
        titleColor: PropTypes.string,
        itemTitleColor: PropTypes.string,
        itemDescriptionColor: PropTypes.string,
        itemBackgroundColor: PropTypes.string,
        imageBorderColor: PropTypes.string,
    }),
    readOnly: PropTypes.bool,
    onConfigChange: PropTypes.func.isRequired,
    getDisplayUrl: PropTypes.func,
    onFileChange: PropTypes.func,
};

GridImageTextBlock.EditorPanel = function GridImageTextBlockEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl: getDisplayUrlFromProp }) {
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
        const newItem = { id: `grid_${Date.now()}`, title: 'New Item', description: '', image: '', alt: '' };
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
            <div><label className="input-label">Section Title (Panel Edit):</label><input type="text" value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="input-text-class" /></div>
            <div>
                <label className="input-label">Number of Columns (1-4):</label>
                <select value={formData.columns || 3} onChange={(e) => handleChange('columns', parseInt(e.target.value, 10))} className="input-select-class">
                    {[1,2,3,4].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
            </div>

            <h4 className="h4-style">Color Scheme</h4>
            <div className="grid grid-cols-2 gap-2">
                <div><label className="input-label-sm">Overall BG:</label><input type="color" value={formData.backgroundColor || '#FFFFFF'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Section Title:</label><input type="color" value={formData.titleColor || '#1A202C'} onChange={(e) => handleChange('titleColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Item BG:</label><input type="color" value={formData.itemBackgroundColor || 'transparent'} onChange={(e) => handleChange('itemBackgroundColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Item Title:</label><input type="color" value={formData.itemTitleColor || '#2D3748'} onChange={(e) => handleChange('itemTitleColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Item Desc:</label><input type="color" value={formData.itemDescriptionColor || '#4A5568'} onChange={(e) => handleChange('itemDescriptionColor', e.target.value)} className="input-color-sm" /></div>
                <div><label className="input-label-sm">Image Border (Edit):</label><input type="color" value={formData.imageBorderColor || '#E2E8F0'} onChange={(e) => handleChange('imageBorderColor', e.target.value)} className="input-color-sm" /></div>
            </div>

            <h4 className="h4-style">Manage Grid Items</h4>
            {(formData.items || []).map((item, itemIndex) => (
                <div key={item.id || itemIndex} className="panel-item-container">
                    <div className="flex justify-between items-center"><h5 className="h5-style">Item {itemIndex + 1}</h5><button onClick={() => handleRemoveItem(itemIndex)} className="btn-remove-xs">Remove</button></div>
                    <div><label className="input-label-xs">Title:</label><input type="text" value={item.title || ''} onChange={(e) => handleItemChange(itemIndex, 'title', e.target.value)} className="input-text-xs" /></div>
                    <div><label className="input-label-xs">Description:</label><textarea value={item.description || ''} onChange={(e) => handleItemChange(itemIndex, 'description', e.target.value)} rows={2} className="input-textarea-xs" /></div>
                    <div>
                        <label className="input-label-xs">Image:</label>
                        <input type="file" accept="image/*" onChange={(e) => handleItemImageChange(itemIndex, e.target.files[0])} className="input-file-xs" />
                        {(getDisplayUrlFromProp && getDisplayUrlFromProp(item.image)) && <img src={getDisplayUrlFromProp(item.image)} alt="Preview" className="img-preview-xs" />}
                        <input type="text" placeholder="Or paste URL" value={typeof item.image === 'string' ? item.image : (item.image?.originalUrl || item.image?.url || '')} onChange={(e) => handleItemChange(itemIndex, 'image', e.target.value)} className="input-text-xs mt-1" />
                    </div>
                    <div><label className="input-label-xs">Image Alt Text:</label><input type="text" value={item.alt || ''} onChange={(e) => handleItemChange(itemIndex, 'alt', e.target.value)} className="input-text-xs" /></div>
                </div>
            ))}
            <button onClick={handleAddItem} className="btn-add-item">+ Add Grid Item</button>
            <style jsx>{`
                .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #4A5568; margin-bottom: 0.25rem; }
                .input-label-sm { display: block; font-size: 0.8rem; font-weight: 500; color: #4A5568; margin-bottom: 0.1rem; }
                .input-label-xs { display: block; font-size: 0.75rem; font-weight: 500; color: #555; margin-bottom: 0.1rem; }
                .input-text-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
                .input-text-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; }
                .input-textarea-xs { display: block; width: 100%; padding: 0.25rem 0.5rem; font-size: 0.875rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 0.25rem; resize: vertical; min-height: 40px; }
                .input-select-class { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
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

GridImageTextBlock.EditorPanel.propTypes = {
    currentConfig: PropTypes.object.isRequired,
    onPanelConfigChange: PropTypes.func.isRequired,
    onPanelFileChange: PropTypes.func.isRequired,
    getDisplayUrl: PropTypes.func.isRequired,
};

export default GridImageTextBlock;