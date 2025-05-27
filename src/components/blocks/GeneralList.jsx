import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const GeneralList = ({ config, readOnly, onConfigChange, getDisplayUrl, onFileChange }) => {
    // Initialize localConfig with defaults and merge with incoming config
    const [localConfig, setLocalConfig] = useState(() => {
        const defaultConfig = {
            title: 'Default Section Title',
            items: [],
            backgroundColor: '#FFFFFF', // Default white background
            textColor: '#333333',       // Default dark text
            itemBackgroundColor: '#F9FAFB',
            itemTextColor: '#111827',
            imageBorderColor: '#E5E7EB'
        };
        return { ...defaultConfig, ...(config || {}) };
    });

    const titleInputRef = useRef(null);
    const itemTextareaRefs = useRef({}); // Use an object to store refs for item fields

    // Effect to sync localConfig with prop changes if not in edit mode (readOnly = true)
    // or if the incoming config is substantially different (e.g. new page loaded)
    useEffect(() => {
        const defaultConfig = {
            title: 'Default Section Title',
            items: [],
            backgroundColor: '#FFFFFF',
            textColor: '#333333',
            itemBackgroundColor: '#F9FAFB',
            itemTextColor: '#111827',
            imageBorderColor: '#E5E7EB'
        };
        // Smart merging: prioritize incoming config but preserve local structure if items exist
        const currentItems = localConfig.items && localConfig.items.length > 0 ? localConfig.items : (config?.items || defaultConfig.items);
        const newConfig = { ...defaultConfig, ...(config || {}), items: currentItems };

        if (readOnly || JSON.stringify(config) !== JSON.stringify(localConfig)) {
            setLocalConfig(newConfig);
        }
    }, [config, readOnly]);

    // Auto-resize textareas
    useEffect(() => {
        if (!readOnly) {
            if (titleInputRef.current) {
                titleInputRef.current.style.height = 'auto';
                titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
            }
            Object.values(itemTextareaRefs.current).forEach(fieldRefs => {
                if (fieldRefs) {
                    Object.values(fieldRefs).forEach(ref => {
                        if (ref && ref.current) {
                            ref.current.style.height = 'auto';
                            ref.current.style.height = `${ref.current.scrollHeight}px`;
                        }
                    });
                }
            });
        }
    }, [localConfig.title, localConfig.items, readOnly]);

    const handleMainTitleChange = (e) => {
        const newTitle = e.target.value;
        setLocalConfig(prev => ({ ...prev, title: newTitle }));
        if (!readOnly) onConfigChange({ ...localConfig, title: newTitle });
    };

    const handleItemFieldChange = (itemIndex, field, value) => {
        setLocalConfig(prev => {
            const updatedItems = prev.items.map((item, i) => 
                i === itemIndex ? { ...item, [field]: value } : item
            );
            const newFullConfig = { ...prev, items: updatedItems };
            if(!readOnly) onConfigChange(newFullConfig);
            return newFullConfig;
        });
    };

    const handleItemAdvantageChange = (itemIndex, advIndex, value) => {
        setLocalConfig(prev => {
            const updatedItems = prev.items.map((item, i) => {
                if (i === itemIndex) {
                    const updatedAdvantages = (item.advantages || []).map((adv, j) => 
                        j === advIndex ? value : adv
                    );
                    return { ...item, advantages: updatedAdvantages };
                }
                return item;
            });
            const newFullConfig = { ...prev, items: updatedItems };
            if(!readOnly) onConfigChange(newFullConfig);
            return newFullConfig;
        });
    };

    const handleBlur = () => {
        if (!readOnly) {
            onConfigChange(localConfig);
        }
    };
    
    // Destructure with defaults from localConfig for rendering
  const {
        title,
        items,
        backgroundColor,
        textColor,
        itemBackgroundColor,
        itemTextColor,
        imageBorderColor 
  } = localConfig;

    const getSafeDisplayUrl = (imgSrc) => {
        if (!imgSrc) return '';
        if (typeof imgSrc === 'string') return imgSrc;
        if (imgSrc.url) return getDisplayUrl ? getDisplayUrl(imgSrc) : imgSrc.url;
        return '';
    };

    // Helper to manage refs for item textareas
    const getItemRef = (itemIndex, field) => (el) => {
        if (!itemTextareaRefs.current[itemIndex]) {
            itemTextareaRefs.current[itemIndex] = {};
        }
        itemTextareaRefs.current[itemIndex][field] = { current: el }; // Store as {current: el} to mimic ref object
    };

    return (
        <div className="py-8 px-4 md:px-8" style={{ backgroundColor: backgroundColor, color: textColor }}>
        {readOnly ? (
                <h2 className="text-3xl font-bold text-center mb-10" style={{ color: 'inherit' }}>{title}</h2>
            ) : (
                <textarea
                    ref={titleInputRef}
                    value={title}
                    onChange={handleMainTitleChange}
                    onBlur={handleBlur}
                    className="text-3xl font-bold text-center mb-10 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 resize-none w-full"
                    style={{ color: 'inherit' }}
                    rows={1}
                    placeholder="Section Title"
                />
            )}
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
              {(items || []).map((item, index) => (
                    <div 
                        key={item.id || index} 
                        className="rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row"
                        style={{ backgroundColor: itemBackgroundColor, color: itemTextColor }}
                    >
                        {item.pictures && item.pictures[0] && (
                            <div className="md:w-1/3 flex-shrink-0">
                                <img 
                                    src={getSafeDisplayUrl(item.pictures[0])} 
                                    alt={item.name || 'Service image'} 
                                    className="w-full h-48 md:h-full object-cover"
                                    style={{ borderRight: !readOnly ? `2px dashed ${imageBorderColor}` : ''}}
                                />
            </div>
          )}
                        <div className={`p-6 flex-grow ${item.pictures && item.pictures[0] ? 'md:w-2/3' : 'w-full'}`}>
      {readOnly ? (
                                <h3 className="text-2xl font-semibold mb-3" style={{ color: 'inherit' }}>{item.name}</h3>
                            ) : (
                                <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => handleItemFieldChange(index, 'name', e.target.value)}
                                    onBlur={handleBlur}
                                    className="text-2xl font-semibold mb-3 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full"
                                    style={{ color: 'inherit' }}
                                    placeholder="Item Name"
                                />
                            )}
                            {readOnly ? (
                                <p className="mb-4 text-sm leading-relaxed" style={{ color: 'inherit' }}>{item.description}</p>
                            ) : (
                                <textarea
                                    ref={getItemRef(index, 'description')}
                                    value={item.description || ''}
                                    onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                                    onBlur={handleBlur}
                                    className="mb-4 text-sm leading-relaxed bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400 rounded p-1 w-full resize-none"
                                    style={{ color: 'inherit' }}
                                    rows={3}
                                    placeholder="Item Description"
                                />
                            )}
                            {item.advantages && item.advantages.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-semibold mb-2 text-md" style={{ color: 'inherit' }}>Advantages:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {item.advantages.map((advantage, advIndex) => (
                                            <li key={advIndex}>
                                                {readOnly ? (
                                                    <span style={{ color: 'inherit' }}>{advantage}</span>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={advantage}
                                                        onChange={(e) => handleItemAdvantageChange(index, advIndex, e.target.value)}
                                                        onBlur={handleBlur}
                                                        className="flex-grow px-2 py-1 text-xs bg-gray-50 border border-gray-300 rounded-md"
                                                        style={{ color: 'inherit' }}
                                                        placeholder={`Advantage ${advIndex + 1}`}
                                                    />
                                                )}
                  </li>
                ))}
              </ul>
            </div>
          )}
                        </div>
          </div>
        ))}
      </div>
    </div>
  );
};

