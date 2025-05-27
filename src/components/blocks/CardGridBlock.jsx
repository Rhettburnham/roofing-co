import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * CardGridBlock
 * 
 * config = {
 *   paragraphText: string,
 *   items: [
 *     { title, image, alt } // each column
 *   ]
 * }
 */

const initializeImageState = (imageValue, defaultPath = '') => {
  let fileObject = null;
  let urlToDisplay = defaultPath;
  let nameToStore = defaultPath.split('/').pop();
  let originalUrlToStore = defaultPath;

  if (imageValue && typeof imageValue === 'object') {
    urlToDisplay = imageValue.url || defaultPath;
    nameToStore = imageValue.name || urlToDisplay.split('/').pop();
    fileObject = imageValue.file || null;
    originalUrlToStore = imageValue.originalUrl || (typeof imageValue.url === 'string' && !imageValue.url.startsWith('blob:') ? imageValue.url : defaultPath);
  } else if (typeof imageValue === 'string') {
    urlToDisplay = imageValue;
    nameToStore = imageValue.split('/').pop();
    originalUrlToStore = imageValue;
  }
  
  return { file: fileObject, url: urlToDisplay, name: nameToStore, originalUrl: originalUrlToStore };
};

const getEffectiveDisplayUrl = (imageState, getDisplayUrlProp) => {
  if (getDisplayUrlProp && imageState) {
    return getDisplayUrlProp(imageState);
  }
  if (imageState && typeof imageState === 'object' && imageState.url) {
    return imageState.url;
  }
  if (typeof imageState === 'string') {
    if (imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:')) {
      return imageState;
    }
    return imageState.startsWith('.') ? imageState : `/${imageState.replace(/^\/*/, "")}`;
  }
  return '';
};

const CardGridBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
  getDisplayUrl,
}) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      paragraphText: "This is a default paragraph. You can edit this text. It's great for introductions or summaries.",
      items: [
        { id: 'item1', title: 'Feature One', image: initializeImageState(null, '/assets/images/placeholder_sq_1.jpg'), alt: 'Placeholder 1' },
        { id: 'item2', title: 'Feature Two', image: initializeImageState(null, '/assets/images/placeholder_sq_2.jpg'), alt: 'Placeholder 2' },
        { id: 'item3', title: 'Feature Three', image: initializeImageState(null, '/assets/images/placeholder_sq_3.jpg'), alt: 'Placeholder 3' },
      ],
      backgroundColor: '#FFFFFF',
      paragraphTextColor: '#374151',
      itemTitleColor: '#1F2937',
      sectionGradientFrom: '#E0E7FF',
      sectionGradientTo: '#FFFFFF',
    };
    const initialData = config || {};
    return {
      ...defaultConfig,
      ...initialData,
      items: (initialData.items || defaultConfig.items).map((item, index) => ({
        ...defaultConfig.items[0],
        ...item,
        id: item.id || `item_init_${index}_${Date.now()}`,
        image: initializeImageState(item.image, defaultConfig.items[index % defaultConfig.items.length]?.image?.originalUrl || '/assets/images/placeholder_general.jpg'),
      })),
      backgroundColor: initialData.backgroundColor ?? defaultConfig.backgroundColor,
      paragraphTextColor: initialData.paragraphTextColor ?? defaultConfig.paragraphTextColor,
      itemTitleColor: initialData.itemTitleColor ?? defaultConfig.itemTitleColor,
      sectionGradientFrom: initialData.sectionGradientFrom ?? defaultConfig.sectionGradientFrom,
      sectionGradientTo: initialData.sectionGradientTo ?? defaultConfig.sectionGradientTo,
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newItems = (config.items || []).map((newItem, index) => {
          const oldItem = prevLocal.items.find(pi => pi.id === newItem.id) || prevLocal.items[index] || {};
          const newImage = initializeImageState(newItem.image, oldItem.image?.originalUrl);
          
          if (oldItem.image?.file && oldItem.image.url?.startsWith('blob:') && oldItem.image.url !== newImage.url) {
            URL.revokeObjectURL(oldItem.image.url);
          }
          return {
            ...oldItem,
            ...newItem,
            image: newImage,
            title: readOnly ? (newItem.title ?? oldItem.title) : oldItem.title,
          };
        });

        return {
          ...prevLocal,
          ...config,
          paragraphText: readOnly ? (config.paragraphText ?? prevLocal.paragraphText) : prevLocal.paragraphText,
          items: newItems,
          backgroundColor: config.backgroundColor ?? prevLocal.backgroundColor,
          paragraphTextColor: config.paragraphTextColor ?? prevLocal.paragraphTextColor,
          itemTitleColor: config.itemTitleColor ?? prevLocal.itemTitleColor,
          sectionGradientFrom: config.sectionGradientFrom ?? prevLocal.sectionGradientFrom,
          sectionGradientTo: config.sectionGradientTo ?? prevLocal.sectionGradientTo,
        };
      });
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        const dataToSave = {
          ...localConfig,
          items: localConfig.items.map(item => ({
            ...item,
            image: item.image?.file 
              ? { ...item.image } 
              : { url: item.image?.originalUrl || item.image?.url },
          })),
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    localConfig.items.forEach(item => {
      if (item.image?.file && item.image.url?.startsWith('blob:')) {
      }
    });
    return () => {
      localConfig.items.forEach(item => {
        if (item.image?.file && item.image.url?.startsWith('blob:')) {
          URL.revokeObjectURL(item.image.url);
        }
      });
    };
  }, [localConfig.items]);

  const handleLocalChange = (fieldOrIndex, value, itemField = null) => {
    if (!readOnly) {
      if (itemField !== null && typeof fieldOrIndex === 'number') {
        setLocalConfig(prev => ({
          ...prev,
          items: prev.items.map((item, i) => 
            i === fieldOrIndex ? { ...item, [itemField]: value } : item
          )
        }));
      } else {
        setLocalConfig(prev => ({ ...prev, [fieldOrIndex]: value }));
      }
    }
  };
  
  const handlePanelDataChange = (newData) => {
    if (!readOnly) {
      if (newData.items) {
        const newItemsWithBlobs = newData.items.map((newItem, index) => {
          const oldItem = localConfig.items.find(pi => pi.id === newItem.id) || localConfig.items[index] || {};
          let newImageState = oldItem.image;

          if (newItem.image && typeof newItem.image === 'object' && newItem.image.file instanceof File) {
            if (oldItem.image?.file && oldItem.image.url?.startsWith('blob:')) {
              URL.revokeObjectURL(oldItem.image.url);
            }
            const blobUrl = URL.createObjectURL(newItem.image.file);
            newImageState = {
              file: newItem.image.file,
              url: blobUrl,
              name: newItem.image.file.name,
              originalUrl: oldItem.image?.originalUrl 
            };
          } else if (typeof newItem.image === 'string') {
            if (oldItem.image?.file && oldItem.image.url?.startsWith('blob:')) {
              URL.revokeObjectURL(oldItem.image.url);
            }
            newImageState = initializeImageState(newItem.image);
          } else if (newItem.image && typeof newItem.image === 'object' && !newItem.image.file) {
             newImageState = initializeImageState(newItem.image, oldItem.image?.originalUrl);
          }
          return { ...oldItem, ...newItem, image: newImageState };
        });
        setLocalConfig(prev => ({ ...prev, ...newData, items: newItemsWithBlobs }));
      } else {
        setLocalConfig(prev => ({ ...prev, ...newData }));
      }
    }
  };

  const {
    paragraphText, items, backgroundColor, paragraphTextColor, itemTitleColor, sectionGradientFrom, sectionGradientTo
  } = localConfig;

  const sectionStyle = {
    background: `linear-gradient(to top, ${sectionGradientTo}, ${sectionGradientFrom})`,
    backgroundColor: backgroundColor,
  };

  const EditableField = ({ value, onChange, placeholder, type = 'text', className, style, rows }) => (
    type === 'textarea' ?
      <textarea value={value} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-500 outline-none w-full ${className}`} style={style} rows={rows} /> :
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-500 outline-none w-full ${className}`} style={style} />
  );

  return (
    <>
      <section className="w-full py-8 md:py-12 card-grid-block" style={sectionStyle}>
        <div className="container mx-auto text-center mb-4 px-6 md:px-10">
          {readOnly ? (
            paragraphText && (
              <p className="text-xs sm:text-sm md:text-lg my-4 max-w-full overflow-hidden text-ellipsis font-serif" style={{ color: paragraphTextColor }}>
                {paragraphText}
              </p>
            )
          ) : (
            <textarea
              value={paragraphText}
              onChange={(e) => handleLocalChange('paragraphText', e.target.value)}
              className="text-xs sm:text-sm md:text-lg my-4 w-full bg-transparent border-b-2 border-dashed focus:border-gray-500 outline-none resize-none p-2 font-serif text-center"
              style={{ color: paragraphTextColor, borderColor: 'rgba(0,0,0,0.2)' }}
              rows={3}
              placeholder="Enter paragraph text here..."
            />
          )}
        </div>
        <div className="container mx-auto">
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-3 px-2 md:px-10">
            {items.map((col, idx) => (
              <div key={col.id || idx} className="flex flex-col items-center text-center bg-white p-4 rounded-lg shadow-lg transition-all hover:shadow-xl">
                {getEffectiveDisplayUrl(col.image, getDisplayUrl) ? (
                  <img
                    src={getEffectiveDisplayUrl(col.image, getDisplayUrl)}
                    alt={col.alt || col.title || ""}
                    className="w-full h-[15vh] md:h-48 object-cover rounded-md shadow-md mb-4"
                  />
                ) : (
                  <div className="w-full h-[15vh] md:h-48 bg-gray-200 rounded-md shadow-md mb-4 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {readOnly ? (
                  col.title && (
                    <h3 className="text-md md:text-xl font-semibold mt-3 md:mt-6" style={{ color: itemTitleColor }}>
                      {col.title}
                    </h3>
                  )
                ) : (
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => handleLocalChange(idx, e.target.value, 'title')}
                    className="text-md md:text-xl font-semibold mt-3 md:mt-6 w-full bg-transparent border-b-2 border-dashed focus:border-gray-500 outline-none text-center p-1"
                    style={{ color: itemTitleColor, borderColor: 'rgba(0,0,0,0.2)' }}
                    placeholder="Item Title"
                  />
                )}
                {!readOnly && (
                  <EditableField
                    type="text"
                    value={col.alt || ""}
                    onChange={(e) => handleLocalChange(idx, e.target.value, 'alt')}
                    className="text-xs font-light mt-1 w-full bg-transparent border-b-2 border-dashed focus:border-gray-500 outline-none text-center p-1"
                    style={{ color: paragraphTextColor, borderColor: 'rgba(0,0,0,0.1)' }}
                    placeholder="Image Alt Text"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {!readOnly && (
        <CardGridBlock.EditorPanel
          currentConfig={localConfig}
          onPanelConfigChange={handlePanelDataChange}
          getDisplayUrl={(imgState) => getEffectiveDisplayUrl(imgState, getDisplayUrl)}
        />
      )}
    </>
  );
};

CardGridBlock.propTypes = {
  config: PropTypes.shape({
    paragraphText: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      alt: PropTypes.string,
    })),
    backgroundColor: PropTypes.string,
    paragraphTextColor: PropTypes.string,
    itemTitleColor: PropTypes.string,
    sectionGradientFrom: PropTypes.string,
    sectionGradientTo: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

CardGridBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, getDisplayUrl: getDisplayUrlForPanel }) => {
  const { items = [], backgroundColor, paragraphTextColor, itemTitleColor, sectionGradientFrom, sectionGradientTo } = currentConfig;

  const handleItemFieldChange = (index, field, value) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onPanelConfigChange({ items: updatedItems });
  };

  const handleItemImageUpdate = (index, imageValue) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        if (imageValue instanceof File) {
          return { ...item, image: { file: imageValue } };
        }
        return { ...item, image: imageValue };
      }
      return item;
    });
    onPanelConfigChange({ items: updatedItems });
  };

  const addItem = () => {
    const newItemId = `new_item_${Date.now()}`;
    const newItems = [
      ...items, 
      { 
        id: newItemId, 
        title: "New Feature", 
        image: initializeImageState(null, '/assets/images/placeholder_sq_new.jpg'), 
        alt: "New item placeholder" 
      }
    ];
    onPanelConfigChange({ items: newItems });
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onPanelConfigChange({ items: updatedItems });
  };

  const handleColorChange = (field, value) => {
    onPanelConfigChange({ [field]: value });
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-b-md space-y-6">
      <h3 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Card Grid Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Section Gradient From:</label>
          <input type="color" value={sectionGradientFrom || '#E0E7FF'} onChange={(e) => handleColorChange('sectionGradientFrom', e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Section Gradient To:</label>
          <input type="color" value={sectionGradientTo || '#FFFFFF'} onChange={(e) => handleColorChange('sectionGradientTo', e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fallback BG Color:</label>
          <input type="color" value={backgroundColor || '#FFFFFF'} onChange={(e) => handleColorChange('backgroundColor', e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Paragraph Text Color:</label>
          <input type="color" value={paragraphTextColor || '#374151'} onChange={(e) => handleColorChange('paragraphTextColor', e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Item Title Color:</label>
          <input type="color" value={itemTitleColor || '#1F2937'} onChange={(e) => handleColorChange('itemTitleColor', e.target.value)} className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer"/>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-200 border-t border-gray-700 pt-4">Grid Items:</h4>
        {items.map((col, idx) => (
          <div key={col.id || idx} className="border border-gray-700 p-3 rounded-md bg-gray-750 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-md font-semibold text-gray-300">Column {idx + 1} (ID: {col.id})</span>
              <button type="button" onClick={() => removeItem(idx)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium">Remove</button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-0.5">Image URL:</label>
              <input
                type="text"
                value={col.image?.originalUrl || col.image?.url || (typeof col.image === 'string' ? col.image : '')}
                onChange={(e) => handleItemImageUpdate(idx, e.target.value)}
                className="mt-1 w-full px-2 py-1.5 bg-gray-600 text-white rounded border border-gray-500 text-sm placeholder-gray-400"
                placeholder="e.g., /assets/images/img.jpg"
              />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-0.5">Or Upload Image:</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && e.target.files.length > 0 && handleItemImageUpdate(idx, e.target.files[0])}
                    className="mt-1 block w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 cursor-pointer"
                />
            </div>
            {getDisplayUrlForPanel(col.image) && (
              <img src={getDisplayUrlForPanel(col.image)} alt={col.alt || "Preview"} className="mt-1 max-h-24 w-auto rounded object-contain bg-gray-600 p-0.5" />
            )}

          </div>
        ))}
        <button type="button" onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium w-full mt-2">
          + Add Column
        </button>
      </div>
    </div>
  );
};

CardGridBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
};

export default CardGridBlock; 