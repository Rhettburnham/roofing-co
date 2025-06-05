import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ThemeColorPicker from '../common/ThemeColorPicker';
import PanelImagesController from '../common/PanelImagesController';

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
        <CardGridBlock.tabsConfig
          currentConfig={localConfig}
          onPanelChange={handlePanelDataChange}
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

CardGridBlock.tabsConfig = (currentConfig, onPanelChange, themeColors, sitePalette) => {
  const { items = [], backgroundColor, paragraphTextColor, itemTitleColor, sectionGradientFrom, sectionGradientTo, columns = 3 } = currentConfig;

  const handleItemImageUpdate = (itemIndex, imageProperty, value) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        if (imageProperty === 'file' && value instanceof File) {
          // Revoke old blob URL if it exists
          if (item.image?.file && item.image.url?.startsWith('blob:')) {
            URL.revokeObjectURL(item.image.url);
          }
          return { 
            ...item, 
            image: { 
              file: value, 
              url: URL.createObjectURL(value), 
              name: value.name, 
              originalUrl: item.image?.originalUrl || '' // Preserve original URL if it existed
            }
          };
        } else if (imageProperty === 'url' && typeof value === 'string'){
           // Revoke old blob URL if replacing with a direct URL
          if (item.image?.file && item.image.url?.startsWith('blob:')) {
            URL.revokeObjectURL(item.image.url);
          }
          return { 
            ...item, 
            image: { 
              file: null, 
              url: value, 
              name: value.split('/').pop(),
              originalUrl: value
            }
          };
        }
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const addItem = () => {
    const newItemId = `item_new_${Date.now()}`;
    const newItems = [
      ...items, 
      { 
        id: newItemId, 
        title: "New Feature", 
        image: initializeImageState(null, '/assets/images/placeholder_sq_new.jpg'), 
        alt: "New item placeholder" 
      }
    ];
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const removeItem = (index) => {
    const itemToRemove = items[index];
    if (itemToRemove?.image?.file && itemToRemove.image.url?.startsWith('blob:')){
        URL.revokeObjectURL(itemToRemove.image.url);
    }
    const updatedItems = items.filter((_, i) => i !== index);
    onPanelChange({ ...currentConfig, items: updatedItems });
  };

  const handleColorChange = (field, value) => {
    onPanelChange({ ...currentConfig, [field]: value });
  };
  
  const handleColumnsChange = (newColumns) => {
    onPanelChange({ ...currentConfig, columns: parseInt(newColumns, 10) || 3 });
  };

  // Prepare data for PanelImagesController
  const imagesForController = items.map((item, index) => ({
    ...(item.image || initializeImageState(null, '/assets/images/placeholder_sq_1.jpg')),
    id: item.id || `card_item_img_${index}`,
    name: item.title || `Card Item ${index + 1}`,
    itemIndex: index,
  }));

  const onImagesControllerChange = (updatedData) => {
    const newItems = [...items]; // Start with a copy of current items
    (updatedData.images || []).forEach(imgCtrl => {
      if (imgCtrl.itemIndex !== undefined && newItems[imgCtrl.itemIndex]) {
        const oldImageState = newItems[imgCtrl.itemIndex].image;
        // Revoke old blob URL if a new file is provided or URL changes significantly
        if (oldImageState?.file && oldImageState.url?.startsWith('blob:')) {
          if ((imgCtrl.file && oldImageState.url !== imgCtrl.url) || (!imgCtrl.file && oldImageState.url !== imgCtrl.originalUrl)) {
            URL.revokeObjectURL(oldImageState.url);
          }
        }
        newItems[imgCtrl.itemIndex].image = {
          file: imgCtrl.file || null,
          url: imgCtrl.url || '',
          name: imgCtrl.name || (imgCtrl.url || '').split('/').pop() || 'image.jpg',
          originalUrl: imgCtrl.originalUrl || imgCtrl.url || ''
        };
      } else if (imgCtrl.itemIndex !== undefined && !newItems[imgCtrl.itemIndex]) {
        // This case implies PanelImagesController might be adding an image for a non-existent item,
        // which shouldn't happen if PanelImagesController only modifies existing images.
        // If PanelImagesController can ADD images, we need to handle creating a new item here.
        // For now, assume it only modifies.
         console.warn("PanelImagesController tried to update a non-existent item index: ", imgCtrl.itemIndex);
      }
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Grid Structure</h3>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Number of Columns (1-3):</label>
          <select 
            value={columns || 3} 
            onChange={(e) => handleColumnsChange(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          >
            {[1, 2, 3].map(num => <option key={num} value={num}>{num}</option>)}
          </select>
        </div>
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Manage Items:</h4>
          <p className="text-xs text-gray-500 mb-3">Item titles and alt text are editable directly on the block preview.</p>
          {(items || []).map((item, index) => (
            <div key={item.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-2 shadow-sm">
              <span className="text-sm text-gray-600 truncate w-3/4" title={item.title}>{index + 1}. {item.title || '(Untitled Item)'}</span>
              <button 
                onClick={() => removeItem(index)} 
                className="text-red-500 hover:text-red-700 text-xs font-semibold p-1 hover:bg-red-100 rounded-full"
                title="Remove Item"
              >
                ✕ Remove
              </button>
            </div>
          ))}
          <button 
            onClick={addItem} 
            className="mt-2 w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:border-solid"
          >
            + Add Grid Item
          </button>
        </div>
      </div>
    ),
    images: () => (
      <PanelImagesController
        currentData={{ images: imagesForController }}
        onControlsChange={onImagesControllerChange}
        imageArrayFieldName="images"
        getItemName={(img) => img?.name || 'Card Image'}
        allowAdd={false} // We manage adding/removing items in the 'general' tab
        allowRemove={false} // We manage adding/removing items in the 'general' tab
      />
    ),
    colors: () => (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Color Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemeColorPicker
            label="Section Gradient From:"
            fieldName="sectionGradientFrom"
            currentColorValue={sectionGradientFrom || '#E0E7FF'}
            onColorChange={handleColorChange}
            themeColors={themeColors}
          />
          <ThemeColorPicker
            label="Section Gradient To:"
            fieldName="sectionGradientTo"
            currentColorValue={sectionGradientTo || '#FFFFFF'}
            onColorChange={handleColorChange}
            themeColors={themeColors}
          />
          <ThemeColorPicker
            label="Fallback BG Color:"
            fieldName="backgroundColor"
            currentColorValue={backgroundColor || '#FFFFFF'}
            onColorChange={handleColorChange}
            themeColors={themeColors}
          />
          <ThemeColorPicker
            label="Paragraph Text Color:"
            fieldName="paragraphTextColor"
            currentColorValue={paragraphTextColor || '#374151'}
            onColorChange={handleColorChange}
            themeColors={themeColors}
          />
          <ThemeColorPicker
            label="Item Title Color:"
            fieldName="itemTitleColor"
            currentColorValue={itemTitleColor || '#1F2937'}
            onColorChange={handleColorChange}
            themeColors={themeColors}
          />
        </div>
      </div>
    ),
  };
};

export default CardGridBlock; 