GeneralList.propTypes = {
    config: PropTypes.shape({
        title: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string,
            description: PropTypes.string,
            advantages: PropTypes.arrayOf(PropTypes.string),
            colorPossibilities: PropTypes.string,
            installationTime: PropTypes.string,
            pictures: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
        })),
        backgroundColor: PropTypes.string,
        textColor: PropTypes.string,
        itemBackgroundColor: PropTypes.string,
        itemTextColor: PropTypes.string,
        imageBorderColor: PropTypes.string,
    }),
    readOnly: PropTypes.bool,
    onConfigChange: PropTypes.func.isRequired,
    getDisplayUrl: PropTypes.func,
    onFileChange: PropTypes.func, 
};

GeneralList.EditorPanel = function GeneralListEditorPanel({ currentConfig, onPanelConfigChange, onPanelFileChange, getDisplayUrl }) {
    const [formData, setFormData] = useState(currentConfig || {});

    useEffect(() => {
        setFormData(currentConfig || {});
    }, [currentConfig]);

    const handleOverallChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        onPanelConfigChange(newFormData); // Propagate all changes live
    };

    const handleItemDetailChange = (itemIndex, field, value) => {
        const updatedItems = (formData.items || []).map((item, i) => 
            i === itemIndex ? { ...item, [field]: value } : item
        );
        handleOverallChange('items', updatedItems);
    };

    const handleItemAdvantageChange = (itemIndex, advIndex, value) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                const updatedAdvantages = (item.advantages || []).map((adv, j) => 
                    j === advIndex ? value : adv
                );
                return { ...item, advantages: updatedAdvantages };
        }
        return item;
        });
        handleOverallChange('items', updatedItems);
    };

    const handleAddItemAdvantage = (itemIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                return { ...item, advantages: [...(item.advantages || []), 'New Advantage'] };
        }
        return item;
        });
        handleOverallChange('items', updatedItems);
    };

    const handleRemoveItemAdvantage = (itemIndex, advIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                const updatedAdvantages = (item.advantages || []).filter((_, j) => j !== advIndex);
                return { ...item, advantages: updatedAdvantages };
            }
            return item;
          });
        handleOverallChange('items', updatedItems);
    };

    const handleAddItem = () => {
        const newItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: 'New Item',
            description: 'New item description.',
            advantages: ['Advantage 1'],
            colorPossibilities: '',
            installationTime: '',
            pictures: [] // Start with an empty pictures array
        };
        handleOverallChange('items', [...(formData.items || []), newItem]);
    };

    const handleRemoveItem = (itemIndex) => {
        const itemToRemove = formData.items?.[itemIndex];
        if (itemToRemove && itemToRemove.pictures) {
            itemToRemove.pictures.forEach(pic => {
                if (typeof pic === 'object' && pic.url && pic.url.startsWith('blob:')) {
                    URL.revokeObjectURL(pic.url);
                }
            });
        }
        const updatedItems = (formData.items || []).filter((_, i) => i !== itemIndex);
        handleOverallChange('items', updatedItems);
    };

    const handleItemPictureChange = (itemIndex, picIndex, file) => {
        if (file && onPanelFileChange) {
            // This tells ServiceEditPage to handle the file and update the config path
            onPanelFileChange({ blockItemIndex: itemIndex, pictureIndex: picIndex, file: file, field: 'pictures'});
        }
    };
    
    const handleAddPictureToItem = (itemIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                // Add a null placeholder. The actual file object will be added by ServiceEditPage
                return { ...item, pictures: [...(item.pictures || []), null] }; 
        }
        return item;
        });
        handleOverallChange('items', updatedItems);
    };

    const handleRemoveItemPicture = (itemIndex, picIndex) => {
        const updatedItems = (formData.items || []).map((item, i) => {
            if (i === itemIndex) {
                const picToRemove = item.pictures?.[picIndex];
                if (typeof picToRemove === 'object' && picToRemove.url && picToRemove.url.startsWith('blob:')) {
                    URL.revokeObjectURL(picToRemove.url);
                }
                const updatedPictures = (item.pictures || []).filter((_, j) => j !== picIndex);
                return { ...item, pictures: updatedPictures };
        }
        return item;
        });
        handleOverallChange('items', updatedItems);
    };


    return (
        <div className="space-y-6 p-3 bg-gray-50 rounded-md shadow">
            <div>
                <label className="block text-sm font-medium text-gray-700">Main Title (Panel Edit):</label>
                <input 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={(e) => handleOverallChange('title', e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            <h4 className="text-lg font-semibold text-gray-700 pt-3 border-t mt-5">Color Scheme</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Overall Background Color:</label>
                    <input type="color" value={formData.backgroundColor || '#FFFFFF'} onChange={(e) => handleOverallChange('backgroundColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Overall Text Color:</label>
                    <input type="color" value={formData.textColor || '#333333'} onChange={(e) => handleOverallChange('textColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item Background Color:</label>
                    <input type="color" value={formData.itemBackgroundColor || '#F9FAFB'} onChange={(e) => handleOverallChange('itemBackgroundColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Item Text Color:</label>
                    <input type="color" value={formData.itemTextColor || '#111827'} onChange={(e) => handleOverallChange('itemTextColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Image Border Color (Edit Mode):</label>
                    <input type="color" value={formData.imageBorderColor || '#E5E7EB'} onChange={(e) => handleOverallChange('imageBorderColor', e.target.value)} className="mt-1 h-8 w-full p-0.5 border border-gray-300 rounded-md" />
                </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-700 pt-3 border-t mt-5">Manage Items</h4>
            {(formData.items || []).map((item, itemIndex) => (
                <div key={item.id || itemIndex} className="space-y-3 p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex justify-between items-center">
                        <h5 className="text-md font-semibold text-gray-600">Item {itemIndex + 1}: {item.name || 'Unnamed Item'}</h5>
                        <button onClick={() => handleRemoveItem(itemIndex)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove Item</button>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Name (Panel Edit):</label>
                        <input type="text" value={item.name || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'name', e.target.value)} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Description (Panel Edit):</label>
                        <textarea value={item.description || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'description', e.target.value)} rows={3} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md resize-none" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Advantages (Panel Edit):</label>
                        {(item.advantages || []).map((adv, advIndex) => (
                            <div key={advIndex} className="flex items-center space-x-2 mt-1">
                                <input type="text" value={adv} onChange={(e) => handleItemAdvantageChange(itemIndex, advIndex, e.target.value)} className="flex-grow px-2 py-1 text-xs bg-gray-50 border border-gray-300 rounded-md" />
                                <button onClick={() => handleRemoveItemAdvantage(itemIndex, advIndex)} className="text-xs text-red-500 hover:text-red-700 font-semibold">&times; Remove</button>
                            </div>
                        ))}
                        <button onClick={() => handleAddItemAdvantage(itemIndex)} className="mt-1 text-xs text-blue-500 hover:text-blue-700 font-semibold">+ Add Advantage</button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600">Pictures:</label>
                        {(item.pictures || []).map((pic, picIndex) => {
                            const picUrl = getDisplayUrl ? getDisplayUrl(pic) : (typeof pic === 'object' && pic?.url ? pic.url : typeof pic === 'string' ? pic : '');
  return (
                                <div key={picIndex} className="flex items-center space-x-2 mt-1 p-1 border border-dashed border-gray-300 rounded">
                                    {picUrl && <img src={picUrl} alt={`Pic ${picIndex + 1}`} className="h-12 w-12 object-cover rounded" />}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleItemPictureChange(itemIndex, picIndex, e.target.files[0])} 
                                        className="flex-grow text-xs file:text-xs file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                    />
                                    <button onClick={() => handleRemoveItemPicture(itemIndex, picIndex)} className="text-xs text-red-500 hover:text-red-700 font-semibold">&times; Remove</button>
                                </div>
                            );
                        })}
                        <button onClick={() => handleAddPictureToItem(itemIndex)} className="mt-1 text-xs text-blue-500 hover:text-blue-700 font-semibold">+ Add Picture Slot</button>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Color Possibilities:</label>
                        <input type="text" value={item.colorPossibilities || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'colorPossibilities', e.target.value)} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Installation Time:</label>
                        <input type="text" value={item.installationTime || ''} onChange={(e) => handleItemDetailChange(itemIndex, 'installationTime', e.target.value)} className="mt-0.5 block w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md" />
                    </div>
                </div>
            ))}
            <button onClick={handleAddItem} className="mt-4 px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm font-semibold">+ Add New Item</button>
        </div>
    );
};

GeneralList.EditorPanel.propTypes = {
    currentConfig: PropTypes.object.isRequired,
    onPanelConfigChange: PropTypes.func.isRequired,
    onPanelFileChange: PropTypes.func.isRequired, 
    getDisplayUrl: PropTypes.func.isRequired, 
};

export default GeneralList;