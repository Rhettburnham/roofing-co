import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import PanelImagesController from "../common/PanelImagesController";
import ThemeColorPicker from "../common/ThemeColorPicker";

/**
 * IconTextBlockGrid
 *
 * config = {
 *   columns: number, // number of columns (1-6)
 *   items: [
 *     { title, image, alt, description }
 *   ]
 * }
 */

// Shared image state helpers
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

const getEffectiveDisplayUrl = (imageState, getDisplayUrlProp, defaultPath = '') => {
  if (getDisplayUrlProp && imageState) return getDisplayUrlProp(imageState);
  if (imageState && typeof imageState === 'object' && imageState.url) return imageState.url;
  if (typeof imageState === 'string' && imageState) {
    if (imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:')) return imageState;
    return imageState.startsWith('.') ? imageState : `/${imageState.replace(/^\/+/, "")}`;
  }
  return defaultPath;
};

// Helper for inline editable fields
const EditableField = ({ value, onChange, placeholder, type = 'text', className, style, rows }) => (
  type === 'textarea' ?
    <textarea value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} rows={rows} /> :
    <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} className={`bg-transparent border-b-2 border-dashed focus:border-gray-400 outline-none w-full ${className}`} style={style} />
);

// Preview Component
function IconTextBlockGridPreview({ localConfig, readOnly, onInlineChange, getDisplayUrl }) {
  const { sectionTitle, columns, items, titleColor, descriptionColor, imageBorderRadius, itemBackgroundColor } = localConfig;
  const gridColsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(Math.max(columns || 1, 1), 6)}`;

  return (
    <div className="py-8 md:py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        {readOnly ? (
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8" style={{ color: titleColor }}>{sectionTitle}</h2>
        ) : (
          <EditableField
            value={sectionTitle}
            onChange={(e) => onInlineChange("sectionTitle", e.target.value)}
            placeholder="Section Title"
            className="text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-8 block mx-auto"
            style={{ color: titleColor }}
          />
        )}
        <div className={`grid ${gridColsClass} gap-6 md:gap-8`}>
          {(items || []).map((item, index) => {
            const imageUrl = getDisplayUrl(item.image, null, '/assets/images/placeholder_sq_1.jpg');
            return (
              <div key={item.id || index}
                className="text-center p-4 md:p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                style={{ backgroundColor: itemBackgroundColor }}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.alt || item.title || "Feature Image"}
                    className="w-full h-48 object-cover mb-4 mx-auto"
                    style={{ borderRadius: imageBorderRadius }}
                  />
                ) : (
                  !readOnly && <div className="w-full h-48 mb-4 mx-auto flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400" style={{ borderRadius: imageBorderRadius }}>Image Missing</div>
                )}

                {readOnly ? (
                  <h3 className="text-xl font-medium mb-1" style={{ color: titleColor }}>{item.title}</h3>
                ) : (
                  <EditableField
                    value={item.title}
                    onChange={(e) => onInlineChange('items', e.target.value, index, "title")}
                    placeholder="Item Title"
                    className="text-xl font-medium mb-1 text-center"
                    style={{ color: titleColor }}
                  />
                )}
                {readOnly ? (
                  <p className="text-sm leading-relaxed" style={{ color: descriptionColor }}>{item.description}</p>
                ) : (
                  <EditableField
                    value={item.description}
                    onChange={(e) => onInlineChange('items', e.target.value, index, "description")}
                    placeholder="Item Description"
                    className="text-sm leading-relaxed text-center min-h-[60px]"
                    style={{ color: descriptionColor }}
                    type="textarea"
                    rows={3}
                  />
                )}
                {!readOnly && (
                  <EditableField
                    value={item.alt || ""}
                    placeholder="Image Alt Text"
                    onChange={(e) => onInlineChange('items', e.target.value, index, "alt")}
                    className="text-xs mt-2 text-center text-gray-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
IconTextBlockGridPreview.propTypes = { localConfig: PropTypes.object.isRequired, readOnly: PropTypes.bool.isRequired, onInlineChange: PropTypes.func.isRequired, getDisplayUrl: PropTypes.func.isRequired };

// Panel Component
function IconTextBlockGridPanel({ localConfig, onPanelChange, onAddItem, onRemoveItem, onUpdateItemImage }) {
  const { items, columns, titleColor, descriptionColor, imageBorderRadius, itemBackgroundColor } = localConfig;

  const handleSettingChange = (field, value) => onPanelChange({ ...localConfig, [field]: value });

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg space-y-4">
      <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Grid Settings</h3>
      <div><label className="block text-sm mb-1">Number of Columns (1-6):</label><input type="number" min="1" max="6" value={columns || 3} onChange={(e) => handleSettingChange('columns', parseInt(e.target.value,10) || 3)} className="panel-text-input" /></div>
      <div><label className="block text-sm mb-1">Image Border Radius (e.g., 0.5rem):</label><input type="text" value={imageBorderRadius || '0.5rem'} onChange={(e) => handleSettingChange('imageBorderRadius', e.target.value)} className="panel-text-input" /></div>
      
      <h4 className="text-md font-semibold border-t border-gray-700 pt-3">Color Settings</h4>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs mb-1">Section/Item Title:</label><input type="color" value={titleColor || '#1A202C'} onChange={(e) => handleSettingChange('titleColor', e.target.value)} className="panel-color-input" /></div>
        <div><label className="block text-xs mb-1">Description Text:</label><input type="color" value={descriptionColor || '#4A5568'} onChange={(e) => handleSettingChange('descriptionColor', e.target.value)} className="panel-color-input" /></div>
        <div><label className="block text-xs mb-1">Item Background:</label><input type="color" value={itemBackgroundColor || '#FFFFFF'} onChange={(e) => handleSettingChange('itemBackgroundColor', e.target.value)} className="panel-color-input" /></div>
      </div>

      <h4 className="text-md font-semibold border-t border-gray-700 pt-3">Manage Grid Items</h4>
      {(items || []).map((item, index) => (
        <div key={item.id || index} className="p-3 bg-gray-700 rounded-md space-y-2">
          <div className="flex justify-between items-center"><span className="text-sm font-medium">{item.title || `(Item ${index + 1})`}</span><button onClick={() => onRemoveItem(index)} className="panel-button-sm-danger">Remove</button></div>
          <div><label className="block text-xs mb-0.5">Image for "{item.title || 'Item'}":</label><input type="file" accept="image/*" onChange={(e) => e.target.files && onUpdateItemImage(index, e.target.files[0])} className="panel-file-input" /></div>
          <div><label className="block text-xs mb-0.5">Or Image URL:</label><input type="text" value={typeof item.image ==='string' ? item.image : (item.image?.url || '')} onChange={(e)=> onUpdateItemImage(index, e.target.value)} className="panel-text-input-xs"/></div>
          {item.image && <img src={typeof item.image === 'string' ? item.image : getEffectiveDisplayUrl(item.image, null)} alt="Preview" className="panel-img-preview-xs" onError={(e)=>e.target.style.display='none'}/>}
        </div>
      ))}
      <button onClick={onAddItem} className="panel-button-action w-full">+ Add Grid Item</button>
    </div>
  );
}
IconTextBlockGridPanel.propTypes = { localConfig: PropTypes.object.isRequired, onPanelChange: PropTypes.func.isRequired, onAddItem: PropTypes.func.isRequired, onRemoveItem: PropTypes.func.isRequired, onUpdateItemImage: PropTypes.func.isRequired };

// Main Block Component
const IconTextBlockGrid = ({ config = {}, readOnly = true, onConfigChange, getDisplayUrl: getDisplayUrlProp }) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      sectionTitle: "Our Features", columns: 3,
      items: [
        { id: `item_${Date.now()}_1`, title: "Feature One", image: initializeImageState(null, "/assets/images/placeholder_sq_1.jpg"), alt: "Feature 1 Image", description: "Description for feature one." },
        { id: `item_${Date.now()}_2`, title: "Feature Two", image: initializeImageState(null, "/assets/images/placeholder_sq_2.jpg"), alt: "Feature 2 Image", description: "Description for feature two." },
        { id: `item_${Date.now()}_3`, title: "Feature Three", image: initializeImageState(null, "/assets/images/placeholder_sq_3.jpg"), alt: "Feature 3 Image", description: "Description for feature three." },
      ],
      titleColor: "#1A202C", descriptionColor: "#4A5568", imageBorderRadius: "0.5rem", itemBackgroundColor: "#FFFFFF",
    };
    const initialData = { ...defaultConfig, ...config };
    return {
      ...initialData,
      items: (initialData.items || []).map((item, idx) => ({
        ...defaultConfig.items[0], ...item, id: item.id || `item_init_${idx}_${Date.now()}`,
        image: initializeImageState(item.image, defaultConfig.items[idx % defaultConfig.items.length]?.image?.originalUrl || "/assets/images/placeholder_sq_1.jpg")
      }))
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newItems = (config.items || []).map((propItem, idx) => {
          const localItem = prevLocal.items.find(li => li.id === propItem.id) || prevLocal.items[idx] || {};
          const newImageState = initializeImageState(propItem.image, localItem.image?.originalUrl);
          if (localItem.image?.file && localItem.image.url?.startsWith('blob:') && localItem.image.url !== newImageState.url) URL.revokeObjectURL(localItem.image.url);
          return {
            ...localItem, ...propItem, image: newImageState,
            title: !readOnly && localItem.title !== (propItem.title || '') ? localItem.title : (propItem.title || localItem.title || ''),
            description: !readOnly && localItem.description !== (propItem.description || '') ? localItem.description : (propItem.description || localItem.description || ''),
            alt: !readOnly && localItem.alt !== (propItem.alt || '') ? localItem.alt : (propItem.alt || localItem.alt || ''),
          };
        });
        return { ...prevLocal, ...config, items: newItems };
      });
    }
  }, [config, readOnly]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true && onConfigChange) {
      const dataToSave = { ...localConfig, items: localConfig.items.map(item => ({ ...item, image: item.image?.file ? { ...item.image } : { url: item.image?.originalUrl || item.image?.url } })) };
      onConfigChange(dataToSave);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    const cleanup = () => localConfig.items.forEach(item => { if (item.image?.file && item.image.url?.startsWith('blob:')) URL.revokeObjectURL(item.image.url); });
    cleanup();
    return cleanup;
  }, [localConfig.items]);

  const handleInlineChange = (field, value, itemIndex = null, itemSubField = null) => {
    if (!readOnly) {
      setLocalConfig(prev => {
        if (field === 'items' && itemIndex !== null && itemSubField) {
          const newItems = prev.items.map((item, idx) => idx === itemIndex ? { ...item, [itemSubField]: value } : item);
          return { ...prev, items: newItems };
        } else {
          return { ...prev, [field]: value };
        }
      });
    }
  };

  const handlePanelChange = (panelData) => { if (!readOnly) setLocalConfig(prev => ({ ...prev, ...panelData })); };

  const handleUpdateItemImage = (itemIndex, fileOrUrl) => {
    if (!readOnly) {
      setLocalConfig(prev => {
        const newItems = [...prev.items];
        const oldItemImage = newItems[itemIndex].image;
        if (oldItemImage?.file && oldItemImage.url?.startsWith('blob:')) URL.revokeObjectURL(oldItemImage.url);
        if (fileOrUrl instanceof File) newItems[itemIndex].image = { file: fileOrUrl, url: URL.createObjectURL(fileOrUrl), name: fileOrUrl.name, originalUrl: oldItemImage?.originalUrl };
        else if (typeof fileOrUrl === 'string') newItems[itemIndex].image = initializeImageState(fileOrUrl, oldItemImage?.originalUrl);
        return { ...prev, items: newItems };
      });
    }
  };

  const handleAddItem = () => {
    if (!readOnly) setLocalConfig(prev => ({ ...prev, items: [...(prev.items || []), { id: `item_new_${Date.now()}`, title: "New Item", image: initializeImageState(null, '/assets/images/placeholder_sq_1.jpg'), alt: "New item alt", description: "New item description." }] }));
  };
  const handleRemoveItem = (indexToRemove) => {
    if (!readOnly) setLocalConfig(prev => ({ ...prev, items: prev.items.filter((_, index) => index !== indexToRemove) }));
  };

  return (
    <>
      <IconTextBlockGridPreview localConfig={localConfig} readOnly={readOnly} onInlineChange={handleInlineChange} getDisplayUrl={getDisplayUrlProp || getEffectiveDisplayUrl} />
      {!readOnly && (
        <div className="bg-gray-900 p-0 rounded-b-lg shadow-xl mt-0">
          <IconTextBlockGridPanel
            localConfig={localConfig} 
            onPanelChange={handlePanelChange} 
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateItemImage={handleUpdateItemImage}
          />
        </div>
      )}
    </>
  );
}

IconTextBlockGrid.propTypes = {
  config: PropTypes.shape({
    sectionTitle: PropTypes.string,
    columns: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      alt: PropTypes.string,
      description: PropTypes.string,
    })),
    titleColor: PropTypes.string,
    descriptionColor: PropTypes.string,
    imageBorderRadius: PropTypes.string,
    itemBackgroundColor: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

IconTextBlockGrid.EditorPanel = IconTextBlockGridPanel;

export default IconTextBlockGrid; 